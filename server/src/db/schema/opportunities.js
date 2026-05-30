"use strict";

const {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  pgEnum,
  integer,
  unique,
  index,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

// ── Enums ───────────────────────────────────────────────────────────────────
const opportunitySourceEnum = pgEnum("opportunity_source", [
  "CLIST",
  "KAGGLE",
]);

const opportunityTypeEnum = pgEnum("opportunity_type", [
  "CODING_CONTEST",
  "HACKATHON",
  "AI_COMPETITION",
  "DATA_SCIENCE_COMPETITION",
  "HIRING_CHALLENGE",
  "OPEN_SOURCE",
  "WORKSHOP",
  "WEBINAR",
  "OTHER"
]);

const opportunityStatusEnum = pgEnum("opportunity_status", [
  "UPCOMING",
  "ONGOING",
  "ENDED",
]);

// ── Opportunities Table ─────────────────────────────────────────────────────
const opportunities = pgTable(
  "opportunities",
  {
    id: serial("id").primaryKey(),
    source: opportunitySourceEnum("source").notNull(),
    sourceId: varchar("source_id", { length: 255 }).notNull(),
    organizer: varchar("organizer", { length: 255 }), // Platform name like codeforces.com
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"), // Some might not have it or have a lot
    officialUrl: varchar("official_url", { length: 500 }).notNull(),
    type: opportunityTypeEnum("type").notNull(),
    status: opportunityStatusEnum("status").notNull(),
    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),
    deadline: timestamp("deadline", { withTimezone: true }), // For Kaggle
    tags: text("tags").array(), // e.g. ["machine learning", "computer vision"]
    rawData: text("raw_data"), // To store raw JSON if needed
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sourceSourceIdUniq: unique().on(table.source, table.sourceId),
    titleIdx: index("opportunities_title_idx").on(table.title),
    statusIdx: index("opportunities_status_idx").on(table.status),
    typeIdx: index("opportunities_type_idx").on(table.type),
  })
);

// ── Opportunity Bookmarks Table ──────────────────────────────────────────────
const opportunityBookmarks = pgTable(
  "opportunity_bookmarks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userOpportunityUniq: unique().on(table.userId, table.opportunityId),
  })
);

module.exports = {
  opportunitySourceEnum,
  opportunityTypeEnum,
  opportunityStatusEnum,
  opportunities,
  opportunityBookmarks,
};
