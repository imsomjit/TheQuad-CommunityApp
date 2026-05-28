"use strict";

const { eq, desc, sql, and } = require("drizzle-orm");
const { db } = require("../../db/index");
const { reports, users } = require("../../db/schema/index");
const AppError = require("../../utils/AppError");
const paginate = require("../../utils/paginate");

const submitReport = async (reporterId, { targetType, targetId, reason, details }) => {
  const [report] = await db
    .insert(reports)
    .values({ reporterId, targetType, targetId, reason, details })
    .returning();

  return report;
};

const listReports = async ({ status, page, limit: lim }) => {
  const { limit, offset, meta } = paginate({ page, limit: lim });

  const where = status ? eq(reports.status, status) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: reports.id,
        targetType: reports.targetType,
        targetId: reports.targetId,
        reason: reports.reason,
        details: reports.details,
        status: reports.status,
        createdAt: reports.createdAt,
        reporterName: users.name,
        reporterUsername: users.username,
      })
      .from(reports)
      .leftJoin(users, eq(reports.reporterId, users.id))
      .where(where)
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset),

    db.select({ count: sql`count(*)`.mapWith(Number) }).from(reports).where(where),
  ]);

  return { data: rows, pagination: meta(count) };
};

const reviewReport = async (reportId, resolvedById, status) => {
  const [updated] = await db
    .update(reports)
    .set({ status, resolvedById, updatedAt: new Date() })
    .where(eq(reports.id, reportId))
    .returning();

  if (!updated) throw new AppError("Report not found", 404, "NOT_FOUND");
  return updated;
};

const suspendUser = async (targetUserId, adminId) => {
  await db
    .update(users)
    .set({ isSuspended: true, updatedAt: new Date() })
    .where(eq(users.id, targetUserId));
};

const banUser = async (targetUserId, adminId) => {
  await db
    .update(users)
    .set({ isBanned: true, updatedAt: new Date() })
    .where(eq(users.id, targetUserId));
};

const reinstateUser = async (targetUserId) => {
  await db
    .update(users)
    .set({ isSuspended: false, isBanned: false, updatedAt: new Date() })
    .where(eq(users.id, targetUserId));
};

module.exports = { submitReport, listReports, reviewReport, suspendUser, banUser, reinstateUser };
