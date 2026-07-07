"use strict";

const { Server } = require("socket.io");
const env = require("../../config/env");
const logger = require("../../utils/logger");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const { chatRooms, chatMessages } = require("../../db/schema");
const { db } = require("../../db/index");
const { eq } = require("drizzle-orm");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Track scheduled ephemeral room deletions
  const deletionTimers = new Map();

  // Middleware for authentication
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication error: No access token"));
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      socket.user = decoded; // { id: userId, role, ... }
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`🔌  User connected via socket: ${socket.user.id}`);

    // Initialize rate limit tracker (10 messages per 10 seconds)
    socket.messageLimits = { count: 0, resetTime: Date.now() + 10000 };

    // Join a specific room
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      logger.debug(`User ${socket.user.id} joined room ${roomId}`);

      // Cancel pending deletion if it exists
      if (deletionTimers.has(roomId)) {
        clearTimeout(deletionTimers.get(roomId));
        deletionTimers.delete(roomId);
        logger.info(`🛑 Canceled scheduled deletion for room ${roomId} because a user joined.`);
      }
    });

    const checkEmptyRoom = async (roomId) => {
      // Small delay to allow socket internal leave to process
      setTimeout(async () => {
        const roomClients = io.sockets.adapter.rooms.get(roomId);
        if (roomClients && roomClients.size > 0) return;

        try {
          const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, roomId)).limit(1);
          if (room && room.type === 'ephemeral') {
            logger.info(`⏳ Ephemeral room ${roomId} is empty. Scheduling deletion in 10 minutes.`);
            
            // Clear any existing timer just in case
            if (deletionTimers.has(roomId)) {
              clearTimeout(deletionTimers.get(roomId));
            }

            const timer = setTimeout(async () => {
              try {
                // Double check if it's STILL empty before deleting
                const clientsNow = io.sockets.adapter.rooms.get(roomId);
                if (clientsNow && clientsNow.size > 0) return;

                await db.delete(chatRooms).where(eq(chatRooms.id, roomId));
                logger.info(`🗑️ Ephemeral room deleted due to 10m inactivity: ${roomId}`);
                io.emit('room_deleted', roomId);
              } catch (err) {
                logger.error("Error deleting ephemeral room:", err);
              } finally {
                deletionTimers.delete(roomId);
              }
            }, 600000); // 10 minutes

            deletionTimers.set(roomId, timer);
          }
        } catch (err) {
          logger.error("Error checking empty room:", err);
        }
      }, 500);
    };

    // Leave a room
    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);
      logger.debug(`User ${socket.user.id} left room ${roomId}`);
      checkEmptyRoom(roomId);
    });

    // Handle incoming messages
    socket.on("send_message", async (data) => {
      try {
        const now = Date.now();
        if (now > socket.messageLimits.resetTime) {
          socket.messageLimits.count = 1;
          socket.messageLimits.resetTime = now + 10000;
        } else {
          socket.messageLimits.count++;
        }

        if (socket.messageLimits.count > 10) {
          logger.warn(`[SOCKET] User ${socket.user.id} exceeded message rate limit.`);
          socket.emit("error", { message: "Slow down! You're sending messages too fast." });
          return;
        }

        const { roomId, content } = data;
        logger.debug(`[SOCKET] User ${socket.user.id} attempting to send message to room ${roomId}`);
        
        // Ensure user is in the room
        if (!socket.rooms.has(roomId)) {
          logger.warn(`[SOCKET] User ${socket.user.id} tried to send message to room ${roomId} without joining. Rooms:`, Array.from(socket.rooms));
          // Don't return, let's join them just in case
          socket.join(roomId);
        }

        // Save to DB
        logger.debug(`[SOCKET] Inserting message into DB...`);
        const [newMessage] = await db
          .insert(chatMessages)
          .values({
            roomId,
            senderId: socket.user.id,
            content,
          })
          .returning();
        logger.debug(`[SOCKET] Message inserted: ${newMessage.id}`);

        // Fetch sender details
        const { users } = require("../../db/schema");
        const [sender] = await db
          .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
          .from(users)
          .where(eq(users.id, socket.user.id))
          .limit(1);

        // Emit to all clients in the room including sender
        logger.debug(`[SOCKET] Emitting receive_message to room ${roomId}`);
        io.to(roomId).emit("receive_message", {
          id: newMessage.id,
          roomId,
          content,
          senderId: socket.user.id,
          sender,
          createdAt: newMessage.createdAt,
        });

      } catch (err) {
        logger.error("Socket send_message error:", err);
      }
    });

    // Broadcast new room creation
    socket.on("create_room_broadcast", (room) => {
      if (!room.isPrivate) {
        socket.broadcast.emit("room_created", room);
      }
    });

    // Broadcast room deletion (Admin)
    socket.on("delete_room_broadcast", (roomId) => {
      // Broadcast to all other clients
      socket.broadcast.emit("room_deleted", roomId);
      
      // Also emit to all clients in the room to force them out
      io.to(roomId).emit("room_deleted", roomId);
    });

    socket.on("disconnecting", () => {
      const roomsToLeave = [...socket.rooms].filter(r => r !== socket.id);
      roomsToLeave.forEach(roomId => checkEmptyRoom(roomId));
    });

    socket.on("disconnect", () => {
      logger.info(`🔌  User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

module.exports = initSocket;
