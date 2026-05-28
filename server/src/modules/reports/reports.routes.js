"use strict";

const { Router } = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const { auth } = require("../../middleware/auth");
const requireRole = require("../../middleware/requireRole");
const { reportLimiter, adminLimiter } = require("../../middleware/rateLimiter");
const reportService = require("./reports.service");
const { z } = require("zod");
const validate = require("../../middleware/validate");

const submitReportSchema = z.object({
  targetType: z.enum(["resource", "question", "answer", "blog", "comment", "user"]),
  targetId: z.coerce.number().int().positive(),
  reason: z.enum(["spam", "abusive", "irrelevant", "copyright", "misinformation", "other"]),
  details: z.string().max(1000).trim().optional(),
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

// GET /api/reports  — moderator/admin only
router.get(
  "/",
  auth,
  requireRole("moderator", "admin"),
  adminLimiter,
  asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const result = await reportService.listReports({
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json({ success: true, ...result });
  })
);

// PATCH /api/reports/:id  — moderator/admin: review/dismiss
router.patch(
  "/:id",
  auth,
  requireRole("moderator", "admin"),
  adminLimiter,
  asyncHandler(async (req, res) => {
    const { status } = req.body; // "reviewed" | "dismissed"
    const report = await reportService.reviewReport(
      parseInt(req.params.id),
      req.user.id,
      status
    );
    res.json({ success: true, data: report });
  })
);

// PATCH /api/reports/users/:id/suspend  — admin only
router.patch(
  "/users/:id/suspend",
  auth,
  requireRole("admin"),
  adminLimiter,
  asyncHandler(async (req, res) => {
    await reportService.suspendUser(parseInt(req.params.id), req.user.id);
    res.json({ success: true, message: "User suspended" });
  })
);

// PATCH /api/reports/users/:id/ban  — admin only
router.patch(
  "/users/:id/ban",
  auth,
  requireRole("admin"),
  adminLimiter,
  asyncHandler(async (req, res) => {
    await reportService.banUser(parseInt(req.params.id), req.user.id);
    res.json({ success: true, message: "User banned" });
  })
);

// PATCH /api/reports/users/:id/reinstate  — admin only
router.patch(
  "/users/:id/reinstate",
  auth,
  requireRole("admin"),
  adminLimiter,
  asyncHandler(async (req, res) => {
    await reportService.reinstateUser(parseInt(req.params.id));
    res.json({ success: true, message: "User reinstated" });
  })
);

module.exports = router;
