"use strict";

const { z } = require("zod");

const listReportsSchema = z.object({
  status: z.enum(["pending", "under_review", "resolved", "dismissed"]).optional(),
  type: z.enum(["resource", "question", "answer", "blog", "comment", "opportunity", "user"]).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("20"),
});

const reportActionSchema = z.object({
  action: z.enum(["review", "dismiss", "resolve"]),
  note: z.string().optional(),
});

const userActionSchema = z.object({
  reason: z.string().min(5),
  durationDays: z.number().int().positive().optional(),
});

const removeContentSchema = z.object({
  reason: z.string().min(5),
});

module.exports = {
  listReportsSchema,
  reportActionSchema,
  userActionSchema,
  removeContentSchema,
};
