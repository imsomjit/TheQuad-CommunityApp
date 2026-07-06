"use strict";

const chatService = require("./chat.service");
const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");

exports.getRooms = asyncHandler(async (req, res) => {
  const rooms = await chatService.getRooms();
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

  const messages = await chatService.getRoomMessages(roomId);
  
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
