"use strict";

const { Router } = require("express");
const controller = require("./github.controller");
const { githubLimiter } = require("../../middleware/rateLimiter");

const router = Router();

// All GitHub routes are public (no auth required).
// Rate limited to prevent abuse of our proxy.

// GET /api/github/:username — profile summary
router.get("/:username", githubLimiter, controller.getProfile);

// GET /api/github/:username/repos — public repos (sorted by stars)
router.get("/:username/repos", githubLimiter, controller.getRepos);

// GET /api/github/:username/languages — aggregated language breakdown
router.get("/:username/languages", githubLimiter, controller.getLanguages);

// GET /api/github/:username/activity — recent public events
router.get("/:username/activity", githubLimiter, controller.getActivity);

// GET /api/github/:username/contributions — streak + summary
router.get("/:username/contributions", githubLimiter, controller.getContributions);

module.exports = router;
