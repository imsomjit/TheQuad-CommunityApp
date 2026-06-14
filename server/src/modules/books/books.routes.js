"use strict";

const express = require("express");
const multer = require("multer");
const booksController = require("./books.controller");
const { auth, restrictTo } = require("../../middleware/auth");
const { bookReadLimiter, adminLimiter, uploadLimiter } = require("../../middleware/rateLimiter");
const AppError = require("../../utils/AppError");

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (Cloudinary free tier limit)
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "file" && file.mimetype !== "application/pdf") {
      return cb(new AppError("Only PDF files are allowed for books", 400), false);
    }
    if (file.fieldname === "cover" && !file.mimetype.startsWith("image/")) {
      return cb(new AppError("Cover must be an image", 400), false);
    }
    cb(null, true);
  },
});

// Public routes
router.get("/", bookReadLimiter, booksController.getBooks);
router.get("/:publicId", bookReadLimiter, booksController.getBookById);
router.post("/:id/downloads", bookReadLimiter, booksController.incrementDownloads);

// Admin only routes
router.use(auth);
router.use(restrictTo("admin"));

router.post(
  "/",
  uploadLimiter,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  booksController.uploadBook
);

router.delete("/:id", adminLimiter, booksController.deleteBook);
router.patch("/:id", adminLimiter, upload.single("cover"), booksController.updateBook);

module.exports = router;
