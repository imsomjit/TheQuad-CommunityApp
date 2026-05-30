"use strict";

const { db } = require("../../db/index");
const { opportunities } = require("../../db/schema/index");
const { sql } = require("drizzle-orm");
const cron = require("node-cron");
const logger = require("../../utils/logger");
const env = require("../../config/env");

async function syncCodeforces() {
  logger.info("[Sync] Starting Codeforces sync...");
  try {
    const res = await fetch("https://codeforces.com/api/contest.list");
    if (!res.ok) throw new Error("Failed to fetch Codeforces API");
    const json = await res.json();
    if (json.status !== "OK") throw new Error("Codeforces API returned error");

    const contests = json.result; // Array of contest objects
    
    // Process in chunks to avoid overwhelming the DB
    const chunkSize = 100;
    for (let i = 0; i < contests.length; i += chunkSize) {
      const chunk = contests.slice(i, i + chunkSize);
      const values = chunk.map(c => {
        let status = "ENDED";
        if (c.phase === "BEFORE") status = "UPCOMING";
        if (c.phase === "CODING") status = "ONGOING";

        const startTime = c.startTimeSeconds ? new Date(c.startTimeSeconds * 1000) : null;
        let endTime = null;
        if (startTime && c.durationSeconds) {
          endTime = new Date(startTime.getTime() + c.durationSeconds * 1000);
        }

        return {
          source: "CODEFORCES",
          sourceId: c.id.toString(),
          title: c.name,
          description: `Codeforces Contest: ${c.name}`,
          officialUrl: `https://codeforces.com/contest/${c.id}`,
          type: "CODING_CONTEST",
          status,
          startTime,
          endTime,
          deadline: startTime, // For coding contests, start time is often the deadline to register/start
          tags: ["competitive programming", "codeforces", c.type?.toLowerCase()].filter(Boolean),
          updatedAt: new Date(),
        };
      });

      await db.insert(opportunities)
        .values(values)
        .onConflictDoUpdate({
          target: [opportunities.source, opportunities.sourceId],
          set: {
            title: sql`EXCLUDED.title`,
            status: sql`EXCLUDED.status`,
            startTime: sql`EXCLUDED.start_time`,
            endTime: sql`EXCLUDED.end_time`,
            updatedAt: new Date(),
          }
        });
    }
    logger.info(`[Sync] Successfully synced ${contests.length} Codeforces contests.`);
  } catch (error) {
    logger.error("[Sync] Codeforces sync failed:", { error: error.message });
  }
}

async function syncKaggle() {
  const { KAGGLE_USERNAME, KAGGLE_KEY } = process.env;
  if (!KAGGLE_USERNAME || !KAGGLE_KEY) {
    logger.warn("[Sync] Skipping Kaggle sync: KAGGLE_USERNAME or KAGGLE_KEY not found in .env");
    return;
  }

  logger.info("[Sync] Starting Kaggle sync...");
  try {
    const auth = Buffer.from(`${KAGGLE_USERNAME}:${KAGGLE_KEY}`).toString("base64");
    const res = await fetch("https://www.kaggle.com/api/v1/competitions/list", {
      headers: {
        "Authorization": `Basic ${auth}`
      }
    });

    if (!res.ok) throw new Error(`Kaggle API returned ${res.status}`);
    const competitions = await res.json();

    const chunkSize = 100;
    for (let i = 0; i < competitions.length; i += chunkSize) {
      const chunk = competitions.slice(i, i + chunkSize);
      const values = chunk.map(c => {
        const deadline = c.deadline ? new Date(c.deadline) : null;
        const enabledDate = c.enabledDate ? new Date(c.enabledDate) : null;
        const now = new Date();

        let status = "ONGOING";
        if (deadline && deadline < now) status = "ENDED";
        if (enabledDate && enabledDate > now) status = "UPCOMING";

        return {
          source: "KAGGLE",
          sourceId: c.id?.toString() || c.ref,
          title: c.title,
          description: c.description || c.subtitle || "Kaggle Data Science Competition",
          officialUrl: c.url || `https://www.kaggle.com/c/${c.ref}`,
          type: "DATA_SCIENCE_COMPETITION",
          status,
          startTime: enabledDate,
          endTime: deadline,
          deadline: deadline,
          tags: ["data science", "machine learning", "kaggle", c.category?.toLowerCase()].filter(Boolean),
          updatedAt: new Date(),
        };
      });

      await db.insert(opportunities)
        .values(values)
        .onConflictDoUpdate({
          target: [opportunities.source, opportunities.sourceId],
          set: {
            title: sql`EXCLUDED.title`,
            description: sql`EXCLUDED.description`,
            status: sql`EXCLUDED.status`,
            startTime: sql`EXCLUDED.start_time`,
            endTime: sql`EXCLUDED.end_time`,
            deadline: sql`EXCLUDED.deadline`,
            updatedAt: new Date(),
          }
        });
    }
    logger.info(`[Sync] Successfully synced ${competitions.length} Kaggle competitions.`);
  } catch (error) {
    logger.error("[Sync] Kaggle sync failed:", { error: error.message });
  }
}

const startSyncJobs = () => {
  // Sync Codeforces every 30 minutes
  cron.schedule("*/30 * * * *", () => {
    syncCodeforces();
  });

  // Sync Kaggle every 6 hours (at minute 0 past every 6th hour)
  cron.schedule("0 */6 * * *", () => {
    syncKaggle();
  });

  // Run initial sync immediately if in production or specifically requested
  // For development, we run it once after a small delay
  setTimeout(() => {
    syncCodeforces();
    syncKaggle();
  }, 5000); // 5 seconds after boot
};

module.exports = {
  startSyncJobs,
  syncCodeforces,
  syncKaggle
};
