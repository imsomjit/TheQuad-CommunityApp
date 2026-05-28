"use strict";

const bcrypt = require("bcryptjs");
const { eq, and } = require("drizzle-orm");
const { db } = require("../../db/index");
const { users, refreshTokens } = require("../../db/schema/index");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshTokenExpiry,
} = require("../../utils/jwt");
const AppError = require("../../utils/AppError");

const BCRYPT_ROUNDS = 12;

/**
 * Strips sensitive fields before sending user to client.
 * @param {object} user
 */
const sanitizeUser = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

/**
 * Register a new student account.
 */
const register = async ({ name, username, email, password }) => {
  // Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Insert user — unique constraint on email/username handled by DB + error handler
  const [user] = await db
    .insert(users)
    .values({ name, username, email, passwordHash, role: "student" })
    .returning();

  // Issue tokens
  const { accessToken, refreshToken } = await issueTokens(user);

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

/**
 * Login with email + password.
 */
const login = async ({ email, password }) => {
  // Fetch user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  if (user.isBanned) {
    throw new AppError("Your account has been banned", 403, "ACCOUNT_BANNED");
  }

  if (user.isSuspended) {
    throw new AppError("Your account is suspended", 403, "ACCOUNT_SUSPENDED");
  }

  // Constant-time compare (bcrypt handles this)
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const { accessToken, refreshToken } = await issueTokens(user);

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

/**
 * Refresh access token using a valid refresh token cookie.
 * Implements token rotation: old refresh token is revoked, new one issued.
 */
const refresh = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    throw new AppError("Refresh token required", 401, "MISSING_REFRESH_TOKEN");
  }

  // Verify JWT signature and expiry
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  const tokenHash = hashToken(rawRefreshToken);

  // Check DB: token must exist, not revoked
  const [stored] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        eq(refreshTokens.isRevoked, false)
      )
    )
    .limit(1);

  if (!stored) {
    throw new AppError("Refresh token invalid or revoked", 401, "INVALID_REFRESH_TOKEN");
  }

  // Revoke the old token (rotation)
  await db
    .update(refreshTokens)
    .set({ isRevoked: true })
    .where(eq(refreshTokens.id, stored.id));

  // Get user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.id))
    .limit(1);

  if (!user || user.isBanned || user.isSuspended) {
    throw new AppError("Account not accessible", 403, "ACCOUNT_INACCESSIBLE");
  }

  // Issue new tokens
  const { accessToken, refreshToken: newRefreshToken } = await issueTokens(user);

  return { user: sanitizeUser(user), accessToken, refreshToken: newRefreshToken };
};

/**
 * Logout — revokes the refresh token.
 */
const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return; // Already logged out

  const tokenHash = hashToken(rawRefreshToken);
  await db
    .update(refreshTokens)
    .set({ isRevoked: true })
    .where(eq(refreshTokens.tokenHash, tokenHash));
};

/**
 * Get current user by ID (for /me endpoint).
 */
const getMe = async (userId) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  return sanitizeUser(user);
};

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Issues both tokens and stores the refresh token hash in DB.
 */
const issueTokens = async (user) => {
  const accessToken = signAccessToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });

  const refreshToken = signRefreshToken(user.id);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = refreshTokenExpiry();

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

module.exports = { register, login, refresh, logout, getMe };
