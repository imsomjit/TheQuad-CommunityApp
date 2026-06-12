"use strict";

const { Router } = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const { auth, restrictTo } = require("../../middleware/auth");
const { reportLimiter, adminLimiter } = require("../../middleware/rateLimiter");
const reportService = require("./reports.service");
const { z } = require("zod");
const validate = require("../../middleware/validate");

const submitReportSchema = z.object({
  targetType: z.enum(["resource", "question", "answer", "blog", "comment", "user", "opportunity", "book"]),
  targetId: z.coerce.number().int().positive(),
  reason: z.enum([
    "spam",
    "harassment",
    "abusive",
    "misleading",
    "copyright",
    "inappropriate",
    "duplicate",
    "other"
  ]),
  description: z.string().max(1000).trim().optional(),
});

const router = Router();

// POST /api/reports  — any authenticated user
router.post(
  "/",
  auth,
  reportLimiter,
  validate(submitReportSchema),
  asyncHandler(async (req, res) => {
    const report = await reportService.submitReport(req.user.id, req.body);
    res.status(201).json({ success: true, data: report });
  })
);

// The admin-specific moderation routes (list/review reports, suspend/ban users) 
// have been removed from here because they are already implemented and 
// consumed by the frontend via moderation.routes.js.

module.exports = router;
