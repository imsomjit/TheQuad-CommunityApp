"use strict";

// Barrel export — import everything from here so drizzle-kit sees one schema file
const { users, userRoleEnum } = require("./users");
const { resources, resourceTags, resourceTypeEnum } = require("./resources");
const { questions, questionTags } = require("./questions");
const { answers } = require("./answers");
const { comments, commentTargetEnum } = require("./comments");
const { votes, voteTargetEnum, voteDirectionEnum } = require("./votes");
const { bookmarks, bookmarkTargetEnum } = require("./bookmarks");
const { follows } = require("./follows");
const { notifications, notificationTypeEnum } = require("./notifications");
const {
  reports,
  reportReasonEnum,
  reportStatusEnum,
  reportTargetEnum,
} = require("./reports");
const { refreshTokens } = require("./refresh_tokens");

module.exports = {
  // Tables
  users,
  resources,
  resourceTags,
  questions,
  questionTags,
  answers,
  comments,
  votes,
  bookmarks,
  follows,
  notifications,
  reports,
  refreshTokens,

  // Enums
  userRoleEnum,
  resourceTypeEnum,
  commentTargetEnum,
  voteTargetEnum,
  voteDirectionEnum,
  bookmarkTargetEnum,
  notificationTypeEnum,
  reportReasonEnum,
  reportStatusEnum,
  reportTargetEnum,
};
