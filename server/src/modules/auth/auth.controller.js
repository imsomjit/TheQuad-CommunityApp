"use strict";

const authService = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");
const env = require("../../config/env");

/** Parses "7d" → milliseconds for cookie maxAge */
const parseDurationMs = (str) => {
  const map = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 86_400_000;
  return parseInt(match[1]) * map[match[2]];
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,              // JS cannot read this cookie (XSS protection)
  secure: env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: parseDurationMs(env.JWT_REFRESH_EXPIRES_IN),
  path: "/api/auth",          // Only sent to auth routes (minimizes exposure)
};

const setRefreshCookie = (res, token) => {
  res.cookie("pv_refresh", token, REFRESH_COOKIE_OPTIONS);
};

const clearRefreshCookie = (res) => {
  res.clearCookie("pv_refresh", { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ success: true, data: { user, accessToken } });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, data: { user, accessToken } });
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

module.exports = { register, login, refresh, logout, me };
