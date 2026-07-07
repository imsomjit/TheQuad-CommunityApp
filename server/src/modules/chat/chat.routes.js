"use strict";

const express = require("express");
const chatController = require("./chat.controller");
const { auth } = require("../../middleware/auth");
const { chatReadLimiter, chatWriteLimiter } = require("../../middleware/rateLimiter");

const router = express.Router();

// All chat routes require authentication
router.use(auth);

// GET /api/chat/rooms
router.route("/rooms")
  .get(chatReadLimiter, chatController.getRooms)
  .post(chatWriteLimiter, chatController.createRoom);

// GET /api/chat/rooms/:roomId/messages
router.route("/rooms/:roomId/messages")
  .get(chatReadLimiter, chatController.getRoomMessages);

// POST /api/chat/rooms/join
router.route("/rooms/join")
  .post(chatWriteLimiter, chatController.joinRoom);

// POST / DELETE /api/chat/rooms/:roomId/pin
router.route("/rooms/:roomId/pin")
  .post(chatWriteLimiter, chatController.pinRoom)
  .delete(chatWriteLimiter, chatController.unpinRoom);

const { restrictTo } = require("../../middleware/auth");

// POST /api/chat/admin/rooms
router.route("/admin/rooms")
  .post(restrictTo("admin", "moderator"), chatWriteLimiter, chatController.createAdminRoom);

// DELETE /api/chat/admin/rooms/:roomId
router.route("/admin/rooms/:roomId")
  .delete(restrictTo("admin", "moderator"), chatWriteLimiter, chatController.deleteAdminRoom);

module.exports = router;
