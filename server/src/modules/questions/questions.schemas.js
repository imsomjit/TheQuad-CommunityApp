"use strict";

const { z } = require("zod");

const createQuestionSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(400)
    .trim()
    .refine((val) => !val || val.split(/\s+/).filter(Boolean).length <= 50, {
      message: "Title cannot exceed 50 words",
    }),
  body: z
    .string()
    .min(20, "Question body must be at least 20 characters")
    .max(20000)
    .trim()
    .refine((val) => !val || val.split(/\s+/).filter(Boolean).length <= 500, {
      message: "Question body cannot exceed 500 words",
    }),
  tags: z
    .union([
      z.string().transform((s) =>
        s.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      ),
      z.array(z.string().max(80)),
    ])
    .optional()
    .default([]),
});

const updateQuestionSchema = z.object({
  title: z.string().min(10).max(400).trim().optional()
    .refine((val) => !val || val.split(/\s+/).filter(Boolean).length <= 50, {
      message: "Title cannot exceed 50 words",
    }),
  body: z.string().min(20).max(20000).trim().optional()
    .refine((val) => !val || val.split(/\s+/).filter(Boolean).length <= 5000, {
      message: "Question body cannot exceed 5000 words",
    }),
  tags: z
    .union([
      z.string().transform((s) =>
        s.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      ),
      z.array(z.string().max(80)),
    ])
    .optional(),
});

const createAnswerSchema = z.object({
  body: z
    .string()
    .min(10, "Answer must be at least 10 characters")
    .max(20000)
    .trim()
    .refine((val) => !val || val.split(/\s+/).filter(Boolean).length <= 5000, {
      message: "Answer cannot exceed 5000 words",
    }),
});

const updateAnswerSchema = z.object({
  body: z
    .string()
    .min(10, "Answer must be at least 10 characters")
    .max(20000)
    .trim()
    .optional()
    .refine((val) => !val || val.split(/\s+/).filter(Boolean).length <= 5000, {
      message: "Answer cannot exceed 5000 words",
    }),
});

const questionQuerySchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(["newest", "votes", "unanswered"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  createAnswerSchema,
  updateAnswerSchema,
  questionQuerySchema,
};
