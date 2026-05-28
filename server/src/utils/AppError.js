"use strict";

/**
 * AppError — operational error class.
 *
 * Distinguishes expected, operational errors (bad input, not found, unauthorized)
 * from unexpected programming errors (crashes, unhandled exceptions).
 *
 * The global error handler uses isOperational to decide whether to send
 * a safe message to the client or a generic "something went wrong" response.
 */
class AppError extends Error {
  /**
   * @param {string}  message     - Human-readable error message (sent to client)
   * @param {number}  statusCode  - HTTP status code
   * @param {string}  [code]      - Optional machine-readable error code
   */
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || null;
    this.isOperational = true;
    // Capture clean stack trace (V8 only)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
