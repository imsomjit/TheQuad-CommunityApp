"use strict";

const { eq, and, sql, desc } = require("drizzle-orm");
const { db } = require("../../db/index");
const { follows, users } = require("../../db/schema/index");
const AppError = require("../../utils/AppError");
const notificationService = require("../notifications/notifications.service");

const followUser = async (followerId, targetUsername) => {
  // Find target user
  const [target] = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(eq(users.username, targetUsername))
    .limit(1);

  if (!target) throw new AppError("User not found", 404, "NOT_FOUND");
  if (target.id === followerId) {
    throw new AppError("You cannot follow yourself", 400, "INVALID_ACTION");
  }

  // Insert — DB unique constraint prevents double-follows
  await db
    .insert(follows)
    .values({ followerId, followingId: target.id })
    .onConflictDoNothing();

  // Notify target
  await notificationService
    .create({
      recipientId: target.id,
      actorId: followerId,
      type: "follow",
      targetType: "user",
      targetId: followerId,
      targetTitle: null,
    })
    .catch(() => {});

  return { following: true };
};

const unfollowUser = async (followerId, targetUsername) => {
  const [target] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, targetUsername))
    .limit(1);

  if (!target) throw new AppError("User not found", 404, "NOT_FOUND");

  await db
    .delete(follows)
    .where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, target.id))
    );

  return { following: false };
};

const isFollowing = async (followerId, followingId) => {
  const [row] = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
    .limit(1);
  return !!row;
};

const getFollowers = async (username) => {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  return db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
      college: users.college,
      branch: users.branch,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followingId, user.id))
    .orderBy(desc(follows.createdAt));
};

const getFollowing = async (username) => {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  return db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
      college: users.college,
      branch: users.branch,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followingId, users.id))
    .where(eq(follows.followerId, user.id))
    .orderBy(desc(follows.createdAt));
};

module.exports = { followUser, unfollowUser, isFollowing, getFollowers, getFollowing };
