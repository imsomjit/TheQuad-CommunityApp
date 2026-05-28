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
} = require("../../middleware/rateLimiter");

const router = Router();

// GET /api/resources  — public, 120 req/min
router.get("/", resourceReadLimiter, optionalAuth, controller.list);

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

// POST /api/resources/:id/download — auth required (logged-in users only)
router.post("/:id/download", resourceReadLimiter, auth, controller.download);

module.exports = router;
