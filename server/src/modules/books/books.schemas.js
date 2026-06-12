"use strict";

const { z } = require("zod");

const uploadBookSchema = z.object({
  title: z.string().min(3).max(300),
  description: z.string().optional(),
  author: z.string().min(2).max(200),
  isbn: z.string().max(50).optional(),
  subject: z.string().max(200).optional(),
});

const updateBookSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  description: z.string().optional(),
  author: z.string().min(2).max(200).optional(),
  isbn: z.string().max(50).optional(),
  subject: z.string().max(200).optional(),
});

const getBooksQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("20"),
  search: z.string().optional(),
  author: z.string().optional(),
  subject: z.string().optional(),
  sort: z.enum(["newest", "popular"]).optional().default("newest"),
});

module.exports = {
  uploadBookSchema,
  updateBookSchema,
  getBooksQuerySchema,
};
