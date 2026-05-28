"use strict";

const { Router } = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const { auth, optionalAuth } = require("../../middleware/auth");
const { userReadLimiter, userWriteLimiter } = require("../../middleware/rateLimiter");
const { uploadAvatar } = require("../../middleware/upload");
const userService = require("./users.service");
const followService = require("../follows/follows.service");
const resourceService = require("../resources/resources.service");
const { z } = require("zod");
const validate = require("../../middleware/validate");

const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).trim().optional(),
  bio: z.string().max(500).trim().optional(),
  college: z.string().max(200).trim().optional(),
  branch: z.string().max(200).trim().optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2050).optional(),
  githubUsername: z.string().max(100).trim().optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
});

const router = Router();

// GET /api/users/:username  — public profile
router.get(
  "/:username",
  userReadLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const profile = await userService.getPublicProfile(
      req.params.username,
      req.user?.id
    );
    res.json({ success: true, data: profile });
  })
);

// PATCH /api/users/me  — update own profile
router.patch(
  "/me",
  auth,
  userWriteLimiter,
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: user });
  })
);

// PATCH /api/users/me/avatar  — upload avatar
router.patch(
  "/me/avatar",
  auth,
  userWriteLimiter,
  uploadAvatar,
  asyncHandler(async (req, res) => {
    const user = await userService.updateAvatar(
      req.user.id,
      req.uploadedImage.avatarUrl
    );
    res.json({ success: true, data: user });
  })
);

// GET /api/users/:username/followers
router.get(
  "/:username/followers",
  userReadLimiter,
  asyncHandler(async (req, res) => {
    const data = await followService.getFollowers(req.params.username);
    res.json({ success: true, data });
  })
);

// GET /api/users/:username/following
router.get(
  "/:username/following",
  userReadLimiter,
  asyncHandler(async (req, res) => {
    const data = await followService.getFollowing(req.params.username);
    res.json({ success: true, data });
  })
);

// GET /api/users/:username/resources
router.get(
  "/:username/resources",
  userReadLimiter,
  asyncHandler(async (req, res) => {
    // Reuse the resources list with uploader filter (by username → id lookup)
    const { eq } = require("drizzle-orm");
    const { db } = require("../../db/index");
    const { users } = require("../../db/schema/index");
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, req.params.username))
      .limit(1);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const result = await resourceService.listResources({
      sort: "newest",
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      uploaderId: user.id,
    });
    res.json({ success: true, ...result });
  })
);

module.exports = router;
