"use strict";

const { eq, and, sql, desc, exists, inArray, ilike } = require("drizzle-orm");
const { db } = require("../../db/index");
const {
  questions,
  questionTags,
  answers,
  users,
} = require("../../db/schema/index");
const AppError = require("../../utils/AppError");
const paginate = require("../../utils/paginate");
const notificationService = require("../notifications/notifications.service");

// ── Questions ─────────────────────────────────────────────────────────────────

const createQuestion = async (authorId, { title, body, tags = [] }) => {
  const [question] = await db
    .insert(questions)
    .values({ title, body, authorId })
    .returning();

  if (tags.length > 0) {
    await db.insert(questionTags).values(
      tags.map((tag) => ({ questionId: question.id, tag }))
    );
  }

  return getQuestionById(question.id);
};

const listQuestions = async (query) => {
  const { q, tag, sort, page, limit: lim } = query;
  const { limit, offset, meta } = paginate({ page, limit: lim });

  const conditions = [];

  if (q) {
    conditions.push(
      sql`to_tsvector('english', ${questions.title} || ' ' || ${questions.body}) @@ plainto_tsquery('english', ${q})`
    );
  }

  if (tag) {
    conditions.push(
      exists(
        db
          .select()
          .from(questionTags)
          .where(
            and(
              eq(questionTags.questionId, questions.id),
              ilike(questionTags.tag, tag)
            )
          )
      )
    );
  }

  if (sort === "unanswered") {
    conditions.push(
      sql`NOT EXISTS (SELECT 1 FROM answers WHERE answers.question_id = ${questions.id})`
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy =
    sort === "votes"
      ? desc(sql`${questions.upvotes} - ${questions.downvotes}`)
      : desc(questions.createdAt);

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: questions.id,
        title: questions.title,
        authorId: questions.authorId,
        upvotes: questions.upvotes,
        downvotes: questions.downvotes,
        views: questions.views,
        createdAt: questions.createdAt,
        authorName: users.name,
        authorUsername: users.username,
        authorAvatarUrl: users.avatarUrl,
        answerCount: sql`(SELECT COUNT(*) FROM answers WHERE answers.question_id = ${questions.id})`.mapWith(Number),
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(questions)
      .where(where),
  ]);

  const qIds = rows.map((r) => r.id);
  const allTags =
    qIds.length > 0
      ? await db
          .select()
          .from(questionTags)
          .where(inArray(questionTags.questionId, qIds))
      : [];

  const tagMap = allTags.reduce((acc, t) => {
    if (!acc[t.questionId]) acc[t.questionId] = [];
    acc[t.questionId].push(t.tag);
    return acc;
  }, {});

  const data = rows.map((r) => ({
    ...r,
    author: {
      id: r.authorId,
      name: r.authorName,
      username: r.authorUsername,
      avatarUrl: r.authorAvatarUrl,
    },
    tags: tagMap[r.id] || [],
  }));

  return { data, pagination: meta(count) };
};

const getQuestionById = async (id, incrementView = false) => {
  if (incrementView) {
    await db
      .update(questions)
      .set({ views: sql`${questions.views} + 1` })
      .where(eq(questions.id, id));
  }

  const [row] = await db
    .select({
      id: questions.id,
      title: questions.title,
      body: questions.body,
      authorId: questions.authorId,
      upvotes: questions.upvotes,
      downvotes: questions.downvotes,
      views: questions.views,
      createdAt: questions.createdAt,
      updatedAt: questions.updatedAt,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
      authorCollege: users.college,
      authorBranch: users.branch,
    })
    .from(questions)
    .leftJoin(users, eq(questions.authorId, users.id))
    .where(eq(questions.id, id))
    .limit(1);

  if (!row) throw new AppError("Question not found", 404, "NOT_FOUND");

  const [tags, questionAnswers] = await Promise.all([
    db
      .select({ tag: questionTags.tag })
      .from(questionTags)
      .where(eq(questionTags.questionId, id)),

    db
      .select({
        id: answers.id,
        body: answers.body,
        authorId: answers.authorId,
        upvotes: answers.upvotes,
        downvotes: answers.downvotes,
        isAccepted: answers.isAccepted,
        createdAt: answers.createdAt,
        updatedAt: answers.updatedAt,
        authorName: users.name,
        authorUsername: users.username,
        authorAvatarUrl: users.avatarUrl,
      })
      .from(answers)
      .leftJoin(users, eq(answers.authorId, users.id))
      .where(eq(answers.questionId, id))
      .orderBy(desc(answers.isAccepted), desc(sql`${answers.upvotes} - ${answers.downvotes}`)),
  ]);

  return {
    ...row,
    author: {
      id: row.authorId,
      name: row.authorName,
      username: row.authorUsername,
      avatarUrl: row.authorAvatarUrl,
      college: row.authorCollege,
      branch: row.authorBranch,
    },
    tags: tags.map((t) => t.tag),
    answers: questionAnswers.map((a) => ({
      ...a,
      author: {
        id: a.authorId,
        name: a.authorName,
        username: a.authorUsername,
        avatarUrl: a.authorAvatarUrl,
      },
    })),
  };
};

