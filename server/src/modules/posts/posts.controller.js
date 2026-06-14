"use strict";

const postsService = require("./posts.service");
const asyncHandler = require("../../utils/asyncHandler");
const { extractIdFromSlug } = require("../../utils/slugify");

// POST /api/posts
const create = asyncHandler(async (req, res) => {
  const post = await postsService.createPost(req.user.id, req.body);
  res.status(201).json({ success: true, data: post });
});

// GET /api/posts
const list = asyncHandler(async (req, res) => {
  const result = await postsService.listPosts(req.query);
  res.json({ success: true, ...result });
});

// GET /api/posts/drafts
const drafts = asyncHandler(async (req, res) => {
  const result = await postsService.listDrafts(req.user.id, req.query);
  res.json({ success: true, ...result });
});

// GET /api/posts/:slug
const getBySlug = asyncHandler(async (req, res) => {
  const publicId = extractIdFromSlug(req.params.slug);
  const post = await postsService.getPostByPublicId(publicId);
  res.json({ success: true, data: post });
});

// GET /api/posts/id/:id (internal — for editor, includes drafts)
const getById = asyncHandler(async (req, res) => {
  const post = await postsService.getPostById(parseInt(req.params.id));

  // Only the author can see their own draft
  if (post.status === "draft" && post.authorId !== req.user?.id) {
    const AppError = require("../../utils/AppError");
    throw new AppError("Post not found", 404, "NOT_FOUND");
  }

  res.json({ success: true, data: post });
});

// PATCH /api/posts/:id
const update = asyncHandler(async (req, res) => {
  const post = await postsService.updatePost(
    parseInt(req.params.id),
    req.user.id,
    req.body
  );
  res.json({ success: true, data: post });
});

// PATCH /api/posts/:id/autosave
const autosave = asyncHandler(async (req, res) => {
  const result = await postsService.autosavePost(
    parseInt(req.params.id),
    req.user.id,
    req.body
  );
  res.json({ success: true, data: result });
});

// POST /api/posts/:id/publish
const publish = asyncHandler(async (req, res) => {
  const post = await postsService.publishPost(
    parseInt(req.params.id),
    req.user.id
  );
  res.json({ success: true, data: post });
});

// POST /api/posts/:id/unpublish
const unpublish = asyncHandler(async (req, res) => {
  const post = await postsService.unpublishPost(
    parseInt(req.params.id),
    req.user.id
  );
  res.json({ success: true, data: post });
});

// DELETE /api/posts/:id
const remove = asyncHandler(async (req, res) => {
  await postsService.deletePost(
    parseInt(req.params.id),
    req.user.id,
    req.user.role
  );
  res.json({ success: true, message: "Post deleted successfully" });
});

// PATCH /api/posts/:id/cover
const uploadCover = asyncHandler(async (req, res) => {
  const post = await postsService.uploadCover(
    parseInt(req.params.id),
    req.user.id,
    req.uploadedImage.coverUrl,
    req.uploadedImage.coverPublicId
  );
  res.json({ success: true, data: post });
});

module.exports = { create, list, drafts, getBySlug, getById, update, autosave, publish, unpublish, remove, uploadCover };
