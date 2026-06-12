"use strict";

const { Router } = require("express");
const controller = require("./leetcode.controller");
const { leetcodeLimiter } = require("../../middleware/rateLimiter");

const router = Router();

// GET /api/leetcode/:username
router.get("/:username", leetcodeLimiter, controller.getProfileStats);

module.exports = router;
