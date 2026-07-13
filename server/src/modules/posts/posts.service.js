"use strict";

const { eq, and, ilike, sql, desc, asc, inArray, or } = require("drizzle-orm");
const { db } = require("../../db/index");
const {
  posts,
  postTags,
  users,
  series,
} = require("../../db/schema/index");
const AppError = require("../../utils/AppError");
const paginate = require("../../utils/paginate");
const ai = require("../../utils/ai");

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a URL-safe slug from a title.
 * Handles collisions by appending -2, -3, etc.
 */
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // remove non-word chars
    .replace(/[\s_]+/g, "-")     // spaces/underscores → hyphens
    .replace(/-+/g, "-")         // collapse consecutive hyphens
    .replace(/^-|-$/g, "")       // trim leading/trailing hyphens
    .slice(0, 300);

const ensureUniqueSlug = async (baseSlug) => {
  let slug = baseSlug;
  let attempt = 0;

  while (attempt < 20) {
    const [existing] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);

    if (!existing) return slug;

    attempt++;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  // Fallback: append timestamp
  return `${baseSlug}-${Date.now()}`;
};

/**
 * Calculate reading time from markdown body (~200 words/min).
 */
const calcReadingTime = (body) => {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

/**
 * Auto-generate excerpt from body (first 160 chars of plain text).
 */
const autoExcerpt = (body) => {
  if (!body) return "";
  // Strip markdown syntax roughly
  const plain = body
    .replace(/```[\s\S]*?```/g, "")       // code blocks
    .replace(/`[^`]+`/g, "")               // inline code
    .replace(/#{1,6}\s/g, "")              // headings
    .replace(/[*_~[\]()>!|-]/g, "")        // md syntax
    .replace(/\n+/g, " ")                  // newlines
    .trim();
  return plain.slice(0, 300);
};

/**
 * Server-side markdown → HTML rendering.
 * Uses a lightweight approach: store markdown as-is, render on read.
 * For V1, we store a basic HTML rendering; a full remark pipeline can be added later.
 */
const renderMarkdown = (body) => {
  if (!body) return "";
  // Basic server-side rendering — convert markdown to safe HTML
  // Using simple regex transforms. For production, consider a full remark pipeline.
  let html = body
    // Code blocks (must come first)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<pre><code class="language-${lang || "text"}">${escaped}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Headings
    .replace(/^#{6}\s(.+)$/gm, "<h6>$1</h6>")
    .replace(/^#{5}\s(.+)$/gm, "<h5>$1</h5>")
    .replace(/^#{4}\s(.+)$/gm, "<h4>$1</h4>")
    .replace(/^###\s(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s(.+)$/gm, "<h1>$1</h1>")
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Blockquotes
    .replace(/^>\s(.+)$/gm, "<blockquote>$1</blockquote>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    // Unordered lists
    .replace(/^[-*]\s(.+)$/gm, "<li>$1</li>")
    // Paragraphs (lines not already wrapped)
    .replace(/^(?!<[a-z])((?!<\/)[^\n]+)$/gm, "<p>$1</p>");

  return html;
};

// ── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Create a new post (draft by default).
 */
const createPost = async (authorId, body) => {
  const { tags = [], status, ...meta } = body;

  // Generate slug from title (immutable once created)
  const baseSlug = slugify(meta.title);
  const slug = await ensureUniqueSlug(baseSlug);

  // Calculate computed fields
  const readingTimeMin = calcReadingTime(meta.body);
  const excerpt = meta.excerpt || autoExcerpt(meta.body);
  const renderedHtml = renderMarkdown(meta.body);
  const publishedAt = status === "published" ? new Date() : null;

  // AI Generation
  let finalTags = tags;
  let tldr = null;
  let embedding = null;

  if (meta.body && meta.title) {
    if (finalTags.length === 0 || body.autoGenerateAI) {
      const aiData = await ai.generateTagsAndTldr(meta.title, meta.body);
      if (finalTags.length === 0) finalTags = aiData.tags;
    }
    embedding = await ai.generateEmbedding(`${meta.title}\n\n${autoExcerpt(meta.body)}`);
  }

  const [post] = await db
    .insert(posts)
    .values({
      ...meta,
      slug,
      excerpt,
      renderedHtml,
      readingTimeMin,
      status: status || "draft",
      authorId,
      publishedAt,
      tldr,
      embedding,
    })
    .returning();

  // Insert tags
  if (finalTags.length > 0) {
    await db.insert(postTags).values(
      finalTags.map((tag) => ({ postId: post.id, tag: tag.toLowerCase().trim() }))
    );
  }

  return getPostById(post.id);
};

/**
 * Update a post. Only the author can edit.
 * Slug is immutable.
 */
const updatePost = async (id, userId, patch) => {
  const post = await getPostById(id);

  if (post.authorId !== userId) {
    throw new AppError("You can only edit your own posts", 403, "FORBIDDEN");
  }

  if (post.status === "published") {
    // If published, we ignore title changes because slug is immutable and we don't want title/slug mismatch
    delete patch.title;
  }

  const { tags, ...meta } = patch;

  // Recalculate computed fields if body changed
  if (meta.body !== undefined) {
    meta.renderedHtml = renderMarkdown(meta.body);
    meta.readingTimeMin = calcReadingTime(meta.body);
    if (!meta.excerpt) {
      meta.excerpt = autoExcerpt(meta.body);
    }
    
    // Update embedding
    const searchTitle = meta.title || post.title;
    meta.embedding = await ai.generateEmbedding(`${searchTitle}\n\n${meta.excerpt}`);
  }

  // AI Generation requested
  let finalTags = tags;
  if (patch.autoGenerateAI && meta.body) {
    const searchTitle = meta.title || post.title;
    const aiData = await ai.generateTagsAndTldr(searchTitle, meta.body);
    if (!finalTags || finalTags.length === 0) finalTags = aiData.tags;
  }

  // Remove slug from patch — it's immutable
  delete meta.slug;

  if (Object.keys(meta).length > 0) {
    await db
      .update(posts)
      .set({ ...meta, updatedAt: new Date() })
      .where(eq(posts.id, id));
  }

  if (finalTags !== undefined) {
    await db.delete(postTags).where(eq(postTags.postId, id));
    if (finalTags.length > 0) {
      await db.insert(postTags).values(
        finalTags.map((tag) => ({ postId: id, tag: tag.toLowerCase().trim() }))
      );
    }
  }

  return getPostById(id);
};

/**
 * Autosave — lightweight partial update for drafts.
 */
const autosavePost = async (id, userId, patch) => {
  const [post] = await db
    .select({ id: posts.id, authorId: posts.authorId, status: posts.status })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!post) throw new AppError("Post not found", 404, "NOT_FOUND");
  if (post.authorId !== userId) {
    throw new AppError("You can only edit your own posts", 403, "FORBIDDEN");
  }

  const updateFields = { updatedAt: new Date() };
  if (patch.title !== undefined) updateFields.title = patch.title;
  if (patch.body !== undefined) {
    updateFields.body = patch.body;
    updateFields.renderedHtml = renderMarkdown(patch.body);
    updateFields.readingTimeMin = calcReadingTime(patch.body);
    updateFields.excerpt = patch.excerpt || autoExcerpt(patch.body);
  }
  if (patch.categoryMeta !== undefined) updateFields.categoryMeta = patch.categoryMeta;

  await db.update(posts).set(updateFields).where(eq(posts.id, id));

  return { id, saved: true, updatedAt: updateFields.updatedAt };
};

/**
 * Publish a draft.
 */
const publishPost = async (id, userId) => {
  const post = await getPostById(id);

  if (post.authorId !== userId) {
    throw new AppError("You can only publish your own posts", 403, "FORBIDDEN");
  }

  if (post.status === "published") {
    throw new AppError("Post is already published", 400, "ALREADY_PUBLISHED");
  }

  // Validate minimum content
  if (!post.title || post.title.length < 3) {
    throw new AppError("Post needs a title (min 3 chars) to publish", 400, "INVALID_CONTENT");
  }
  if (!post.body || post.body.length < 50) {
    throw new AppError("Post body must be at least 50 characters to publish", 400, "INVALID_CONTENT");
  }

  const setFields = {
    status: "published",
    updatedAt: new Date(),
  };

  // Only set publishedAt on first publish
  if (!post.publishedAt) {
    setFields.publishedAt = new Date();
  }

  await db.update(posts).set(setFields).where(eq(posts.id, id));

  return getPostById(id);
};

/**
 * Unpublish — revert to draft.
 */
const unpublishPost = async (id, userId) => {
  const post = await getPostById(id);

  if (post.authorId !== userId) {
    throw new AppError("You can only unpublish your own posts", 403, "FORBIDDEN");
  }

  await db
    .update(posts)
    .set({ status: "draft", updatedAt: new Date() })
    .where(eq(posts.id, id));

  return getPostById(id);
};

/**
 * Delete a post — owner or moderator.
 */
const deletePost = async (id, userId, userRole) => {
  const post = await getPostById(id);

  const isOwner = post.authorId === userId;
  const isMod = ["moderator", "admin"].includes(userRole);

  if (!isOwner && !isMod) {
    throw new AppError("You cannot delete this post", 403, "FORBIDDEN");
  }

  await db
    .update(posts)
    .set({
      isDeleted: true,
      deletedById: userId,
      deletedAt: new Date(),
    })
    .where(eq(posts.id, id));
};

// ── Read ─────────────────────────────────────────────────────────────────────

/**
 * Get a single post by ID (internal, includes drafts).
 */
const getPostById = async (id) => {
  const [row] = await db
    .select({
      id: posts.id,
      publicId: posts.publicId,
      title: posts.title,
      slug: posts.slug,
      body: posts.body,
      renderedHtml: posts.renderedHtml,
      excerpt: posts.excerpt,
      coverImageUrl: posts.coverImageUrl,
      coverImagePublicId: posts.coverImagePublicId,
      category: posts.category,
      categoryMeta: posts.categoryMeta,
      status: posts.status,
      tldr: posts.tldr,
      authorId: posts.authorId,
      readingTimeMin: posts.readingTimeMin,
      upvotes: posts.upvotes,
      downvotes: posts.downvotes,
      views: posts.views,
      bookmarksCount: posts.bookmarksCount,
      seriesId: posts.seriesId,
      seriesOrder: posts.seriesOrder,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      // Author join
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
      authorBio: users.bio,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.id, id), eq(posts.isDeleted, false)))
    .limit(1);

  if (!row) throw new AppError("Post not found", 404, "NOT_FOUND");

  const tags = await db
    .select({ tag: postTags.tag })
    .from(postTags)
    .where(eq(postTags.postId, id));

  return formatPost(row, tags.map((t) => t.tag));
};

/**
 * Get a post by slug (public — only published).
 */
const getPostByPublicId = async (publicId, incrementView = false) => {
  if (incrementView) {
    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(and(eq(posts.publicId, publicId), eq(posts.status, "published")));
  }

  const [row] = await db
    .select({
      id: posts.id,
      publicId: posts.publicId,
      title: posts.title,
      slug: posts.slug,
      body: posts.body,
      renderedHtml: posts.renderedHtml,
      excerpt: posts.excerpt,
      coverImageUrl: posts.coverImageUrl,
      category: posts.category,
      categoryMeta: posts.categoryMeta,
      status: posts.status,
      tldr: posts.tldr,
      authorId: posts.authorId,
      readingTimeMin: posts.readingTimeMin,
      upvotes: posts.upvotes,
      downvotes: posts.downvotes,
      views: posts.views,
      bookmarksCount: posts.bookmarksCount,
      seriesId: posts.seriesId,
      seriesOrder: posts.seriesOrder,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorName: users.name,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
      authorBio: users.bio,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.publicId, publicId), eq(posts.status, "published"), eq(posts.isDeleted, false)))
    .limit(1);

  if (!row) throw new AppError("Post not found", 404, "NOT_FOUND");

  const tags = await db
    .select({ tag: postTags.tag })
    .from(postTags)
    .where(eq(postTags.postId, row.id));

  const post = formatPost(row, tags.map((t) => t.tag));

  // Attach series navigation if part of a series
  if (post.seriesId) {
    post.seriesNav = await getSeriesNav(post.seriesId, post.seriesOrder);
  }

  return post;
};

/**
 * List published posts with filters, search, pagination.
 */
const listPosts = async (query) => {
  const {
    q,
    category,
    tag,
    authorUsername,
    sort,
    page,
    limit: lim,
    semantic,
  } = query;

  const { limit, offset, meta } = paginate({ page, limit: lim });

  // Build WHERE
  const conditions = [eq(posts.status, "published"), eq(posts.isDeleted, false)];

  let searchEmbedding = null;

  if (q) {
    if (semantic === "true" || semantic === true) {
      searchEmbedding = await ai.generateEmbedding(q);
    } else {
      const searchParam = `%${q}%`;
      conditions.push(
        or(
          sql`to_tsvector('english', ${posts.title} || ' ' || coalesce(${posts.category}::text, '')) @@ plainto_tsquery('english', ${q})`,
          sql`EXISTS (SELECT 1 FROM users WHERE users.id = ${posts.authorId} AND (users.name ILIKE ${searchParam} OR users.username ILIKE ${searchParam}))`,
          sql`EXISTS (SELECT 1 FROM post_tags WHERE post_tags.post_id = ${posts.id} AND post_tags.tag ILIKE ${searchParam})`
        )
      );
    }
  }
  if (category) conditions.push(eq(posts.category, category));
  if (authorUsername) {
    // Sub-select for author filter
    conditions.push(
      sql`${posts.authorId} IN (
        SELECT id FROM users WHERE username = ${authorUsername}
      )`
    );
  }

  const where = and(...conditions);

  // Tag filter via EXISTS subquery
  let tagCondition = where;
  if (tag) {
    tagCondition = and(
      where,
      sql`EXISTS (
        SELECT 1 FROM post_tags
        WHERE post_tags.post_id = posts.id
        AND post_tags.tag = ${tag.toLowerCase()}
      )`
    );
  }

  // Order
  let orderBy =
    sort === "top"
      ? desc(sql`${posts.upvotes} - ${posts.downvotes}`)
      : sort === "trending"
      ? desc(sql`(${posts.upvotes} - ${posts.downvotes}) + (${posts.views} * 0.1)`)
      : desc(posts.publishedAt);

  if (searchEmbedding) {
    orderBy = asc(sql`${posts.embedding} <=> ${JSON.stringify(searchEmbedding)}::vector`);
  }

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: posts.id,
        publicId: posts.publicId,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        coverImageUrl: posts.coverImageUrl,
        category: posts.category,
        categoryMeta: posts.categoryMeta,
        status: posts.status,
        authorId: posts.authorId,
        readingTimeMin: posts.readingTimeMin,
        upvotes: posts.upvotes,
        downvotes: posts.downvotes,
        views: posts.views,
        bookmarksCount: posts.bookmarksCount,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt,
        authorName: users.name,
        authorUsername: users.username,
        authorAvatarUrl: users.avatarUrl,
        seriesId: posts.seriesId,
        seriesOrder: posts.seriesOrder,
        seriesTitle: series.title,
        seriesSlug: series.slug,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(series, eq(posts.seriesId, series.id))
      .where(tagCondition)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(posts)
      .where(tagCondition),
  ]);

  // Attach tags
  const postIds = rows.map((r) => r.id);
  const allTags =
    postIds.length > 0
      ? await db
          .select()
          .from(postTags)
          .where(inArray(postTags.postId, postIds))
      : [];

  const tagMap = allTags.reduce((acc, t) => {
    if (!acc[t.postId]) acc[t.postId] = [];
    acc[t.postId].push(t.tag);
    return acc;
  }, {});

  const data = rows.map((r) => ({
    ...formatPost(r, tagMap[r.id] || []),
  }));

  return { data, pagination: meta(count) };
};

/**
 * List user's own drafts.
 */
const listDrafts = async (userId, query = {}) => {
  const { page, limit: lim } = query;
  const { limit, offset, meta } = paginate({ page, limit: lim });

  const where = and(
    eq(posts.authorId, userId),
    eq(posts.status, "draft"),
    eq(posts.isDeleted, false)
  );

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        category: posts.category,
        status: posts.status,
        readingTimeMin: posts.readingTimeMin,
        updatedAt: posts.updatedAt,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(where)
      .orderBy(desc(posts.updatedAt))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(posts)
      .where(where),
  ]);

  return { data: rows, pagination: meta(count) };
};

// ── Series Navigation ────────────────────────────────────────────────────────

/**
 * Get prev/next posts in a series for navigation.
 */
const getSeriesNav = async (seriesId, currentOrder) => {
  // Get the series info
  const [seriesInfo] = await db
    .select({
      id: series.id,
      title: series.title,
      slug: series.slug,
    })
    .from(series)
    .where(eq(series.id, seriesId))
    .limit(1);

  if (!seriesInfo) return null;

  // Get all published posts in this series, ordered
  const seriesPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      seriesOrder: posts.seriesOrder,
    })
    .from(posts)
    .where(
      and(
        eq(posts.seriesId, seriesId),
        eq(posts.status, "published"),
        eq(posts.isDeleted, false)
      )
    )
    .orderBy(asc(posts.seriesOrder));

  const currentIdx = seriesPosts.findIndex((p) => p.seriesOrder === currentOrder);

  return {
    series: seriesInfo,
    totalParts: seriesPosts.length,
    currentPart: currentOrder,
    posts: seriesPosts,
    prev: currentIdx > 0 ? seriesPosts[currentIdx - 1] : null,
    next: currentIdx < seriesPosts.length - 1 ? seriesPosts[currentIdx + 1] : null,
  };
};

// ── Cover Upload ────────────────────────────────────────────────────────────
const uploadCover = async (id, authorId, coverUrl, coverPublicId) => {
  const [post] = await db
    .select({ id: posts.id, authorId: posts.authorId })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!post) throw new AppError("Post not found", 404, "NOT_FOUND");
  if (post.authorId !== authorId) throw new AppError("Unauthorized", 403, "FORBIDDEN");

  const [updated] = await db
    .update(posts)
    .set({
      coverImageUrl: coverUrl,
      coverImagePublicId: coverPublicId,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  return formatPost(updated);
};

// ── Formatters ───────────────────────────────────────────────────────────────

const formatPost = (row, tags = []) => ({
  id: row.id,
  publicId: row.publicId,
  title: row.title,
  slug: row.slug,
  body: row.body,
  renderedHtml: row.renderedHtml,
  excerpt: row.excerpt,
  coverImageUrl: row.coverImageUrl,
  coverImagePublicId: row.coverImagePublicId,
  category: row.category,
  categoryMeta: row.categoryMeta || {},
  status: row.status,
  tldr: row.tldr,
  authorId: row.authorId,
  readingTimeMin: row.readingTimeMin,
  upvotes: row.upvotes,
  downvotes: row.downvotes,
  views: row.views,
  bookmarksCount: row.bookmarksCount,
  seriesId: row.seriesId,
  seriesOrder: row.seriesOrder,
  seriesTitle: row.seriesTitle,
  seriesSlug: row.seriesSlug,
  publishedAt: row.publishedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  author: row.authorName
    ? {
        id: row.authorId,
        name: row.authorName,
        username: row.authorUsername,
        avatarUrl: row.authorAvatarUrl,
        bio: row.authorBio,
      }
    : undefined,
  tags,
});
const getRecommendations = async (userId, query) => {
  // Simple heuristic: fetch user's recent posts to build a context
  const recentPosts = await db
    .select({ title: posts.title })
    .from(posts)
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt))
    .limit(5);

  let contextString = "developer software engineering coding programming community"; // fallback
  if (recentPosts.length > 0) {
    contextString = recentPosts.map((p) => p.title).join(" ");
  }

  // We can just rely on the vector similarity with the context string
  return listPosts({ ...query, q: contextString.slice(0, 500), semantic: true });
};

const generateAI = async (title, body) => {
  if (!title || !body) throw new AppError("Title and body are required", 400);
  return await ai.generateTagsAndTldr(title, body);
};

const generateTldr = async (id) => {
  const post = await getPostById(id);
  if (post.tldr) return { tldr: post.tldr }; // already generated

  const aiData = await ai.generateTagsAndTldr(post.title, post.body);
  if (!aiData.tldr) throw new AppError("Failed to generate TL;DR", 500);

  await db
    .update(posts)
    .set({ tldr: aiData.tldr })
    .where(eq(posts.id, id));

  return { tldr: aiData.tldr };
};

module.exports = {
  createPost,
  updatePost,
  autosavePost,
  publishPost,
  unpublishPost,
  deletePost,
  uploadCover,
  getPostById,
  getPostByPublicId,
  listPosts,
  listDrafts,
  getSeriesNav,
  getRecommendations,
  generateAI,
  generateTldr,
};
