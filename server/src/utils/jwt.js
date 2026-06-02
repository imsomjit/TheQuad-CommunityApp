"use strict";

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const env = require("../config/env");

/**
 * Signs a short-lived access token containing the user payload.
 * @param {{ id: number, username: string, role: string }} payload
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

/**
 * Signs a long-lived refresh token.
 * We include only the userId to keep the token small.
 * @param {number} userId
 */
const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

/**
 * Verifies an access token. Throws if invalid/expired.
 * @param {string} token
 * @returns {{ id: number, username: string, role: string, iat: number, exp: number }}
 */
const verifyAccessToken = (token) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET);

/**
 * Verifies a refresh token. Throws if invalid/expired.
 * @param {string} token
 * @returns {{ id: number, iat: number, exp: number }}
 */
const verifyRefreshToken = (token) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET);

/**
 * Hashes a refresh token for secure DB storage.
 * We never store raw tokens — if the DB leaks, tokens are unusable.
 * @param {string} token
 * @returns {string} SHA-256 hex hash
 */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Calculates the expiry Date for a refresh token based on JWT_REFRESH_EXPIRES_IN.
 * @returns {Date}
 */
const refreshTokenExpiry = () => {
  const ms = parseDurationMs(env.JWT_REFRESH_EXPIRES_IN);
  return new Date(Date.now() + ms);
};

/** Parses simple duration strings like "7d", "15m", "1h" to milliseconds. */
function parseDurationMs(str) {
  const map = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 86_400_000; // default 7d
  return parseInt(match[1]) * map[match[2]];
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  refreshTokenExpiry,
  parseDurationMs,
};
