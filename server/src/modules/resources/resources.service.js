"use strict";

const { eq, and, ilike, sql, desc, asc, inArray } = require("drizzle-orm");
const { db } = require("../../db/index");
const {
  resources,
  resourceTags,
  users,
  bookmarks,
} = require("../../db/schema/index");
const cloudinary = require("../../config/cloudinary");
const AppError = require("../../utils/AppError");
const paginate = require("../../utils/paginate");

/**
 * Create a new resource with file + metadata.
 * File has already been uploaded to Cloudinary by the upload middleware.
 */
const createResource = async (uploaderId, body, uploadedFile) => {
  const { tags = [], ...meta } = body;

  const [resource] = await db
    .insert(resources)
    .values({
      ...meta,
      uploaderId,
      ...uploadedFile, // fileUrl, filePublicId, fileName, fileSize
    })
    .returning();

  // Insert tags
  if (tags.length > 0) {
    await db.insert(resourceTags).values(
      tags.map((tag) => ({ resourceId: resource.id, tag }))
    );
  }

  return getResourceById(resource.id);
};

/**
 * List resources with filters, search, and pagination.
 * Uses raw SQL for the full-text search (tsvector) and count query.
 */
const listResources = async (query) => {
  const { q, type, college, branch, semester, subject, sort, page, limit: lim, uploaderId } =
    query;

  const { limit, offset, meta } = paginate({ page, limit: lim });

  // ── Build WHERE conditions ─────────────────────────────────────────────────
  const conditions = [];

  if (q) {
    // Full-text search on title + description
    conditions.push(
      sql`to_tsvector('english', ${resources.title} || ' ' || coalesce(${resources.description}, '')) @@ plainto_tsquery('english', ${q})`
    );
  }
  
  // Filter out deleted resources
  conditions.push(eq(resources.isDeleted, false));
  
  if (type) conditions.push(eq(resources.type, type));
  if (college) conditions.push(ilike(resources.college, `%${college}%`));
  if (branch) conditions.push(ilike(resources.branch, `%${branch}%`));
  if (semester) conditions.push(eq(resources.semester, semester));
  if (subject) conditions.push(ilike(resources.subject, `%${subject}%`));
  if (uploaderId) conditions.push(eq(resources.uploaderId, uploaderId));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // ── Order by ──────────────────────────────────────────────────────────────
  const orderBy =
    sort === "top"
      ? desc(sql`${resources.upvotes} - ${resources.downvotes}`)
      : sort === "most_downloaded"
      ? desc(resources.downloads)
      : desc(resources.createdAt);

  // ── Query ─────────────────────────────────────────────────────────────────
  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: resources.id,
        publicId: resources.publicId,
        title: resources.title,
        description: resources.description,
        type: resources.type,
        fileUrl: resources.fileUrl,
        fileName: resources.fileName,
        fileSize: resources.fileSize,
        college: resources.college,
        branch: resources.branch,
        semester: resources.semester,
        subject: resources.subject,
        uploaderId: resources.uploaderId,
        upvotes: resources.upvotes,
        downvotes: resources.downvotes,
        views: resources.views,
        downloads: resources.downloads,
        bookmarksCount: resources.bookmarksCount,
        createdAt: resources.createdAt,
        // Uploader info via join
        uploaderName: users.name,
        uploaderUsername: users.username,
        uploaderAvatarUrl: users.avatarUrl,
      })
      .from(resources)
      .leftJoin(users, eq(resources.uploaderId, users.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(resources)
      .where(where),
  ]);

  // Attach tags to each resource
  const resourceIds = rows.map((r) => r.id);
  const allTags =
    resourceIds.length > 0
      ? await db
          .select()
          .from(resourceTags)
          .where(inArray(resourceTags.resourceId, resourceIds))
      : [];

  const tagMap = allTags.reduce((acc, t) => {
    if (!acc[t.resourceId]) acc[t.resourceId] = [];
    acc[t.resourceId].push(t.tag);
    return acc;
  }, {});

  const data = rows.map((r) => ({
    ...r,
    uploader: {
      id: r.uploaderId,
      name: r.uploaderName,
      username: r.uploaderUsername,
      avatarUrl: r.uploaderAvatarUrl,
    },
    tags: tagMap[r.id] || [],
  }));

  return { data, pagination: meta(count) };
};

