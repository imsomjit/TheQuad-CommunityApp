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
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 12);
const { users } = require("./users");

// ─── Books ────────────────────────────────────────────────────────────────────
const books = pgTable("books", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 12 }).$defaultFn(() => nanoid(12)).unique(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  author: varchar("author", { length: 200 }).notNull(),
  isbn: varchar("isbn", { length: 50 }),
  subject: varchar("subject", { length: 200 }),
  tags: text("tags").array().default([]),

  // Cloudinary file info
  fileUrl: text("file_url").notNull(),
  filePublicId: text("file_public_id").notNull(), // for deletion from Cloudinary
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size"), // in bytes
  pages: integer("pages"),
  
  // Cover Image
  coverUrl: text("cover_url"),
  coverPublicId: text("cover_public_id"),

  // Uploader (Admin)
  uploaderId: integer("uploader_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Stats (denormalized for fast reads)
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  downloads: integer("downloads").default(0).notNull(),
  bookmarksCount: integer("bookmarks_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),

  // Moderation & Curation
  isFeatured: boolean("is_featured").default(false).notNull(),
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

module.exports = { books };
