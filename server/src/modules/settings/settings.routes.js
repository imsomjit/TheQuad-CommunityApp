"use strict";

const express = require("express");
const { auth, restrictTo } = require("../../middleware/auth");
const settingsService = require("./settings.service");
const { apiLimiter, adminLimiter } = require("../../middleware/rateLimiter");

const router = express.Router();

/**
 * @route   GET /api/settings
 * @desc    Get global site settings (Public)
 * @access  Public
 */
router.get("/", apiLimiter, async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/settings
 * @desc    Update global site settings
 * @access  Admin only
 */
router.put("/", auth, restrictTo("admin"), adminLimiter, async (req, res, next) => {
  try {
    const updated = await settingsService.updateSettings(req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
