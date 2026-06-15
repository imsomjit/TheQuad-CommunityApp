"use strict";

const express = require("express");
const router = express.Router();
const tagsController = require("./tags.controller");

// GET /api/tags
router.get("/", tagsController.getAllTags);

module.exports = router;
