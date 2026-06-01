"use strict";

const {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

// ─── Questions ────────────────────────────────────────────────────────────────
const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 400 }).notNull(),
  body: text("body").notNull(),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Stats (denormalized)
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  answerCount: integer("answer_count").default(0).notNull(),

  // Moderation & Curation
  isFeatured: boolean("is_featured").default(false).notNull(),
  isEdited: boolean("is_edited").default(false).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedById: integer("deleted_by_id").references(() => users.id),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Question Tags ────────────────────────────────────────────────────────────
const questionTags = pgTable("question_tags", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  tag: varchar("tag", { length: 80 }).notNull(),
});

module.exports = { questions, questionTags };
