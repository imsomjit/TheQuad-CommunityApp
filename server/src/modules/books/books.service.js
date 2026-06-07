"use strict";

const { eq, desc, and, or, ilike, sql } = require("drizzle-orm");
const { db } = require("../../db");
const { books } = require("../../db/schema");
const { users } = require("../../db/schema");
const cloudinary = require("../../config/cloudinary");
const AppError = require("../../utils/AppError");
const { uploadToCloudinary } = require("../../middleware/upload");

const uploadBook = async (adminId, data, file, coverFile) => {
  if (!file) {
    throw new AppError("Book PDF file is required", 400, "MISSING_FILE");
  }

  // Upload PDF to Cloudinary
  const uploadResult = await uploadToCloudinary(file.buffer, {
    folder: "peerverse/books",
    resource_type: "raw", // PDF
  });

  // Upload Cover Image (Optional)
  let coverResult = null;
  if (coverFile) {
    coverResult = await uploadToCloudinary(coverFile.buffer, {
      folder: "peerverse/books/covers",
      resource_type: "image",
    });
  }

  const [newBook] = await db
    .insert(books)
    .values({
      title: data.title,
      description: data.description,
      author: data.author,
      isbn: data.isbn,
      subject: data.subject,
      tags: data.tags ? JSON.parse(data.tags) : [],
      fileUrl: uploadResult.secure_url,
      filePublicId: uploadResult.public_id,
      fileName: file.originalname,
      fileSize: file.size,
      coverUrl: coverResult?.secure_url,
      coverPublicId: coverResult?.public_id,
      uploaderId: adminId,
    })
    .returning();

  return newBook;
};

const getBooks = async ({ page, limit, search, author, subject, sort }) => {
  const offset = (page - 1) * limit;

  const filters = [eq(books.isDeleted, false)];

  if (search) {
    filters.push(
      or(
        ilike(books.title, `%${search}%`),
        ilike(books.author, `%${search}%`)
      )
    );
  }
  if (author) {
    filters.push(ilike(books.author, `%${author}%`));
  }
  if (subject) {
    filters.push(ilike(books.subject, `%${subject}%`));
  }

  const orderBy = [];
  if (sort === "popular") {
    orderBy.push(desc(books.views), desc(books.downloads));
  } else {
    orderBy.push(desc(books.createdAt));
  }

  const results = await db
    .select({
      id: books.id,
      publicId: books.publicId,
      title: books.title,
      author: books.author,
      subject: books.subject,
      description: books.description,
      tags: books.tags,
      coverUrl: books.coverUrl,
      views: books.views,
      downloads: books.downloads,
      upvotes: books.upvotes,
      downvotes: books.downvotes,
      bookmarksCount: books.bookmarksCount,
      createdAt: books.createdAt,
    })
    .from(books)
    .where(and(...filters))
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset);

  const [totalCount] = await db
    .select({ count: sql`count(*)::integer` })
    .from(books)
    .where(and(...filters));

  return {
    data: results,
    pagination: {
      total: totalCount.count,
      page,
      limit,
      totalPages: Math.ceil(totalCount.count / limit),
    },
  };
};

const getBookById = async (publicId) => {
  const [book] = await db
    .select({
      id: books.id,
      publicId: books.publicId,
      title: books.title,
      description: books.description,
      author: books.author,
      isbn: books.isbn,
      subject: books.subject,
      tags: books.tags,
      fileUrl: books.fileUrl,
      fileName: books.fileName,
      fileSize: books.fileSize,
      coverUrl: books.coverUrl,
      upvotes: books.upvotes,
      downvotes: books.downvotes,
      views: books.views,
      downloads: books.downloads,
      bookmarksCount: books.bookmarksCount,
      commentsCount: books.commentsCount,
      createdAt: books.createdAt,
      updatedAt: books.updatedAt,
      uploader: {
        id: users.id,
        username: users.username,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(books)
    .leftJoin(users, eq(books.uploaderId, users.id))
    .where(
      and(
        /^\d+$/.test(publicId) ? eq(books.id, parseInt(publicId, 10)) : eq(books.publicId, publicId),
        eq(books.isDeleted, false)
      )
    )
    .limit(1);

  if (!book) throw new AppError("Book not found", 404, "NOT_FOUND");
  return book;
};

const incrementViews = async (id) => {
  await db
    .update(books)
    .set({ views: sql`${books.views} + 1` })
    .where(eq(books.id, id));
};

const incrementDownloads = async (id) => {
  await db
    .update(books)
    .set({ downloads: sql`${books.downloads} + 1` })
    .where(eq(books.id, id));
};

const deleteBook = async (id) => {
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  if (!book) throw new AppError("Book not found", 404, "NOT_FOUND");

  // In a real app we might just soft delete, but for PDFs we might want to hard delete
  // to save storage. For now, let's just soft delete.
  await db.update(books).set({ isDeleted: true, deletedAt: new Date() }).where(eq(books.id, id));

  return { success: true };
};

const updateBook = async (id, data, coverFile) => {
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  if (!book) throw new AppError("Book not found", 404, "NOT_FOUND");

  const updateData = {};
  if (data.author !== undefined) updateData.author = data.author;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.subject !== undefined) updateData.subject = data.subject;
  if (data.isbn !== undefined) updateData.isbn = data.isbn;
  if (data.tags !== undefined) {
    updateData.tags = typeof data.tags === "string" ? JSON.parse(data.tags) : data.tags;
  }

  if (coverFile) {
    const coverResult = await uploadToCloudinary(coverFile.buffer, {
      folder: "peerverse/books/covers",
      resource_type: "image",
    });
    updateData.coverUrl = coverResult.secure_url;
    updateData.coverPublicId = coverResult.public_id;
  }

  const [updatedBook] = await db
    .update(books)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(books.id, id))
    .returning();

  return updatedBook;
};

module.exports = {
  uploadBook,
  updateBook,
  getBooks,
  getBookById,
  incrementViews,
  incrementDownloads,
  deleteBook,
};
