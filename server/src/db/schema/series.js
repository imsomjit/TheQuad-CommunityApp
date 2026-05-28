"use strict";

const {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

// ─── Series ──────────────────────────────────────────────────────────────────
// A lightweight series container. Posts link to it via posts.seriesId + seriesOrder.
const series = pgTable("series", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 350 }).notNull().unique(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

module.exports = { series };
