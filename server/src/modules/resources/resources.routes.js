"use strict";

const { Router } = require("express");
const controller = require("./resources.controller");
const { auth, optionalAuth } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { createResourceSchema, updateResourceSchema } = require("./resources.schemas");
const { uploadResourceFile } = require("../../middleware/upload");
const {
  resourceReadLimiter,
  resourceWriteLimiter,
  uploadLimiter,
  aiLimiter,
} = require("../../middleware/rateLimiter");
const { db } = require("../../db/index");
const { resources } = require("../../db/schema/index");
const { eq } = require("drizzle-orm");
const { extractIdFromSlug } = require("../../utils/slugify");

const router = Router();

// Middleware to resolve slug or ID to integer ID
router.param("id", async (req, res, next, val) => {
  try {
    const publicId = extractIdFromSlug(val);
    if (!publicId) return next();
    
    // First try publicId
    const [row] = await db.select({ id: resources.id }).from(resources).where(eq(resources.publicId, publicId)).limit(1);
    if (row) {
      req.params.id = row.id;
      return next();
    }
    
    // Fallback to integer
    if (/^\d+$/.test(publicId)) {
      req.params.id = parseInt(publicId, 10);
      return next();
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

// GET /api/resources  — public, 120 req/min
router.get("/", resourceReadLimiter, optionalAuth, controller.list);

// GET /api/resources/recommendations — get personalized recommendations
router.get("/recommendations", auth, resourceReadLimiter, controller.recommendations);

// POST /api/resources — auth required, 10 uploads/hr + 30 writes/15min
router.post(
  "/",
  auth,
  uploadLimiter,
  uploadResourceFile,      // multer → Cloudinary → req.uploadedFile
  resourceWriteLimiter,
  validate(createResourceSchema),
  controller.create
);

// GET /api/resources/:id — public
router.get("/:id", resourceReadLimiter, optionalAuth, controller.getOne);

// PATCH /api/resources/:id — auth + owner check in service
router.patch(
  "/:id",
  auth,
  resourceWriteLimiter,
  validate(updateResourceSchema),
  controller.update
);

// DELETE /api/resources/:id — auth + owner/mod check in service
router.delete("/:id", auth, resourceWriteLimiter, controller.remove);

// POST /api/resources/:id/download  (tracks downloads)
router.post(
  "/:id/download",
  resourceReadLimiter,
  auth,
  controller.download
);

// POST /api/resources/parse-metadata (pre-upload extraction)
router.post(
  "/parse-metadata",
  auth,
  aiLimiter,
  uploadResourceFile,
  controller.parseMetadata
);

// POST /api/resources/:id/chat
router.post(
  "/:id/chat",
  auth,
  aiLimiter,
  controller.chat
);

module.exports = router;
