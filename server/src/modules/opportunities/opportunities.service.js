"use strict";

const { db } = require("../../db/index");
const {
  opportunities,
  opportunityBookmarks,
} = require("../../db/schema/index");
const { eq, and, or, ilike, desc, asc, sql } = require("drizzle-orm");
const AppError = require("../../utils/AppError");

const listOpportunities = async (filters) => {
  const { organizer, type, status, q, sort = "newest", page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  let queryConditions = [];

  if (organizer) queryConditions.push(eq(opportunities.organizer, organizer));
  if (type) queryConditions.push(eq(opportunities.type, type));
  if (status) queryConditions.push(eq(opportunities.status, status));

  // Filter out soft-deleted and only show APPROVED opportunities
  queryConditions.push(eq(opportunities.isDeleted, false));
  queryConditions.push(eq(opportunities.moderationStatus, "APPROVED"));

  if (q) {
    const searchString = `%${q}%`;
    queryConditions.push(
      or(
        sql`to_tsvector('english', coalesce(${opportunities.title}, '') || ' ' || coalesce(${opportunities.description}, '')) @@ plainto_tsquery('english', ${q})`,
        ilike(opportunities.organizer, searchString),
        sql`${opportunities.source}::text ILIKE ${searchString}`,
        sql`${opportunities.type}::text ILIKE ${searchString}`,
        sql`${opportunities.tags}::text ILIKE ${searchString}`
      )
    );
  }

  // Archive ended opportunities older than 45 days
  queryConditions.push(
    sql`NOT (${opportunities.status} = 'ENDED' AND COALESCE(${opportunities.endTime}, ${opportunities.deadline}, ${opportunities.startTime}, ${opportunities.updatedAt}) < NOW() - INTERVAL '45 days')`
  );

  const whereClause = queryConditions.length > 0 ? and(...queryConditions) : undefined;

  let orderByClause = desc(opportunities.createdAt);
  if (sort === "start_date") orderByClause = asc(opportunities.startTime);
  if (sort === "deadline") orderByClause = asc(opportunities.deadline);
  // We can add "most_bookmarked" using a subquery if needed later, 
  // but for now keeping it simple with newest/start_date/deadline.

  const data = await db
    .select()
    .from(opportunities)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(opportunities)
    .where(whereClause);

  return {
    data,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getOpportunityById = async (id, userId = null) => {
  const [opportunity] = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, id), eq(opportunities.isDeleted, false)));

  if (!opportunity) throw new AppError("Opportunity not found", 404);

  let isBookmarked = false;
  if (userId) {
    const [bookmark] = await db
      .select()
      .from(opportunityBookmarks)
      .where(and(eq(opportunityBookmarks.userId, userId), eq(opportunityBookmarks.opportunityId, id)));
    isBookmarked = !!bookmark;
  }

  return { ...opportunity, isBookmarked };
};

const toggleBookmark = async (userId, opportunityId) => {
  const [existing] = await db
    .select()
    .from(opportunityBookmarks)
    .where(and(eq(opportunityBookmarks.userId, userId), eq(opportunityBookmarks.opportunityId, opportunityId)));

  if (existing) {
    await db
      .delete(opportunityBookmarks)
      .where(eq(opportunityBookmarks.id, existing.id));
    return { bookmarked: false };
  } else {
    await db.insert(opportunityBookmarks).values({
      userId,
      opportunityId,
    });
    return { bookmarked: true };
  }
};

const getBookmarkedOpportunities = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const data = await db
    .select({ opportunity: opportunities })
    .from(opportunityBookmarks)
    .innerJoin(opportunities, eq(opportunityBookmarks.opportunityId, opportunities.id))
    .where(
      and(
        eq(opportunityBookmarks.userId, userId),
        eq(opportunities.isDeleted, false),
        eq(opportunities.moderationStatus, "APPROVED")
      )
    )
    .orderBy(desc(opportunityBookmarks.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(opportunityBookmarks)
    .where(eq(opportunityBookmarks.userId, userId));

  return {
    data: data.map((d) => ({ ...d.opportunity, isBookmarked: true })),
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

module.exports = {
  listOpportunities,
  getOpportunityById,
  toggleBookmark,
  getBookmarkedOpportunities,
};
