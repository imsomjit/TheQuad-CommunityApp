"use strict";

const { eq, and, or, ilike, desc, sql, count } = require("drizzle-orm");
const bcrypt = require("bcryptjs");
const { db } = require("../../db/index");
const {
  reports,
  users,
  userActions,
  resources,
  questions,
  answers,
  posts,
  comments,
  opportunities,
} = require("../../db/schema/index");
const AppError = require("../../utils/AppError");
const paginate = require("../../utils/paginate");
const notificationService = require("../notifications/notifications.service");
const { sendEmail } = require("../../utils/email");

const listReports = async (query) => {
  const { status, type, page, limit: lim } = query;
  const { limit, offset, meta } = paginate({ page, limit: lim });

  const conditions = [];
  if (status) conditions.push(eq(reports.status, status));
  if (type) conditions.push(eq(reports.targetType, type));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id: reports.id,
        reporterId: reports.reporterId,
        targetType: reports.targetType,
        targetId: reports.targetId,
        reason: reports.reason,
        description: reports.description,
        status: reports.status,
        contentSnapshot: reports.contentSnapshot,
        assignedToId: reports.assignedToId,
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
    db
      .select({ totalCount: count() })
      .from(reports)
      .where(where),
  ]);

  return {
    data: rows.map(r => ({
      ...r,
      reporter: {
        id: r.reporterId,
        name: r.reporterName,
        username: r.reporterUsername,
      },
    })),
    pagination: meta(totalCount),
  };
};

const updateReportStatus = async (id, status, moderatorId, note) => {
  const [report] = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  if (!report) throw new AppError("Report not found", 404, "NOT_FOUND");

  await db
    .update(reports)
    .set({
      status,
      assignedToId: moderatorId,
      // We could store note in a separate notes table if needed, but for now just resolve status
    })
    .where(eq(reports.id, id));

  return { id, status };
};

const getTargetTable = (type) => {
  switch (type) {
    case "resource": return resources;
    case "question": return questions;
    case "answer": return answers;
    case "blog": return posts;
    case "comment": return comments;
    case "opportunity": return opportunities;
    default: return null;
  }
};

const removeContent = async (type, id, moderatorId, reason) => {
  const table = getTargetTable(type);
  if (!table) throw new AppError("Invalid content type", 400, "INVALID_TARGET");

  // Determine owner to notify
  const [content] = await db.select().from(table).where(eq(table.id, id)).limit(1);
  if (!content) throw new AppError("Content not found", 404, "NOT_FOUND");
  if (content.isDeleted) throw new AppError("Content already deleted", 400, "ALREADY_DELETED");

  const ownerId = content.authorId || content.uploaderId || content.organizerId; // Note: opportunities use organizer string currently, but we don't notify organizer directly via ID if it's external. If user created it, opportunity.userId doesn't exist yet, wait, let's check opportunity schema...

  await db
    .update(table)
    .set({
      isDeleted: true,
      deletedById: moderatorId,
      deletedAt: new Date(),
    })
    .where(eq(table.id, id));

  // If we can determine the owner, notify them
  // Assuming authorId/uploaderId for user generated content
  let recipientId = content.authorId || content.uploaderId;
  if (recipientId) {
    await notificationService.create({
      recipientId,
      actorId: moderatorId,
      type: "moderation_alert", // Custom type for mod alerts
      targetType: type,
      targetId: id,
      targetTitle: "Content Removed",
    }).catch(() => {});
  }

  // Automatically resolve related reports
  await db
    .update(reports)
    .set({ status: "resolved", assignedToId: moderatorId })
    .where(and(eq(reports.targetType, type), eq(reports.targetId, id), eq(reports.status, "pending")));

  return { success: true };
};

const warnUser = async (userId, moderatorId, reason) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  await db.insert(userActions).values({
    userId,
    actionType: "warn",
    reason,
    issuedById: moderatorId,
  });

  await notificationService.create({
    recipientId: userId,
    actorId: moderatorId,
    type: "moderation_alert",
    targetType: "user",
    targetId: userId,
    targetTitle: "Warning Received",
  }).catch(() => {});

  return { success: true };
};

