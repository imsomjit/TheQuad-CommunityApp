"use strict";

/**
 * asyncHandler — wraps async route handlers to catch promise rejections.
 *
 * Without this, an async controller that throws will cause an unhandled
 * promise rejection and the Express error handler won't see it.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
