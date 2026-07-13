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
  notificationsApi,
  bookmarksApi,
  settingsApi,
  getAccessToken,
  API_BASE,
  mapNotification,
} from "../services/api";
import ReportModal from "../components/ReportModal";


const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};

export function AppProvider({ children }) {
  const { user: currentUser, isAuthenticated } = useAuth();

  const [resources, setResources] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [votes, setVotes] = useState({});
  const [siteSettings, setSiteSettings] = useState(null);
  const [apiLoaded, setApiLoaded] = useState(false);

  // Global report modal state
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    targetType: "",
    targetId: null,
    targetTitle: "",
  });

  // ── Fetch real data ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const promises = [
          resourcesApi.list({ sort: "newest", limit: 20 }),
          questionsApi.list({ sort: "newest", limit: 20 }),
          settingsApi.get()
        ];

        if (isAuthenticated && getAccessToken()) {
          promises.push(notificationsApi.list({ page: 1, limit: 20 }));
          promises.push(bookmarksApi.list("resource"));
          promises.push(bookmarksApi.list("blog"));
          promises.push(bookmarksApi.list("book"));
          promises.push(votesApi.list());
        }

        const results = await Promise.allSettled(promises);

        if (results[0].status === "fulfilled") {
          setResources(results[0].value.data);
        }
        if (results[1].status === "fulfilled") {
          setQuestions(results[1].value.data);
        }
        if (results[2].status === "fulfilled") {
          setSiteSettings(results[2].value);
        }
        
        if (isAuthenticated && getAccessToken()) {
          if (results[3] && results[3].status === "fulfilled") {
            setNotifications(results[3].value.data);
          }
          
          const newBookmarks = new Set();
          if (results[4] && results[4].status === "fulfilled") {
            results[4].value.forEach(id => newBookmarks.add(`resource:${id}`));
          }
          if (results[5] && results[5].status === "fulfilled") {
            results[5].value.forEach(id => newBookmarks.add(`blog:${id}`));
          }
          if (results[6] && results[6].status === "fulfilled") {
            results[6].value.forEach(id => newBookmarks.add(`book:${id}`));
          }
          setBookmarks(newBookmarks);

          if (results[7] && results[7].status === "fulfilled") {
            const userVotes = {};
            results[7].value.forEach(v => {
              userVotes[`${v.targetType}_${v.targetId}`] = v.direction;
            });
            setVotes(userVotes);
          }
        }
        
        setApiLoaded(true);
      } catch (error) {
        console.error("Failed to load app data", error);
        setResources([]);
        setQuestions([]);
        setApiLoaded(true);
      }
    };

    load();
  }, [isAuthenticated]);

  // ── Server-Sent Events (SSE) ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !getAccessToken()) return;

    let eventSource;
    let reconnectTimeout;

    const connectSSE = () => {
      const token = getAccessToken();
      const url = token ? `${API_BASE}/notifications/stream?token=${token}` : `${API_BASE}/notifications/stream`;
      
      eventSource = new EventSource(url, {
        withCredentials: true,
      });

      eventSource.addEventListener("connected", (e) => {
        // Just log connection, unreadCount is computed dynamically
        if (import.meta.env.DEV) {
          console.log("SSE connected!");
        }
      });

      eventSource.addEventListener("notification", (e) => {
        try {
          const rawNotif = JSON.parse(e.data);
          const newNotif = mapNotification(rawNotif);
          
          // Add to notifications list safely
          setNotifications((prev) => {
            // Prevent duplicates
            if (prev.find((n) => n.id === newNotif.id)) return prev;
            
            return [newNotif, ...prev];
          });

        } catch (err) {
          console.error("SSE notification parse error", err);
        }
      });

      eventSource.onerror = (error) => {
        if (import.meta.env.DEV) {
          console.error("SSE connection error", error);
        }
        eventSource.close();
        reconnectTimeout = setTimeout(connectSSE, 5000); // Reconnect after 5s
      };
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
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
        votesApi.cast({ targetType: kind, targetId: id, direction }).catch(() => {
          // Rollback on failure
          setVotes((prev) => ({ ...prev, [key]: existing }));
          const revD = { upvotes: -(d.upvotes || 0), downvotes: -(d.downvotes || 0) };

          if (kind === "resource") {
            setResources((rs) => rs.map((r) => r.id === id ? { ...r, upvotes: (r.upvotes || 0) + revD.upvotes, downvotes: (r.downvotes || 0) + revD.downvotes } : r));
          } else if (kind === "question") {
            setQuestions((qs) => qs.map((q) => q.id === id ? { ...q, upvotes: (q.upvotes || 0) + revD.upvotes, downvotes: (q.downvotes || 0) + revD.downvotes } : q));
          } else if (kind === "answer") {
            setQuestions((qs) => qs.map((q) => ({
              ...q,
              answers: (q.answers || []).map((a) => a.id === id ? { ...a, upvotes: (a.upvotes || 0) + revD.upvotes, downvotes: (a.downvotes || 0) + revD.downvotes } : a),
            })));
          }
        });
      }
    },
    [votes, isAuthenticated]
  );

  // ── Bookmarks ──────────────────────────────────────────────────────────────
  const toggleBookmark = useCallback(
    async (id, targetType = "resource") => {
      const key = `${targetType}:${id}`;
      // Optimistic
      setBookmarks((prev) => {
        const next = new Set(prev);
        const isAdding = !next.has(key);
        
        if (isAdding) next.add(key);
        else next.delete(key);
        
        // Optimistically update resource bookmark count
        if (targetType === "resource") {
            setResources(rs => rs.map(r => r.id === id ? { ...r, bookmarks: (r.bookmarks || 0) + (isAdding ? 1 : -1) } : r));
        }
        
        return next;
      });

      if (isAuthenticated) {
        bookmarksApi.toggle({ targetType, targetId: id }).catch(() => {
          // Rollback
          setBookmarks((prev) => {
            const next = new Set(prev);
            const isAdding = !next.has(key); // If it doesn't have it now, it means we tried to delete it and failed, so add it back
            if (isAdding) next.add(key);
            else next.delete(key);
            
            if (targetType === "resource") {
                setResources(rs => rs.map(r => r.id === id ? { ...r, bookmarks: (r.bookmarks || 0) + (isAdding ? 1 : -1) } : r));
            }
            return next;
          });
        });
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

      return null;
    },
    [isAuthenticated]
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
      if (!isAuthenticated) return;
      
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
    },
    [isAuthenticated]
  );

  // ── Questions ──────────────────────────────────────────────────────────────
  const addQuestion = useCallback(
    async (data) => {
      if (!isAuthenticated) return;

      const q = await questionsApi.create(data);
      setQuestions((qs) => [q, ...qs]);
      return q;
    },
    [isAuthenticated]
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
      if (isAuthenticated) {
        await questionsApi.delete(id);
      }
      setQuestions((qs) => qs.filter((q) => q.id !== id));
    },
    [isAuthenticated]
  );

  const fetchQuestion = useCallback(
    async (id) => {
      try {
        const fullQuestion = await questionsApi.get(id);
        setQuestions((qs) => {
          const exists = qs.find(q => q.id === fullQuestion.id);
          if (exists) {
            return qs.map(q => q.id === fullQuestion.id ? fullQuestion : q);
          }
          return [...qs, fullQuestion];
        });
        return fullQuestion;
      } catch (err) {
        console.error("Failed to fetch question", err);
        return null;
      }
    },
    []
  );

  const addAnswer = useCallback(
    async (questionId, body) => {
      if (!isAuthenticated) return;

      const answer = await questionsApi.addAnswer(questionId, body);
      setQuestions((qs) =>
        qs.map((q) =>
          q.id === questionId ? { ...q, answers: [...(q.answers || []), answer] } : q
        )
      );
      return answer;
    },
    [isAuthenticated]
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

  const incrementLocalViews = useCallback((kind, id) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (kind === "question") {
      setQuestions((qs) =>
        qs.map((q) => (q.id === numericId ? { ...q, views: (q.views || 0) + 1 } : q))
      );
    } else if (kind === "resource") {
      setResources((rs) =>
        rs.map((r) => (r.id === numericId ? { ...r, views: (r.views || 0) + 1 } : r))
      );
    }
  }, []);

  const incrementDownloads = useCallback((kind, id) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (kind === "resource") {
      setResources((rs) =>
        rs.map((r) => (r.id === numericId ? { ...r, downloads: (r.downloads || 0) + 1 } : r))
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

  const clearAllNotifs = useCallback(async () => {
    setNotifications([]);
    if (isAuthenticated) notificationsApi.clearAll().catch(() => {});
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const openReportModal = useCallback((targetType, targetId, targetTitle) => {
    setReportModal({
      isOpen: true,
      targetType,
      targetId,
      targetTitle,
    });
  }, []);

  const closeReportModal = useCallback(() => {
    setReportModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = useMemo(
    () => ({
      currentUser,
      resources,
      questions,
      notifications,
      bookmarks,
      votes,
      siteSettings,
      setSiteSettings,
      unreadCount,
      apiLoaded,
      voteOn,
      toggleBookmark,
      addResource,
      updateResource,
      deleteResource,
      addCommentToResource,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      fetchQuestion,
      addAnswer,
      acceptAnswer,
      incrementLocalViews,
      incrementDownloads,
      markNotifRead,
      markAllNotifsRead,
      clearAllNotifs,
      openReportModal,
      closeReportModal,
    }),
    [
      currentUser,
      resources,
      questions,
      notifications,
      bookmarks,
      votes,
      siteSettings,
      setSiteSettings,
      unreadCount,
      apiLoaded,
      voteOn,
      toggleBookmark,
      addResource,
      updateResource,
      deleteResource,
      addCommentToResource,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      fetchQuestion,
      addAnswer,
      acceptAnswer,
      incrementLocalViews,
      incrementDownloads,
      markNotifRead,
      markAllNotifsRead,
      clearAllNotifs,
      openReportModal,
      closeReportModal,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <ReportModal 
        isOpen={reportModal.isOpen} 
        onClose={closeReportModal} 
        targetType={reportModal.targetType} 
        targetId={reportModal.targetId} 
        targetTitle={reportModal.targetTitle} 
      />
    </AppContext.Provider>
  );
}
