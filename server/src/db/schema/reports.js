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

const reportReasonEnum = pgEnum("report_reason", [
  "spam",
  "abusive",
  "irrelevant",
  "copyright",
  "misinformation",
  "other",
]);

const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewed",
  "dismissed",
]);

const reportTargetEnum = pgEnum("report_target_type", [
  "resource",
  "question",
  "answer",
  "blog",
  "comment",
  "user",
]);

const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: reportTargetEnum("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  reason: reportReasonEnum("reason").notNull(),
  details: text("details"),
  status: reportStatusEnum("status").default("pending").notNull(),
  resolvedById: integer("resolved_by_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

module.exports = { reports, reportReasonEnum, reportStatusEnum, reportTargetEnum };
