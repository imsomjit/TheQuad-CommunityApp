"use strict";

const { Router } = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const { auth, optionalAuth } = require("../../middleware/auth");
const { userReadLimiter, userWriteLimiter } = require("../../middleware/rateLimiter");
const { uploadAvatar, uploadBanner } = require("../../middleware/upload");
const userService = require("./users.service");
const followService = require("../follows/follows.service");
const resourceService = require("../resources/resources.service");
const { z } = require("zod");
const validate = require("../../middleware/validate");

const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).trim().optional(),
  bio: z.string().max(500).trim().optional(),
  location: z.string().max(100).trim().optional(),
  organization: z.string().max(200).trim().optional(),
  website: z.string().url().max(300).trim().optional().or(z.literal("")),
  college: z.string().max(200).trim().optional(),
  branch: z.string().max(200).trim().optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2050).optional(),
  githubUsername: z.string().max(100).trim().optional(),
  linkedinUrl: z.string().url().max(300).trim().optional().or(z.literal("")),
  twitterHandle: z.string().max(50).trim().optional(),
  instagramHandle: z.string().max(50).trim().optional(),
  leetcodeUsername: z.string().max(50).trim().optional(),
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

// PATCH /api/users/me/avatar  — upload avatar (Cloudinary)
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

// PATCH /api/users/me/banner  — upload banner (Cloudinary)
router.patch(
  "/me/banner",
  auth,
  userWriteLimiter,
  uploadBanner,
  asyncHandler(async (req, res) => {
    const user = await userService.updateBanner(
      req.user.id,
      req.uploadedImage.bannerUrl
    );
    res.json({ success: true, data: user });
  })
);

// POST /api/users/:username/follow  — follow a user
router.post(
  "/:username/follow",
  auth,
  userWriteLimiter,
  asyncHandler(async (req, res) => {
    const result = await followService.followUser(req.user.id, req.params.username);
    res.json({ success: true, data: result });
  })
);

// DELETE /api/users/:username/follow  — unfollow a user
router.delete(
  "/:username/follow",
  auth,
  userWriteLimiter,
  asyncHandler(async (req, res) => {
    const result = await followService.unfollowUser(req.user.id, req.params.username);
    res.json({ success: true, data: result });
  })
);

// GET /api/users/:username/followers  — own profile only (checked on client)
router.get(
  "/:username/followers",
  userReadLimiter,
  auth,
  asyncHandler(async (req, res) => {
    // Only allow self to view their own lists
    if (req.user.username !== req.params.username) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const data = await followService.getFollowers(req.params.username);
    res.json({ success: true, data });
  })
);

// GET /api/users/:username/following  — own profile only
router.get(
  "/:username/following",
  userReadLimiter,
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.username !== req.params.username) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const data = await followService.getFollowing(req.params.username);
    res.json({ success: true, data });
  })
);

// GET /api/users/:username/resources  — public, paginated
router.get(
  "/:username/resources",
  userReadLimiter,
  asyncHandler(async (req, res) => {
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
