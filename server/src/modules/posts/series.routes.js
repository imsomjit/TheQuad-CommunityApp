"use strict";

const seriesService = require("./series.service");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../middleware/validate");
const { auth } = require("../../middleware/auth");
const { createSeriesSchema, updateSeriesSchema } = require("./posts.schemas");
const { Router } = require("express");
const { postReadLimiter, postWriteLimiter } = require("../../middleware/rateLimiter");

const router = Router();

// GET /api/series/:slug
router.get("/:slug", postReadLimiter, asyncHandler(async (req, res) => {
  const s = await seriesService.getSeriesBySlug(req.params.slug);
  res.json({ success: true, data: s });
}));

// GET /api/series/user/:userId — user's own series list
router.get("/user/:userId", postReadLimiter, asyncHandler(async (req, res) => {
  const data = await seriesService.listUserSeries(parseInt(req.params.userId));
  res.json({ success: true, data });
}));

// POST /api/series — create a series
router.post("/", auth, postWriteLimiter, validate(createSeriesSchema), asyncHandler(async (req, res) => {
  const s = await seriesService.createSeries(req.user.id, req.body);
  res.status(201).json({ success: true, data: s });
}));

// PATCH /api/series/:id — update a series
router.patch("/:id", auth, postWriteLimiter, validate(updateSeriesSchema), asyncHandler(async (req, res) => {
  const s = await seriesService.updateSeries(parseInt(req.params.id), req.user.id, req.body);
  res.json({ success: true, data: s });
}));

// DELETE /api/series/:id
router.delete("/:id", auth, postWriteLimiter, asyncHandler(async (req, res) => {
  await seriesService.deleteSeries(parseInt(req.params.id), req.user.id, req.user.role);
  res.json({ success: true, message: "Series deleted" });
}));

// POST /api/series/:seriesId/posts/:postId — attach a post to a series
router.post("/:seriesId/posts/:postId", auth, postWriteLimiter, asyncHandler(async (req, res) => {
  const order = parseInt(req.body.order) || 1;
  const s = await seriesService.addPostToSeries(
    parseInt(req.params.seriesId),
    parseInt(req.params.postId),
    order,
    req.user.id
  );
  res.json({ success: true, data: s });
}));

// DELETE /api/series/posts/:postId — remove a post from its series
router.delete("/posts/:postId", auth, postWriteLimiter, asyncHandler(async (req, res) => {
  await seriesService.removePostFromSeries(parseInt(req.params.postId), req.user.id);
  res.json({ success: true, message: "Post removed from series" });
}));

module.exports = router;
