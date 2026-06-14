"use strict";

const resourceService = require("./resources.service");
const asyncHandler = require("../../utils/asyncHandler");
const { resourceQuerySchema } = require("./resources.schemas");

// GET /api/resources
const list = asyncHandler(async (req, res) => {
  const query = resourceQuerySchema.parse(req.query);
  const result = await resourceService.listResources(query);
  res.json({ success: true, ...result });
});

// POST /api/resources  (file already uploaded by middleware)
const create = asyncHandler(async (req, res) => {
  const resource = await resourceService.createResource(
    req.user.id,
    req.body,
    req.uploadedFile
  );
  res.status(201).json({ success: true, data: resource });
});

// GET /api/resources/:id
const getOne = asyncHandler(async (req, res) => {
  const resource = await resourceService.getResourceById(
    parseInt(req.params.id)
  );
  res.json({ success: true, data: resource });
});

// PATCH /api/resources/:id
const update = asyncHandler(async (req, res) => {
  const resource = await resourceService.updateResource(
    parseInt(req.params.id),
    req.user.id,
    req.body
  );
  res.json({ success: true, data: resource });
});

// DELETE /api/resources/:id
const remove = asyncHandler(async (req, res) => {
  await resourceService.deleteResource(
    parseInt(req.params.id),
    req.user.id,
    req.user.role
  );
  res.json({ success: true, message: "Resource deleted" });
});

// POST /api/resources/:id/download  (tracks downloads)
const download = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resource = await resourceService.getResourceById(id);
  await resourceService.incrementDownloads(id);
  res.json({ success: true, data: { fileUrl: resource.fileUrl } });
});

module.exports = { list, create, getOne, update, remove, download };
