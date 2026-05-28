"use strict";

const { Router } = require("express");
const controller = require("./auth.controller");
const validate = require("../../middleware/validate");
const { auth } = require("../../middleware/auth");
const { registerSchema, loginSchema } = require("./auth.schemas");
const {
  authLimiter,
  registerLimiter,
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

// POST /api/auth/login
// Rate: 10 requests per 15 minutes per IP
router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  controller.login
);

// POST /api/auth/refresh
// Uses httpOnly cookie — no rate limiter needed (automatic browser behavior)
router.post("/refresh", controller.refresh);

// POST /api/auth/logout
router.post("/logout", controller.logout);

// GET /api/auth/me
// Protected — must have valid access token
router.get("/me", auth, controller.me);

module.exports = router;