const updateQuestion = async (id, userId, patch) => {
  const question = await getQuestionById(id);

  if (question.authorId !== userId) {
    throw new AppError("You can only edit your own questions", 403, "FORBIDDEN");
  }

  const { tags, ...meta } = patch;

  if (Object.keys(meta).length > 0) {
    await db
      .update(questions)
      .set({ ...meta, updatedAt: new Date() })
      .where(eq(questions.id, id));
  }

  if (tags !== undefined) {
    await db.delete(questionTags).where(eq(questionTags.questionId, id));
    if (tags.length > 0) {
      await db.insert(questionTags).values(
        tags.map((tag) => ({ questionId: id, tag }))
      );
    }
  }

  return getQuestionById(id);
};

const deleteQuestion = async (id, userId, userRole) => {
  const question = await getQuestionById(id);

  const isOwner = question.authorId === userId;
  const isMod = ["moderator", "admin"].includes(userRole);

  if (!isOwner && !isMod) {
    throw new AppError("You cannot delete this question", 403, "FORBIDDEN");
  }

  await db.delete(questions).where(eq(questions.id, id));
};

// ── Answers ───────────────────────────────────────────────────────────────────

const createAnswer = async (questionId, authorId, body) => {
  const question = await getQuestionById(questionId);

  const [answer] = await db
    .insert(answers)
    .values({ questionId, authorId, body })
    .returning();

  // Notify question author
  if (question.authorId !== authorId) {
    await notificationService.create({
      recipientId: question.authorId,
      actorId: authorId,
      type: "answer_on_question",
      targetType: "question",
      targetId: questionId,
      targetTitle: question.title,
    });
  }

  return answer;
};

const updateAnswer = async (id, userId, body) => {
  const [answer] = await db
    .select()
    .from(answers)
    .where(eq(answers.id, id))
    .limit(1);

  if (!answer) throw new AppError("Answer not found", 404, "NOT_FOUND");
  if (answer.authorId !== userId) {
    throw new AppError("You can only edit your own answers", 403, "FORBIDDEN");
  }

  const [updated] = await db
    .update(answers)
    .set({ body, updatedAt: new Date() })
    .where(eq(answers.id, id))
    .returning();

  return updated;
};

const deleteAnswer = async (id, userId, userRole) => {
  const [answer] = await db
    .select()
    .from(answers)
    .where(eq(answers.id, id))
    .limit(1);

  if (!answer) throw new AppError("Answer not found", 404, "NOT_FOUND");

  const isOwner = answer.authorId === userId;
  const isMod = ["moderator", "admin"].includes(userRole);

  if (!isOwner && !isMod) {
    throw new AppError("You cannot delete this answer", 403, "FORBIDDEN");
  }

  await db.delete(answers).where(eq(answers.id, id));
};

const acceptAnswer = async (questionId, answerId, userId) => {
  const question = await getQuestionById(questionId);

  if (question.authorId !== userId) {
    throw new AppError(
      "Only the question author can accept an answer",
      403,
      "FORBIDDEN"
    );
  }

  // Unaccept all, then accept the chosen one
  await db
    .update(answers)
    .set({ isAccepted: false })
    .where(eq(answers.questionId, questionId));

  await db
    .update(answers)
    .set({ isAccepted: true })
    .where(and(eq(answers.id, answerId), eq(answers.questionId, questionId)));
};

module.exports = {
  createQuestion,
  listQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
};
