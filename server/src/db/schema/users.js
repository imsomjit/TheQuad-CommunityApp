"use strict";

const {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  pgEnum,
  integer,
} = require("drizzle-orm/pg-core");

// ─── Enums ────────────────────────────────────────────────────────────────────
const userRoleEnum = pgEnum("user_role", ["student", "moderator", "admin"]);

// ─── Table ────────────────────────────────────────────────────────────────────
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("student").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  college: varchar("college", { length: 200 }),
  branch: varchar("branch", { length: 200 }),
  graduationYear: integer("graduation_year"),
  githubUsername: varchar("github_username", { length: 100 }),
  skills: text("skills").array(), // stored as text[]
  isSuspended: boolean("is_suspended").default(false).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

module.exports = { users, userRoleEnum };
