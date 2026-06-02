"use strict";

const cron = require("node-cron");
const { sql } = require("drizzle-orm");
const { db } = require("../db/index");
const { users, notifications, broadcasts } = require("../db/schema/index");
const { sendEmail } = require("./email");
const logger = require("./logger");

const startCronJobs = () => {
  // Run everyday at 8:00 AM server time
  cron.schedule("0 8 * * *", async () => {
    try {
      logger.info("[Cron] Running birthday check job...");
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 1-12
      const currentDay = today.getDate(); // 1-31

      // Find users whose birthday is today
      const { rows: birthdayUsers } = await db.execute(sql`
        SELECT id, name, username, email FROM users
        WHERE EXTRACT(MONTH FROM date_of_birth) = ${currentMonth} 
          AND EXTRACT(DAY FROM date_of_birth) = ${currentDay}
          AND is_banned = false
      `);

      if (!birthdayUsers || birthdayUsers.length === 0) {
        logger.info("[Cron] No birthdays today.");
        return;
      }

      logger.info(`[Cron] Found ${birthdayUsers.length} birthdays today. Sending greetings...`);

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
        const emailHtml = `
          <div style="font-family: sans-serif; text-align: center; color: #1e293b; padding: 40px; background-color: #f8fafc; border-radius: 8px;">
            <h1 style="color: #6366f1;">Happy Birthday, ${user.name}! 🥳</h1>
            <p style="font-size: 16px; margin: 20px 0;">We at PeerVerse hope you have an incredible day filled with joy and success.</p>
            <p style="font-size: 16px;">Keep building, keep sharing, and keep growing!</p>
            <br/>
            <p style="font-size: 14px; color: #64748b;">Best Wishes,<br>The PeerVerse Team</p>
          </div>
        `;
        
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
      const { rows: pendingBroadcasts } = await db.execute(sql`
        SELECT * FROM broadcasts
        WHERE is_sent = false AND scheduled_at <= NOW()
      `);

      if (!pendingBroadcasts || pendingBroadcasts.length === 0) {
        return; // Nothing to send
      }

      logger.info(`[Cron] Found ${pendingBroadcasts.length} pending broadcasts.`);

      // Get all active users
      const { rows: activeUsers } = await db.execute(sql`
        SELECT id FROM users WHERE is_banned = false
      `);

      for (const broadcast of pendingBroadcasts) {
        if (activeUsers && activeUsers.length > 0) {
          // Prepare notifications for all active users
          const notificationsToInsert = activeUsers.map(user => ({
            recipientId: user.id,
            actorId: broadcast.created_by, // use the raw DB column
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
            await db.insert(notifications).values(chunk);
          }
        }

        // Mark broadcast as sent
        await db.execute(sql`
          UPDATE broadcasts SET is_sent = true WHERE id = ${broadcast.id}
        `);
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
