"use strict";

const express = require("express");
const chatController = require("./chat.controller");
const { auth, optionalAuth } = require("../../middleware/auth");
const { chatReadLimiter, chatWriteLimiter, aiLimiter } = require("../../middleware/rateLimiter");

const router = express.Router();

// GET /api/chat/rooms
router.route("/rooms")
  .get(optionalAuth, chatReadLimiter, chatController.getRooms)
  .post(auth, chatWriteLimiter, chatController.createRoom);

// GET /api/chat/online
router.route("/online")
  .get(auth, chatReadLimiter, chatController.getOnlineUsers);

// GET /api/chat/rooms/:roomId/messages
router.route("/rooms/:roomId/messages")
  .get(auth, chatReadLimiter, chatController.getRoomMessages);

// POST /api/chat/rooms/join
router.route("/rooms/join")
  .post(auth, chatWriteLimiter, chatController.joinRoom);

// POST /api/chat/direct/:targetUserId
router.route("/direct/:targetUserId")
  .post(auth, chatWriteLimiter, chatController.createDirectRoom);

// POST / DELETE /api/chat/rooms/:roomId/pin
router.route("/rooms/:roomId/pin")
  .post(auth, chatWriteLimiter, chatController.pinRoom)
  .delete(auth, chatWriteLimiter, chatController.unpinRoom);

const { restrictTo } = require("../../middleware/auth");

// POST /api/chat/admin/rooms
router.route("/admin/rooms")
  .post(auth, restrictTo("admin", "moderator"), chatWriteLimiter, chatController.createAdminRoom);

// DELETE /api/chat/admin/rooms/:roomId
router.route("/admin/rooms/:roomId")
  .delete(auth, restrictTo("admin", "moderator"), chatWriteLimiter, chatController.deleteAdminRoom);

// POST /api/chat/bot
router.route("/bot")
  .post(aiLimiter, chatController.generateGuideChat);

module.exports = router;
