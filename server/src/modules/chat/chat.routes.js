"use strict";

const express = require("express");
const chatController = require("./chat.controller");
const { auth } = require("../../middleware/auth");

const router = express.Router();

// All chat routes require authentication
router.use(auth);

// GET /api/chat/rooms
router.route("/rooms")
  .get(chatController.getRooms)
  .post(chatController.createRoom);

// GET /api/chat/rooms/:roomId/messages
router.route("/rooms/:roomId/messages")
  .get(chatController.getRoomMessages);

// POST /api/chat/rooms/join
router.route("/rooms/join")
  .post(chatController.joinRoom);

module.exports = router;
