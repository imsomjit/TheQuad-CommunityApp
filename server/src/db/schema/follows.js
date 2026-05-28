"use strict";

const {
  pgTable,
  integer,
  timestamp,
  primaryKey,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

/**
 * Follows join table.
 * Composite PK on (follower_id, following_id) prevents duplicates.
 * onDelete cascade: when a user is deleted, their follows disappear too.
 */
const follows = pgTable(
  "follows",
  {
    followerId: integer("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: integer("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
  })
);

module.exports = { follows };
