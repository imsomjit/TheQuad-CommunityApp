"use strict";

const {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  integer,
  boolean
} = require("drizzle-orm/pg-core");
const { users } = require("./users");
const { relations } = require("drizzle-orm");

const roomTypeEnum = pgEnum("room_type", ["global", "ephemeral", "direct"]);

const chatRooms = pgTable("chat_rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }), // Can be null for direct messages
  type: roomTypeEnum("type").default("global").notNull(),
  description: text("description"), // Optional, e.g., "Prep for OS Midterm"
  creatorId: integer("creator_id").references(() => users.id, { onDelete: "set null" }), // Who created it
  isPrivate: boolean("is_private").default(false).notNull(),
  joinCode: varchar("join_code", { length: 10 }).unique(), // For private rooms
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  creator: one(users, {
    fields: [chatRooms.creatorId],
    references: [users.id],
  }),
  messages: many(require("./chat_messages").chatMessages),
  participants: many(require("./chat_participants").chatParticipants),
}));

module.exports = { chatRooms, roomTypeEnum, chatRoomsRelations };
