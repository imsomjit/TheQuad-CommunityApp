"use strict";

// Load env first — exits with error if vars are missing
const env = require("./config/env");
const createApp = require("./app");
const { pool } = require("./db/index");
const logger = require("./utils/logger");
const { startSyncJobs } = require("./modules/opportunities/sync/sync.service");
const { startCronJobs } = require("./utils/cron");
const sseManager = require("./config/sse");
const initSocket = require("./modules/chat/chat.socket");

const start = async () => {
  try {
    // ── Verify DB connection ─────────────────────────────────────────────────
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    logger.info("✅  PostgreSQL connected");

    // ── Create Express app ───────────────────────────────────────────────────
    const app = createApp();
    const PORT = parseInt(env.PORT) || 5000;

    const server = app.listen(PORT, () => {
      logger.info(`🚀  The Quad API running on http://localhost:${PORT}`);
      logger.info(`📦  Environment: ${env.NODE_ENV}`);
      
      // Initialize WebSockets
      initSocket(server);
      
      // Start background sync jobs
      startSyncJobs();
      logger.info(`🔄  Background sync jobs started`);

      // Start cron jobs
      startCronJobs();
    });

    // ── Graceful shutdown ────────────────────────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      
      // Force shutdown after 10 seconds if graceful shutdown hangs
      setTimeout(() => {
        logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000).unref();

      server.close(async () => {
        sseManager.closeAll();
        await pool.end();
        logger.info("PostgreSQL pool closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // ── Unhandled rejections & exceptions → log and exit ─────────────────────
    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled promise rejection", { reason });
      process.exit(1);
    });

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught exception", { error: error.message, stack: error.stack });
      process.exit(1);
    });

  } catch (err) {
    logger.error("Failed to start server", { error: err.message });
    process.exit(1);
  }
};

start();
