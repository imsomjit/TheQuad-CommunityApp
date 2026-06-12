"use strict";

const express = require("express");
const { auth, restrictTo } = require("../../middleware/auth");
const broadcastsService = require("./broadcasts.service");
const { adminLimiter } = require("../../middleware/rateLimiter");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../middleware/validate");
const { z } = require("zod");

const createBroadcastSchema = z.object({
  title: z.string().min(3).max(100),
  message: z.string().min(5).max(1000),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "ERROR"]).optional(),
  scheduledAt: z.string().datetime(),
});

const router = express.Router();

// All broadcast endpoints are Admin only
router.use(auth, restrictTo("admin"), adminLimiter);

/**
 * @route   GET /api/broadcasts
 * @desc    List all scheduled and past broadcasts
 */
router.get("/", asyncHandler(async (req, res) => {
  const data = await broadcastsService.listBroadcasts();
  res.json(data);
}));

/**
 * @route   POST /api/broadcasts
 * @desc    Schedule a new broadcast
 */
router.post("/", validate(createBroadcastSchema), asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    createdBy: req.user.id
  };
  const scheduled = await broadcastsService.scheduleBroadcast(data);
  res.status(201).json(scheduled);
}));

/**
 * @route   DELETE /api/broadcasts/:id
 * @desc    Delete a scheduled broadcast
 */
router.delete("/:id", asyncHandler(async (req, res) => {
  await broadcastsService.deleteBroadcast(parseInt(req.params.id, 10));
  res.json({ message: "Broadcast deleted successfully" });
}));

module.exports = router;
