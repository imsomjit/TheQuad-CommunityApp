"use strict";

const { eq, sql, count } = require("drizzle-orm");
const { db } = require("../../db/index");
const {
  users,
  resources,
  questions,
  answers,
  follows,
} = require("../../db/schema/index");
const AppError = require("../../utils/AppError");
const followService = require("../follows/follows.service");

const sanitize = (u) => {
  if (!u) return null;
  const { passwordHash, ...safe } = u;
  return safe;
};

/**
 * Public profile — aggregated stats included.
 */
const getPublicProfile = async (username, viewerUserId = null) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  if (user.isBanned) throw new AppError("This account is banned", 403, "ACCOUNT_BANNED");

  // Aggregate stats in parallel
  const [
    [{ resourceCount }],
    [{ questionCount }],
    [{ answerCount }],
    [{ followerCount }],
    [{ followingCount }],
    [{ totalUpvotes }],
  ] = await Promise.all([
    db.select({ resourceCount: sql`count(*)`.mapWith(Number) })
      .from(resources).where(eq(resources.uploaderId, user.id)),

    db.select({ questionCount: sql`count(*)`.mapWith(Number) })
      .from(questions).where(eq(questions.authorId, user.id)),

    db.select({ answerCount: sql`count(*)`.mapWith(Number) })
      .from(answers).where(eq(answers.authorId, user.id)),

    db.select({ followerCount: sql`count(*)`.mapWith(Number) })
      .from(follows).where(eq(follows.followingId, user.id)),

    db.select({ followingCount: sql`count(*)`.mapWith(Number) })
      .from(follows).where(eq(follows.followerId, user.id)),

    // Sum upvotes across resources + questions + answers
    db.execute(sql`
      SELECT COALESCE(SUM(upvotes), 0) AS "totalUpvotes"
      FROM (
        SELECT upvotes FROM resources WHERE uploader_id = ${user.id}
        UNION ALL
        SELECT upvotes FROM questions WHERE author_id = ${user.id}
        UNION ALL
        SELECT upvotes FROM answers WHERE author_id = ${user.id}
      ) t
    `).then((r) => [{ totalUpvotes: Number(r.rows[0]?.totalUpvotes ?? 0) }]),
  ]);

  // Check if viewer follows this user
  let viewerFollows = false;
  if (viewerUserId && viewerUserId !== user.id) {
    viewerFollows = await followService.isFollowing(viewerUserId, user.id);
  }

  return {
    ...sanitize(user),
    stats: {
      resources: resourceCount,
      questions: questionCount,
      answers: answerCount,
      followers: followerCount,
      following: followingCount,
      totalUpvotes,
    },
    viewerFollows,
  };
};

/**
 * Update own profile (text fields only — avatar/banner handled separately).
 */
const updateProfile = async (userId, patch) => {
  const allowedFields = [
    "name", "bio", "location", "organization", "website",
    "college", "branch", "graduationYear",
    "githubUsername", "linkedinUrl", "twitterHandle", "instagramHandle", "leetcodeUsername",
    "skills",
  ];
  const filtered = Object.fromEntries(
    Object.entries(patch).filter(([k]) => allowedFields.includes(k))
  );

  if (Object.keys(filtered).length === 0) {
    throw new AppError("No valid fields to update", 400, "NO_UPDATE");
  }

  const [updated] = await db
    .update(users)
    .set({ ...filtered, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return sanitize(updated);
};

/**
 * Update avatar URL after Cloudinary upload.
 */
const updateAvatar = async (userId, avatarUrl) => {
  const [updated] = await db
    .update(users)
    .set({ avatarUrl, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return sanitize(updated);
};

/**
 * Update banner URL after Cloudinary upload.
 */
const updateBanner = async (userId, bannerUrl) => {
  const [updated] = await db
    .update(users)
    .set({ bannerUrl, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return sanitize(updated);
};

module.exports = { getPublicProfile, updateProfile, updateAvatar, updateBanner };
