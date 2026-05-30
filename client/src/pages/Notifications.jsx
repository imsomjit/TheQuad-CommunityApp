import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  MessageCircle,
  ArrowUp,
  MessageSquare,
  UserPlus,
  Loader2,
  Inbox,
  Filter,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { notificationsApi } from "../services/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { getAvatarFallback } from "../utils/fallbacks";

function formatRel(ts) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const iconFor = (type) => {
  if (type?.includes("comment")) return MessageCircle;
  if (type?.includes("upvote")) return ArrowUp;
  if (type?.includes("answer")) return MessageSquare;
  if (type === "follow") return UserPlus;
  if (type === "system_welcome") return Sparkles;
  return Bell;
};

const linkFor = (notification) => {
  if (notification.type === "system_welcome") return "/settings/profile";
  if (notification.type === "follow") return `/pv/${notification.actor?.username}`;
  if (notification.targetType === "resource" || notification.type?.includes("resource")) {
    return `/resources/${notification.targetId}`;
  }
  return `/questions/${notification.targetId}`;
};

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "unread"

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const result = await notificationsApi.list({ page, limit: 20 });
      setNotifications(result.data);
      setUnreadCount(result.unreadCount);
      setPagination(result.pagination);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [page, isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const displayed = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 fade-in-up">
        <Bell className="h-12 w-12 text-ink-3 mb-4" />
        <h2 className="font-display text-xl font-semibold text-ink">
          Sign in to view notifications
        </h2>
        <p className="mt-2 text-sm text-ink-2">
          You need to be logged in to see your notifications.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-paper glow-btn"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto fade-in-up">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
              // notifications
            </p>
            <h1 className="font-display text-5xl font-bold tracking-tight text-ink flex items-center gap-3">
              <Bell className="h-8 w-8 text-accent-2" />
              Recent <span className="font-display-italic text-accent">Activities</span>,
              {unreadCount > 0 && (
                <span className="font-mono text-sm font-normal text-accent bg-accent-soft px-2.5 py-1 rounded-sm">
                  {unreadCount} new
                </span>
              )}
            </h1>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              data-testid="mark-all-read-page"
              className="flex items-center gap-1.5 text-xs font-medium text-ink-2 hover:text-accent transition-colors border border-rule rounded-sm px-3 py-2 bg-paper-2/60 hover:border-accent/50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </header>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-rule mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            filter === "all"
              ? "border-accent text-accent"
              : "border-transparent text-ink-3 hover:text-ink"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            filter === "unread"
              ? "border-accent text-accent"
              : "border-transparent text-ink-3 hover:text-ink"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          Unread
          {unreadCount > 0 && (
            <span className="font-mono text-[10px] bg-accent text-paper px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-ink-3" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-sm border border-rule bg-paper-2">
            <Inbox className="h-7 w-7 text-ink-3" />
          </div>
          <p className="mt-4 font-display text-lg font-semibold text-ink">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="mt-1 text-sm text-ink-2">
            {filter === "unread"
              ? "You're all caught up!"
              : "When someone interacts with your content, it'll show up here."}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayed.map((notification) => {
            const Icon = iconFor(notification.type);

            return (
              <Link
                key={notification.id}
                to={linkFor(notification)}
                onClick={() => !notification.read && handleMarkRead(notification.id)}
                data-testid={`notification-page-item-${notification.id}`}
                className={`group flex gap-4 rounded-sm border px-5 py-4 transition-all duration-200 hover:bg-paper-2 ${
                  !notification.read
                    ? "border-accent/30 bg-accent-soft/20"
                    : "border-rule/60 bg-transparent hover:border-rule"
                }`}
              >
                {/* Actor avatar */}
                <div className="relative shrink-0">
                  <img
                    src={notification.actor?.avatar || getAvatarFallback(notification.actor?.name, notification.actor?.username)}
                    alt={notification.actor?.name || ""}
                    className="h-10 w-10 rounded-sm border border-rule object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-paper bg-paper-2">
                    <Icon className="h-3 w-3 text-accent" />
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-ink-2">
                    {notification.type === "system_welcome" ? (
                      <span className="font-semibold text-accent">
                        PeerVerse Team
                      </span>
                    ) : (
                      <span className="font-semibold text-ink">
                        {notification.actor?.name || "Someone"}
                      </span>
                    )}{" "}
                    <span>{notification.text}</span>
                  </p>

                  {notification.target && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-3 font-medium">
                      {notification.target}
                    </p>
                  )}

                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">
                    {formatRel(notification.created_at)}
                  </p>
                </div>

                {/* Unread dot */}
                {!notification.read && (
                  <span className="pulse-dot h-2.5 w-2.5 self-center rounded-full bg-accent shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-rule">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-sm border border-rule text-sm text-ink-2 hover:border-ink-3 hover:text-ink disabled:opacity-30 disabled:hover:border-rule disabled:hover:text-ink-2 transition-colors"
          >
            ← Prev
          </button>

          <span className="font-mono text-xs text-ink-3">
            {page} / {pagination.totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="px-4 py-2 rounded-sm border border-rule text-sm text-ink-2 hover:border-ink-3 hover:text-ink disabled:opacity-30 disabled:hover:border-rule disabled:hover:text-ink-2 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
