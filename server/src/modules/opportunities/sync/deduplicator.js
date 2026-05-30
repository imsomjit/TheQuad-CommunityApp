"use strict";

const { db } = require("../../../db");
const { opportunities } = require("../../../db/schema");
const { gte } = require("drizzle-orm");

/**
 * Filter out duplicates based on exact Title + Organizer + StartDate match
 * specifically for CROSS-PROVIDER duplicates. Same-provider updates are passed through.
 * 
 * @param {Array} newOpportunities - List of normalized opportunity objects fetched from APIs.
 * @returns {Promise<Array>} - List of opportunities to upsert.
 */
async function deduplicateOpportunities(newOpportunities) {
  if (!newOpportunities || newOpportunities.length === 0) return [];

  // Fetch opportunities from the last 6 months to avoid full table scans
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const existing = await db
    .select({
      source: opportunities.source,
      sourceId: opportunities.sourceId,
      title: opportunities.title,
      organizer: opportunities.organizer,
      startTime: opportunities.startTime,
    })
    .from(opportunities)
    .where(gte(opportunities.createdAt, sixMonthsAgo));

  const uniqueOpportunities = [];
  const incomingSet = new Set();

  for (const opp of newOpportunities) {
    const timeStr = opp.startTime ? new Date(opp.startTime).getTime().toString() : "null";
    const org = opp.organizer ? opp.organizer.toLowerCase() : "null";
    const title = opp.title.toLowerCase();
    
    // Check if it already exists from a DIFFERENT source
    const crossProviderDuplicate = existing.find(o => 
      o.title.toLowerCase() === title &&
      (o.organizer ? o.organizer.toLowerCase() : "null") === org &&
      (o.startTime ? new Date(o.startTime).getTime().toString() : "null") === timeStr &&
      o.source !== opp.source
    );

    if (crossProviderDuplicate) {
      continue; // Skip this one, it was already added by another provider
    }

    // Check for exact duplicates within the SAME incoming batch
    const incomingKey = `${title}|${org}|${timeStr}|${opp.source}`;
    if (incomingSet.has(incomingKey)) {
      continue;
    }

    incomingSet.add(incomingKey);
    uniqueOpportunities.push(opp);
  }

  return uniqueOpportunities;
}

module.exports = {
  deduplicateOpportunities,
};
