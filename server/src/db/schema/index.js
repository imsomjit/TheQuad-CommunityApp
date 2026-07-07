"use strict";

// Barrel export — import everything from here so drizzle-kit sees one schema file
const { users, userRoleEnum, genderEnum, authProviderEnum } = require("./users");
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
const { userActions, actionTypeEnum } = require("./user_actions");
const {
  posts,
  postTags,
  postCategoryEnum,
  postStatusEnum,
} = require("./posts");
const { series } = require("./series");
const {
  opportunities,
  opportunityBookmarks,
  opportunitySourceEnum,
  opportunityTypeEnum,
  opportunityStatusEnum,
  opportunityModerationStatusEnum,
} = require("./opportunities");
const { siteSettings } = require("./settings");
const { broadcasts, broadcastTypeEnum } = require("./broadcasts");
const { books } = require("./books");
const { contentViews } = require("./content_views");
const { chatRooms, roomTypeEnum, chatRoomsRelations } = require("./chat_rooms");
const { chatMessages, chatMessagesRelations } = require("./chat_messages");
const { chatPins, chatPinsRelations } = require("./chat_pins");

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
  userActions,
  posts,
  postTags,
  series,
  opportunities,
  opportunityBookmarks,
  siteSettings,
  broadcasts,
  books,
  contentViews,
  chatRooms,
  chatMessages,
  chatPins,

  // Relations
  chatRoomsRelations,
  chatMessagesRelations,
  chatPinsRelations,

  // Enums
  userRoleEnum,
  genderEnum,
  authProviderEnum,
  resourceTypeEnum,
  commentTargetEnum,
  voteTargetEnum,
  voteDirectionEnum,
  bookmarkTargetEnum,
  notificationTypeEnum,
  reportReasonEnum,
  reportStatusEnum,
  reportTargetEnum,
  postCategoryEnum,
  postStatusEnum,
  opportunitySourceEnum,
  opportunityTypeEnum,
  opportunityStatusEnum,
  opportunityModerationStatusEnum,
  actionTypeEnum,
  broadcastTypeEnum,
  roomTypeEnum,
};
