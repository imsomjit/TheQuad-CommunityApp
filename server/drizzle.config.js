"use strict";

const { defineConfig } = require("drizzle-kit");
require("dotenv").config();

module.exports = defineConfig({
  schema: "./src/db/schema/index.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
