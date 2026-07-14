"use strict";

const {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  unique,
  vector,
} = require("drizzle-orm/pg-core");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 12);
const { users } = require("./users");

// ─── Enums ────────────────────────────────────────────────────────────────────
const postCategoryEnum = pgEnum("post_category", [
  "dsa_editorial",
  "interview_experience",
  "learning_journal",
  "project_breakdown",
]);

const postStatusEnum = pgEnum("post_status", ["draft", "published"]);

// ─── Posts ────────────────────────────────────────────────────────────────────
const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 12 }).$defaultFn(() => nanoid(12)).unique(),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 350 }).notNull().unique(),
  body: text("body").notNull().default(""), // raw markdown
  renderedHtml: text("rendered_html"), // server-rendered HTML
  excerpt: varchar("excerpt", { length: 500 }), // auto or manual summary
  tldr: text("tldr"), // AI generated summary

  // Vector Embedding
  embedding: vector("embedding", { dimensions: 768 }),


  // Cover image (Cloudinary)
  coverImageUrl: text("cover_image_url"),
  coverImagePublicId: text("cover_image_public_id"), // for Cloudinary deletion

  // Classification
  category: postCategoryEnum("category").notNull(),
  /**
   * Category-specific structured metadata stored as JSONB.
   *
   * DSA:       { platform, problemLink, difficulty, timeComplexity, spaceComplexity }
   * Interview: { company, role, experienceLevel, interviewMode, year, topicsAsked[] }
   * Journal:   { dayNumber }
   * Project:   { techStack[], repoUrl, liveUrl }
   */
  categoryMeta: jsonb("category_meta").default({}),
  status: postStatusEnum("status").default("draft").notNull(),

  // Author
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Computed
  readingTimeMin: integer("reading_time_min").default(1),

  // Denormalized stats (updated by vote/bookmark services)
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  bookmarksCount: integer("bookmarks_count").default(0).notNull(),

  // Series membership (nullable — most posts are standalone)
  seriesId: integer("series_id"), // FK added after series table is defined
  seriesOrder: integer("series_order"), // position within the series (1-indexed)

  // Moderation & Curation
  isFeatured: boolean("is_featured").default(false).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedById: integer("deleted_by_id").references(() => users.id),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),

  // Timestamps
  publishedAt: timestamp("published_at", { withTimezone: true }), // set on first publish
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Post Tags (normalized) ──────────────────────────────────────────────────
const postTags = pgTable("post_tags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  tag: varchar("tag", { length: 80 }).notNull(),
});

module.exports = {
  posts,
  postTags,
  postCategoryEnum,
  postStatusEnum,
};
