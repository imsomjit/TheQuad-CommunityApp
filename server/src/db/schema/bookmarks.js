"use strict";

const {
  pgTable,
  serial,
  integer,
  timestamp,
  pgEnum,
  unique,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

const bookmarkTargetEnum = pgEnum("bookmark_target_type", ["resource", "blog", "book"]);

const bookmarks = pgTable(
  "bookmarks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: bookmarkTargetEnum("target_type").notNull(),
    targetId: integer("target_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniq: unique().on(table.userId, table.targetType, table.targetId),
  })
);

module.exports = { bookmarks, bookmarkTargetEnum };
