"use strict";

const express = require("express");
const { auth, restrictTo } = require("../../middleware/auth");
const broadcastsService = require("./broadcasts.service");

const router = express.Router();

// All broadcast endpoints are Admin only
router.use(auth, restrictTo("admin"));

/**
 * @route   GET /api/broadcasts
 * @desc    List all scheduled and past broadcasts
 */
router.get("/", async (req, res, next) => {
  try {
    const data = await broadcastsService.listBroadcasts();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/broadcasts
 * @desc    Schedule a new broadcast
 */
router.post("/", async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdBy: req.user.id
    };
    const scheduled = await broadcastsService.scheduleBroadcast(data);
    res.status(201).json(scheduled);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/broadcasts/:id
 * @desc    Delete a scheduled broadcast
 */
router.delete("/:id", async (req, res, next) => {
  try {
    await broadcastsService.deleteBroadcast(parseInt(req.params.id, 10));
    res.json({ message: "Broadcast deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
