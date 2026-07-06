"use strict";

const {
  pgTable,
  uuid,
  text,
  timestamp,
  integer
} = require("drizzle-orm/pg-core");
const { users } = require("./users");
const { chatRooms } = require("./chat_rooms");
const { relations } = require("drizzle-orm");

const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id")
    .notNull()
    .references(() => chatRooms.id, { onDelete: "cascade" }),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatMessages.roomId],
    references: [chatRooms.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

module.exports = { chatMessages, chatMessagesRelations };
