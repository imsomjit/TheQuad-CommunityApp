"use strict";

const asyncHandler = require("../../utils/asyncHandler");
const booksService = require("./books.service");
const { uploadBookSchema, getBooksQuerySchema, updateBookSchema } = require("./books.schemas");
const AppError = require("../../utils/AppError");

exports.uploadBook = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const data = uploadBookSchema.parse(req.body);
  
  // PDF file must be uploaded as "file"
  const file = req.files?.file?.[0];
  // Cover image as "cover" (optional)
  const coverFile = req.files?.cover?.[0];

  if (!file) {
    throw new AppError("PDF file is required", 400, "MISSING_FILE");
  }

  const book = await booksService.uploadBook(adminId, data, file, coverFile);

  res.status(201).json({
    status: "success",
    data: { book },
  });
});

exports.getBooks = asyncHandler(async (req, res) => {
  const query = getBooksQuerySchema.parse(req.query);
  const result = await booksService.getBooks(query);

  res.status(200).json({
    status: "success",
    data: result.data,
    pagination: result.pagination,
  });
});

exports.getBookById = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const book = await booksService.getBookById(publicId);

  res.status(200).json({
    status: "success",
    data: { book },
  });
});

exports.incrementViews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await booksService.incrementViews(Number(id));
  res.status(200).json({ status: "success" });
});

exports.incrementDownloads = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await booksService.incrementDownloads(Number(id));
  res.status(200).json({ status: "success" });
});

exports.deleteBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await booksService.deleteBook(Number(id));
  res.status(204).send();
});

exports.updateBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = updateBookSchema.parse(req.body);
  const book = await booksService.updateBook(Number(id), data, req.file);
  res.status(200).json({ status: "success", data: { book } });
});
