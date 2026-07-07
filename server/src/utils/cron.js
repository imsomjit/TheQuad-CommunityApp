"use strict";

const cron = require("node-cron");
const { sql, and, eq, lte } = require("drizzle-orm");
const { db } = require("../db/index");
const { users, notifications, broadcasts, resources, posts, books, questions, opportunities, answers, comments } = require("../db/schema/index");
const cloudinary = require("../config/cloudinary");
const { sendEmail } = require("./email");
const logger = require("./logger");
const sseManager = require("../config/sse");

const startCronJobs = () => {
  // Run everyday at 8:00 AM server time
  cron.schedule("0 8 * * *", async () => {
    try {
      logger.info("[Cron] Running birthday check job...");
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 1-12
      const currentDay = today.getDate(); // 1-31

      // Find users whose birthday is today (excluding default 2000-01-01)
      const { rows: birthdayUsers } = await db.execute(sql`
        SELECT id, name, username, email FROM users
        WHERE EXTRACT(MONTH FROM date_of_birth) = ${currentMonth} 
          AND EXTRACT(DAY FROM date_of_birth) = ${currentDay}
          AND date_of_birth != '2000-01-01'
          AND is_banned = false
      `);

      if (!birthdayUsers || birthdayUsers.length === 0) {
        logger.info("[Cron] No birthdays today.");
        return;
      }

      logger.info(`[Cron] Found ${birthdayUsers.length} birthdays today. Sending greetings...`);

      const { getBirthdayEmailTemplate } = require("./emailTemplates");

      for (const user of birthdayUsers) {
        // Send In-App Notification
        await db.insert(notifications).values({
          recipientId: user.id,
          actorId: user.id, // System-generated; use self as actor (actorId is NOT NULL)
          type: "system_broadcast",
          targetType: "birthday",
          targetId: user.id,
          targetTitle: `[Birthday] The Quad: Happy Birthday, ${user.name}! 🥳 Wishing you a fantastic day ahead!`,
          isRead: false,
        });

        // Send Email
        const emailSubject = "Happy Birthday from The Quad! 🎉";
        const emailHtml = getBirthdayEmailTemplate(user.name);
        
        await sendEmail({
          to: user.email,
          subject: emailSubject,
          html: emailHtml,
        });
      }
      logger.info("[Cron] Birthday greetings sent successfully.");
    } catch (error) {
      logger.error("[Cron] Error running birthday job:", error);
    }
  });

  // Run every minute to check for scheduled broadcasts
  cron.schedule("* * * * *", async () => {
    try {
      // Find broadcasts that are scheduled for now or in the past, and haven't been sent
      const pendingBroadcasts = await db
        .select()
        .from(broadcasts)
        .where(
          and(
            eq(broadcasts.isSent, false),
            lte(broadcasts.scheduledAt, new Date())
          )
        );

      if (!pendingBroadcasts || pendingBroadcasts.length === 0) {
        return; // Nothing to send
      }

      logger.info(`[Cron] Found ${pendingBroadcasts.length} pending broadcasts.`);

      for (const broadcast of pendingBroadcasts) {
        const targetTitle = `[${broadcast.type}] ${broadcast.title}: ${broadcast.message}`;

      // 1. Raw SQL insert for ALL active users directly in Postgres (zero memory overhead)
      await db.execute(sql`
        INSERT INTO notifications (
          recipient_id, actor_id, type, target_type, target_id, target_title, is_read, created_at
        )
        SELECT 
          id, 
          ${broadcast.createdBy}, 
          'system_broadcast', 
          'broadcast', 
          ${broadcast.id}, 
          ${targetTitle}, 
          false, 
          NOW()
        FROM users 
        WHERE is_banned = false
      `);

      // 2. Push via SSE to ONLY currently connected clients
      if (sseManager.clients && sseManager.clients.size > 0) {
        sseManager.clients.forEach((_, userId) => {
          const payload = {
            recipientId: userId,
            actorId: broadcast.createdBy,
            type: "system_broadcast",
            targetType: "broadcast",
            targetId: broadcast.id,
            targetTitle,
            isRead: false,
            actor: {
              id: broadcast.createdBy,
              name: "System",
              username: "system",
              avatarUrl: null
            }
          };
          sseManager.send(userId, "notification", payload);
        });
      }

        // Mark broadcast as sent
        await db.update(broadcasts).set({ isSent: true }).where(eq(broadcasts.id, broadcast.id));
        logger.info(`[Cron] Broadcast ${broadcast.id} sent successfully.`);
      }
    } catch (error) {
      logger.error("[Cron] Error running broadcast job:", error);
    }
  });

  // Run everyday at midnight to cleanup expired refresh tokens
  cron.schedule("0 0 * * *", async () => {
    try {
      logger.info("[Cron] Running refresh token cleanup job...");
      await db.execute(sql`
        DELETE FROM refresh_tokens
        WHERE expires_at < NOW() OR is_revoked = true
      `);
      logger.info("[Cron] Refresh token cleanup completed.");
    } catch (error) {
      logger.error("[Cron] Error running refresh token cleanup job:", error);
    }
  });

  // Run everyday at midnight to hard-delete soft-deleted content older than 14 days
  cron.schedule("0 0 * * *", async () => {
    try {
      logger.info("[Cron] Running 14-day soft-delete cleanup job...");
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

      // Helper to process deletion
      const processTableDeletion = async (table, hasFiles = false, fileFields = []) => {
        const expiredRecords = await db
          .select()
          .from(table)
          .where(
            and(
              eq(table.isDeleted, true),
              lte(table.deletedAt, fourteenDaysAgo)
            )
          );

        if (expiredRecords.length === 0) return 0;

        // Delete files from Cloudinary
        if (hasFiles) {
          for (const record of expiredRecords) {
            for (const field of fileFields) {
              const publicId = record[field.name];
              if (publicId) {
                try {
                  await cloudinary.uploader.destroy(publicId, { resource_type: field.type });
                } catch (err) {
                  logger.error(`[Cron] Failed to delete Cloudinary file ${publicId}:`, err);
                }
              }
            }
          }
        }

        // Hard delete from DB
        const ids = expiredRecords.map(r => r.id);
        // Using inArray might hit limits if ids array is huge, but soft-deletes aren't typically millions per day.
        // Let's use raw SQL for safe batch deletion
        const tableName = table[Symbol.for('drizzle:Name')];
        await db.execute(sql.raw(`DELETE FROM "${tableName}" WHERE id IN (${ids.join(',')})`));
        return ids.length;
      };

      let totalDeleted = 0;

      // Resources (has filePublicId)
      totalDeleted += await processTableDeletion(resources, true, [{ name: 'filePublicId', type: 'raw' }]);
      // Books (has filePublicId and coverPublicId)
      totalDeleted += await processTableDeletion(books, true, [
        { name: 'filePublicId', type: 'raw' },
        { name: 'coverPublicId', type: 'image' }
      ]);
      // Posts (has coverImagePublicId)
      totalDeleted += await processTableDeletion(posts, true, [{ name: 'coverImagePublicId', type: 'image' }]);
      
      // No files
      totalDeleted += await processTableDeletion(questions);
      totalDeleted += await processTableDeletion(opportunities);
      totalDeleted += await processTableDeletion(answers);
      totalDeleted += await processTableDeletion(comments);

      logger.info(`[Cron] Soft-delete cleanup completed. Permanently removed ${totalDeleted} items.`);
    } catch (error) {
      logger.error("[Cron] Error running soft-delete cleanup job:", error);
    }
  });

  logger.info("[Cron] Cron jobs initialized.");
};

module.exports = { startCronJobs };
