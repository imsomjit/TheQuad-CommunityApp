"use strict";

const asyncHandler = require("../../utils/asyncHandler");
const leetcodeService = require("./leetcode.service");

// GET /api/leetcode/:username
const getProfileStats = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const stats = await leetcodeService.getProfileStats(username);
  res.json({ success: true, data: stats });
});

module.exports = {
  getProfileStats
};
