"use strict";

const { eq, and, sql, gte } = require("drizzle-orm");
const { db } = require("../../db/index");
const {
  contentViews,
  posts,
  resources,
  questions,
  books,
} = require("../../db/schema/index");
const crypto = require("crypto");

/**
 * Record a view for a content type if not viewed by this user/visitor in the last 24h.
 */
const recordView = async ({ contentType, contentId, userId, visitorId }) => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  // 1. Check if view exists recently
  const conditions = [
    eq(contentViews.contentType, contentType),
    eq(contentViews.contentId, contentId),
    gte(contentViews.viewedAt, cutoff),
  ];

  if (userId) {
    conditions.push(eq(contentViews.userId, userId));
  } else {
    conditions.push(eq(contentViews.visitorId, visitorId));
  }

  const [existingView] = await db
    .select()
    .from(contentViews)
    .where(and(...conditions))
    .limit(1);

  if (existingView) {
    return { recorded: false, reason: "recently_viewed" };
  }

  // 2. Insert new view
  await db.insert(contentViews).values({
    contentType,
    contentId,
    userId: userId || null,
    visitorId: userId ? null : visitorId,
  });

  // 3. Increment the counter on the parent table
  let targetTable;
  if (contentType === "post") targetTable = posts;
  else if (contentType === "resource") targetTable = resources;
  else if (contentType === "question") targetTable = questions;
  else if (contentType === "book") targetTable = books;

  if (targetTable) {
    await db
      .update(targetTable)
      .set({ views: sql`${targetTable.views} + 1` })
      .where(eq(targetTable.id, contentId));
  }

  return { recorded: true };
};

module.exports = {
  recordView,
};
