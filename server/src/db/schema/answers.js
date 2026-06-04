"use strict";

const {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
} = require("drizzle-orm/pg-core");
const { nanoid } = require("nanoid");
const { users } = require("./users");
const { questions } = require("./questions");

const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 12 }).$defaultFn(() => nanoid(12)).unique(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),

  // Stats (denormalized)
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  isAccepted: boolean("is_accepted").default(false).notNull(),

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

module.exports = { answers };
