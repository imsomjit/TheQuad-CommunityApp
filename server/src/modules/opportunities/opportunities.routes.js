"use strict";

const { Router } = require("express");
const controller = require("./opportunities.controller");
const { auth, optionalAuth } = require("../../middleware/auth");
const { apiLimiter } = require("../../middleware/rateLimiter");

const router = Router();

// GET /api/opportunities
router.get("/", apiLimiter, controller.listOpportunities);

// GET /api/opportunities/bookmarked
router.get("/bookmarked", auth, apiLimiter, controller.getBookmarkedOpportunities);

// GET /api/opportunities/:id
router.get("/:id", optionalAuth, apiLimiter, controller.getOpportunityById);

// POST /api/opportunities/:id/bookmark
router.post("/:id/bookmark", auth, apiLimiter, controller.toggleBookmark);

module.exports = router;
