"use strict";

const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const env = require("../config/env");

/**
 * Global error handler middleware.
 * Must be registered LAST in app.js (after all routes).
 *
 * Handles:
 * - Operational errors (AppError instances) → send message to client
 * - JWT errors → 401
 * - Drizzle/pg errors → 400 or 409 (constraint violations)
 * - Unknown errors → 500 with generic message
 */
const errorHandler = (err, req, res, _next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let code = err.code || "INTERNAL_ERROR";

  // ── JWT errors ─────────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    code = "INVALID_TOKEN";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  }

  // ── PostgreSQL errors ──────────────────────────────────────────────────────
  else if (err.code === "23505") {
    // Unique constraint violation
    statusCode = 409;
    message = extractPgConflictMessage(err.detail);
    code = "CONFLICT";
  } else if (err.code === "23503") {
    // Foreign key violation
    statusCode = 400;
    message = "Referenced record does not exist";
    code = "FOREIGN_KEY_VIOLATION";
  } else if (err.code === "22P02") {
    // Invalid input syntax (e.g., passing a string where int expected)
    statusCode = 400;
    message = "Invalid input format";
    code = "INVALID_INPUT";
  }

  // ── Zod validation errors (from validate middleware) ──────────────────────
  else if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation error";
    code = "VALIDATION_ERROR";
    return res.status(statusCode).json({
      success: false,
      message,
      code,
      errors: err.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  // ── Log ───────────────────────────────────────────────────────────────────
  if (statusCode >= 500) {
    logger.error("Unhandled server error", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  } else if (statusCode >= 400) {
    logger.warn("Client error", {
      message,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // ── Response ──────────────────────────────────────────────────────────────
  const body = {
    success: false,
    message: statusCode >= 500 && env.NODE_ENV === "production"
      ? "An unexpected error occurred. Please try again."
      : message,
    code,
    ...(env.NODE_ENV !== "production" && statusCode >= 500 && { stack: err.stack }),
  };

  res.status(statusCode).json(body);
};

/** Parse pg's constraint detail into a friendlier message. */
function extractPgConflictMessage(detail = "") {
  if (detail.includes("username")) return "Username is already taken";
  if (detail.includes("email")) return "Email is already registered";
  return "A record with this value already exists";
}

module.exports = errorHandler;
