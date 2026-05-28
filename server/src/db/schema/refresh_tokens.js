"use strict";

const {
  pgTable,
  serial,
  integer,
  varchar,
  boolean,
  timestamp,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

/**
 * Stores hashed refresh tokens for revocation on logout.
 * We store the hash (not the raw token) to limit damage if the DB is breached.
 * expires_at allows a cron job to clean up expired tokens.
 */
const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

module.exports = { refreshTokens };
