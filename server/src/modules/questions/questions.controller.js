"use strict";

const questionService = require("./questions.service");
const asyncHandler = require("../../utils/asyncHandler");
const {
  createQuestionSchema,
  updateQuestionSchema,
  createAnswerSchema,
  questionQuerySchema,
} = require("./questions.schemas");
const validate = require("../../middleware/validate");

// ── Questions ─────────────────────────────────────────────────────────────────

const list = asyncHandler(async (req, res) => {
  const query = questionQuerySchema.parse(req.query);
  const result = await questionService.listQuestions(query);
  res.json({ success: true, ...result });
});

const create = asyncHandler(async (req, res) => {
  const question = await questionService.createQuestion(req.user.id, req.body);
  res.status(201).json({ success: true, data: question });
});

const getOne = asyncHandler(async (req, res) => {
  const question = await questionService.getQuestionById(
    parseInt(req.params.id),
    true
  );
  res.json({ success: true, data: question });
});

const update = asyncHandler(async (req, res) => {
  const question = await questionService.updateQuestion(
    parseInt(req.params.id),
    req.user.id,
    req.body
  );
  res.json({ success: true, data: question });
});

const remove = asyncHandler(async (req, res) => {
  await questionService.deleteQuestion(
    parseInt(req.params.id),
    req.user.id,
    req.user.role
  );
  res.json({ success: true, message: "Question deleted" });
});

// ── Answers ───────────────────────────────────────────────────────────────────

const createAnswer = asyncHandler(async (req, res) => {
  const answer = await questionService.createAnswer(
    parseInt(req.params.id),
    req.user.id,
    req.body.body
  );
  res.status(201).json({ success: true, data: answer });
});

const updateAnswer = asyncHandler(async (req, res) => {
  const answer = await questionService.updateAnswer(
    parseInt(req.params.answerId),
    req.user.id,
    req.body.body
  );
  res.json({ success: true, data: answer });
});

const deleteAnswer = asyncHandler(async (req, res) => {
  await questionService.deleteAnswer(
    parseInt(req.params.answerId),
    req.user.id,
    req.user.role
  );
  res.json({ success: true, message: "Answer deleted" });
});

const acceptAnswer = asyncHandler(async (req, res) => {
  await questionService.acceptAnswer(
    parseInt(req.params.id),
    parseInt(req.params.answerId),
    req.user.id
  );
  res.json({ success: true, message: "Answer accepted" });
});

module.exports = {
  list,
  create,
  getOne,
  update,
  remove,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
};
