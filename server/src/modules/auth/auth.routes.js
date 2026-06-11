"use strict";

const { Router } = require("express");
const controller = require("./auth.controller");
const validate = require("../../middleware/validate");
const { auth, requireCsrf } = require("../../middleware/auth");
const { registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema } = require("./auth.schemas");
const {
  authLimiter,
  registerLimiter,
  refreshLimiter,
  userReadLimiter,
} = require("../../middleware/rateLimiter");

const router = Router();

// POST /api/auth/register
// Rate: 5 requests per hour per IP
router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  controller.register
);

// POST /api/auth/verify-otp
router.post(
  "/verify-otp",
  authLimiter,
  validate(verifyOtpSchema),
  controller.verifyOtp
);

// POST /api/auth/resend-otp
router.post(
  "/resend-otp",
  authLimiter,
  validate(resendOtpSchema),
  controller.resendOtp
);

// POST /api/auth/login
// Rate: 10 requests per 15 minutes per IP
router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  controller.login
);

// GET /api/auth/google — redirect to Google consent screen
router.get("/google", authLimiter, controller.googleRedirect);

// GET /api/auth/google/callback — handle Google OAuth callback
router.get("/google/callback", authLimiter, controller.googleCallback);

// POST /api/auth/refresh
// Rate-limited to prevent brute-force refresh token guessing
router.post("/refresh", requireCsrf, refreshLimiter, controller.refresh);

// POST /api/auth/logout
router.post("/logout", requireCsrf, refreshLimiter, controller.logout);

// GET /api/auth/me
// Protected — must have valid access token
router.get("/me", auth, userReadLimiter, controller.me);

module.exports = router;

