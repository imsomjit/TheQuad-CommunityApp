"use strict";

const logger = require("../../../../utils/logger");

async function fetchKaggleOpportunities() {
  const { KAGGLE_USERNAME, KAGGLE_KEY } = process.env;
  if (!KAGGLE_USERNAME || !KAGGLE_KEY) {
    logger.warn("[Sync] Skipping Kaggle sync: Credentials not found in .env");
    return [];
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

    const normalized = competitions.map(c => {
      const deadline = c.deadline ? new Date(c.deadline) : null;
      const enabledDate = c.enabledDate ? new Date(c.enabledDate) : null;
      const now = new Date();

      let status = "ONGOING";
      if (deadline && deadline < now) status = "ENDED";
      if (enabledDate && enabledDate > now) status = "UPCOMING";

      return {
        source: "KAGGLE",
        sourceId: c.id?.toString() || c.ref,
        organizer: "Kaggle",
        title: c.title,
        description: c.description || c.subtitle || "Kaggle Data Science Competition",
        officialUrl: c.url || `https://www.kaggle.com/c/${c.ref}`,
        type: "DATA_SCIENCE_COMPETITION",
        status,
        startTime: enabledDate,
        endTime: deadline,
        deadline: deadline,
        tags: ["data science", "machine learning", "kaggle", c.category?.toLowerCase()].filter(Boolean),
        rawData: JSON.stringify(c),
      };
    });

    logger.info(`[Sync] Successfully fetched ${normalized.length} Kaggle opportunities.`);
    return normalized;
  } catch (error) {
    logger.error("[Sync] Kaggle sync failed:", { error: error.message });
    return [];
  }
}

module.exports = {
  fetchKaggleOpportunities,
};
