"use strict";

const { Router } = require("express");
const controller = require("./questions.controller");
const { auth, optionalAuth } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const {
  createQuestionSchema,
  updateQuestionSchema,
  createAnswerSchema,
} = require("./questions.schemas");
const {
  questionReadLimiter,
  questionWriteLimiter,
} = require("../../middleware/rateLimiter");

const router = Router();

// Questions
router.get("/", questionReadLimiter, optionalAuth, controller.list);
router.post("/", auth, questionWriteLimiter, validate(createQuestionSchema), controller.create);
router.get("/:id", questionReadLimiter, optionalAuth, controller.getOne);
router.patch("/:id", auth, questionWriteLimiter, validate(updateQuestionSchema), controller.update);
router.delete("/:id", auth, questionWriteLimiter, controller.remove);

// Answers (nested under questions)
router.post("/:id/answers", auth, questionWriteLimiter, validate(createAnswerSchema), controller.createAnswer);
router.delete("/:id/answers/:answerId", auth, questionWriteLimiter, controller.deleteAnswer);
router.post("/:id/answers/:answerId/accept", auth, questionWriteLimiter, controller.acceptAnswer);

module.exports = router;
