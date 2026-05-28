"use strict";

const { Router } = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const { auth } = require("../../middleware/auth");
const { followLimiter } = require("../../middleware/rateLimiter");
const followService = require("./follows.service");

const router = Router();

// POST /api/follows/:username  — follow
router.post(
  "/:username",
  auth,
  followLimiter,
  asyncHandler(async (req, res) => {
    const result = await followService.followUser(req.user.id, req.params.username);
    res.json({ success: true, data: result });
  })
);

// DELETE /api/follows/:username  — unfollow
router.delete(
  "/:username",
  auth,
  followLimiter,
  asyncHandler(async (req, res) => {
    const result = await followService.unfollowUser(req.user.id, req.params.username);
    res.json({ success: true, data: result });
  })
);

module.exports = router;
