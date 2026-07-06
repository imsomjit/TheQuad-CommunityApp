"use strict";

const { db } = require("../../db");
const { chatRooms, chatMessages, users } = require("../../db/schema");
const { eq, asc, and } = require("drizzle-orm");
const crypto = require("crypto");

/**
 * Fetch all available rooms (global & ephemeral)
 */
const getRooms = async () => {
  return await db
    .select()
    .from(chatRooms)
    .where(eq(chatRooms.isPrivate, false))
    .orderBy(asc(chatRooms.createdAt));
};

/**
 * Create a new ephemeral study room
 */
const createRoom = async (name, description, creatorId, isPrivate = false) => {
  let joinCode = null;
  if (isPrivate) {
    // Generate a 6-character random alphanumeric code
    joinCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  }

  const [newRoom] = await db
    .insert(chatRooms)
    .values({
      name,
      description,
      type: "ephemeral",
      creatorId,
      isPrivate,
      joinCode,
    })
    .returning();
  return newRoom;
};

/**
 * Join a private room by code
 */
const joinRoomByCode = async (code) => {
  const [room] = await db
    .select()
    .from(chatRooms)
    .where(eq(chatRooms.joinCode, code))
    .limit(1);
  return room;
};

/**
 * Fetch message history for a specific room
 */
const getRoomMessages = async (roomId) => {
  return await db
    .select({
      id: chatMessages.id,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
      senderId: chatMessages.senderId,
      roomId: chatMessages.roomId,
      sender: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      }
    })
    .from(chatMessages)
    .leftJoin(users, eq(chatMessages.senderId, users.id))
    .where(eq(chatMessages.roomId, roomId))
    .orderBy(asc(chatMessages.createdAt));
};

module.exports = {
  getRooms,
  createRoom,
  getRoomMessages,
  joinRoomByCode,
};
