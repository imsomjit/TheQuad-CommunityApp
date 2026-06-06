"use strict";

const { eq, and, sql } = require("drizzle-orm");
const { db } = require("../../db/index");
const {
  votes,
  resources,
  questions,
  answers,
  books,
} = require("../../db/schema/index");
const AppError = require("../../utils/AppError");
const notificationService = require("../notifications/notifications.service");

/**
 * Toggle vote on a target (resource/question/answer/blog).
 *
 * Logic:
 * - No existing vote → insert (upvote or downvote)
 * - Same direction → remove (toggle off)
 * - Different direction → update direction
 * In all cases, we update the denormalized counter on the target row.
 */
const castVote = async (userId, { targetType, targetId, direction }) => {
  const [existing] = await db
    .select()
    .from(votes)
    .where(
      and(
        eq(votes.userId, userId),
        eq(votes.targetType, targetType),
        eq(votes.targetId, targetId)
      )
    )
    .limit(1);

  let delta = { upvotes: 0, downvotes: 0 };
  let action; // "add" | "remove" | "switch"

  if (!existing) {
    // New vote
    await db.insert(votes).values({ userId, targetType, targetId, direction });
    delta = direction === "up" ? { upvotes: 1 } : { downvotes: 1 };
    action = "add";
  } else if (existing.direction === direction) {
    // Toggle off
    await db.delete(votes).where(eq(votes.id, existing.id));
    delta = direction === "up" ? { upvotes: -1 } : { downvotes: -1 };
    action = "remove";
  } else {
    // Switch direction
    await db
      .update(votes)
      .set({ direction })
      .where(eq(votes.id, existing.id));
    delta =
      direction === "up"
        ? { upvotes: 1, downvotes: -1 }
        : { upvotes: -1, downvotes: 1 };
    action = "switch";
  }

  // Update denormalized counters
  await updateTargetCounters(targetType, targetId, delta);

  // Notify content owner on upvote (not on remove or downvote)
  if (action === "add" && direction === "up") {
    await notificationService
      .notifyOnUpvote(userId, targetType, targetId)
      .catch(() => {});
  }

  return { action, direction: action === "remove" ? null : direction };
};

/** Get current user's vote on a target */
const getUserVote = async (userId, targetType, targetId) => {
  const [vote] = await db
    .select()
    .from(votes)
    .where(
      and(
        eq(votes.userId, userId),
        eq(votes.targetType, targetType),
        eq(votes.targetId, targetId)
      )
    )
    .limit(1);

  return vote ? vote.direction : null;
};

// ── Internal ──────────────────────────────────────────────────────────────────

const updateTargetCounters = async (targetType, targetId, delta) => {
  const upDelta = delta.upvotes || 0;
  const downDelta = delta.downvotes || 0;

  const tableMap = {
    resource: resources,
    question: questions,
    answer: answers,
    book: books,
  };

  const table = tableMap[targetType];
  if (!table) return; // blog handled when blog module is added

  const updates = {};
  if (upDelta !== 0) {
    updates.upvotes = sql`${table.upvotes} + ${upDelta}`;
  }
  if (downDelta !== 0) {
    updates.downvotes = sql`${table.downvotes} + ${downDelta}`;
  }

  if (Object.keys(updates).length > 0) {
    await db.update(table).set(updates).where(eq(table.id, targetId));
  }
};

module.exports = { castVote, getUserVote };
