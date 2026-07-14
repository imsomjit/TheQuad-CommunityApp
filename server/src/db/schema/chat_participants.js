"use strict";

const { pgTable, uuid, timestamp, integer } = require("drizzle-orm/pg-core");
const { users } = require("./users");
const { chatRooms } = require("./chat_rooms");
const { relations } = require("drizzle-orm");

const chatParticipants = pgTable("chat_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id")
    .references(() => chatRooms.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  lastReadAt: timestamp("last_read_at", { withTimezone: true }).defaultNow().notNull(),
  clearedAt: timestamp("cleared_at", { withTimezone: true }),
});

const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatParticipants.roomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [chatParticipants.userId],
    references: [users.id],
  }),
}));

module.exports = { chatParticipants, chatParticipantsRelations };