const suspendUser = async (userId, moderatorId, reason, durationDays) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  await db.transaction(async (tx) => {
    await tx.insert(userActions).values({
      userId,
      actionType: "suspend",
      durationDays,
      reason,
      issuedById: moderatorId,
    });

    await tx.update(users).set({ suspensionExpiresAt: expiresAt }).where(eq(users.id, userId));
  });

  await sendEmail({
    to: user.email,
    subject: "Your Account Has Been Suspended",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfcfc; color: #0f172a; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; text-align: left; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="padding: 30px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #0f172a; font-weight: 800; letter-spacing: -0.5px;">Peer<span style="color: #6366f1;">Verse</span></h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="margin-top: 0; font-size: 20px; color: #ef4444; font-weight: 700;">Account Suspended</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">Your account on PeerVerse has been suspended for <strong>${durationDays} days</strong>.</p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-size: 15px; color: #991b1b;"><strong>Reason for Suspension:</strong><br>${reason}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">Your suspension will automatically expire on <strong>${expiresAt.toLocaleString()}</strong>.</p>
            <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 0;">If you believe this was a mistake, please reply directly to this email to contact our moderation team.</p>
          </div>
          <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #94a3b8;">&copy; ${new Date().getFullYear()} PeerVerse. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  });

  return { success: true, suspensionExpiresAt: expiresAt };
};

const banUser = async (userId, moderatorId, reason) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  await db.transaction(async (tx) => {
    await tx.insert(userActions).values({
      userId,
      actionType: "ban",
      reason,
      issuedById: moderatorId,
    });

    await tx.update(users).set({ isBanned: true }).where(eq(users.id, userId));
  });

  await sendEmail({
    to: user.email,
    subject: "Your Account Has Been Permanently Banned",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfcfc; color: #0f172a; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; text-align: left; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="padding: 30px; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #0f172a; font-weight: 800; letter-spacing: -0.5px;">Peer<span style="color: #6366f1;">Verse</span></h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="margin-top: 0; font-size: 20px; color: #ef4444; font-weight: 700;">Account Permanently Banned</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">Your account on PeerVerse has been permanently banned.</p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-size: 15px; color: #991b1b;"><strong>Reason for Ban:</strong><br>${reason}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">This action is permanent and cannot be undone due to severe or repeated violations of our community guidelines.</p>
          </div>
          <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #94a3b8;">&copy; ${new Date().getFullYear()} PeerVerse. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  });

  return { success: true };
};

const getAnalytics = async () => {
  const [
    [{ totalUsers }],
    [{ totalResources }],
    [{ totalQuestions }],
    [{ totalBlogs }],
    [{ pendingReports }],
    [{ bannedUsers }]
  ] = await Promise.all([
    db.select({ totalUsers: count() }).from(users).where(eq(users.isBanned, false)),
    db.select({ totalResources: count() }).from(resources).where(eq(resources.isDeleted, false)),
    db.select({ totalQuestions: count() }).from(questions).where(eq(questions.isDeleted, false)),
    db.select({ totalBlogs: count() }).from(posts).where(eq(posts.isDeleted, false)),
    db.select({ pendingReports: count() }).from(reports).where(eq(reports.status, "pending")),
    db.select({ bannedUsers: count() }).from(users).where(eq(users.isBanned, true))
  ]);

  return {
    totalUsers,
    totalResources,
    totalQuestions,
    totalBlogs,
    pendingReports,
    bannedUsers
  };
};

const listUsers = async (query) => {
  const { search, page = 1, limit: lim = 20 } = query;
  const { limit, offset, meta } = paginate({ page, limit: lim });

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(users.name, `%${search}%`),
        ilike(users.username, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        role: users.role,
        isBanned: users.isBanned,
        suspensionExpiresAt: users.suspensionExpiresAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ totalCount: count() }).from(users).where(where),
  ]);

  return {
    data: rows,
    pagination: meta(totalCount),
  };
};

