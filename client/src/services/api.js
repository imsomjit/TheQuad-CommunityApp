/**
 * PeerVerse API Service
 *
 * Centralized Axios wrapper with:
 * - Access token injection via interceptor
 * - Silent 401 refresh via refresh-token cookie
 * - Data transformers that convert API camelCase → frontend snake_case shapes
 */

import axios from "axios";
import { getAvatarFallback, getBannerFallback } from "../utils/fallbacks";

// ── Base instance ────────────────────────────────────────────────────────────

export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "https://api-peerverse.onrender.com/api");

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send httpOnly cookie on every request
  headers: { "Content-Type": "application/json" },
});

// ── Token management ─────────────────────────────────────────────────────────
let accessToken = null;
let refreshPromise = null; // single in-flight refresh to avoid races
let authFailureCallback = null; // called instead of hard redirect on auth failure

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

/**
 * Register a callback to invoke when silent refresh fails.
 * AuthContext sets this on mount so we can clear React state
 * instead of doing a full-page reload via window.location.
 */
export const setAuthFailureHandler = (handler) => {
  authFailureCallback = handler;
};

// ── Request interceptor: inject Bearer token ─────────────────────────────────
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Response interceptor: handle 401 → silent refresh ────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Only retry once, and only for 401s that aren't the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh") &&
      !original.url?.includes("/auth/login")
    ) {
      original._retry = true;

      try {
        // Deduplicate concurrent refresh attempts
        if (!refreshPromise) {
          refreshPromise = api.post("/auth/refresh").finally(() => {
            refreshPromise = null;
          });
        }
        const { data } = await refreshPromise;
        setAccessToken(data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        clearAccessToken();
        // Notify AuthContext so React state is cleared and
        // ProtectedRoute handles the redirect — no page reload.
        if (authFailureCallback) {
          authFailureCallback();
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ── Data Transformers ────────────────────────────────────────────────────────
// The API returns camelCase, but the frontend components expect snake_case
// field names from the mock data era. These transforms bridge the gap without
// touching any UI component code.

/** Map an API user object → frontend user shape */
const mapUser = (u) => {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email || "",
    role: u.role || "student",
    // Images
    avatar: u.avatarUrl || u.avatar || getAvatarFallback(u.name, u.username),
    avatarUrl: u.avatarUrl || null,
    bannerUrl: u.bannerUrl || getBannerFallback(u.username),
    // Profile
    bio: u.bio || "",
    location: u.location || "",
    organization: u.organization || "",
    website: u.website || "",
    // Academic
    college: u.college || "",
    branch: u.branch || "",
    graduationYear: u.graduationYear || null,
    semester: u.semester || u.graduationYear || null,
    // Skills
    skills: u.skills || [],
    // Social
    githubUsername: u.githubUsername || u.github_username || "",
    linkedinUrl: u.linkedinUrl || "",
    twitterHandle: u.twitterHandle || "",
    instagramHandle: u.instagramHandle || "",
    leetcodeUsername: u.leetcodeUsername || "",
    // Personal
    gender: u.gender || "other",
    dateOfBirth: u.dateOfBirth || "2000-01-01",
    // Meta
    createdAt: u.createdAt || null,
    stats: u.stats || { resources: 0, questions: 0, answers: 0, followers: 0, following: 0, totalUpvotes: 0 },
    viewerFollows: u.viewerFollows || false,
  };
};

/** Map API resource → frontend resource shape */
const mapResource = (r) => ({
  id: r.id,
  publicId: r.publicId,
  title: r.title,
  description: r.description || "",
  type: r.type,
  file: {
    name: r.fileName || "",
    size: r.fileSize ? `${(r.fileSize / (1024 * 1024)).toFixed(1)} MB` : "N/A",
    pages: r.pages || null,
  },
  fileUrl: r.fileUrl,
  college: r.college || "",
  branch: r.branch || "",
  semester: r.semester || null,
  subject: r.subject || "",
  tags: r.tags || [],
  uploader: r.uploader
    ? {
        id: r.uploader.id || r.uploaderId,
        name: r.uploader.name || r.uploaderName || "",
        username: r.uploader.username || r.uploaderUsername || "",
        avatar: r.uploader.avatarUrl || r.uploader.avatar || r.uploaderAvatarUrl || "",
      }
    : { id: r.uploaderId, name: r.uploaderName || "", username: r.uploaderUsername || "", avatar: r.uploaderAvatarUrl || "" },
  createdAt: r.createdAt || r.created_at,
  updatedAt: r.updatedAt || r.updated_at,
  upvotes: r.upvotes || 0,
  downvotes: r.downvotes || 0,
  views: r.views || 0,
  downloads: r.downloads || 0,
  bookmarks: r.bookmarksCount || 0,
  comments: [], // comments are fetched separately
});

/** Map API question → frontend question shape */
const mapQuestion = (q) => ({
  id: q.id,
  publicId: q.publicId,
  title: q.title,
  body: q.body || "",
  tags: q.tags || [],
  author: q.author
    ? {
        id: q.author.id || q.authorId,
        name: q.author.name || q.authorName || "",
        username: q.author.username || q.authorUsername || "",
        avatar: q.author.avatarUrl || q.author.avatar || q.authorAvatarUrl || "",
      }
    : { id: q.authorId, name: q.authorName || "", username: q.authorUsername || "", avatar: q.authorAvatarUrl || "" },
  createdAt: q.createdAt || q.created_at,
  updatedAt: q.updatedAt || q.updated_at,
  upvotes: q.upvotes || 0,
  downvotes: q.downvotes || 0,
  views: q.views || 0,
  answerCount: q.answerCount || 0,
  answers: (q.answers || []).map(mapAnswer),
});

/** Map API answer → frontend answer shape */
const mapAnswer = (a) => ({
  id: a.id,
  body: a.body || "",
  author: a.author
    ? {
        id: a.author.id || a.authorId,
        name: a.author.name || a.authorName || "",
        username: a.author.username || a.authorUsername || "",
        avatar: a.author.avatarUrl || a.author.avatar || a.authorAvatarUrl || "",
      }
    : { id: a.authorId, name: a.authorName || "", username: a.authorUsername || "", avatar: a.authorAvatarUrl || "" },
  createdAt: a.createdAt || a.created_at,
  updatedAt: a.updatedAt || a.updated_at,
  upvotes: a.upvotes || 0,
  downvotes: a.downvotes || 0,
  accepted: a.isAccepted || a.accepted || false,
  comments: [],
});

/** Map API comment → frontend comment shape */
const mapComment = (c) => ({
  id: c.id,
  authorId: c.authorId || c.author?.id,
  parentId: c.parentId || null,
  author: c.author
    ? {
        id: c.author.id || c.authorId,
        name: c.author.name || c.authorName || "",
        username: c.author.username || c.authorUsername || "",
        avatar: c.author.avatarUrl || c.author.avatar || c.authorAvatarUrl || "",
        avatarUrl: c.author.avatarUrl || c.author.avatar || c.authorAvatarUrl || "",
      }
    : { id: c.authorId, name: "", username: "", avatar: "", avatarUrl: "" },
  body: c.body || c.text || "",
  text: c.body || c.text || "",
  createdAt: c.createdAt || c.created_at,
  replies: (c.replies || []).map(mapComment),
});

/** Derive readable notification text from type */
const notifText = (type) => {
  const map = {
    comment_on_resource: "commented on your resource",
    comment_on_question: "commented on your question",
    comment_on_answer: "commented on your answer",
    upvote_resource: "upvoted your resource",
    upvote_question: "upvoted your question",
    upvote_answer: "upvoted your answer",
    answer_on_question: "answered your question",
    follow: "started following you",
    report_resolved: "your report was resolved",
    content_removed: "your content was removed",
    like_blog: "liked your post",
    comment_on_blog: "commented on your post",
    system_welcome: "Welcome to PeerVerse! Please take a moment to set up your profile.",
    system_broadcast: "sent a notification",
  };
  return map[type] || "interacted with your content";
};

/** Map API notification → frontend notification shape */
const mapNotification = (n) => {
  let titleOverride = null;
  let text = notifText(n.type);
  let target = n.targetTitle || "";

  if (n.type === "system_broadcast") {
    const match = (n.targetTitle || "").match(/^\[(.*?)\] (.*?):\s*(.*)$/);
    if (match) {
      titleOverride = `[${match[1]}] Admin`;
      target = `${match[2]}: ${match[3]}`;
    } else {
      titleOverride = "System Broadcast";
      target = n.targetTitle || "";
    }
  } else if (n.type === "system_welcome") {
    titleOverride = "PeerVerse Team";
  }

  return {
    id: n.id,
    type: n.type,
    actor: n.actor
      ? {
          id: n.actor.id || n.actorId,
          name: n.actor.name || n.actorName || "",
          username: n.actor.username || n.actorUsername || "",
          avatar: n.actor.avatarUrl || n.actor.avatar || n.actorAvatarUrl || "",
        }
      : { id: n.actorId, name: n.actorName || "", username: n.actorUsername || "", avatar: n.actorAvatarUrl || "" },
    text,
    target,
    titleOverride,
    targetId: n.targetId,
    targetType: n.targetType,
    createdAt: n.createdAt || n.created_at,
    read: n.isRead ?? n.read ?? false,
  };
};

// ── API Functions ────────────────────────────────────────────────────────────

// Auth
export const authApi = {
  register: (data) => api.post("/auth/register", data),
  verifyOtp: (data) => api.post("/auth/verify-otp", data),
  resendOtp: (data) => api.post("/auth/resend-otp", data),
  login: (data) => api.post("/auth/login", data),
  refresh: () => api.post("/auth/refresh"),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

// Resources
export const resourcesApi = {
  list: (params) => api.get("/resources", { params }).then((r) => ({
    data: r.data.data.map(mapResource),
    pagination: r.data.pagination,
  })),
  get: (id) => api.get(`/resources/${id}`).then((r) => mapResource(r.data.data)),
  create: (formData) =>
    api.post("/resources", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => mapResource(r.data.data)),
  update: (id, data) => api.patch(`/resources/${id}`, data).then((r) => mapResource(r.data.data)),
  delete: (id) => api.delete(`/resources/${id}`),
  download: (id) => api.post(`/resources/${id}/download`).then((r) => r.data.data.fileUrl),
};

// Questions
export const questionsApi = {
  list: (params) => api.get("/questions", { params }).then((r) => ({
    data: r.data.data.map(mapQuestion),
    pagination: r.data.pagination,
  })),
  get: (id) => api.get(`/questions/${id}`).then((r) => mapQuestion(r.data.data)),
  create: (data) => api.post("/questions", data).then((r) => mapQuestion(r.data.data)),
  update: (id, data) => api.patch(`/questions/${id}`, data).then((r) => mapQuestion(r.data.data)),
  delete: (id) => api.delete(`/questions/${id}`),
  // Answers
  addAnswer: (qId, body) => api.post(`/questions/${qId}/answers`, { body }).then((r) => mapAnswer(r.data.data)),
  updateAnswer: (qId, aId, body) => api.patch(`/questions/${qId}/answers/${aId}`, { body }).then((r) => mapAnswer(r.data.data)),
  deleteAnswer: (qId, aId) => api.delete(`/questions/${qId}/answers/${aId}`),
  acceptAnswer: (qId, aId) => api.post(`/questions/${qId}/answers/${aId}/accept`),
};

// Comments
export const commentsApi = {
  list: (targetType, targetId) =>
    api.get("/comments", { params: { targetType, targetId } }).then((r) => r.data.data.map(mapComment)),
  add: (data) => api.post("/comments", data).then((r) => mapComment(r.data.data)),
  delete: (id) => api.delete(`/comments/${id}`),
};

// Votes
export const votesApi = {
  cast: (data) => api.post("/votes", data).then((r) => r.data.data),
};

// Bookmarks
export const bookmarksApi = {
  toggle: (data) => api.post("/bookmarks", data).then((r) => r.data.data),
  list: (targetType = "resource") =>
    api.get("/bookmarks", { params: { targetType } }).then((r) => r.data.data),
};

// Follows (deprecated — use usersApi.follow/unfollow below)

// Notifications
export const notificationsApi = {
  list: (params) =>
    api.get("/notifications", { params }).then((r) => ({
      data: r.data.data.map(mapNotification),
      unreadCount: r.data.unreadCount,
      pagination: r.data.pagination,
    })),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  clearAll: () => api.delete("/notifications/clear-all"),
};

// Users
export const usersApi = {
  getProfile: (username) => api.get(`/users/${username}`).then((r) => {
    const u = r.data.data;
    return {
      ...mapUser(u),
      stats: u.stats || {},
      viewerFollows: u.viewerFollows || false,
    };
  }),
  getTopContributors: async () => {
    const { data } = await api.get('/users/top-contributors');
    return data.data;
  },
  updateProfile: (data) => api.patch("/users/me", data).then((r) => mapUser(r.data.data)),
  uploadAvatar: (formData) =>
    api.patch("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => mapUser(r.data.data)),
  uploadBanner: (formData) =>
    api.patch("/users/me/banner", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => mapUser(r.data.data)),
  follow: (username) => api.post(`/users/${username}/follow`).then((r) => r.data.data),
  unfollow: (username) => api.delete(`/users/${username}/follow`).then((r) => r.data.data),
  getFollowers: (username) => api.get(`/users/${username}/followers`).then((r) => r.data.data),
  getFollowing: (username) => api.get(`/users/${username}/following`).then((r) => r.data.data),
};

// Reports
export const reportsApi = {
  submit: (data) => api.post("/reports", data),
};

// GitHub (server-side proxy)
export const githubApi = {
  getProfile: (username) =>
    api.get(`/github/${username}`).then((r) => r.data.data),
  getRepos: (username, params) =>
    api.get(`/github/${username}/repos`, { params }).then((r) => r.data.data),
  getLanguages: (username) =>
    api.get(`/github/${username}/languages`).then((r) => r.data.data),
  getActivity: (username, params) =>
    api.get(`/github/${username}/activity`, { params }).then((r) => r.data.data),
  getContributions: (username) =>
    api.get(`/github/${username}/contributions`).then((r) => r.data.data),
};

/** Map an API post → frontend post shape */
const mapPost = (p) => ({
  id: p.id,
  publicId: p.publicId,
  title: p.title,
  slug: p.slug,
  body: p.body || "",
  renderedHtml: p.renderedHtml || "",
  excerpt: p.excerpt || "",
  coverImageUrl: p.coverImageUrl || null,
  category: p.category,
  categoryMeta: p.categoryMeta || {},
  status: p.status,
  authorId: p.authorId,
  readingTimeMin: p.readingTimeMin || 1,
  upvotes: p.upvotes || 0,
  downvotes: p.downvotes || 0,
  views: p.views || 0,
  bookmarksCount: p.bookmarksCount || 0,
  seriesId: p.seriesId || null,
  seriesOrder: p.seriesOrder || null,
  seriesNav: p.seriesNav || null,
  publishedAt: p.publishedAt || null,
  createdAt: p.createdAt || p.created_at,
  updatedAt: p.updatedAt || p.updated_at,
  author: p.author
    ? {
        id: p.author.id,
        name: p.author.name || "",
        username: p.author.username || "",
        avatar: p.author.avatarUrl || p.author.avatar || getAvatarFallback(p.author.name, p.author.username),
        bio: p.author.bio || "",
      }
    : null,
  tags: p.tags || [],
});

// Posts (Knowledge Publishing)
export const postsApi = {
  list: (params) =>
    api.get("/posts", { params }).then((r) => ({
      data: r.data.data.map(mapPost),
      pagination: r.data.pagination,
    })),
  drafts: (params) =>
    api.get("/posts/drafts", { params }).then((r) => ({
      data: r.data.data,
      pagination: r.data.pagination,
    })),
  getBySlug: (slug) =>
    api.get(`/posts/${slug}`).then((r) => mapPost(r.data.data)),
  getById: (id) =>
    api.get(`/posts/id/${id}`).then((r) => mapPost(r.data.data)),
  create: (data) =>
    api.post("/posts", data).then((r) => mapPost(r.data.data)),
  update: (id, data) =>
    api.patch(`/posts/${id}`, data).then((r) => mapPost(r.data.data)),
  autosave: (id, data) =>
    api.patch(`/posts/${id}/autosave`, data).then((r) => r.data.data),
  publish: (id) =>
    api.post(`/posts/${id}/publish`).then((r) => mapPost(r.data.data)),
  unpublish: (id) =>
    api.post(`/posts/${id}/unpublish`).then((r) => mapPost(r.data.data)),
  delete: (id) => api.delete(`/posts/${id}`),
  uploadCover: (id, formData) =>
    api.patch(`/posts/${id}/cover`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data),
};

// Series
export const seriesApi = {
  getBySlug: (slug) =>
    api.get(`/series/${slug}`).then((r) => r.data.data),
  listByUser: (userId) =>
    api.get(`/series/user/${userId}`).then((r) => r.data.data),
  create: (data) =>
    api.post("/series", data).then((r) => r.data.data),
  update: (id, data) =>
    api.patch(`/series/${id}`, data).then((r) => r.data.data),
  delete: (id) => api.delete(`/series/${id}`),
  addPost: (seriesId, postId, order) =>
    api.post(`/series/${seriesId}/posts/${postId}`, { order }).then((r) => r.data.data),
  removePost: (postId) =>
    api.delete(`/series/posts/${postId}`),
};

// LeetCode
export const leetcodeApi = {
  getProfileStats: (username) =>
    api.get(`/leetcode/${username}`).then((r) => r.data.data),
};

// Opportunities
export const opportunitiesApi = {
  list: (params) =>
    api.get("/opportunities", { params }).then((r) => ({
      data: r.data.data.data, // Data is in r.data.data.data and pagination in r.data.data.pagination based on standard setup
      pagination: r.data.data.pagination,
    })),
  getBookmarked: (params) =>
    api.get("/opportunities/bookmarked", { params }).then((r) => ({
      data: r.data.data.data,
      pagination: r.data.data.pagination,
    })),
  getById: (id) =>
    api.get(`/opportunities/${id}`).then((r) => r.data.data),
  toggleBookmark: (id) =>
    api.post(`/opportunities/${id}/bookmark`).then((r) => r.data.data),
};

// Admin / Moderation
export const adminApi = {
  getAnalytics: () => api.get("/moderation/analytics").then((r) => r.data.data),
  listUsers: (params) => api.get("/moderation/users", { params }).then((r) => r.data),
  getUserHistory: (id) => api.get(`/moderation/users/${id}/history`).then((r) => r.data.data),
  warnUser: (id, data) => api.post(`/moderation/users/${id}/warn`, data).then((r) => r.data),
  suspendUser: (id, data) => api.post(`/moderation/users/${id}/suspend`, data).then((r) => r.data.data),
  banUser: (id, data) => api.post(`/moderation/users/${id}/ban`, data).then((r) => r.data),
  updateUserRole: (id, role) => api.patch(`/moderation/users/${id}/role`, { role }).then((r) => r.data.data),
  createModerator: (data) => api.post("/moderation/moderators", data).then((r) => r.data.data),
  
  getFeaturedContent: () => api.get("/moderation/featured").then((r) => r.data.data),
  toggleFeatureContent: (type, id) => api.patch(`/moderation/content/${type}/${id}/feature`).then((r) => r.data.data),
  
  createOpportunity: (data) => api.post("/moderation/opportunities", data).then((r) => r.data.data),
  updateOpportunity: (id, data) => api.patch(`/moderation/opportunities/${id}`, data).then((r) => r.data.data),
  deleteOpportunity: (id) => api.delete(`/moderation/opportunities/${id}`).then((r) => r.data.data),
};

// Settings
export const settingsApi = {
  get: () => api.get("/settings").then((r) => r.data),
  update: (data) => api.put("/settings", data).then((r) => r.data),
};

// Broadcasts
export const broadcastsApi = {
  list: () => api.get("/broadcasts").then((r) => r.data),
  schedule: (data) => api.post("/broadcasts", data).then((r) => r.data),
  delete: (id) => api.delete(`/broadcasts/${id}`).then((r) => r.data),
};

export { mapUser, mapResource, mapQuestion, mapAnswer, mapComment, mapNotification, mapPost };
export default api;
