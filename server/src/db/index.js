"use strict";

const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const env = require("../config/env");
const schema = require("./schema/index");
const logger = require("../utils/logger");

/**
 * Single pg connection pool shared across the entire application.
 * Max 10 connections — appropriate for Render free tier + local dev.
 * Increase max in production as needed.
 */
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  logger.error("Unexpected PostgreSQL pool error", { error: err.message });
});

/**
 * Drizzle ORM instance.
 * Import `db` throughout the app instead of the raw pool.
 * Use `db.execute(sql`...`)` for complex raw queries.
 */
const db = drizzle(pool, { schema });

module.exports = { db, pool };
