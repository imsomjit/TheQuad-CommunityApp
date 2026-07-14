"use strict";

const {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  pgEnum,
  boolean,
  vector,
} = require("drizzle-orm/pg-core");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 12);
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
  publicId: varchar("public_id", { length: 12 }).$defaultFn(() => nanoid(12)).unique(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  type: resourceTypeEnum("type").notNull(),

  // Vector Embedding
  embedding: vector("embedding", { dimensions: 768 }),

  // Cloudinary file info
  fileUrl: text("file_url").notNull(),
  filePublicId: text("file_public_id").notNull(), // for deletion from Cloudinary
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size"), // in bytes
  pages: integer("pages"),
  parsedText: text("parsed_text"), // Extracted text for AI Chat

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

// ─── Resource Tags (normalized) ───────────────────────────────────────────────
const resourceTags = pgTable("resource_tags", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id")
    .notNull()
    .references(() => resources.id, { onDelete: "cascade" }),
  tag: varchar("tag", { length: 80 }).notNull(),
});

module.exports = { resources, resourceTags, resourceTypeEnum };
