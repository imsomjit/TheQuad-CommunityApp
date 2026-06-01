"use strict";

const {
  pgTable,
  serial,
  integer,
  boolean,
  varchar,
  timestamp,
  pgEnum,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

const notificationTypeEnum = pgEnum("notification_type", [
  "follow",
  "upvote_resource",
  "upvote_question",
  "upvote_answer",
  "comment_on_resource",
  "comment_on_question",
  "comment_on_answer",
  "answer_on_question",
  "like_blog",
  "comment_on_blog",
  "system_welcome",
  "system_broadcast",
]);

const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actorId: integer("actor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  // What was acted on (e.g., "resource" + id=42)
  targetType: varchar("target_type", { length: 50 }),
  targetId: integer("target_id"),
  // Human-readable snapshot (avoids extra JOIN in notification list)
  targetTitle: varchar("target_title", { length: 300 }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

module.exports = { notifications, notificationTypeEnum };
