"use strict";

const { pgTable, serial, integer, text, boolean, timestamp, pgEnum } = require("drizzle-orm/pg-core");
const { users } = require("./users");

const broadcastTypeEnum = pgEnum("broadcast_type", ["INFO", "SUCCESS", "WARNING", "SYSTEM"]);

const broadcasts = pgTable("broadcasts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: broadcastTypeEnum("type").default("INFO").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  isSent: boolean("is_sent").default(false).notNull(),
  createdBy: integer("created_by")
    .references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

module.exports = { broadcasts, broadcastTypeEnum };
