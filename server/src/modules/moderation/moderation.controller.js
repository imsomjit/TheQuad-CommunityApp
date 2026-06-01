"use strict";

const moderationService = require("./moderation.service");
const asyncHandler = require("../../utils/asyncHandler");
const {
  listReportsSchema,
  reportActionSchema,
  userActionSchema,
  removeContentSchema,
} = require("./moderation.schemas");

const listReports = asyncHandler(async (req, res) => {
  const query = listReportsSchema.parse(req.query);
  const result = await moderationService.listReports(query);
  res.json({ success: true, ...result });
});

const reviewReport = asyncHandler(async (req, res) => {
  const { action, note } = reportActionSchema.parse(req.body);
  const reportId = parseInt(req.params.id);
  
  let status = "resolved";
  if (action === "dismiss") status = "dismissed";
  if (action === "review") status = "under_review";

  const result = await moderationService.updateReportStatus(
    reportId,
    status,
    req.user.id,
    note
  );
  res.json({ success: true, data: result });
});

const removeContent = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const { reason } = removeContentSchema.parse(req.body);

  await moderationService.removeContent(
    type,
    parseInt(id),
    req.user.id,
    reason
  );

  res.json({ success: true, message: "Content removed successfully" });
});

const warnUser = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  const { reason } = userActionSchema.parse(req.body);

  await moderationService.warnUser(userId, req.user.id, reason);

  res.json({ success: true, message: "User warned successfully" });
});

const suspendUser = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  const { reason, durationDays } = userActionSchema.parse(req.body);

  if (!durationDays) {
    return res.status(400).json({ success: false, message: "durationDays is required for suspension" });
  }

  const result = await moderationService.suspendUser(
    userId,
    req.user.id,
    reason,
    durationDays
  );

  res.json({ success: true, data: result });
});

const banUser = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  const { reason } = userActionSchema.parse(req.body);

  const result = await moderationService.banUser(userId, req.user.id, reason);
  res.json({ success: true, data: result });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const data = await moderationService.getAnalytics();
  res.json({ success: true, data });
});

const listUsers = asyncHandler(async (req, res) => {
  const data = await moderationService.listUsers(req.query);
  res.json({ success: true, ...data });
});

const getUserHistory = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  const data = await moderationService.getUserHistory(userId);
  res.json({ success: true, data });
});

const createModerator = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body; // Add simple validation or rely on service
  if (!name || !username || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }
  const data = await moderationService.createModerator({ name, username, email, password });
  res.json({ success: true, data });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;
  if (!role || !["student", "moderator"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }
  const data = await moderationService.updateUserRole(userId, role);
  res.json({ success: true, data });
});

const toggleFeatureContent = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const data = await moderationService.toggleFeatureContent(type, parseInt(id), req.user.id);
  res.json({ success: true, data });
});

const getFeaturedContent = asyncHandler(async (req, res) => {
  const data = await moderationService.getFeaturedContent();
  res.json({ success: true, data });
});

const createOpportunity = asyncHandler(async (req, res) => {
  const data = await moderationService.createOpportunity(req.body);
  res.json({ success: true, data });
});

const updateOpportunity = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const data = await moderationService.updateOpportunity(id, req.body);
  res.json({ success: true, data });
});

const deleteOpportunity = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const data = await moderationService.deleteOpportunity(id, req.user.id);
  res.json({ success: true, data });
});

module.exports = {
  listReports,
  reviewReport,
  removeContent,
  warnUser,
  suspendUser,
  banUser,
  getAnalytics,
  listUsers,
  getUserHistory,
  createModerator,
  updateUserRole,
  toggleFeatureContent,
  getFeaturedContent,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
};
