"use strict";

const logger = require("../../../../utils/logger");

const ALLOWED_RESOURCES = {
    "codeforces.com": "Codeforces",
    "leetcode.com": "LeetCode",
    "codechef.com": "CodeChef",
    "atcoder.jp": "AtCoder",
    "hackerrank.com": "HackerRank",
    "hackerearth.com": "HackerEarth",
    "topcoder.com": "TopCoder",
    "geeksforgeeks.org": "GeeksforGeeks",
    "naukri.com/code360": "Code360 (Naukri)",
    "codingcompetitions.withgoogle.com": "Google Coding Competitions",
};

async function fetchClistOpportunities() {
  const { CLIST_USERNAME, CLIST_API_KEY } = process.env;
  if (!CLIST_USERNAME || !CLIST_API_KEY) {
    logger.warn("[Sync] Skipping CLIST sync: Credentials not found in .env");
    return [];
  }

  logger.info("[Sync] Starting CLIST sync...");
  try {
    // Fetch contests starting from 30 days ago to future
    const startGte = new Date();
    startGte.setDate(startGte.getDate() - 30);
    const startGteStr = startGte.toISOString();

    const url = new URL("https://clist.by/api/v4/contest/");
    url.searchParams.append("username", CLIST_USERNAME);
    url.searchParams.append("api_key", CLIST_API_KEY);
    url.searchParams.append("limit", "200");
    url.searchParams.append("order_by", "start");
    url.searchParams.append("start__gte", startGteStr);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`CLIST API returned ${res.status}`);
    const json = await res.json();
    const contests = json.objects || [];

    const normalized = contests
      .filter(c => ALLOWED_RESOURCES[c.resource])
      .map(c => {
        let status = "ENDED";
        const startTime = new Date(c.start);
        const endTime = new Date(c.end);
        const now = new Date();

        if (startTime > now) status = "UPCOMING";
        else if (endTime > now) status = "ONGOING";

        const formattedOrganizer = ALLOWED_RESOURCES[c.resource];

        return {
          source: "CLIST",
          sourceId: c.id.toString(),
          organizer: formattedOrganizer,
          title: c.event,
          description: c.description || "",
          officialUrl: c.href,
          type: "CODING_CONTEST",
          status,
          startTime,
          endTime,
          deadline: startTime, // For coding contests, start time is often the deadline to register/start
          tags: ["competitive programming", "clist", formattedOrganizer.toLowerCase()],
          rawData: JSON.stringify(c),
        };
      });

    logger.info(`[Sync] Successfully fetched ${normalized.length} CLIST opportunities.`);
    return normalized;
  } catch (error) {
    logger.error("[Sync] CLIST sync failed:", { error: error.message });
    return []; // Return empty array on failure so pipeline doesn't break
  }
}

module.exports = {
  fetchClistOpportunities,
};
