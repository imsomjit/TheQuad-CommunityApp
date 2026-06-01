"use strict";

const {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  timestamp,
  pgEnum,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

const actionTypeEnum = pgEnum("action_type", ["warn", "suspend", "ban"]);

const userActions = pgTable("user_actions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actionType: actionTypeEnum("action_type").notNull(),
  durationDays: integer("duration_days"), // Nullable, only relevant for suspensions
  reason: text("reason").notNull(),
  issuedById: integer("issued_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

module.exports = { userActions, actionTypeEnum };
