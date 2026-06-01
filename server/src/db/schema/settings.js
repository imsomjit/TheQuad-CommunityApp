"use strict";

const { pgTable, serial, boolean, text, jsonb } = require("drizzle-orm/pg-core");

const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  registrationEnabled: boolean("registration_enabled").default(true).notNull(),
  announcementText: text("announcement_text"),
  announcementType: text("announcement_type").default("INFO").notNull(), // INFO, SUCCESS, WARNING, ERROR
  announcementActive: boolean("announcement_active").default(false).notNull(),
  socialLinks: jsonb("social_links").default({
    linkedin: "",
    instagram: "",
    twitter: "",
    discord: "",
    email: ""
  }).notNull(),
});

module.exports = { siteSettings };
