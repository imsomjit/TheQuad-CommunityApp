"use strict";

const AppError = require("../utils/AppError");

/**
 * requireRole(...roles) — RBAC middleware factory.
 *
 * Must come AFTER the `auth` middleware (requires req.user to be set).
 *
 * Usage:
 *   router.delete('/admin/user/:id', auth, requireRole('admin'), controller.ban);
 *   router.patch('/report/:id', auth, requireRole('moderator', 'admin'), controller.review);
 */
const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401, "MISSING_TOKEN"));
  }

  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(
        `Access denied. Required role: ${roles.join(" or ")}`,
        403,
        "FORBIDDEN"
      )
    );
  }

  next();
};

module.exports = requireRole;
