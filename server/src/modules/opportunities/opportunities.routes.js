"use strict";

const { Router } = require("express");
const controller = require("./opportunities.controller");
const { auth, optionalAuth } = require("../../middleware/auth");
const { apiLimiter } = require("../../middleware/rateLimiter");

const router = Router();

// GET /api/opportunities
router.get("/", apiLimiter, controller.listOpportunities);

// GET /api/opportunities/bookmarked
router.get("/bookmarked", auth, controller.getBookmarkedOpportunities);

// GET /api/opportunities/:id
router.get("/:id", optionalAuth, controller.getOpportunityById);

// POST /api/opportunities/:id/bookmark
router.post("/:id/bookmark", auth, controller.toggleBookmark);

module.exports = router;
