"use strict";

const { eq, and, desc, sql } = require("drizzle-orm");
const { db } = require("../../db/index");
const { comments, users } = require("../../db/schema/index");
const AppError = require("../../utils/AppError");
const notificationService = require("../notifications/notifications.service");

const VALID_TARGETS = ["resource", "question", "answer", "blog"];

const addComment = async (authorId, { targetType, targetId, body }) => {
  if (!VALID_TARGETS.includes(targetType)) {
    throw new AppError("Invalid target type", 400, "INVALID_TARGET");
  }

  const [comment] = await db
    .insert(comments)
    .values({ authorId, targetType, targetId: parseInt(targetId), body })
    .returning();

  // Trigger notification for the content owner (service handles ownership lookup)
  await notificationService.notifyOnComment(authorId, targetType, parseInt(targetId), body).catch(() => {});

  return getCommentWithAuthor(comment.id);
};

const getComments = async (targetType, targetId) => {
  const rows = await db
    .select({
      id: comments.id,
      body: comments.body,
      targetType: comments.targetType,
      targetId: comments.targetId,
      authorId: comments.authorId,
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
    .orderBy(desc(comments.createdAt));

  return rows.map((r) => ({
    ...r,
    author: {
      id: r.authorId,
      name: r.authorName,
      username: r.authorUsername,
      avatarUrl: r.authorAvatarUrl,
    },
  }));
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
    ...row,
    author: {
      id: row.authorId,
      name: row.authorName,
      username: row.authorUsername,
      avatarUrl: row.authorAvatarUrl,
    },
  };
};

module.exports = { addComment, getComments, deleteComment };
