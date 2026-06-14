"use strict";

const authService = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");
const env = require("../../config/env");
const logger = require("../../utils/logger");
const { parseDurationMs } = require("../../utils/jwt");

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,              // JS cannot read this cookie (XSS protection)
  secure: env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: env.NODE_ENV === "production" ? "none" : "lax", // "none" required for cross-domain in prod
  maxAge: parseDurationMs(env.JWT_REFRESH_EXPIRES_IN),
  path: "/api",               // Allow SSE stream at /api/notifications to read this cookie
};

const setRefreshCookie = (res, token) => {
  // Clear the legacy cookie that had path="/api/auth" to prevent browser conflicts
  res.clearCookie("pv_refresh", { ...REFRESH_COOKIE_OPTIONS, path: "/api/auth", maxAge: 0 });
  res.cookie("pv_refresh", token, REFRESH_COOKIE_OPTIONS);
};

const clearRefreshCookie = (res) => {
  res.clearCookie("pv_refresh", { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
  res.clearCookie("pv_refresh", { ...REFRESH_COOKIE_OPTIONS, path: "/api/auth", maxAge: 0 });
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { email } = await authService.register(req.body);
  res.status(201).json({ success: true, message: "OTP sent to email", data: { email } });
});

// POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.verifyOtp(req.body);
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, data: { user, accessToken } });
});

// POST /api/auth/resend-otp
const resendOtp = asyncHandler(async (req, res) => {
  await authService.resendOtp(req.body);
  res.json({ success: true, message: "New OTP sent to email" });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, data: { user, accessToken } });
});

// ── Google OAuth (Server-Side Redirect Flow) ─────────────────────────────────

// GET /api/auth/google — redirect to Google consent screen
const googleRedirect = (req, res) => {
  if (!env.GOOGLE_CLIENT_ID) {
    return res.status(501).json({
      success: false,
      message: "Google OAuth is not configured on this server",
    });
  }

  const state = require("crypto").randomUUID();
  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state, // Add state parameter for CSRF protection
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

// GET /api/auth/google/callback
const googleCallback = asyncHandler(async (req, res) => {
  const { code, error, state } = req.query;
  const storedState = req.cookies?.oauth_state;

  // Clear state cookie as it's single-use
  res.clearCookie("oauth_state", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  });

  if (!state || state !== storedState) {
    logger.warn("Google OAuth CSRF state mismatch");
    return res.redirect(`${env.CLIENT_URL}/login?error=google_failed`);
  }

  if (error || !code) {
    logger.warn("Google OAuth denied or no code received", { error });
    return res.redirect(`${env.CLIENT_URL}/login?error=google_denied`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      logger.error("Google token exchange failed", { tokenData });
      return res.redirect(`${env.CLIENT_URL}/login?error=google_token_failed`);
    }

    // Fetch user info from Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userInfoRes.json();

    if (!googleUser.email) {
      return res.redirect(`${env.CLIENT_URL}/login?error=google_no_email`);
    }

    // Authenticate / create / link via service
    const { user, accessToken, refreshToken } = await authService.googleAuth({
      googleId: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    });

    // Set refresh cookie
    setRefreshCookie(res, refreshToken);

    // Redirect to client (AuthCallback page will read cookie via /api/auth/refresh)
    res.redirect(`${env.CLIENT_URL}/auth/callback`);
  } catch (err) {
    logger.error("Google OAuth callback error", { error: err.message });

    // Handle specific known errors
    if (err.statusCode === 403) {
      return res.redirect(`${env.CLIENT_URL}/login?error=${err.code?.toLowerCase() || "account_blocked"}`);
    }

    return res.redirect(`${env.CLIENT_URL}/login?error=google_failed`);
  }
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.pv_refresh;
  const { user, accessToken, refreshToken } = await authService.refresh(rawToken);
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, data: { user, accessToken } });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.pv_refresh;
  await authService.logout(rawToken);
  clearRefreshCookie(res);
  res.json({ success: true, message: "Logged out successfully" });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ success: true, data: { user } });
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);
  // Always return the same response
  res.json({ success: true, message: "If an account exists for this email, a password reset link has been sent." });
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  res.json({ success: true, message: "Password has been successfully reset." });
});

module.exports = { register, verifyOtp, resendOtp, login, googleRedirect, googleCallback, refresh, logout, me, forgotPassword, resetPassword };

