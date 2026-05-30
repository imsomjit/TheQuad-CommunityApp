"use strict";

const { fetchClistOpportunities } = require("./providers/clist.provider");
const { fetchKaggleOpportunities } = require("./providers/kaggle.provider");
const { deduplicateOpportunities } = require("./deduplicator");
const { db } = require("../../../db");
const { opportunities } = require("../../../db/schema");
const { sql } = require("drizzle-orm");
const logger = require("../../../utils/logger");
const cron = require("node-cron");

/**
 * Run the aggregation pipeline for specific sources.
 * @param {Array<string>} sources - 'CLIST', 'KAGGLE'
 */
async function runOpportunitySync(sources = ["CLIST", "KAGGLE"]) {
  logger.info(`[SyncService] Starting opportunity aggregation pipeline for ${sources.join(", ")}...`);

  try {
    const fetchPromises = [];
    if (sources.includes("CLIST")) fetchPromises.push(fetchClistOpportunities());
    if (sources.includes("KAGGLE")) fetchPromises.push(fetchKaggleOpportunities());

    const results = await Promise.all(fetchPromises);
    
    // Flatten the results array
    const allFetched = results.flat();
    logger.info(`[SyncService] Fetched total ${allFetched.length} opportunities.`);

    if (allFetched.length === 0) {
      logger.info("[SyncService] No opportunities fetched. Aborting sync.");
      return;
    }

    // Deduplicate
    const uniqueToUpsert = await deduplicateOpportunities(allFetched);
    logger.info(`[SyncService] After deduplication, ${uniqueToUpsert.length} opportunities to upsert.`);

    if (uniqueToUpsert.length === 0) return;

    // Batch upsert into database
    const chunkSize = 100;
    for (let i = 0; i < uniqueToUpsert.length; i += chunkSize) {
      const chunk = uniqueToUpsert.slice(i, i + chunkSize);

      await db.insert(opportunities)
        .values(chunk)
        .onConflictDoUpdate({
          target: [opportunities.source, opportunities.sourceId],
          set: {
            title: sql`EXCLUDED.title`,
            description: sql`EXCLUDED.description`,
            status: sql`EXCLUDED.status`,
            startTime: sql`EXCLUDED.start_time`,
            endTime: sql`EXCLUDED.end_time`,
            deadline: sql`EXCLUDED.deadline`,
            organizer: sql`EXCLUDED.organizer`,
            rawData: sql`EXCLUDED.raw_data`,
            updatedAt: new Date(),
          }
        });
    }

    logger.info("[SyncService] Opportunity aggregation pipeline completed successfully.");
  } catch (error) {
    logger.error("[SyncService] Critical failure in sync pipeline:", { error: error.message });
  }
}

function startSyncJobs() {
  // Sync CLIST every 30 minutes
  cron.schedule("*/30 * * * *", () => {
    runOpportunitySync(["CLIST"]);
  });

  // Sync Kaggle every 3 hours
  cron.schedule("0 */3 * * *", () => {
    runOpportunitySync(["KAGGLE"]);
  });

  // Initial fetch for development
  setTimeout(() => {
    runOpportunitySync(["CLIST", "KAGGLE"]);
  }, 5000);
}

module.exports = {
  runOpportunitySync,
  startSyncJobs,
};
