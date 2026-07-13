"use strict";

const { Router } = require("express");
const controller = require("./questions.controller");
const { auth, optionalAuth } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const {
  createQuestionSchema,
  updateQuestionSchema,
  createAnswerSchema,
  updateAnswerSchema,
} = require("./questions.schemas");
const {
  questionReadLimiter,
  questionWriteLimiter,
} = require("../../middleware/rateLimiter");
const { db } = require("../../db/index");
const { questions } = require("../../db/schema/index");
const { eq } = require("drizzle-orm");
const { extractIdFromSlug } = require("../../utils/slugify");

const router = Router();

// Middleware to resolve slug or ID to integer ID
router.param("id", async (req, res, next, val) => {
  try {
    const publicId = extractIdFromSlug(val);
    if (!publicId) return next();
    
    // First try publicId
    const [row] = await db.select({ id: questions.id }).from(questions).where(eq(questions.publicId, publicId)).limit(1);
    if (row) {
      req.params.id = row.id;
      return next();
    }
    
    // Fallback to integer (for backwards compatibility if someone uses old links)
    if (/^\d+$/.test(publicId)) {
      req.params.id = parseInt(publicId, 10);
      return next();
    }
    
    // If neither, let it fail in the controller
    next();
  } catch (err) {
    next(err);
  }
});

// Questions
router.get("/", questionReadLimiter, optionalAuth, controller.list);
router.get("/recommendations", auth, questionReadLimiter, controller.recommendations);
router.post("/", auth, questionWriteLimiter, validate(createQuestionSchema), controller.create);
router.get("/:id", questionReadLimiter, optionalAuth, controller.getOne);
router.patch("/:id", auth, questionWriteLimiter, validate(updateQuestionSchema), controller.update);
router.delete("/:id", auth, questionWriteLimiter, controller.remove);

// Answers (nested under questions)
router.post("/:id/answers", auth, questionWriteLimiter, validate(createAnswerSchema), controller.createAnswer);
router.patch("/:id/answers/:answerId", auth, questionWriteLimiter, validate(updateAnswerSchema), controller.updateAnswer);
router.delete("/:id/answers/:answerId", auth, questionWriteLimiter, controller.deleteAnswer);
router.post("/:id/answers/:answerId/accept", auth, questionWriteLimiter, controller.acceptAnswer);

module.exports = router;
