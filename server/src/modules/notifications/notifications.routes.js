"use strict";

const { Router } = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const { auth } = require("../../middleware/auth");
const { sseLimiter, notificationLimiter } = require("../../middleware/rateLimiter");
const notificationService = require("./notifications.service");
const sseManager = require("../../config/sse");

const router = Router();

/**
 * GET /api/notifications/stream
 * Server-Sent Events endpoint.
 * Client connects once and receives push events.
 *
 * The client is identified by their JWT access token (Authorization header
 * is readable on the initial SSE HTTP request).
 */
router.get(
  "/stream",
  auth,         // reads Authorization header — works on GET for SSE
  sseLimiter,
  (req, res) => {
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable Nginx buffering (Render)
    res.flushHeaders();

    // Register this client
    sseManager.addClient(req.user.id, res);

    // Send initial "connected" event with unread count
    notificationService.getForUser(req.user.id, 1, 1).then(({ unreadCount }) => {
      res.write(`event: connected\n`);
      res.write(`data: ${JSON.stringify({ unreadCount })}\n\n`);
    }).catch(() => {});

    // Cleanup on disconnect
    req.on("close", () => {
      sseManager.removeClient(req.user.id);
    });
  }
);

// GET /api/notifications
router.get(
  "/",
  auth,
  notificationLimiter,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const result = await notificationService.getForUser(req.user.id, page, limit);
    res.json({ success: true, ...result });
  })
);

// PATCH /api/notifications/:id/read
router.patch(
  "/:id/read",
  auth,
  notificationLimiter,
  asyncHandler(async (req, res) => {
    await notificationService.markRead(parseInt(req.params.id), req.user.id);
    res.json({ success: true, message: "Marked as read" });
  })
);

// PATCH /api/notifications/read-all
router.patch(
  "/read-all",
  auth,
  notificationLimiter,
  asyncHandler(async (req, res) => {
    await notificationService.markAllRead(req.user.id);
    res.json({ success: true, message: "All notifications marked as read" });
  })
);

// DELETE /api/notifications/clear-all
router.delete(
  "/clear-all",
  auth,
  notificationLimiter,
  asyncHandler(async (req, res) => {
    await notificationService.clearAll(req.user.id);
    res.json({ success: true, message: "All notifications cleared" });
  })
);

module.exports = router;
