"use strict";

const AppError = require("../../utils/AppError");
const logger = require("../../utils/logger");

const cache = new Map();
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
  if (cache.size > 500) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

async function leetcodeGraphQL(query, variables) {
  const res = await fetch(LEETCODE_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://leetcode.com/"
    },
    body: JSON.stringify({ query, variables })
  });

  if (!res.ok) {
    throw new AppError("Failed to fetch LeetCode data", res.status);
  }

  const json = await res.json();
  if (json.errors) {
    logger.error("LeetCode GraphQL error", { errors: json.errors });
    throw new AppError("LeetCode user not found or error", 400);
  }

  return json.data;
}

const getProfileStats = async (username) => {
  const cacheKey = `leetcode:${username}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const profileQuery = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  const contestQuery = `
    query getUserContestRanking($username: String!) {
      userContestRanking(username: $username) {
        rating
        globalRanking
      }
    }
  `;

  try {
    const [profileData, contestData] = await Promise.all([
      leetcodeGraphQL(profileQuery, { username }),
      leetcodeGraphQL(contestQuery, { username })
    ]);

    if (!profileData.matchedUser) {
      throw new AppError("LeetCode user not found", 404);
    }

    const acStats = profileData.matchedUser.submitStats.acSubmissionNum;
    const all = acStats.find(s => s.difficulty === "All")?.count || 0;
    const easy = acStats.find(s => s.difficulty === "Easy")?.count || 0;
    const medium = acStats.find(s => s.difficulty === "Medium")?.count || 0;
    const hard = acStats.find(s => s.difficulty === "Hard")?.count || 0;

    const contest = contestData.userContestRanking;

    const data = {
      username,
      solved: {
        all,
        easy,
        medium,
        hard
      },
      contest: contest ? {
        rating: Math.round(contest.rating),
        globalRanking: contest.globalRanking
      } : null
    };

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Error fetching LeetCode stats", { error: error.message });
    throw new AppError("Internal error while fetching LeetCode stats", 500);
  }
};

module.exports = {
  getProfileStats
};
