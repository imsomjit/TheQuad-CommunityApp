"use strict";

const {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  pgEnum,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

// ─── Enums ────────────────────────────────────────────────────────────────────
const resourceTypeEnum = pgEnum("resource_type", [
  "notes",
  "pyq",
  "assignment",
  "cheatsheet",
  "other",
]);

// ─── Resources ────────────────────────────────────────────────────────────────
const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  type: resourceTypeEnum("type").notNull(),

  // Cloudinary file info
  fileUrl: text("file_url").notNull(),
  filePublicId: text("file_public_id").notNull(), // for deletion from Cloudinary
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size"), // in bytes
  pages: integer("pages"),

  // Academic metadata
  college: varchar("college", { length: 200 }),
  branch: varchar("branch", { length: 200 }),
  semester: integer("semester"),
  subject: varchar("subject", { length: 200 }),

  // Uploader
  uploaderId: integer("uploader_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Stats (denormalized for fast reads)
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  downloads: integer("downloads").default(0).notNull(),
  bookmarksCount: integer("bookmarks_count").default(0).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Resource Tags (normalized) ───────────────────────────────────────────────
const resourceTags = pgTable("resource_tags", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id")
    .notNull()
    .references(() => resources.id, { onDelete: "cascade" }),
  tag: varchar("tag", { length: 80 }).notNull(),
});

module.exports = { resources, resourceTags, resourceTypeEnum };
