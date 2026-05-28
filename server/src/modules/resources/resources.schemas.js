"use strict";

const { z } = require("zod");

const RESOURCE_TYPES = ["notes", "pyq", "assignment", "cheatsheet", "other"];

const createResourceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(300).trim(),
  description: z.string().max(2000).trim().optional(),
  type: z.enum(RESOURCE_TYPES, {
    errorMap: () => ({ message: `Type must be one of: ${RESOURCE_TYPES.join(", ")}` }),
  }),
  college: z.string().max(200).trim().optional(),
  branch: z.string().max(200).trim().optional(),
  semester: z.coerce.number().int().min(1).max(10).optional(),
  subject: z.string().max(200).trim().optional(),
  pages: z.coerce.number().int().min(1).optional(),
  tags: z
    .union([
      z.string().transform((s) =>
        s
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      ),
      z.array(z.string()),
    ])
    .optional()
    .default([]),
});

const updateResourceSchema = createResourceSchema.partial().omit({ type: true });

const resourceQuerySchema = z.object({
  q: z.string().optional(),
  type: z.enum([...RESOURCE_TYPES, ""]).optional(),
  college: z.string().optional(),
  branch: z.string().optional(),
  semester: z.coerce.number().int().min(1).max(10).optional(),
  subject: z.string().optional(),
  sort: z.enum(["newest", "top", "most_downloaded"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

module.exports = { createResourceSchema, updateResourceSchema, resourceQuerySchema };