const getUserHistory = async (userId) => {
  const actions = await db
    .select({
      id: userActions.id,
      actionType: userActions.actionType,
      reason: userActions.reason,
      durationDays: userActions.durationDays,
      createdAt: userActions.createdAt,
      issuedByName: users.name,
    })
    .from(userActions)
    .leftJoin(users, eq(userActions.issuedById, users.id))
    .where(eq(userActions.userId, userId))
    .orderBy(desc(userActions.createdAt));

  return actions;
};

const createModerator = async ({ name, username, email, password }) => {
  // Check existence
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1);

  if (existing.length > 0) {
    throw new AppError("Email or username already in use", 400, "ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [newMod] = await db.insert(users).values({
    name,
    username,
    email,
    passwordHash,
    role: "moderator",
    isVerified: true, // auto-verified
  }).returning({
    id: users.id,
    name: users.name,
    username: users.username,
    email: users.email,
    role: users.role,
  });

  return newMod;
};

const updateUserRole = async (userId, newRole) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  if (user.role === "admin") throw new AppError("Cannot change admin role", 403, "FORBIDDEN");
  
  await db.update(users).set({ role: newRole }).where(eq(users.id, userId));
  
  await notificationService.create({
    recipientId: userId,
    actorId: null, // System notification
    type: "moderation_alert",
    targetType: "user",
    targetId: userId,
    targetTitle: `Role Updated to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`,
  }).catch(() => {});
  
  return { id: userId, role: newRole };
};

const toggleFeatureContent = async (type, id, moderatorId) => {
  const table = getTargetTable(type);
  if (!table) throw new AppError("Invalid content type for featuring", 400, "INVALID_TARGET");

  const [content] = await db.select().from(table).where(eq(table.id, id)).limit(1);
  if (!content) throw new AppError("Content not found", 404, "NOT_FOUND");
  
  const newStatus = !content.isFeatured;
  
  await db.update(table).set({ isFeatured: newStatus }).where(eq(table.id, id));
  
  return { id, isFeatured: newStatus };
};

const getFeaturedContent = async () => {
  // We'll fetch featured resources, questions, and posts and merge them
  const [featuredResources, featuredQuestions, featuredBlogs] = await Promise.all([
    db.select({ id: resources.id, title: resources.title, type: sql`'resource'` }).from(resources).where(eq(resources.isFeatured, true)),
    db.select({ id: questions.id, title: questions.title, type: sql`'question'` }).from(questions).where(eq(questions.isFeatured, true)),
    db.select({ id: posts.id, title: posts.title, type: sql`'blog'` }).from(posts).where(eq(posts.isFeatured, true)),
  ]);

  return [...featuredResources, ...featuredQuestions, ...featuredBlogs];
};

const createOpportunity = async (data) => {
  const [opp] = await db.insert(opportunities).values({
    ...data,
    source: "OTHER",
    sourceId: `admin-${Date.now()}`,
    moderationStatus: "APPROVED",
  }).returning();
  return opp;
};

const updateOpportunity = async (id, data) => {
  const [opp] = await db.update(opportunities)
    .set({ ...data, updatedAt: new Date(), isEdited: true })
    .where(eq(opportunities.id, id))
    .returning();
  
  if (!opp) throw new AppError("Opportunity not found", 404, "NOT_FOUND");
  return opp;
};

const deleteOpportunity = async (id, moderatorId) => {
  const [opp] = await db.update(opportunities)
    .set({ isDeleted: true, deletedById: moderatorId, deletedAt: new Date() })
    .where(eq(opportunities.id, id))
    .returning();
    
  if (!opp) throw new AppError("Opportunity not found", 404, "NOT_FOUND");
  return { success: true };
};

module.exports = {
  listReports,
  updateReportStatus,
  removeContent,
  warnUser,
  suspendUser,
  banUser,
  getAnalytics,
  listUsers,
  getUserHistory,
  createModerator,
  updateUserRole,
  toggleFeatureContent,
  getFeaturedContent,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
};
