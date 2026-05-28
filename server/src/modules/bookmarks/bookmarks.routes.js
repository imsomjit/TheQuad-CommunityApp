"use strict";

const { Router } = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const { auth } = require("../../middleware/auth");
const { bookmarkLimiter } = require("../../middleware/rateLimiter");
const bookmarkService = require("./bookmarks.service");
const { z } = require("zod");
const validate = require("../../middleware/validate");

const bookmarkSchema = z.object({
  targetType: z.enum(["resource", "blog"]),
  targetId: z.coerce.number().int().positive(),
});

const router = Router();

// POST /api/bookmarks  — toggle
router.post(
  "/",
  auth,
  bookmarkLimiter,
  validate(bookmarkSchema),
  asyncHandler(async (req, res) => {
    const result = await bookmarkService.toggleBookmark(req.user.id, req.body);
    res.json({ success: true, data: result });
  })
);

// GET /api/bookmarks?targetType=resource  — list my bookmarks
router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const ids = await bookmarkService.getUserBookmarkIds(
      req.user.id,
      req.query.targetType || "resource"
    );
    res.json({ success: true, data: ids });
  })
);

module.exports = router;
