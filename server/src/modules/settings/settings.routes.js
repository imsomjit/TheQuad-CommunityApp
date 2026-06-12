"use strict";

const express = require("express");
const { auth, restrictTo } = require("../../middleware/auth");
const settingsService = require("./settings.service");
const { userReadLimiter, adminLimiter } = require("../../middleware/rateLimiter");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../middleware/validate");
const { z } = require("zod");

const updateSettingsSchema = z.object({
  registrationEnabled: z.boolean().optional(),
  announcementActive: z.boolean().optional(),
  announcementType: z.enum(["INFO", "WARNING", "SUCCESS", "ERROR"]).optional(),
  announcementText: z.string().max(500).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    discord: z.string().url().optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal(""))
  }).optional()
});

const router = express.Router();

/**
 * @route   GET /api/settings
 * @desc    Get global site settings (Public)
 * @access  Public
 */
router.get("/", userReadLimiter, asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings();
  res.json(settings);
}));

/**
 * @route   PUT /api/settings
 * @desc    Update global site settings
 * @access  Admin only
 */
router.put("/", auth, restrictTo("admin"), adminLimiter, validate(updateSettingsSchema), asyncHandler(async (req, res) => {
  const updated = await settingsService.updateSettings(req.body);
  res.json(updated);
}));

module.exports = router;
