"use strict";

const githubService = require("./github.service");
const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");

// GET /api/github/:username
const getProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username || username.length > 100) {
    throw new AppError("Invalid GitHub username", 400, "INVALID_INPUT");
  }

  const profile = await githubService.getProfile(username);
  res.json({ success: true, data: profile });
});

// GET /api/github/:username/repos
const getRepos = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const sort = req.query.sort || "stars";
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const pinned = req.query.pinned === "true";

  const repos = await githubService.getRepos(username, { sort, limit, pinned });
  res.json({ success: true, data: repos });
});

// GET /api/github/:username/languages
const getLanguages = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const languages = await githubService.getLanguages(username);
  res.json({ success: true, data: languages });
});

// GET /api/github/:username/activity
const getActivity = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 30, 100);

  const activity = await githubService.getActivity(username, { limit });
  res.json({ success: true, data: activity });
});

// GET /api/github/:username/contributions
const getContributions = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const summary = await githubService.getContributionSummary(username);
  res.json({ success: true, data: summary });
});

module.exports = { getProfile, getRepos, getLanguages, getActivity, getContributions };
