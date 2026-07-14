"use strict";

const { Router } = require("express");
const controller = require("./moderation.controller");
const { auth, restrictTo } = require("../../middleware/auth");
const { adminLimiter } = require("../../middleware/rateLimiter");

const router = Router();

// All moderation routes require at least moderator access
router.use(auth);
router.use(restrictTo("moderator", "admin"));
router.use(adminLimiter);

// Reports
router.get("/reports", controller.listReports);
router.patch("/reports/:id/review", controller.reviewReport);
router.patch("/reports/:id/dismiss", controller.reviewReport); // we can map both to reviewReport and pass action in body

// Content
router.delete("/content/:type/:id", controller.removeContent);
router.patch("/content/:type/:id/restore", controller.restoreContent);
router.get("/deleted-content", controller.getDeletedContent);

// Analytics
router.get("/analytics", controller.getAnalytics);

// Users Management
router.get("/users", controller.listUsers);
router.get("/users/:id/history", controller.getUserHistory);
router.patch("/users/:id/role", restrictTo("admin"), controller.updateUserRole); // Only admins can change roles
router.post("/users/:id/warn", controller.warnUser);
router.post("/users/:id/suspend", controller.suspendUser);
router.post("/users/:id/ban", restrictTo("admin"), controller.banUser); // Only admins can ban

// Moderators
router.post("/moderators", restrictTo("admin"), controller.createModerator);



// Opportunities
router.post("/opportunities", controller.createOpportunity);
router.patch("/opportunities/:id", controller.updateOpportunity);
router.delete("/opportunities/:id", controller.deleteOpportunity);

module.exports = router;
