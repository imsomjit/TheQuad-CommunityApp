"use strict";

const rateLimit = require("express-rate-limit");

/**
 * Per-module rate limiters for PeerVerse API.
 *
 * Design rationale:
 * - Auth routes: very strict (brute-force protection)
 * - Write routes: moderate (prevent spam)
 * - Read routes: generous (good UX for search/browse)
 * - Upload routes: strict (storage cost control)
 * - Admin routes: moderate (low volume expected)
 * - SSE routes: very generous (persistent connections)
 *
 * All limiters use a standard JSON error response.
 * Rate limit headers (RateLimit-*) are sent on every response.
 */

const rateLimitResponse = (req, res) => {
  res.status(429).json({
    success: false,
    message: "Too many requests — please slow down and try again.",
    code: "RATE_LIMITED",
    retryAfter: Math.ceil(res.getHeader("Retry-After") || 60),
  });
};

// ── Auth ───────────────────────────────────────────────────────────────────────
// 10 attempts per 15 minutes per IP — strict brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
  message: undefined,
});

// Register separately — even stricter (one bad actor creating accounts)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// Forgot Password Limiter
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// Refresh token limiter - much more generous since multiple tabs/users behind NAT can hit this often
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Resources ─────────────────────────────────────────────────────────────────
// List/search resources: 120 req/min (public browsing)
const resourceReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// Create/edit/delete resources: 30 req/15min
const resourceWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// File upload: 10 per hour (bandwidth / Cloudinary cost)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Questions & Answers ───────────────────────────────────────────────────────
// Read: 120/min
const questionReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// Write (ask/answer/edit): 30/15min
const questionWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Comments ──────────────────────────────────────────────────────────────────
// 60 comments per 15 minutes
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Votes ─────────────────────────────────────────────────────────────────────
// 200 votes per 15 minutes (fast action, toggle)
const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Bookmarks ─────────────────────────────────────────────────────────────────
// 100 bookmarks per 15 minutes
const bookmarkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Follows ───────────────────────────────────────────────────────────────────
// 60 follow/unfollow per 15 minutes
const followLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Users / Profile ───────────────────────────────────────────────────────────
// Profile reads: 100/min
const userReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// Profile updates: 20/15min
const userWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Notifications ─────────────────────────────────────────────────────────────
// SSE connections: 10 concurrent per IP (persistent connections)
const sseLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// REST notification actions (mark read): 60/min
const notificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Reports ───────────────────────────────────────────────────────────────────
// Submit report: 20 per hour (prevent spam-reporting)
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// Admin actions: 200/15min (mods do high-volume reviews)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Posts / Knowledge Publishing ──────────────────────────────────────────────
// Read: 120/min (same as resources)
const postReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// Write: 30/15min
const postWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// Autosave: 60/min (frequent but lightweight drafts)
const autosaveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Opportunities ─────────────────────────────────────────────────────────────
// Read: 120/min
const opportunityReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// Write: 30/15min
const opportunityWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── External APIs (GitHub, LeetCode) ──────────────────────────────────────────
const githubLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

const leetcodeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Books ─────────────────────────────────────────────────────────────────────
const bookReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Additional Specific Read Limiters ─────────────────────────────────────────
const commentReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

const voteReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// ── Chat ───────────────────────────────────────────────────────────────────────
const chatReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

const chatWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

module.exports = {
  authLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  refreshLimiter,
  resourceReadLimiter,
  resourceWriteLimiter,
  uploadLimiter,
  questionReadLimiter,
  questionWriteLimiter,
  commentLimiter,
  voteLimiter,
  bookmarkLimiter,
  followLimiter,
  userReadLimiter,
  userWriteLimiter,
  sseLimiter,
  notificationLimiter,
  reportLimiter,
  adminLimiter,
  postReadLimiter,
  postWriteLimiter,
  autosaveLimiter,
  opportunityReadLimiter,
  opportunityWriteLimiter,
  githubLimiter,
  leetcodeLimiter,
  bookReadLimiter,
  commentReadLimiter,
  voteReadLimiter,
  chatReadLimiter,
  chatWriteLimiter,
};
