import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import {
  resourcesApi,
  questionsApi,
  commentsApi,
  votesApi,
  bookmarksApi,
  notificationsApi,
  getAccessToken,
} from "../services/api";
import {
  CURRENT_USER,
  RESOURCES_SEED,
  QUESTIONS_SEED,
  NOTIFICATIONS_SEED,
} from "../data/mockData";

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};

let commentCounter = 1000;
let answerCounter = 1000;

export function AppProvider({ children }) {
  const { user: authUser, isAuthenticated } = useAuth();

  const [resources, setResources] = useState(RESOURCES_SEED);
  const [questions, setQuestions] = useState(QUESTIONS_SEED);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_SEED);
  const [bookmarks, setBookmarks] = useState(new Set(["r_003"]));
  const [votes, setVotes] = useState({});
  const [apiLoaded, setApiLoaded] = useState(false);

  // Use auth user when logged in, fall back to mock user
  const currentUser = isAuthenticated ? authUser : CURRENT_USER;

  // ── Fetch real data when authenticated ─────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !getAccessToken()) {
      setApiLoaded(false);
      setResources(RESOURCES_SEED);
      setQuestions(QUESTIONS_SEED);
      setNotifications(NOTIFICATIONS_SEED);
      setBookmarks(new Set(["r_003"]));
      return;
    }

    const load = async () => {
      try {
        const [resResult, qResult, notifResult, bookmarkIds] = await Promise.allSettled([
          resourcesApi.list({ sort: "newest", limit: 50 }),
          questionsApi.list({ sort: "newest", limit: 50 }),
          notificationsApi.list({ page: 1, limit: 20 }),
          bookmarksApi.list("resource"),
        ]);

        if (resResult.status === "fulfilled") {
          setResources(resResult.value.data);
        }
        if (qResult.status === "fulfilled") {
          setQuestions(qResult.value.data);
        }
        if (notifResult.status === "fulfilled") {
          setNotifications(notifResult.value.data);
        }
        if (bookmarkIds.status === "fulfilled") {
          setBookmarks(new Set(bookmarkIds.value));
        }
        setApiLoaded(true);
      } catch {
        // Fall back to mock data silently
      }
    };

    load();
  }, [isAuthenticated]);

  // ── SSE for live notifications ─────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !getAccessToken()) return;

    let es;
    try {
      // EventSource doesn't support custom headers, so we use query param
      // Actually for PeerVerse SSE, the server reads Bearer from Authorization header.
      // Standard EventSource can't send headers, so we'll use fetch-based SSE or
      // just poll for now. The SSE endpoint works if accessed via browser with
      // the token in query. For production, use EventSourcePolyfill.
      // For now, let's skip SSE and rely on the fetched notifications.
    } catch {
      // SSE not available
    }

    return () => {
      if (es) es.close();
    };
  }, [isAuthenticated]);

  // ── Voting ─────────────────────────────────────────────────────────────────
  const voteOn = useCallback(
    async (kind, id, direction) => {
      const key = `${kind}_${id}`;
      const existing = votes[key];

      // Optimistic update
      setVotes((prev) => {
        const next = { ...prev };
        if (existing === direction) {
          delete next[key];
        } else {
          next[key] = direction;
        }
        return next;
      });

      const delta = (ex) => {
        if (ex === direction) return direction === "up" ? { upvotes: -1 } : { downvotes: -1 };
        if (ex && ex !== direction) return direction === "up" ? { upvotes: 1, downvotes: -1 } : { upvotes: -1, downvotes: 1 };
        return direction === "up" ? { upvotes: 1 } : { downvotes: 1 };
      };

      const d = delta(existing);

      if (kind === "resource") {
        setResources((rs) =>
          rs.map((r) =>
            r.id === id
              ? { ...r, upvotes: (r.upvotes || 0) + (d.upvotes || 0), downvotes: (r.downvotes || 0) + (d.downvotes || 0) }
              : r
          )
        );
      } else if (kind === "question") {
        setQuestions((qs) =>
          qs.map((q) =>
            q.id === id
              ? { ...q, upvotes: (q.upvotes || 0) + (d.upvotes || 0), downvotes: (q.downvotes || 0) + (d.downvotes || 0) }
              : q
          )
        );
      } else if (kind === "answer") {
        setQuestions((qs) =>
          qs.map((q) => ({
            ...q,
            answers: (q.answers || []).map((a) =>
              a.id === id
                ? { ...a, upvotes: (a.upvotes || 0) + (d.upvotes || 0), downvotes: (a.downvotes || 0) + (d.downvotes || 0) }
                : a
            ),
          }))
        );
      }

      // Fire API call (non-blocking)
      if (isAuthenticated) {
        votesApi.cast({ targetType: kind, targetId: id, direction }).catch(() => {});
      }
    },
    [votes, isAuthenticated]
  );

  // ── Bookmarks ──────────────────────────────────────────────────────────────
  const toggleBookmark = useCallback(
    async (id) => {
      // Optimistic
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });

      if (isAuthenticated) {
        bookmarksApi.toggle({ targetType: "resource", targetId: id }).catch(() => {});
      }
    },
    [isAuthenticated]
  );

  // ── Resources ──────────────────────────────────────────────────────────────
  const addResource = useCallback(
    async (data, file) => {
      if (isAuthenticated && file) {
        const formData = new FormData();
        formData.append("file", file);
        Object.entries(data).forEach(([k, v]) => {
          if (Array.isArray(v)) formData.append(k, v.join(","));
          else if (v != null) formData.append(k, v);
        });
        const resource = await resourcesApi.create(formData);
        setResources((rs) => [resource, ...rs]);
        return resource;
      }

      // Fallback mock
      const id = `r_${Date.now()}`;
      const now = new Date().toISOString();
      const newResource = {
        id,
        ...data,
        uploader: currentUser,
        created_at: now,
        updated_at: now,
        upvotes: 0,
        downvotes: 0,
        views: 0,
        downloads: 0,
        bookmarks: 0,
        comments: [],
      };
      setResources((rs) => [newResource, ...rs]);
      return newResource;
    },
    [currentUser, isAuthenticated]
  );

  const updateResource = useCallback(
    async (id, patch) => {
      if (isAuthenticated) {
        const updated = await resourcesApi.update(id, patch);
        setResources((rs) => rs.map((r) => (r.id === id ? updated : r)));
        return updated;
      }
      setResources((rs) =>
        rs.map((r) => (r.id === id ? { ...r, ...patch, updated_at: new Date().toISOString() } : r))
      );
    },
    [isAuthenticated]
  );

  const deleteResource = useCallback(
    async (id) => {
      if (isAuthenticated) {
        await resourcesApi.delete(id);
      }
      setResources((rs) => rs.filter((r) => r.id !== id));
    },
    [isAuthenticated]
  );

  const addCommentToResource = useCallback(
    async (resourceId, text) => {
      if (isAuthenticated) {
        const comment = await commentsApi.add({
          targetType: "resource",
          targetId: resourceId,
          body: text,
        });
        setResources((rs) =>
          rs.map((r) =>
            r.id === resourceId
              ? { ...r, comments: [...(r.comments || []), comment] }
              : r
          )
        );
        return comment;
      }

      const id = `c_${++commentCounter}`;
      const comment = { id, author: currentUser, text, created_at: new Date().toISOString() };
      setResources((rs) =>
        rs.map((r) =>
          r.id === resourceId
            ? { ...r, comments: [...(r.comments || []), comment] }
            : r
        )
      );
      return comment;
    },
    [currentUser, isAuthenticated]
  );

  // ── Questions ──────────────────────────────────────────────────────────────
  const addQuestion = useCallback(
    async (data) => {
      if (isAuthenticated) {
        const q = await questionsApi.create(data);
        setQuestions((qs) => [q, ...qs]);
        return q;
      }
      const id = `q_${Date.now()}`;
      const now = new Date().toISOString();
      const q = { id, ...data, author: currentUser, created_at: now, views: 0, upvotes: 0, downvotes: 0, answers: [] };
      setQuestions((qs) => [q, ...qs]);
      return q;
    },
    [currentUser, isAuthenticated]
  );

  const updateQuestion = useCallback(
    async (id, patch) => {
      if (isAuthenticated) {
        const updated = await questionsApi.update(id, patch);
        setQuestions((qs) => qs.map((q) => (q.id === id ? updated : q)));
        return updated;
      }
      setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    },
    [isAuthenticated]
  );

  const deleteQuestion = useCallback(
    async (id) => {
      if (isAuthenticated) await questionsApi.delete(id);
      setQuestions((qs) => qs.filter((q) => q.id !== id));
    },
    [isAuthenticated]
  );

  const addAnswer = useCallback(
    async (questionId, body) => {
      if (isAuthenticated) {
        const answer = await questionsApi.addAnswer(questionId, body);
        setQuestions((qs) =>
          qs.map((q) =>
            q.id === questionId ? { ...q, answers: [...(q.answers || []), answer] } : q
          )
        );
        return answer;
      }
      const id = `a_${++answerCounter}`;
      const answer = { id, author: currentUser, body, created_at: new Date().toISOString(), upvotes: 0, downvotes: 0, accepted: false, comments: [] };
      setQuestions((qs) =>
        qs.map((q) =>
          q.id === questionId ? { ...q, answers: [...(q.answers || []), answer] } : q
        )
      );
      return answer;
    },
    [currentUser, isAuthenticated]
  );

  const acceptAnswer = useCallback(
    async (questionId, answerId) => {
      if (isAuthenticated) {
        await questionsApi.acceptAnswer(questionId, answerId);
      }
      setQuestions((qs) =>
        qs.map((q) =>
          q.id === questionId
            ? { ...q, answers: (q.answers || []).map((a) => ({ ...a, accepted: a.id === answerId })) }
            : q
        )
      );
    },
    [isAuthenticated]
  );

  const incrementViews = useCallback((kind, id) => {
    if (kind === "question") {
      setQuestions((qs) =>
        qs.map((q) => (q.id === id ? { ...q, views: (q.views || 0) + 1 } : q))
      );
    } else if (kind === "resource") {
      setResources((rs) =>
        rs.map((r) => (r.id === id ? { ...r, views: (r.views || 0) + 1 } : r))
      );
    }
  }, []);

  // ── Notifications ──────────────────────────────────────────────────────────
  const markNotifRead = useCallback(
    async (id) => {
      setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (isAuthenticated) notificationsApi.markRead(id).catch(() => {});
    },
    [isAuthenticated]
  );

  const markAllNotifsRead = useCallback(async () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    if (isAuthenticated) notificationsApi.markAllRead().catch(() => {});
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Context value ──────────────────────────────────────────────────────────
  const value = useMemo(
    () => ({
      currentUser,
      resources,
      questions,
      notifications,
      bookmarks,
      votes,
      unreadCount,
      voteOn,
      toggleBookmark,
      addResource,
      updateResource,
      deleteResource,
      addCommentToResource,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      addAnswer,
      acceptAnswer,
      incrementViews,
      markNotifRead,
      markAllNotifsRead,
    }),
    [
      currentUser,
      resources,
      questions,
      notifications,
      bookmarks,
      votes,
      unreadCount,
      voteOn,
      toggleBookmark,
      addResource,
      updateResource,
      deleteResource,
      addCommentToResource,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      addAnswer,
      acceptAnswer,
      incrementViews,
      markNotifRead,
      markAllNotifsRead,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}