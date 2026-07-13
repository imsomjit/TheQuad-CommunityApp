"use strict";

const asyncHandler = require("../../utils/asyncHandler");
const tagsService = require("./tags.service");

// GET /api/tags
const getAllTags = asyncHandler(async (req, res) => {
  const tags = await tagsService.getAllUniqueTags();
  res.json({ success: true, data: tags });
});

module.exports = {
  getAllTags
};
