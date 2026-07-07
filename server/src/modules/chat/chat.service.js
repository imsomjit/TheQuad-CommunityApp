"use strict";

const { db } = require("../../db");
const { chatRooms, chatMessages, users, chatPins } = require("../../db/schema");
const { eq, asc, and, count } = require("drizzle-orm");
const crypto = require("crypto");

/**
 * Fetch all available rooms (global & ephemeral) + pinned private rooms
 */
const getRooms = async (userId) => {
  // Get all public rooms
  const publicRooms = await db
    .select()
    .from(chatRooms)
    .where(eq(chatRooms.isPrivate, false))
    .orderBy(asc(chatRooms.createdAt));

  // Get user's pinned rooms
  const userPins = await db
    .select({
      roomId: chatPins.roomId,
    })
    .from(chatPins)
    .where(eq(chatPins.userId, userId));

  const pinnedRoomIds = new Set(userPins.map(p => p.roomId));

  let allRooms = [...publicRooms];
  
  const { inArray } = require("drizzle-orm");
  if (pinnedRoomIds.size > 0) {
    const pinnedPrivateRooms = await db
      .select()
      .from(chatRooms)
      .where(and(eq(chatRooms.isPrivate, true), inArray(chatRooms.id, Array.from(pinnedRoomIds))));
    allRooms = [...allRooms, ...pinnedPrivateRooms];
  }

  // Map to add isPinned
  return allRooms.map(room => ({
    ...room,
    isPinned: pinnedRoomIds.has(room.id)
  }));
};

const pinRoom = async (userId, roomId) => {
  // Check if already pinned
  const existing = await db
    .select()
    .from(chatPins)
    .where(and(eq(chatPins.userId, userId), eq(chatPins.roomId, roomId)))
    .limit(1);
  
  if (existing.length > 0) return;

  // Check limit
  const pinCountRes = await db
    .select({ value: count() })
    .from(chatPins)
    .where(eq(chatPins.userId, userId));
  
  if (pinCountRes[0].value >= 5) {
    const error = new Error("You can only pin up to 5 chat rooms.");
    error.statusCode = 400;
    throw error;
  }

  await db.insert(chatPins).values({ userId, roomId });
};

const unpinRoom = async (userId, roomId) => {
  await db
    .delete(chatPins)
    .where(and(eq(chatPins.userId, userId), eq(chatPins.roomId, roomId)));
};

/**
 * Create a new ephemeral study room
 */
const createRoom = async (name, description, creatorId, isPrivate = false) => {
  let joinCode = null;
  if (isPrivate) {
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
        username: users.username,
        avatarUrl: users.avatarUrl,
      }
    })
    .from(chatMessages)
    .leftJoin(users, eq(chatMessages.senderId, users.id))
    .where(eq(chatMessages.roomId, roomId))
    .orderBy(asc(chatMessages.createdAt));
};

/**
 * Create a new global study room (Admin/Mod only)
 */
const createGlobalRoom = async (name, description, creatorId) => {
  const [newRoom] = await db
    .insert(chatRooms)
    .values({
      name,
      description,
      type: "global",
      creatorId,
      isPrivate: false,
    })
    .returning();
  return newRoom;
};

/**
 * Delete a chat room (Admin/Mod only)
 */
const deleteGlobalRoom = async (roomId) => {
  await db.delete(chatRooms).where(eq(chatRooms.id, roomId));
};

module.exports = {
  getRooms,
  createRoom,
  getRoomMessages,
  joinRoomByCode,
  pinRoom,
  unpinRoom,
  createGlobalRoom,
  deleteGlobalRoom,
};
