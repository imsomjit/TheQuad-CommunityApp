"use strict";

const {
  pgTable,
  uuid,
  integer,
  timestamp,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");
const { chatRooms } = require("./chat_rooms");
const { relations } = require("drizzle-orm");

const chatPins = pgTable("chat_pins", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roomId: uuid("room_id").notNull().references(() => chatRooms.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

const chatPinsRelations = relations(chatPins, ({ one }) => ({
  user: one(users, {
    fields: [chatPins.userId],
    references: [users.id],
  }),
  room: one(chatRooms, {
    fields: [chatPins.roomId],
    references: [chatRooms.id],
  }),
}));

module.exports = { chatPins, chatPinsRelations };
