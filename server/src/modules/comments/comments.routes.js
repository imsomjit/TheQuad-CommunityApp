"use strict";

const { Router } = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const { auth } = require("../../middleware/auth");
const commentService = require("./comments.service");
const { commentLimiter, commentReadLimiter } = require("../../middleware/rateLimiter");
const { z } = require("zod");
const validate = require("../../middleware/validate");

const addCommentSchema = z.object({
  targetType: z.enum(["resource", "question", "answer", "blog", "book"]),
  targetId: z.coerce.number().int().positive(),
  body: z.string().min(1, "Comment cannot be empty").max(2000).trim()
    .refine((val) => !val || val.split(/\s+/).filter(Boolean).length <= 500, {
      message: "Comment cannot exceed 500 words",
    }),
  parentId: z.coerce.number().int().positive().optional().or(z.null()),
});

const getCommentsSchema = z.object({
  targetType: z.enum(["resource", "question", "answer", "blog", "book"]),
  targetId: z.coerce.number().int().positive(),
});

const router = Router();

// POST /api/comments
router.post(
  "/",
  auth,
  commentLimiter,
  validate(addCommentSchema),
  asyncHandler(async (req, res) => {
    const comment = await commentService.addComment(req.user.id, req.body);
    res.status(201).json({ success: true, data: comment });
  })
);

// GET /api/comments?targetType=resource&targetId=5
router.get(
  "/",
  commentReadLimiter,
  validate(getCommentsSchema, "query"),
  asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.query;
    const rows = await commentService.getComments(targetType, parseInt(targetId));
    res.json({ success: true, data: rows });
  })
);

// DELETE /api/comments/:id
router.delete(
  "/:id",
  auth,
  commentLimiter,
  asyncHandler(async (req, res) => {
    await commentService.deleteComment(
      parseInt(req.params.id),
      req.user.id,
      req.user.role
    );
    res.json({ success: true, message: "Comment deleted" });
  })
);

module.exports = router;
