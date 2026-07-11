"use strict";

const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");
const { db } = require("../../db/index");
const { users } = require("../../db/schema/index");
const { eq } = require("drizzle-orm");
const logger = require("../../utils/logger");

// ── Cache layer ──────────────────────────────────────────────────────────────
// GitHub API has a 60 req/hr limit for unauthenticated requests.
// We cache responses for 10 minutes to avoid hitting limits.
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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
  // Prevent unbounded growth
  if (cache.size > 500) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

// ── GitHub API helpers ───────────────────────────────────────────────────────
const GITHUB_API = "https://api.github.com";

async function githubFetch(path) {
  const url = `${GITHUB_API}${path}`;
  const cached = getCached(url);
  if (cached) return cached;

  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "thequad/1.0",
  };

  // Optional: add PAT for higher rate limit (60 → 5000 req/hr)
  // Set GITHUB_TOKEN in server .env — no special scopes needed
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });

  if (res.status === 404) {
    throw new AppError("GitHub user not found", 404, "GITHUB_NOT_FOUND");
  }
  if (res.status === 403) {
    throw new AppError(
      "GitHub API rate limit exceeded. Try again later.",
      429,
      "GITHUB_RATE_LIMITED"
    );
  }
  if (res.status === 401) {
    throw new AppError("Invalid GitHub Token. Please check your credentials.", 401, "GITHUB_UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new AppError("Failed to fetch from GitHub", 502, "GITHUB_API_ERROR");
  }

  const data = await res.json();
  setCache(url, data);
  return data;
}

async function githubGraphQL(query, variables) {
  const url = `https://api.github.com/graphql`;
  const key = `${url}:${JSON.stringify(variables)}`;
  const cached = getCached(key);
  if (cached) return cached;

  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "thequad/1.0",
    "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
  };

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify({ query, variables }) });
  
  if (res.status === 401) throw new AppError("Invalid GitHub Token. Please check your credentials.", 401, "GITHUB_UNAUTHORIZED");
  if (res.status === 403) throw new AppError("GitHub API rate limit exceeded.", 429, "GITHUB_RATE_LIMITED");
  if (!res.ok) throw new AppError("Failed to fetch from GitHub GraphQL", 502, "GITHUB_API_ERROR");

  const data = await res.json();
  if (data.errors) {
    if (data.errors[0]?.type === "NOT_FOUND") throw new AppError("GitHub user not found", 404, "GITHUB_NOT_FOUND");
    throw new AppError("GraphQL Error", 500, "GITHUB_API_ERROR");
  }

  setCache(key, data.data);
  return data.data;
}

// ── Service functions ────────────────────────────────────────────────────────

/**
 * Fetch a user's GitHub profile summary.
 */
const getProfile = async (githubUsername) => {
  const profile = await githubFetch(`/users/${githubUsername}`);

  return {
    login: profile.login,
    name: profile.name,
    avatar: profile.avatar_url,
    bio: profile.bio,
    company: profile.company,
    location: profile.location,
    blog: profile.blog,
    publicRepos: profile.public_repos,
    publicGists: profile.public_gists,
    followers: profile.followers,
    following: profile.following,
    createdAt: profile.created_at,
    htmlUrl: profile.html_url,
  };
};

/**
 * Fetch a user's recent public repositories.
 */
const getRepos = async (githubUsername, { limit = 20 } = {}) => {
  const repos = await githubFetch(
    `/users/${githubUsername}/repos?type=owner&sort=updated&per_page=${limit}`
  );

  return repos.map((r) => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    htmlUrl: r.html_url,
    homepage: r.homepage,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    watchers: r.watchers_count,
    openIssues: r.open_issues_count,
    isForked: r.fork,
    topics: r.topics || [],
    updatedAt: r.updated_at,
    pushedAt: r.pushed_at,
  }));
};

/**
 * Fetch language breakdown across all repos (aggregated bytes).
 */
const getLanguages = async (githubUsername) => {
  // First get repos
  const repos = await githubFetch(
    `/users/${githubUsername}/repos?type=owner&per_page=100`
  );

  // For performance, limit to top 15 repos by stars
  const topRepos = repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 15);

  const aggregated = {};

  for (const repo of topRepos) {
    try {
      const langs = await githubFetch(`/repos/${repo.full_name}/languages`);
      for (const [lang, bytes] of Object.entries(langs)) {
        aggregated[lang] = (aggregated[lang] || 0) + bytes;
      }
    } catch {
      // Skip repos that fail (private, rate limited, etc.)
    }
  }

  // Convert to sorted array
  const total = Object.values(aggregated).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(aggregated)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / total) * 1000) / 10,
    }))
    .sort((a, b) => b.bytes - a.bytes);
};

/**
 * Fetch recent contribution events (public activity).
 */
const getActivity = async (githubUsername, { limit = 30 } = {}) => {
  const events = await githubFetch(
    `/users/${githubUsername}/events/public?per_page=${Math.min(limit, 100)}`
  );

  return events.slice(0, limit).map((e) => ({
    id: e.id,
    type: e.type,
    repo: e.repo?.name,
    createdAt: e.created_at,
    action: e.payload?.action,
    // Simplify payload based on type
    ...(e.type === "PushEvent" && {
      commits: (e.payload?.commits || []).length,
      branch: e.payload?.ref?.replace("refs/heads/", ""),
    }),
    ...(e.type === "PullRequestEvent" && {
      title: e.payload?.pull_request?.title,
    }),
    ...(e.type === "IssuesEvent" && {
      title: e.payload?.issue?.title,
    }),
    ...(e.type === "CreateEvent" && {
      refType: e.payload?.ref_type,
      ref: e.payload?.ref,
    }),
  }));
};

/**
 * Calculate a contribution "streak" and summary from recent events.
 */
const getContributionSummary = async (githubUsername) => {
  if (process.env.GITHUB_TOKEN) {
    try {
      const query = `
        query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
              totalCommitContributions
            }
          }
        }
      `;
      const data = await githubGraphQL(query, { login: githubUsername });
      const collection = data.user.contributionsCollection;
      const calendar = collection.contributionCalendar;

      const dayMap = {};
      let activeDays = 0;

      for (const week of calendar.weeks) {
        for (const day of week.contributionDays) {
          if (day.contributionCount > 0) {
            dayMap[day.date] = day.contributionCount;
            activeDays++;
          }
        }
      }

      const today = new Date();
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (dayMap[key]) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      return {
        currentStreak: streak,
        totalEvents: calendar.totalContributions,
        totalCommits: collection.totalCommitContributions,
        activeDays,
        contributionsByDay: dayMap,
      };
    } catch (err) {
      logger.error("GraphQL contribution fetch failed, falling back to REST", err);
    }
  }

  // Fallback to REST API (only last 90 days available)
  const events = await githubFetch(
    `/users/${githubUsername}/events/public?per_page=100`
  );

  const dayMap = {};
  for (const e of events) {
    const day = e.created_at.slice(0, 10); // YYYY-MM-DD
    dayMap[day] = (dayMap[day] || 0) + 1;
  }

  // Calculate streak
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dayMap[key]) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  const pushEvents = events.filter((e) => e.type === "PushEvent");
  const totalCommits = pushEvents.reduce(
    (sum, e) => sum + (e.payload?.commits?.length || 0),
    0
  );

  return {
    currentStreak: streak,
    totalEvents: events.length,
    totalCommits,
    activeDays: Object.keys(dayMap).length,
    contributionsByDay: dayMap,
  };
};

module.exports = {
  getProfile,
  getRepos,
  getLanguages,
  getActivity,
  getContributionSummary,
};
