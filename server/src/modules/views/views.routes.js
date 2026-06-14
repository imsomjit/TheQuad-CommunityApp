"use strict";

const express = require("express");
const viewsController = require("./views.controller");
const { optionalAuth } = require("../../middleware/auth");

const router = express.Router();

// optionalAuth is used so we know req.user if they are logged in
router.post("/:contentType/:id", optionalAuth, viewsController.recordView);

module.exports = router;
