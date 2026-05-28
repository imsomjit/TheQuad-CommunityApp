"use strict";

const { eq, desc, sql, and } = require("drizzle-orm");
const { db } = require("../../db/index");
const {
  notifications,
  users,
  resources,
  questions,
  answers,
} = require("../../db/schema/index");
const sseManager = require("../../config/sse");
const AppError = require("../../utils/AppError");

/**
 * Create a notification and push it via SSE if the recipient is connected.
 */
const create = async ({
  recipientId,
  actorId,
  type,
  targetType,
  targetId,
  targetTitle,
}) => {
  // Don't notify yourself (except for system_welcome)
  if (recipientId === actorId && type !== "system_welcome") return null;

  const [notification] = await db
    .insert(notifications)
    .values({
      recipientId,
      actorId,
      type,
      targetType,
      targetId,
      targetTitle,
    })
    .returning();

  // Fetch actor info for the SSE payload
  const [actor] = await db
    .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, actorId))
    .limit(1);

  const payload = {
    ...notification,
    actor,
  };

  // Push to connected SSE client (fire and forget)
  sseManager.send(recipientId, "notification", payload);

  return payload;
};

/**
 * Triggered when someone upvotes a resource/question/answer.
 * Looks up the content owner and creates a notification.
 */
const notifyOnUpvote = async (actorId, targetType, targetId) => {
  let ownerId, title;

  if (targetType === "resource") {
    const [r] = await db
      .select({ uploaderId: resources.uploaderId, title: resources.title })
      .from(resources)
      .where(eq(resources.id, targetId))
      .limit(1);
    if (!r) return;
    ownerId = r.uploaderId;
    title = r.title;
  } else if (targetType === "question") {
    const [q] = await db
      .select({ authorId: questions.authorId, title: questions.title })
      .from(questions)
      .where(eq(questions.id, targetId))
      .limit(1);
    if (!q) return;
    ownerId = q.authorId;
    title = q.title;
  } else if (targetType === "answer") {
    const [a] = await db
      .select({ authorId: answers.authorId })
      .from(answers)
      .where(eq(answers.id, targetId))
      .limit(1);
    if (!a) return;
    ownerId = a.authorId;
    title = "your answer";
  }

  if (!ownerId) return;

  const typeMap = {
    resource: "upvote_resource",
    question: "upvote_question",
    answer: "upvote_answer",
  };

  await create({
    recipientId: ownerId,
    actorId,
    type: typeMap[targetType],
    targetType,
    targetId,
    targetTitle: title,
  });
};

/**
 * Triggered when someone comments on content.
 */
const notifyOnComment = async (actorId, targetType, targetId) => {
  let ownerId, title;

  if (targetType === "resource") {
    const [r] = await db
      .select({ uploaderId: resources.uploaderId, title: resources.title })
      .from(resources).where(eq(resources.id, targetId)).limit(1);
    if (!r) return;
    ownerId = r.uploaderId;
    title = r.title;
  } else if (targetType === "question") {
    const [q] = await db
      .select({ authorId: questions.authorId, title: questions.title })
      .from(questions).where(eq(questions.id, targetId)).limit(1);
    if (!q) return;
    ownerId = q.authorId;
    title = q.title;
  } else if (targetType === "answer") {
    const [a] = await db
      .select({ authorId: answers.authorId })
      .from(answers).where(eq(answers.id, targetId)).limit(1);
    if (!a) return;
    ownerId = a.authorId;
    title = "your answer";
  }

  if (!ownerId) return;

  const typeMap = {
    resource: "comment_on_resource",
    question: "comment_on_question",
    answer: "comment_on_answer",
  };

  await create({
    recipientId: ownerId,
    actorId,
    type: typeMap[targetType],
    targetType,
    targetId,
    targetTitle: title,
  });
};

/**
 * Get paginated notifications for the current user.
 */
const getForUser = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      targetType: notifications.targetType,
      targetId: notifications.targetId,
      targetTitle: notifications.targetTitle,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
      actorId: users.id,
      actorName: users.name,
      actorUsername: users.username,
      actorAvatarUrl: users.avatarUrl,
    })
    .from(notifications)
    .leftJoin(users, eq(notifications.actorId, users.id))
    .where(eq(notifications.recipientId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count, unread }] = await db
    .select({
      count: sql`count(*)`.mapWith(Number),
      unread: sql`count(*) filter (where is_read = false)`.mapWith(Number),
    })
    .from(notifications)
    .where(eq(notifications.recipientId, userId));

  const data = rows.map((r) => ({
    ...r,
    actor: {
      id: r.actorId,
      name: r.actorName,
      username: r.actorUsername,
      avatarUrl: r.actorAvatarUrl,
    },
  }));

  return {
    data,
    unreadCount: unread,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const markRead = async (notificationId, userId) => {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.recipientId, userId)
      )
    );
};

const markAllRead = async (userId) => {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.recipientId, userId));
};

module.exports = {
  create,
  notifyOnUpvote,
  notifyOnComment,
  getForUser,
  markRead,
  markAllRead,
};
