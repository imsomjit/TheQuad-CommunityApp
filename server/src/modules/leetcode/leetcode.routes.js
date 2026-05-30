"use strict";

const { Router } = require("express");
const controller = require("./leetcode.controller");
const { apiLimiter } = require("../../middleware/rateLimiter");

const router = Router();

// GET /api/leetcode/:username
router.get("/:username", apiLimiter, controller.getProfileStats);

module.exports = router;
