"use strict";

const { eq, and, asc, sql } = require("drizzle-orm");
const { db } = require("../../db/index");
const { series, posts, users } = require("../../db/schema/index");
const AppError = require("../../utils/AppError");

// ── Slug helper ──────────────────────────────────────────────────────────────

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 300);

const ensureUniqueSeriesSlug = async (baseSlug) => {
  let slug = baseSlug;
  let attempt = 0;
  while (attempt < 20) {
    const [existing] = await db
      .select({ id: series.id })
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);
    if (!existing) return slug;
    attempt++;
    slug = `${baseSlug}-${attempt + 1}`;
  }
  return `${baseSlug}-${Date.now()}`;
};

// ── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Create a new series.
 */
const createSeries = async (authorId, body) => {
  const slug = await ensureUniqueSeriesSlug(slugify(body.title));

  const [row] = await db
    .insert(series)
    .values({
      title: body.title,
      slug,
      description: body.description || null,
      coverImageUrl: body.coverImageUrl || null,
      authorId,
    })
    .returning();

  return row;
};

/**
 * Update a series.
 */
const updateSeries = async (id, userId, patch) => {
  const [row] = await db
    .select()
    .from(series)
    .where(eq(series.id, id))
    .limit(1);

  if (!row) throw new AppError("Series not found", 404, "NOT_FOUND");
  if (row.authorId !== userId) {
    throw new AppError("You can only edit your own series", 403, "FORBIDDEN");
  }

  // Slug is immutable for series too
  delete patch.slug;

  await db
    .update(series)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(series.id, id));

  return getSeriesById(id);
};

/**
 * Delete a series (does not delete posts — just unlinks them).
 */
const deleteSeries = async (id, userId, userRole) => {
  const [row] = await db
    .select()
    .from(series)
    .where(eq(series.id, id))
    .limit(1);

  if (!row) throw new AppError("Series not found", 404, "NOT_FOUND");

  const isOwner = row.authorId === userId;
  const isMod = ["moderator", "admin"].includes(userRole);
  if (!isOwner && !isMod) {
    throw new AppError("You cannot delete this series", 403, "FORBIDDEN");
  }

  // Unlink all posts from this series
  await db
    .update(posts)
    .set({ seriesId: null, seriesOrder: null })
    .where(eq(posts.seriesId, id));

  await db.delete(series).where(eq(series.id, id));
};

/**
 * Get a series by ID with its posts list.
 */
const getSeriesById = async (id) => {
  const [row] = await db
    .select({
      id: series.id,
      title: series.title,
      slug: series.slug,
      description: series.description,
      coverImageUrl: series.coverImageUrl,
      authorId: series.authorId,
      createdAt: series.createdAt,
      updatedAt: series.updatedAt,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(series)
    .leftJoin(users, eq(series.authorId, users.id))
    .where(eq(series.id, id))
    .limit(1);

  if (!row) throw new AppError("Series not found", 404, "NOT_FOUND");

  // Get posts in this series
  const seriesPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      seriesOrder: posts.seriesOrder,
      status: posts.status,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(eq(posts.seriesId, id))
    .orderBy(asc(posts.seriesOrder));

  return {
    ...row,
    author: {
      id: row.authorId,
      name: row.authorName,
      username: row.authorUsername,
      avatarUrl: row.authorAvatarUrl,
    },
    posts: seriesPosts,
  };
};

/**
 * Get a series by slug.
 */
const getSeriesBySlug = async (slug) => {
  const [row] = await db
    .select({ id: series.id })
    .from(series)
    .where(eq(series.slug, slug))
    .limit(1);

  if (!row) throw new AppError("Series not found", 404, "NOT_FOUND");

  return getSeriesById(row.id);
};

/**
 * List series by a specific user.
 */
const listUserSeries = async (userId) => {
  const rows = await db
    .select({
      id: series.id,
      title: series.title,
      slug: series.slug,
      description: series.description,
      createdAt: series.createdAt,
    })
    .from(series)
    .where(eq(series.authorId, userId))
    .orderBy(asc(series.createdAt));

  // Attach post count to each series
  const result = [];
  for (const row of rows) {
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(posts)
      .where(eq(posts.seriesId, row.id));
    result.push({ ...row, postCount: count });
  }

  return result;
};

/**
 * Add a post to a series (or reorder).
 */
const addPostToSeries = async (seriesId, postId, order, userId) => {
  // Verify series ownership
  const [s] = await db
    .select({ authorId: series.authorId })
    .from(series)
    .where(eq(series.id, seriesId))
    .limit(1);

  if (!s) throw new AppError("Series not found", 404, "NOT_FOUND");
  if (s.authorId !== userId) {
    throw new AppError("You can only manage your own series", 403, "FORBIDDEN");
  }

  // Verify post ownership
  const [p] = await db
    .select({ authorId: posts.authorId })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!p) throw new AppError("Post not found", 404, "NOT_FOUND");
  if (p.authorId !== userId) {
    throw new AppError("You can only add your own posts to a series", 403, "FORBIDDEN");
  }

  await db
    .update(posts)
    .set({ seriesId, seriesOrder: order, updatedAt: new Date() })
    .where(eq(posts.id, postId));

  return getSeriesById(seriesId);
};

/**
 * Remove a post from a series.
 */
const removePostFromSeries = async (postId, userId) => {
  const [p] = await db
    .select({ authorId: posts.authorId, seriesId: posts.seriesId })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!p) throw new AppError("Post not found", 404, "NOT_FOUND");
  if (p.authorId !== userId) {
    throw new AppError("You can only manage your own posts", 403, "FORBIDDEN");
  }

  await db
    .update(posts)
    .set({ seriesId: null, seriesOrder: null, updatedAt: new Date() })
    .where(eq(posts.id, postId));
};

module.exports = {
  createSeries,
  updateSeries,
  deleteSeries,
  getSeriesById,
  getSeriesBySlug,
  listUserSeries,
  addPostToSeries,
  removePostFromSeries,
};
