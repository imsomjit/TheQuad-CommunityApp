"use strict";

const { eq, and, desc, sql, inArray } = require("drizzle-orm");
const { db } = require("../../db/index");
const { bookmarks, resources, books } = require("../../db/schema/index");
const AppError = require("../../utils/AppError");

/**
 * Toggle a bookmark.
 * Returns { bookmarked: true|false }
 */
const toggleBookmark = async (userId, { targetType, targetId }) => {
  const [existing] = await db
    .select()
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.targetType, targetType),
        eq(bookmarks.targetId, targetId)
      )
    )
    .limit(1);

  if (existing) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));

    // Decrement resource bookmarks_count
    if (targetType === "resource") {
      await db
        .update(resources)
        .set({ bookmarksCount: sql`${resources.bookmarksCount} - 1` })
        .where(eq(resources.id, targetId));
    } else if (targetType === "book") {
      await db
        .update(books)
        .set({ bookmarksCount: sql`${books.bookmarksCount} - 1` })
        .where(eq(books.id, targetId));
    }

    return { bookmarked: false };
  } else {
    await db.insert(bookmarks).values({ userId, targetType, targetId });

    if (targetType === "resource") {
      await db
        .update(resources)
        .set({ bookmarksCount: sql`${resources.bookmarksCount} + 1` })
        .where(eq(resources.id, targetId));
    } else if (targetType === "book") {
      await db
        .update(books)
        .set({ bookmarksCount: sql`${books.bookmarksCount} + 1` })
        .where(eq(books.id, targetId));
    }

    return { bookmarked: true };
  }
};

/**
 * Get user's bookmarked resource IDs.
 */
const getUserBookmarkIds = async (userId, targetType = "resource") => {
  const rows = await db
    .select({ targetId: bookmarks.targetId })
    .from(bookmarks)
    .where(
      and(eq(bookmarks.userId, userId), eq(bookmarks.targetType, targetType))
    );
  return rows.map((r) => r.targetId);
};

module.exports = { toggleBookmark, getUserBookmarkIds };
