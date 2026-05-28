"use strict";

const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { Readable } = require("stream");

/**
 * Multer configured for memory storage.
 * We buffer the file in memory, then stream it to Cloudinary.
 * This avoids writing temp files to disk.
 *
 * Max file sizes:
 * - PDFs: 50 MB (notes can be large)
 * - Images: 5 MB (avatars, blog covers)
 */
const ALLOWED_PDF_TYPES = ["application/pdf"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const memoryStorage = multer.memoryStorage();

const createUploader = (allowedTypes, maxSize) =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: maxSize },
    fileFilter: (_req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new AppError(
            `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
            400,
            "INVALID_FILE_TYPE"
          )
        );
      }
    },
  });

/** Multer instances */
const pdfUpload = createUploader(ALLOWED_PDF_TYPES, MAX_PDF_SIZE);
const imageUpload = createUploader(ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE);

/**
 * Streams a buffer to Cloudinary using upload_stream.
 *
 * @param {Buffer} buffer
 * @param {object} options  - Cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(new AppError(error.message, 500, "UPLOAD_FAILED"));
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });

/**
 * Middleware: upload a PDF resource file.
 * Attaches { fileUrl, filePublicId, fileName, fileSize } to req.uploadedFile.
 */
const uploadResourceFile = [
  pdfUpload.single("file"),
  asyncHandler(async (req, _res, next) => {
    if (!req.file) {
      throw new AppError("A file is required", 400, "FILE_REQUIRED");
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "peerverse/resources",
      resource_type: "raw",             // PDFs are "raw" in Cloudinary
      public_id: `${Date.now()}-${req.file.originalname.replace(/\s+/g, "_")}`,
      format: "pdf",
    });

    req.uploadedFile = {
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    };

    next();
  }),
];

/**
 * Middleware: upload an avatar image.
 * Attaches { avatarUrl, avatarPublicId } to req.uploadedImage.
 */
const uploadAvatar = [
  imageUpload.single("avatar"),
  asyncHandler(async (req, _res, next) => {
    if (!req.file) {
      throw new AppError("An image is required", 400, "FILE_REQUIRED");
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "peerverse/avatars",
      resource_type: "image",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto" },
      ],
    });

    req.uploadedImage = {
      avatarUrl: result.secure_url,
      avatarPublicId: result.public_id,
    };

    next();
  }),
];

/**
 * Middleware: upload a banner/cover image.
 * Attaches { bannerUrl, bannerPublicId } to req.uploadedImage.
 */
const uploadBanner = [
  imageUpload.single("banner"),
  asyncHandler(async (req, _res, next) => {
    if (!req.file) {
      throw new AppError("An image is required", 400, "FILE_REQUIRED");
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "peerverse/banners",
      resource_type: "image",
      transformation: [
        { width: 1500, height: 500, crop: "fill", gravity: "center" },
        { quality: "auto" },
      ],
    });

    req.uploadedImage = {
      bannerUrl: result.secure_url,
      bannerPublicId: result.public_id,
    };

    next();
  }),
];

module.exports = { uploadResourceFile, uploadAvatar, uploadBanner, uploadToCloudinary };
