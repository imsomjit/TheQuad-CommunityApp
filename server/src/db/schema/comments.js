"use strict";

/**
 * Polymorphic comments table.
 *
 * target_type discriminates between:
 *   "resource" | "question" | "answer" | "blog"
 *
 * target_id is the integer PK of the target row in the appropriate table.
 * We don't use a FK here because PostgreSQL doesn't support polymorphic FKs.
 * Referential integrity is enforced at the service layer.
 */

const {
  pgTable,
  serial,
  text,
  integer,
  varchar,
  timestamp,
  pgEnum,
  boolean,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

const commentTargetEnum = pgEnum("comment_target_type", [
  "resource",
  "question",
  "answer",
  "blog",
]);

const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: commentTargetEnum("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  body: text("body").notNull(),
  // Reply threading — null for top-level comments
  parentId: integer("parent_id"), // self-referencing foreign key set after initialization

  // Moderation
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

module.exports = { comments, commentTargetEnum };
