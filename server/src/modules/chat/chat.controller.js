"use strict";

const chatService = require("./chat.service");
const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");
const { getIo } = require("./chat.socket");
const ai = require("../../utils/ai");

exports.getRooms = asyncHandler(async (req, res) => {
  const rooms = await chatService.getRooms(req.user?.id);
  res.status(200).json({
    success: true,
    data: rooms,
  });
});

exports.createRoom = asyncHandler(async (req, res) => {
  const { name, description, isPrivate } = req.body;
  
  if (!name) {
    throw new AppError("Room name is required", 400);
  }

  const room = await chatService.createRoom(name, description, req.user.id, isPrivate);
  
  res.status(201).json({
    success: true,
    data: room,
  });
});

exports.getRoomMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  
  if (!roomId) {
    throw new AppError("Room ID is required", 400);
  }

  const messages = await chatService.getRoomMessages(roomId, req.user?.id);
  
  res.status(200).json({
    success: true,
    data: messages,
  });
});

exports.joinRoom = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new AppError("Join code is required", 400);
  }

  const room = await chatService.joinRoomByCode(code.toUpperCase());

  if (!room) {
    throw new AppError("Invalid or expired join code", 404);
  }

  res.status(200).json({
    success: true,
    data: room,
  });
});

exports.pinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  
  if (!roomId) {
    throw new AppError("Room ID is required", 400);
  }

  await chatService.pinRoom(req.user.id, roomId);
  
  res.status(200).json({
    success: true,
    message: "Room pinned successfully",
  });
});

exports.unpinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  
  if (!roomId) {
    throw new AppError("Room ID is required", 400);
  }

  await chatService.unpinRoom(req.user.id, roomId);
  
  res.status(200).json({
    success: true,
    message: "Room unpinned successfully",
  });
});

exports.createAdminRoom = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    throw new AppError("Room name is required", 400);
  }
  const room = await chatService.createGlobalRoom(name, description, req.user.id);
  res.status(201).json({
    success: true,
    data: room,
  });
});

exports.deleteAdminRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) {
    throw new AppError("Room ID is required", 400);
  }
  await chatService.deleteGlobalRoom(roomId);
  res.status(200).json({
    success: true,
    message: "Room deleted successfully",
  });
});

exports.createDirectRoom = asyncHandler(async (req, res) => {
  const { targetUserId } = req.params;
  
  if (!targetUserId) {
    throw new AppError("Target user ID is required", 400);
  }

  const roomId = await chatService.getOrCreateDirectRoom(req.user.id, parseInt(targetUserId, 10));
  
  res.status(200).json({
    success: true,
    data: { id: roomId },
  });
});

exports.clearChat = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) throw new AppError("Room ID is required", 400);
  
  await chatService.clearChat(req.user.id, roomId);
  
  res.status(200).json({
    success: true,
    message: "Chat cleared successfully",
  });
});

exports.deleteChat = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) throw new AppError("Room ID is required", 400);
  
  await chatService.deleteUserRoom(req.user.id, roomId);
  
  res.status(200).json({
    success: true,
    message: "Chat deleted successfully",
  });
});

exports.getOnlineUsers = asyncHandler(async (req, res) => {
  const io = getIo();
  const onlineUserIds = [];
  
  // Iterate through all rooms in the socket adapter
  for (const [roomName, sockets] of io.sockets.adapter.rooms.entries()) {
    if (roomName.startsWith("user_") && sockets.size > 0) {
      const userIdStr = roomName.replace("user_", "");
      const userId = parseInt(userIdStr, 10);
      if (!isNaN(userId)) {
        onlineUserIds.push(userId);
      }
    }
  }

  res.status(200).json({
    success: true,
    data: onlineUserIds,
  });
});

exports.generateGuideChat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    throw new AppError("Message is required", 400);
  }
  
  const reply = await ai.chatWithPlatformGuide(history || [], message);
  
  res.status(200).json({
    success: true,
    data: reply,
  });
});
