"use strict";

const bcrypt = require("bcryptjs");
const { eq, and, or } = require("drizzle-orm");
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
const { sendEmail } = require("../../utils/email");
const notificationService = require("../notifications/notifications.service");

const BCRYPT_ROUNDS = 12;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const getOtpExpiry = () => new Date(Date.now() + 15 * 60 * 1000); // 15 mins

/**
 * Strips sensitive fields before sending user to client.
 * @param {object} user
 */
const sanitizeUser = (user) => {
  const { passwordHash, otp, otpExpiresAt, ...safe } = user;
  return safe;
};

/**
 * Register a new student account (email + password).
 */
const register = async ({ name, username, email, password }) => {
  // Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  
  const otp = generateOtp();
  const otpExpiresAt = getOtpExpiry();

  // Insert user — unique constraint on email/username handled by DB + error handler
  const [user] = await db
    .insert(users)
    .values({ 
      name, 
      username, 
      email, 
      passwordHash, 
      role: "student", 
      authProvider: "local",
      isVerified: false,
      otp,
      otpExpiresAt
    })
    .returning();

  // Send OTP email
  await sendEmail({
    to: email,
    subject: "Verify your email for PeerVerse",
    html: `<h2>Welcome to PeerVerse!</h2><p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p>`,
  });

  return { success: true, email };
};

/**
 * Verify OTP
 */
const verifyOtp = async ({ email, otp }) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  if (user.isVerified) throw new AppError("User is already verified", 400, "ALREADY_VERIFIED");

  if (user.otp !== otp || new Date() > user.otpExpiresAt) {
    throw new AppError("Invalid or expired OTP", 400, "INVALID_OTP");
  }

  // Update user
  const [updated] = await db
    .update(users)
    .set({ isVerified: true, otp: null, otpExpiresAt: null, updatedAt: new Date() })
    .where(eq(users.id, user.id))
    .returning();

  // Send Welcome email
  await sendEmail({
    to: email,
    subject: "Welcome to PeerVerse!",
    html: `<h2>Welcome to PeerVerse, ${updated.name}!</h2><p>Your email has been successfully verified. We're thrilled to have you join our community.</p>`,
  });

  // Create welcome notification
  await notificationService.create({
    recipientId: updated.id,
    actorId: updated.id,
    type: "system_welcome",
  });

  const { accessToken, refreshToken } = await issueTokens(updated);

  return { success: true, user: sanitizeUser(updated), accessToken, refreshToken };
};

/**
 * Resend OTP
 */
const resendOtp = async ({ email }) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  if (user.isVerified) throw new AppError("User is already verified", 400, "ALREADY_VERIFIED");

  const otp = generateOtp();
  const otpExpiresAt = getOtpExpiry();

  await db.update(users).set({ otp, otpExpiresAt }).where(eq(users.id, user.id));

  await sendEmail({
    to: email,
    subject: "Your new verification code for PeerVerse",
    html: `<h2>PeerVerse Verification</h2><p>Your new verification code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p>`,
  });

  return { success: true };
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

  if (!user.isVerified) {
    throw new AppError("Please verify your email first", 403, "UNVERIFIED_EMAIL");
  }

  // If user registered via Google and never set a password
  if (!user.passwordHash) {
    throw new AppError(
      "This account uses Google sign-in. Please use the Google button to log in.",
      400,
      "GOOGLE_AUTH_REQUIRED"
    );
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
 * Google OAuth authentication.
 */
const googleAuth = async ({ googleId, email, name, picture }) => {
  // ── Case 1: Find by Google ID ──────────────────────────────────────────────
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.googleId, googleId))
    .limit(1);

  if (user) {
    if (user.isBanned) throw new AppError("Your account has been banned", 403, "ACCOUNT_BANNED");
    if (user.isSuspended) throw new AppError("Your account is suspended", 403, "ACCOUNT_SUSPENDED");

    const { accessToken, refreshToken } = await issueTokens(user);
    return { user: sanitizeUser(user), accessToken, refreshToken };
  }

  // ── Case 2: Find by email (account linking) ───────────────────────────────
  [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user) {
    if (user.isBanned) throw new AppError("Your account has been banned", 403, "ACCOUNT_BANNED");
    if (user.isSuspended) throw new AppError("Your account is suspended", 403, "ACCOUNT_SUSPENDED");

    // Link the Google account to the existing user
    const [updated] = await db
      .update(users)
      .set({
        googleId,
        avatarUrl: user.avatarUrl || picture || null,
        isVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    const { accessToken, refreshToken } = await issueTokens(updated);
    return { user: sanitizeUser(updated), accessToken, refreshToken, linked: true };
  }

  // ── Case 3: New user → auto-create ─────────────────────────────────────────
  const baseUsername = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 25);

  let finalUsername = baseUsername;
  let attempts = 0;
  while (attempts < 10) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, finalUsername))
      .limit(1);

    if (!existing) break;

    finalUsername = `${baseUsername}${Math.floor(Math.random() * 9000) + 1000}`;
    attempts++;
  }

  const [newUser] = await db
    .insert(users)
    .values({
      name: name || email.split("@")[0],
      username: finalUsername,
      email,
      passwordHash: null,
      role: "student",
      authProvider: "google",
      googleId,
      avatarUrl: picture || null,
      isVerified: true,
    })
    .returning();

  // Send Welcome Email for new Google user
  await sendEmail({
    to: email,
    subject: "Welcome to PeerVerse!",
    html: `<h2>Welcome to PeerVerse, ${newUser.name}!</h2><p>We're thrilled to have you join our community.</p>`,
  });

  // Create welcome notification
  await notificationService.create({
    recipientId: newUser.id,
    actorId: newUser.id,
    type: "system_welcome",
  });

  const { accessToken, refreshToken } = await issueTokens(newUser);
  return { user: sanitizeUser(newUser), accessToken, refreshToken, created: true };
};

/**
 * Refresh access token using a valid refresh token cookie.
 */
const refresh = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    throw new AppError("Refresh token required", 401, "MISSING_REFRESH_TOKEN");
  }

  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  const tokenHash = hashToken(rawRefreshToken);

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

  await db
    .update(refreshTokens)
    .set({ isRevoked: true })
    .where(eq(refreshTokens.id, stored.id));

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.id))
    .limit(1);

  if (!user || user.isBanned || user.isSuspended) {
    throw new AppError("Account not accessible", 403, "ACCOUNT_INACCESSIBLE");
  }

  const { accessToken, refreshToken: newRefreshToken } = await issueTokens(user);

  return { user: sanitizeUser(user), accessToken, refreshToken: newRefreshToken };
};

/**
 * Logout — revokes the refresh token.
 */
const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;

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

module.exports = { register, verifyOtp, resendOtp, login, googleAuth, refresh, logout, getMe };
