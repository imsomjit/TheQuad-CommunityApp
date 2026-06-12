"use strict";

const { Router } = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const { auth } = require("../../middleware/auth");
const { voteLimiter, voteReadLimiter } = require("../../middleware/rateLimiter");
const voteService = require("./votes.service");
const { z } = require("zod");
const validate = require("../../middleware/validate");

const voteSchema = z.object({
  targetType: z.enum(["resource", "question", "answer", "blog", "book"]),
  targetId: z.coerce.number().int().positive(),
  direction: z.enum(["up", "down"]),
});

const router = Router();

// POST /api/votes  — toggle vote
router.post(
  "/",
  auth,
  voteLimiter,
  validate(voteSchema),
  asyncHandler(async (req, res) => {
    const result = await voteService.castVote(req.user.id, req.body);
    res.json({ success: true, data: result });
  })
);

// GET /api/votes  — get all user votes
router.get(
  "/",
  auth,
  voteReadLimiter,
  asyncHandler(async (req, res) => {
    const result = await voteService.getUserVotes(req.user.id);
    res.json({ success: true, data: result });
  })
);

module.exports = router;
