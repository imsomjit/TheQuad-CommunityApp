"use strict";

const { Router } = require("express");
const controller = require("./opportunities.controller");
const { auth, optionalAuth } = require("../../middleware/auth");
const { apiLimiter } = require("../../middleware/rateLimiter");
const { db } = require("../../db/index");
const { opportunities } = require("../../db/schema/index");
const { eq } = require("drizzle-orm");
const { extractIdFromSlug } = require("../../utils/slugify");

const router = Router();

// Middleware to resolve slug or ID to integer ID
router.param("id", async (req, res, next, val) => {
  try {
    const publicId = extractIdFromSlug(val);
    if (!publicId) return next();
    
    const [row] = await db.select({ id: opportunities.id }).from(opportunities).where(eq(opportunities.publicId, publicId)).limit(1);
    if (row) {
      req.params.id = row.id;
      return next();
    }
    
    if (/^\d+$/.test(publicId)) {
      req.params.id = parseInt(publicId, 10);
      return next();
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

// GET /api/opportunities
router.get("/", apiLimiter, controller.listOpportunities);

// GET /api/opportunities/bookmarked
router.get("/bookmarked", auth, apiLimiter, controller.getBookmarkedOpportunities);

// GET /api/opportunities/:id
router.get("/:id", optionalAuth, apiLimiter, controller.getOpportunityById);

// POST /api/opportunities/:id/bookmark
router.post("/:id/bookmark", auth, apiLimiter, controller.toggleBookmark);

module.exports = router;
