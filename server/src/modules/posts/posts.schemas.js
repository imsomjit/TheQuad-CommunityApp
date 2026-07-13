"use strict";

const { z } = require("zod");

// ── Category-specific metadata schemas ───────────────────────────────────────

const dsaMetaSchema = z
  .object({
    platform: z.string().max(50).optional(),
    problemLink: z.string().url().optional().or(z.literal("")),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    timeComplexity: z.string().max(100).optional(),
    spaceComplexity: z.string().max(100).optional(),
  })
  .optional()
  .default({});

const interviewMetaSchema = z
  .object({
    company: z.string().max(120).optional(),
    role: z.string().max(120).optional(),
    experienceLevel: z
      .enum(["internship", "new_grad", "mid", "senior"])
      .optional(),
    interviewMode: z.enum(["online", "onsite", "hybrid"]).optional(),
    year: z.number().int().min(2000).max(2100).optional(),
    topicsAsked: z.array(z.string().max(80)).max(20).optional(),
  })
  .optional()
  .default({});

const journalMetaSchema = z
  .object({
    dayNumber: z.number().int().min(1).optional(),
  })
  .optional()
  .default({});

const projectMetaSchema = z
  .object({
    techStack: z.array(z.string().max(80)).max(20).optional(),
    repoUrl: z.string().url().optional().or(z.literal("")),
    liveUrl: z.string().url().optional().or(z.literal("")),
  })
  .optional()
  .default({});

// ── Main schemas ─────────────────────────────────────────────────────────────

const CATEGORIES = ["dsa_editorial", "interview_experience", "learning_journal", "project_breakdown"];

const createPostSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(300, "Title must be at most 300 characters")
      .trim(),
    body: z.string()
      .max(100000, "Body cannot exceed 100,000 characters")
      .default("")
      .refine((val) => !val || val.trim().split(/\s+/).length <= 5000, {
        message: "Body cannot exceed 5000 words",
      }),
    excerpt: z.string().max(500).optional(),
    category: z.enum(CATEGORIES),
    categoryMeta: z.any().optional().default({}),
    tags: z
      .array(z.string().max(80).trim())
      .max(10, "Maximum 10 tags")
      .optional()
      .default([]),
    coverImageUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
    coverImagePublicId: z.string().optional().or(z.null()),
    status: z.enum(["draft", "published"]).optional().default("draft"),
    seriesId: z.number().int().positive().optional().or(z.null()),
    seriesOrder: z.number().int().positive().optional().or(z.null()),
  })
  .superRefine((data, ctx) => {
    // Validate categoryMeta based on category
    const metaSchemas = {
      dsa_editorial: dsaMetaSchema,
      interview_experience: interviewMetaSchema,
      learning_journal: journalMetaSchema,
      project_breakdown: projectMetaSchema,
    };
    const schema = metaSchemas[data.category];
    if (schema && data.categoryMeta) {
      const result = schema.safeParse(data.categoryMeta);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ["categoryMeta", ...issue.path],
          });
        });
      }
    }
  });

const updatePostSchema = z
  .object({
    title: z.string().min(3).max(300).trim().optional(),
    body: z.string()
      .max(100000, "Body cannot exceed 100,000 characters")
      .optional()
      .refine((val) => !val || val.trim().split(/\s+/).length <= 5000, {
        message: "Body cannot exceed 5000 words",
      }),
    excerpt: z.string().max(500).optional().or(z.null()),
    category: z.enum(CATEGORIES).optional(),
    categoryMeta: z.any().optional(),
    tags: z.array(z.string().max(80).trim()).max(10).optional(),
    coverImageUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
    coverImagePublicId: z.string().optional().or(z.null()),
    seriesId: z.number().int().positive().optional().or(z.null()),
    seriesOrder: z.number().int().positive().optional().or(z.null()),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

const autosaveSchema = z.object({
  title: z.string().max(300).optional(),
  body: z.string()
    .max(100000, "Body cannot exceed 100,000 characters")
    .optional()
    .refine((val) => !val || val.trim().split(/\s+/).length <= 5000, {
      message: "Body cannot exceed 5000 words",
    }),
  excerpt: z.string().max(500).optional(),
  categoryMeta: z.any().optional(),
});

// ── Series schemas ───────────────────────────────────────────────────────────

const createSeriesSchema = z.object({
  title: z
    .string()
    .min(3, "Series title must be at least 3 characters")
    .max(300)
    .trim(),
  description: z.string().max(1000).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
});

const updateSeriesSchema = z
  .object({
    title: z.string().min(3).max(300).trim().optional(),
    description: z.string().max(1000).optional().or(z.null()),
    coverImageUrl: z.string().url().optional().or(z.literal("")).or(z.null()),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

module.exports = {
  createPostSchema,
  updatePostSchema,
  autosaveSchema,
  createSeriesSchema,
  updateSeriesSchema,
};