/**
 * Get a single resource by ID with full details.
 * Also increments view count atomically.
 */
const getResourceById = async (id, incrementView = false) => {
  if (incrementView) {
    await db
      .update(resources)
      .set({ views: sql`${resources.views} + 1` })
      .where(eq(resources.id, id));
  }

  const [row] = await db
    .select({
      id: resources.id,
      publicId: resources.publicId,
      title: resources.title,
      description: resources.description,
      type: resources.type,
      fileUrl: resources.fileUrl,
      filePublicId: resources.filePublicId,
      fileName: resources.fileName,
      fileSize: resources.fileSize,
      pages: resources.pages,
      college: resources.college,
      branch: resources.branch,
      semester: resources.semester,
      subject: resources.subject,
      uploaderId: resources.uploaderId,
      upvotes: resources.upvotes,
      downvotes: resources.downvotes,
      views: resources.views,
      downloads: resources.downloads,
      bookmarksCount: resources.bookmarksCount,
      createdAt: resources.createdAt,
      updatedAt: resources.updatedAt,
      uploaderName: users.name,
      uploaderUsername: users.username,
      uploaderAvatarUrl: users.avatarUrl,
      uploaderCollege: users.college,
      uploaderBranch: users.branch,
    })
    .from(resources)
    .leftJoin(users, eq(resources.uploaderId, users.id))
    .where(and(eq(resources.id, id), eq(resources.isDeleted, false)))
    .limit(1);

  if (!row) throw new AppError("Resource not found", 404, "NOT_FOUND");

  const tags = await db
    .select({ tag: resourceTags.tag })
    .from(resourceTags)
    .where(eq(resourceTags.resourceId, id));

  return {
    ...row,
    uploader: {
      id: row.uploaderId,
      name: row.uploaderName,
      username: row.uploaderUsername,
      avatarUrl: row.uploaderAvatarUrl,
      college: row.uploaderCollege,
      branch: row.uploaderBranch,
    },
    tags: tags.map((t) => t.tag),
  };
};

/**
 * Update resource metadata (not the file).
 * Only the owner can do this.
 */
const updateResource = async (id, userId, patch) => {
  const resource = await getResourceById(id);

  if (resource.uploaderId !== userId) {
    throw new AppError("You can only edit your own resources", 403, "FORBIDDEN");
  }

  const { tags, ...meta } = patch;

  if (Object.keys(meta).length > 0) {
    await db
      .update(resources)
      .set({ ...meta, isEdited: true, updatedAt: new Date() })
      .where(eq(resources.id, id));
  }

  if (tags !== undefined) {
    await db.delete(resourceTags).where(eq(resourceTags.resourceId, id));
    if (tags.length > 0) {
      await db.insert(resourceTags).values(
        tags.map((tag) => ({ resourceId: id, tag }))
      );
    }
  }

  return getResourceById(id);
};

/**
 * Delete a resource — owner or moderator/admin.
 * Also removes the file from Cloudinary.
 */
const deleteResource = async (id, userId, userRole) => {
  const resource = await getResourceById(id);

  const isOwner = resource.uploaderId === userId;
  const isMod = ["moderator", "admin"].includes(userRole);

  if (!isOwner && !isMod) {
    throw new AppError("You cannot delete this resource", 403, "FORBIDDEN");
  }

  // Delete from Cloudinary (fire-and-forget, don't block the response)
  // cloudinary.uploader
  //   .destroy(resource.filePublicId, { resource_type: "raw" })
  //   .catch(() => {});

  await db
    .update(resources)
    .set({
      isDeleted: true,
      deletedById: userId,
      deletedAt: new Date(),
    })
    .where(eq(resources.id, id));
};

/**
 * Increment download counter.
 */
const incrementDownloads = async (id) => {
  await db
    .update(resources)
    .set({ downloads: sql`${resources.downloads} + 1` })
    .where(eq(resources.id, id));
};

module.exports = {
  createResource,
  listResources,
  getResourceById,
  updateResource,
  deleteResource,
  incrementDownloads,
};
