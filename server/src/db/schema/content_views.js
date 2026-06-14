"use strict";

const {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
  index,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

const contentViews = pgTable(
  "content_views",
  {
    id: serial("id").primaryKey(),
    contentType: varchar("content_type", { length: 50 }).notNull(),
    contentId: integer("content_id").notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    visitorId: varchar("visitor_id", { length: 255 }),
    viewedAt: timestamp("viewed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // Indexes for fast querying of recent views
    userViewIdx: index("user_view_idx").on(table.userId, table.contentType, table.contentId),
    visitorViewIdx: index("visitor_view_idx").on(table.visitorId, table.contentType, table.contentId),
    timeViewIdx: index("time_view_idx").on(table.viewedAt),
  })
);

module.exports = { contentViews };
