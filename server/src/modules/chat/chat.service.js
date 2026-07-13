"use strict";

const { db } = require("../../db");
const { chatRooms, chatMessages, users, chatPins, chatParticipants } = require("../../db/schema");
const { eq, asc, and, count, inArray, or, gt, ne } = require("drizzle-orm");
const crypto = require("crypto");

/**
 * Fetch all available rooms (global & ephemeral) + pinned private rooms
 */
const getRooms = async (userId) => {
  if (!userId) {
    const publicRooms = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.isPrivate, false))
      .orderBy(asc(chatRooms.createdAt));

    return publicRooms.map(room => ({
      ...room,
      isPinned: false
    }));
  }

  // Get user's pinned rooms
  const userPins = await db
    .select({
      roomId: chatPins.roomId,
    })
    .from(chatPins)
    .where(eq(chatPins.userId, userId));

  const pinnedRoomIds = new Set(userPins.map(p => p.roomId));

  // Build the OR conditions for non-direct rooms
  const roomConditions = [
    eq(chatRooms.isPrivate, false), // Public rooms
    and(
      eq(chatRooms.isPrivate, true),
      eq(chatRooms.type, "ephemeral"),
      eq(chatRooms.creatorId, userId) // Private ephemeral rooms created by the user
    )
  ];

  if (pinnedRoomIds.size > 0) {
    roomConditions.push(
      and(
        eq(chatRooms.isPrivate, true), 
        eq(chatRooms.type, "ephemeral"),
        inArray(chatRooms.id, Array.from(pinnedRoomIds))
      )
    );
  }

  // Fetch all relevant lounges
  const allLounges = await db
    .select()
    .from(chatRooms)
    .where(or(...roomConditions))
    .orderBy(asc(chatRooms.createdAt));

  let allRooms = [...allLounges];

  // Get user's Direct Messaging (DM) rooms
  const userDirectParticipants = await db
    .select({ 
      roomId: chatParticipants.roomId,
      lastReadAt: chatParticipants.lastReadAt 
    })
    .from(chatParticipants)
    .where(eq(chatParticipants.userId, userId));

  const directRoomIds = userDirectParticipants.map(p => p.roomId);
  
  // Fetch unread counts
  const unreadCounts = {};
  for (const p of userDirectParticipants) {
    const [{ c }] = await db
      .select({ c: count() })
      .from(chatMessages)
      .where(and(
        eq(chatMessages.roomId, p.roomId),
        gt(chatMessages.createdAt, p.lastReadAt),
        ne(chatMessages.senderId, userId)
      ));
    unreadCounts[p.roomId] = c;
  }
  
  if (directRoomIds.length > 0) {
    // Fetch the direct rooms along with their participants to know who the other person is
    const directRooms = await db
      .select({
        id: chatRooms.id,
        name: chatRooms.name,
        type: chatRooms.type,
        description: chatRooms.description,
        creatorId: chatRooms.creatorId,
        isPrivate: chatRooms.isPrivate,
        joinCode: chatRooms.joinCode,
        createdAt: chatRooms.createdAt,
        participantId: users.id,
        participantName: users.name,
        participantUsername: users.username,
        participantAvatarUrl: users.avatarUrl,
      })
      .from(chatRooms)
      .innerJoin(chatParticipants, eq(chatRooms.id, chatParticipants.roomId))
      .innerJoin(users, eq(chatParticipants.userId, users.id))
      .where(and(
        eq(chatRooms.type, "direct"),
        inArray(chatRooms.id, directRoomIds)
      ));

    // Group the rows by room ID since each room has 2 participants
    const groupedDirectRooms = {};
    for (const row of directRooms) {
      if (!groupedDirectRooms[row.id]) {
        groupedDirectRooms[row.id] = {
          id: row.id,
          name: row.name,
          type: row.type,
          description: row.description,
          creatorId: row.creatorId,
          isPrivate: row.isPrivate,
          joinCode: row.joinCode,
          createdAt: row.createdAt,
          unreadCount: unreadCounts[row.id] || 0,
          participants: [],
        };
      }
      groupedDirectRooms[row.id].participants.push({
        id: row.participantId,
        name: row.participantName,
        username: row.participantUsername,
        avatarUrl: row.participantAvatarUrl,
      });
    }

    allRooms = [...allRooms, ...Object.values(groupedDirectRooms)];
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

/**
 * Get or create a direct messaging room between two users
 */
const getOrCreateDirectRoom = async (user1Id, user2Id) => {
  if (user1Id === user2Id) {
    throw new Error("Cannot create a direct message with yourself");
  }

  // Find if a direct room already exists between these two users
  // We look for a room that has BOTH users as participants and is of type 'direct'
  const existingRoomsQuery = await db.execute(require("drizzle-orm").sql`
    SELECT r.id
    FROM chat_rooms r
    JOIN chat_participants p1 ON r.id = p1.room_id
    JOIN chat_participants p2 ON r.id = p2.room_id
    WHERE r.type = 'direct'
      AND p1.user_id = ${user1Id}
      AND p2.user_id = ${user2Id}
    LIMIT 1
  `);

  const rows = existingRoomsQuery.rows || existingRoomsQuery;

  if (rows && rows.length > 0) {
    return rows[0].id;
  }

  // Create new direct room
  return await db.transaction(async (tx) => {
    const [newRoom] = await tx
      .insert(chatRooms)
      .values({
        type: "direct",
        isPrivate: true,
        creatorId: user1Id,
      })
      .returning();

    // Add both participants
    await tx.insert(chatParticipants).values([
      { roomId: newRoom.id, userId: user1Id },
      { roomId: newRoom.id, userId: user2Id }
    ]);

    return newRoom.id;
  });
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
  getOrCreateDirectRoom,
};
