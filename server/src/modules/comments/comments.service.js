"use strict";

const { eq, and, desc, sql, isNull, asc } = require("drizzle-orm");
const { db } = require("../../db/index");
const { comments, users } = require("../../db/schema/index");
const AppError = require("../../utils/AppError");
const notificationService = require("../notifications/notifications.service");

const VALID_TARGETS = ["resource", "question", "answer", "blog"];

const addComment = async (authorId, { targetType, targetId, body, parentId }) => {
  if (!VALID_TARGETS.includes(targetType)) {
    throw new AppError("Invalid target type", 400, "INVALID_TARGET");
  }

  // Validate parentId if provided
  if (parentId) {
    const [parent] = await db
      .select({ id: comments.id, targetType: comments.targetType, targetId: comments.targetId })
      .from(comments)
      .where(eq(comments.id, parseInt(parentId)))
      .limit(1);

    if (!parent) {
      throw new AppError("Parent comment not found", 404, "NOT_FOUND");
    }
    // Reply must be on the same target
    if (parent.targetType !== targetType || parent.targetId !== parseInt(targetId)) {
      throw new AppError("Reply must be on the same target", 400, "INVALID_PARENT");
    }
  }

  const [comment] = await db
    .insert(comments)
    .values({
      authorId,
      targetType,
      targetId: parseInt(targetId),
      body,
      parentId: parentId ? parseInt(parentId) : null,
    })
    .returning();

  // Trigger notification for the content owner
  await notificationService
    .notifyOnComment(authorId, targetType, parseInt(targetId), body)
    .catch(() => {});

  return getCommentWithAuthor(comment.id);
};

/**
 * Get comments for a target, structured as a threaded tree.
 * Returns top-level comments with nested `replies` arrays.
 */
const getComments = async (targetType, targetId) => {
  const rows = await db
    .select({
      id: comments.id,
      body: comments.body,
      targetType: comments.targetType,
      targetId: comments.targetId,
      authorId: comments.authorId,
      parentId: comments.parentId,
      createdAt: comments.createdAt,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(
      and(
        eq(comments.targetType, targetType),
        eq(comments.targetId, parseInt(targetId))
      )
    )
    .orderBy(asc(comments.createdAt));

  // Format all rows
  const formatted = rows.map((r) => ({
    id: r.id,
    body: r.body,
    targetType: r.targetType,
    targetId: r.targetId,
    authorId: r.authorId,
    parentId: r.parentId,
    createdAt: r.createdAt,
    author: {
      id: r.authorId,
      name: r.authorName,
      username: r.authorUsername,
      avatarUrl: r.authorAvatarUrl,
    },
    replies: [],
  }));

  // Build tree: group replies under parents
  const map = new Map();
  const roots = [];

  for (const c of formatted) {
    map.set(c.id, c);
  }

  for (const c of formatted) {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId).replies.push(c);
    } else {
      roots.push(c);
    }
  }

  return roots;
};

const deleteComment = async (id, userId, userRole) => {
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1);

  if (!comment) throw new AppError("Comment not found", 404, "NOT_FOUND");

  const isOwner = comment.authorId === userId;
  const isMod = ["moderator", "admin"].includes(userRole);

  if (!isOwner && !isMod) {
    throw new AppError("You cannot delete this comment", 403, "FORBIDDEN");
  }

  // Delete comment and all its replies (cascade via parentId check)
  // First delete child replies
  await db.delete(comments).where(eq(comments.parentId, id));
  // Then delete the comment itself
  await db.delete(comments).where(eq(comments.id, id));
};

const getCommentWithAuthor = async (id) => {
  const [row] = await db
    .select({
      id: comments.id,
      body: comments.body,
      targetType: comments.targetType,
      targetId: comments.targetId,
      authorId: comments.authorId,
      parentId: comments.parentId,
      createdAt: comments.createdAt,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.id, id))
    .limit(1);

  return {
    id: row.id,
    body: row.body,
    targetType: row.targetType,
    targetId: row.targetId,
    authorId: row.authorId,
    parentId: row.parentId,
    createdAt: row.createdAt,
    author: {
      id: row.authorId,
      name: row.authorName,
      username: row.authorUsername,
      avatarUrl: row.authorAvatarUrl,
    },
    replies: [],
  };
};

module.exports = { addComment, getComments, deleteComment };
