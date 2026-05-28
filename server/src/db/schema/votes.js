"use strict";

/**
 * Polymorphic votes table.
 * Unique constraint prevents double-voting.
 * Toggle logic is handled at the service layer.
 */

const {
  pgTable,
  serial,
  integer,
  timestamp,
  pgEnum,
  unique,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

const voteTargetEnum = pgEnum("vote_target_type", [
  "resource",
  "question",
  "answer",
  "blog",
]);

const voteDirectionEnum = pgEnum("vote_direction", ["up", "down"]);

const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: voteTargetEnum("target_type").notNull(),
    targetId: integer("target_id").notNull(),
    direction: voteDirectionEnum("direction").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // One vote per user per target
    uniq: unique().on(table.userId, table.targetType, table.targetId),
  })
);

module.exports = { votes, voteTargetEnum, voteDirectionEnum };
