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
const authProviderEnum = pgEnum("auth_provider", ["local", "google", "both"]);

// ─── Table ────────────────────────────────────────────────────────────────────
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }), // nullable for OAuth users
  role: userRoleEnum("role").default("student").notNull(),
  authProvider: authProviderEnum("auth_provider").default("local").notNull(),
  googleId: varchar("google_id", { length: 255 }).unique(),

  // ─── Authentication & Verification ──────────────────────────────────────────
  isVerified: boolean("is_verified").default(false).notNull(),
  otp: varchar("otp", { length: 6 }),
  otpExpiresAt: timestamp("otp_expires_at", { withTimezone: true }),

  // ─── Profile ─────────────────────────────────────────────────────────────
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  bio: text("bio"),
  location: varchar("location", { length: 100 }),
  organization: varchar("organization", { length: 200 }),
  website: text("website"),

  // ─── Academic ────────────────────────────────────────────────────────────
  college: varchar("college", { length: 200 }),
  branch: varchar("branch", { length: 200 }),
  graduationYear: integer("graduation_year"),

  // ─── Skills ──────────────────────────────────────────────────────────────
  skills: text("skills").array(), // stored as text[]

  // ─── Social links ─────────────────────────────────────────────────────────
  githubUsername: varchar("github_username", { length: 100 }),
  linkedinUrl: text("linkedin_url"),
  twitterHandle: varchar("twitter_handle", { length: 50 }),
  instagramHandle: varchar("instagram_handle", { length: 50 }),
  leetcodeUsername: varchar("leetcode_username", { length: 50 }),

  // ─── Moderation ───────────────────────────────────────────────────────────
  isSuspended: boolean("is_suspended").default(false).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

module.exports = { users, userRoleEnum, authProviderEnum };

