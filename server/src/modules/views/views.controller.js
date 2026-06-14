"use strict";

const asyncHandler = require("../../utils/asyncHandler");
const viewsService = require("./views.service");
const crypto = require("crypto");

/**
 * Record a view for a given content type and id.
 * Generates a visitor_id cookie if not present.
 */
const recordView = asyncHandler(async (req, res) => {
  const { contentType, id } = req.params;
  
  // Valid types
  if (!["post", "resource", "question", "book"].includes(contentType)) {
    return res.status(400).json({ success: false, message: "Invalid content type" });
  }

  const userId = req.user ? req.user.id : null;
  let visitorId = req.cookies?.visitor_id;

  // Generate visitor ID if neither logged in nor has cookie
  if (!userId && !visitorId) {
    visitorId = crypto.randomUUID();
    // Set a long-lived cookie for anonymous users
    res.cookie("visitor_id", visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
  }

  const result = await viewsService.recordView({
    contentType,
    contentId: parseInt(id, 10),
    userId,
    visitorId,
  });

  res.status(result.recorded ? 201 : 200).json({
    success: true,
    data: result,
  });
});

module.exports = {
  recordView,
};
