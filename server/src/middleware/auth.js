"use strict";

const { verifyAccessToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * auth middleware — verifies the JWT access token from Authorization header.
 *
 * On success: attaches decoded payload to req.user
 *   req.user = { id, username, role }
 *
 * On failure: passes a 401 AppError to next()
 *
 * Usage:
 *   router.get('/protected', auth, controller.action);
 */
const auth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401, "MISSING_TOKEN");
  }

  const token = header.slice(7); // strip "Bearer "

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (err) {
    // Let JWT errors bubble to the global error handler
    // which converts them to proper 401 responses
    throw err;
  }
});

/**
 * optionalAuth — same as auth but doesn't fail if no token is present.
 * Useful for routes that are public but show extra data when authenticated.
 */
const optionalAuth = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  try {
    const token = header.slice(7);
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
  } catch {
    req.user = null;
  }

  next();
};

const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403, "FORBIDDEN");
    }
    next();
  };
};

module.exports = { auth, optionalAuth, restrictTo };
