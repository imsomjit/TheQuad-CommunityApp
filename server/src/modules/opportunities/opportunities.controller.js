"use strict";

const asyncHandler = require("../../utils/asyncHandler");
const opportunitiesService = require("./opportunities.service");

const listOpportunities = asyncHandler(async (req, res) => {
  const filters = {
    organizer: req.query.organizer,
    type: req.query.type,
    status: req.query.status,
    q: req.query.q,
    sort: req.query.sort,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
  };

  const result = await opportunitiesService.listOpportunities(filters);
  res.json({ success: true, data: result, message: "Opportunities retrieved" });
});

const getOpportunityById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id; // Optional: if auth middleware is applied optionally
  
  const opportunity = await opportunitiesService.getOpportunityById(parseInt(id), userId);
  res.json({ success: true, data: opportunity, message: "Opportunity retrieved" });
});

const toggleBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await opportunitiesService.toggleBookmark(userId, parseInt(id));
  res.json({ success: true, data: result, message: result.bookmarked ? "Opportunity bookmarked" : "Bookmark removed" });
});

const getBookmarkedOpportunities = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await opportunitiesService.getBookmarkedOpportunities(userId, page, limit);
  res.json({ success: true, data: result, message: "Bookmarked opportunities retrieved" });
});

module.exports = {
  listOpportunities,
  getOpportunityById,
  toggleBookmark,
  getBookmarkedOpportunities,
};
