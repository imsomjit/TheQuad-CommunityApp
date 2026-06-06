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
const { nanoid } = require("nanoid");
const { users } = require("./users");

const reportReasonEnum = pgEnum("report_reason", [
  "spam",
  "harassment",
  "abusive",
  "misleading",
  "copyright",
  "inappropriate",
  "duplicate",
  "other",
]);

const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "under_review",
  "resolved",
  "dismissed",
]);

const reportTargetEnum = pgEnum("report_target_type", [
  "resource",
  "question",
  "answer",
  "blog",
  "comment",
  "opportunity",
  "user",
  "book",
]);

const reports = pgTable("reports", {
  id: varchar("id", { length: 12 }).$defaultFn(() => nanoid(12)).primaryKey(),
  reporterId: integer("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: reportTargetEnum("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  reason: reportReasonEnum("reason").notNull(),
  details: text("details"),
  contentSnapshot: text("content_snapshot"), // Store JSON stringified snapshot or direct text
  status: reportStatusEnum("status").default("pending").notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  resolvedById: integer("resolved_by_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

module.exports = { reports, reportReasonEnum, reportStatusEnum, reportTargetEnum };
