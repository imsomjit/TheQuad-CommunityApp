"use strict";

const cron = require("node-cron");
const { sql, and, eq, lte } = require("drizzle-orm");
const { db } = require("../db/index");
const { users, notifications, broadcasts } = require("../db/schema/index");
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
          targetTitle: `[Birthday] PeerVerse: Happy Birthday, ${user.name}! 🥳 Wishing you a fantastic day ahead!`,
          isRead: false,
        });

        // Send Email
        const emailSubject = "Happy Birthday from PeerVerse! 🎉";
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

      // Get all active users
      const activeUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.isBanned, false));

      for (const broadcast of pendingBroadcasts) {
        if (activeUsers && activeUsers.length > 0) {
          // Prepare notifications for all active users
          const notificationsToInsert = activeUsers.map(user => ({
            recipientId: user.id,
            actorId: broadcast.createdBy, // use the raw DB column
            type: "system_broadcast",
            targetType: "broadcast",
            targetId: broadcast.id,
            targetTitle: `[${broadcast.type}] ${broadcast.title}: ${broadcast.message}`,
            isRead: false,
          }));

          // Insert in chunks to avoid blowing up the query size
          const chunkSize = 1000;
          for (let i = 0; i < notificationsToInsert.length; i += chunkSize) {
            const chunk = notificationsToInsert.slice(i, i + chunkSize);
            const inserted = await db.insert(notifications).values(chunk).returning();
            
            // Push via SSE to connected clients
            for (const notif of inserted) {
              const payload = {
                ...notif,
                actor: {
                  id: broadcast.createdBy,
                  name: "System", // System fallback, as we don't have the actor object fully populated
                  username: "system",
                  avatarUrl: null
                }
              };
              sseManager.send(notif.recipientId, "notification", payload);
            }
          }
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

  logger.info("[Cron] Cron jobs initialized.");
};

module.exports = { startCronJobs };
