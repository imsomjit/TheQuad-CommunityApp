"use strict";

const { verifyAccessToken, verifyRefreshToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { db } = require("../db/index");
const { users } = require("../db/schema/index");
const { eq } = require("drizzle-orm");

const banCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const checkUserStatus = async (userId) => {
  const now = Date.now();
  const cached = banCache.get(userId);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }

  const [user] = await db.select({
    isBanned: users.isBanned,
    isSuspended: users.isSuspended,
    suspensionExpiresAt: users.suspensionExpiresAt
  }).from(users).where(eq(users.id, userId)).limit(1);

  banCache.set(userId, { user, timestamp: now });
  return user;
};

const invalidateUserCache = (userId) => {
  banCache.delete(userId);
};

const auth = asyncHandler(async (req, _res, next) => {
  let decoded;
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    const token = header.slice(7);
    decoded = verifyAccessToken(token);
  } else if (req.query.token) {
    decoded = verifyAccessToken(req.query.token);
  } else if (req.cookies?.pv_refresh && req.originalUrl.includes("/api/notifications/stream")) {
    decoded = verifyRefreshToken(req.cookies.pv_refresh);
  } else {
    throw new AppError("Authentication required", 401, "MISSING_TOKEN");
  }

  // Check DB to ensure user is not suspended or banned
  const user = await checkUserStatus(decoded.id);

  if (!user) throw new AppError("User not found", 401, "USER_NOT_FOUND");
  if (user.isBanned) throw new AppError("Your account has been banned", 403, "ACCOUNT_BANNED");
  if (user.isSuspended && (!user.suspensionExpiresAt || new Date() < new Date(user.suspensionExpiresAt))) throw new AppError("Your account is suspended", 403, "ACCOUNT_SUSPENDED");

  req.user = {
    id: decoded.id,
    username: decoded.username,
    role: decoded.role,
  };
  next();
});

const optionalAuth = async (req, _res, next) => {
  let decoded;
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    const token = header.slice(7);
    try {
      decoded = verifyAccessToken(token);
    } catch {
      // Ignore
    }
  } else if (req.query.token) {
    try {
      decoded = verifyAccessToken(req.query.token);
    } catch {
      // Ignore
    }
  } else if (req.cookies?.pv_refresh && req.originalUrl.includes("/api/notifications/stream")) {
    try {
      decoded = verifyRefreshToken(req.cookies.pv_refresh);
    } catch {
      // Ignore
    }
  }

  if (!decoded) {
    req.user = null;
    return next();
  }

  try {
    const user = await checkUserStatus(decoded.id);

    if (!user || user.isBanned || (user.isSuspended && (!user.suspensionExpiresAt || new Date() < new Date(user.suspensionExpiresAt)))) {
      req.user = null;
    } else {
      req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
    }
  } catch {
    req.user = null;
  }

  next();
};

const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403, "FORBIDDEN"));
    }
    next();
  };
};

const requireCsrf = (req, _res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  
  if (req.headers["x-requested-with"] !== "XMLHttpRequest") {
    throw new AppError("Invalid request: CSRF validation failed", 403, "CSRF_VIOLATION");
  }
  next();
};

module.exports = { auth, optionalAuth, restrictTo, requireCsrf, invalidateUserCache };
