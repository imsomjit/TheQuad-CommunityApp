"use strict";

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");
const env = require("./config/env");

// ── Route modules ─────────────────────────────────────────────────────────────
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/users.routes");
const resourceRoutes = require("./modules/resources/resources.routes");
const questionRoutes = require("./modules/questions/questions.routes");
const commentRoutes = require("./modules/comments/comments.routes");
const voteRoutes = require("./modules/votes/votes.routes");
const bookmarkRoutes = require("./modules/bookmarks/bookmarks.routes");
const followRoutes = require("./modules/follows/follows.routes");
const notificationRoutes = require("./modules/notifications/notifications.routes");
const reportRoutes = require("./modules/reports/reports.routes");
const githubRoutes = require("./modules/github/github.routes");
const postRoutes = require("./modules/posts/posts.routes");
const seriesRoutes = require("./modules/posts/series.routes");
const leetcodeRoutes = require("./modules/leetcode/leetcode.routes");
const opportunityRoutes = require("./modules/opportunities/opportunities.routes");

const createApp = () => {
  const app = express();

  // ── Trust proxy (needed for rate limiters behind Render/Nginx) ────────────
  app.set("trust proxy", 1);

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true, // allow cookies to be sent cross-origin
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // ── Request logger ────────────────────────────────────────────────────────
  app.use((req, _res, next) => {
    logger.debug(`→ ${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      ua: req.headers["user-agent"]?.slice(0, 60),
    });
    next();
  });

  // ── Health check ──────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── API Routes ────────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/resources", resourceRoutes);
  app.use("/api/questions", questionRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api/votes", voteRoutes);
  app.use("/api/bookmarks", bookmarkRoutes);
  app.use("/api/follows", followRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/github", githubRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/series", seriesRoutes);
  app.use("/api/leetcode", leetcodeRoutes);
  app.use("/api/opportunities", opportunityRoutes);

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: "NOT_FOUND",
    });
  });

  // ── Global error handler (must be last) ───────────────────────────────────
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
