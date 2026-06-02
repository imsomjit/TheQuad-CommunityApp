"use strict";

const { Router } = require("express");
const controller = require("./posts.controller");
const validate = require("../../middleware/validate");
const { auth } = require("../../middleware/auth");
const {
  createPostSchema,
  updatePostSchema,
  autosaveSchema,
} = require("./posts.schemas");
const {
  postReadLimiter,
  postWriteLimiter,
  autosaveLimiter,
} = require("../../middleware/rateLimiter");
const { db } = require("../../db/index");
const { posts } = require("../../db/schema/index");
const { eq } = require("drizzle-orm");
const { extractIdFromSlug } = require("../../utils/slugify");

const router = Router();

// Middleware to resolve slug or ID to integer ID
router.param("id", async (req, res, next, val) => {
  try {
    const publicId = extractIdFromSlug(val);
    if (!publicId) return next();
    
    const [row] = await db.select({ id: posts.id }).from(posts).where(eq(posts.publicId, publicId)).limit(1);
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

// ── Public reads ─────────────────────────────────────────────────────────────

// GET /api/posts — list published posts (filtered, searched, paginated)
router.get("/", postReadLimiter, controller.list);

// GET /api/posts/drafts — user's own drafts (must come before :slug)
router.get("/drafts", auth, postReadLimiter, controller.drafts);

// GET /api/posts/id/:id — get by ID (for editor, drafts visible to author)
router.get("/id/:id", auth, postReadLimiter, controller.getById);

// GET /api/posts/:slug — read published post by slug
router.get("/:slug", postReadLimiter, controller.getBySlug);

// ── Protected writes ─────────────────────────────────────────────────────────

// POST /api/posts — create new post
router.post(
  "/",
  auth,
  postWriteLimiter,
  validate(createPostSchema),
  controller.create
);

// PATCH /api/posts/:id — update post
router.patch(
  "/:id",
  auth,
  postWriteLimiter,
  validate(updatePostSchema),
  controller.update
);

// PATCH /api/posts/:id/autosave — lightweight draft autosave
router.patch(
  "/:id/autosave",
  auth,
  autosaveLimiter,
  validate(autosaveSchema),
  controller.autosave
);

// POST /api/posts/:id/publish
router.post("/:id/publish", auth, postWriteLimiter, controller.publish);

// POST /api/posts/:id/unpublish
router.post("/:id/unpublish", auth, postWriteLimiter, controller.unpublish);

// DELETE /api/posts/:id
router.delete("/:id", auth, postWriteLimiter, controller.remove);

module.exports = router;
