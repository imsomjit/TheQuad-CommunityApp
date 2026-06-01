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

/**
 * Get top contributors of the month based on a points system.
 */
const getTopContributors = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const query = sql`
    WITH 
      month_answers AS (
        SELECT author_id, COUNT(*) as count FROM answers WHERE created_at >= ${thirtyDaysAgo} AND is_deleted = false GROUP BY author_id
      ),
      month_resources AS (
        SELECT uploader_id, COUNT(*) as count FROM resources WHERE created_at >= ${thirtyDaysAgo} AND is_deleted = false GROUP BY uploader_id
      ),
      month_posts AS (
        SELECT author_id, COUNT(*) as count FROM posts WHERE created_at >= ${thirtyDaysAgo} AND status = 'published' AND is_deleted = false GROUP BY author_id
      ),
      month_comments AS (
        SELECT author_id, COUNT(*) as count FROM comments WHERE created_at >= ${thirtyDaysAgo} AND is_deleted = false GROUP BY author_id
      ),
      month_votes AS (
        SELECT v.target_id as id, v.target_type as type
        FROM votes v
        WHERE v.created_at >= ${thirtyDaysAgo} AND v.direction = 'up'
      ),
      vote_authors AS (
        SELECT r.uploader_id as user_id FROM month_votes v JOIN resources r ON v.id = r.id WHERE v.type = 'resource'
        UNION ALL
        SELECT q.author_id as user_id FROM month_votes v JOIN questions q ON v.id = q.id WHERE v.type = 'question'
        UNION ALL
        SELECT a.author_id as user_id FROM month_votes v JOIN answers a ON v.id = a.id WHERE v.type = 'answer'
        UNION ALL
        SELECT p.author_id as user_id FROM month_votes v JOIN posts p ON v.id = p.id WHERE v.type = 'blog'
      ),
      month_received_upvotes AS (
        SELECT user_id, COUNT(*) as count FROM vote_authors GROUP BY user_id
      )
    SELECT 
      u.id, 
      u.name, 
      u.username, 
      u.avatar_url, 
      u.college, 
      u.branch,
      COALESCE(a.count, 0) * 15 + 
      COALESCE(r.count, 0) * 10 + 
      COALESCE(p.count, 0) * 10 + 
      COALESCE(c.count, 0) * 2 + 
      COALESCE(vu.count, 0) * 3 AS score
    FROM users u
    LEFT JOIN month_answers a ON u.id = a.author_id
    LEFT JOIN month_resources r ON u.id = r.uploader_id
    LEFT JOIN month_posts p ON u.id = p.author_id
    LEFT JOIN month_comments c ON u.id = c.author_id
    LEFT JOIN month_received_upvotes vu ON u.id = vu.user_id
    WHERE u.is_banned = false AND (COALESCE(a.count, 0) + COALESCE(r.count, 0) + COALESCE(p.count, 0) + COALESCE(c.count, 0) + COALESCE(vu.count, 0)) > 0
    ORDER BY score DESC
    LIMIT 10
  `;

  const { rows } = await db.execute(query);
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    username: r.username,
    avatar: r.avatar_url,
    college: r.college,
    branch: r.branch,
    score: Number(r.score)
  }));
};

module.exports = { getPublicProfile, updateProfile, updateAvatar, updateBanner, getTopContributors };
