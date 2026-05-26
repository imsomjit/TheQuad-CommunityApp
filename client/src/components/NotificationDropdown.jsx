import React from "react";
import { Link } from "react-router-dom";
import {
    Bell,
    CheckCheck,
    MessageCircle,
    ArrowUp,
    MessageSquare,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { useApp } from "../context/AppContext";

function formatRel(ts) {
    const diff =
        (Date.now() - new Date(ts).getTime()) / 1000;

    if (diff < 60) {
        return `${Math.floor(diff)}s ago`;
    }

    if (diff < 3600) {
        return `${Math.floor(diff / 60)}m ago`;
    }

    if (diff < 86400) {
        return `${Math.floor(diff / 3600)}h ago`;
    }

    return `${Math.floor(diff / 86400)}d ago`;
}

const iconFor = (type) => {
    switch (type) {
        case "comment_on_resource":
            return MessageCircle;

        case "upvote_resource":
            return ArrowUp;

        case "answer_on_question":
            return MessageSquare;

        case "comment_on_answer":
            return MessageCircle;

        default:
            return Bell;
    }
};

const linkFor = (notification) => {
    if (notification.type.includes("resource")) {
        return `/resources/${notification.targetId}`;
    }

    return `/questions/${notification.targetId}`;
};

export default function NotificationDropdown({
    children,
}) {
    const {
        notifications,
        markNotifRead,
        markAllNotifsRead,
        unreadCount,
    } = useApp();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                data-testid="notifications-dropdown"
                className="w-[380px] overflow-hidden border border-zinc-800 bg-zinc-950 p-0 shadow-2xl shadow-black/60"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                    <div className="flex items-baseline gap-2">
                        <span className="font-display font-semibold text-zinc-50">
                            Notifications
                        </span>

                        {unreadCount > 0 && (
                            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    <button
                        data-testid="mark-all-read-btn"
                        onClick={markAllNotifsRead}
                        className="flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-emerald-400"
                    >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Mark all read
                    </button>
                </div>

                {/* Notification List */}
                <div className="max-h-[440px] overflow-y-auto">
                    {notifications.length === 0 && (
                        <div className="px-4 py-12 text-center text-sm text-zinc-500">
                            You're all caught up.
                        </div>
                    )}

                    {notifications.map((notification) => {
                        const Icon = iconFor(
                            notification.type
                        );

                        return (
                            <Link
                                key={notification.id}
                                to={linkFor(notification)}
                                onClick={() =>
                                    markNotifRead(notification.id)
                                }
                                data-testid={`notification-item-${notification.id}`}
                                className={`flex gap-3 border-b border-zinc-900 px-4 py-3 transition-colors hover:bg-zinc-900/60 ${!notification.read
                                        ? "bg-emerald-500/[0.03]"
                                        : ""
                                    }`}
                            >
                                {/* Avatar + Event Icon */}
                                <div className="relative shrink-0">
                                    <img
                                        src={notification.actor.avatar}
                                        alt={notification.actor.name}
                                        className="h-9 w-9 rounded-full object-cover"
                                    />

                                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-900">
                                        <Icon className="h-3 w-3 text-emerald-400" />
                                    </div>
                                </div>

                                {/* Notification Content */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm leading-snug text-zinc-300">
                                        <span className="font-semibold text-zinc-50">
                                            {notification.actor.name}
                                        </span>{" "}
                                        <span className="text-zinc-400">
                                            {notification.text}
                                        </span>
                                    </p>

                                    <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                                        {notification.target}
                                    </p>

                                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                                        {formatRel(
                                            notification.created_at
                                        )}
                                    </p>
                                </div>

                                {/* Unread Dot */}
                                {!notification.read && (
                                    <span className="pulse-dot h-2 w-2 self-center rounded-full bg-emerald-400" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-800 px-4 py-2 text-center">
                    <button className="text-xs text-zinc-500 transition-colors hover:text-zinc-300">
                        View all activity
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}