import React from "react";
import { Link } from "react-router-dom";
import {
    Bell,
    CheckCheck,
    MessageCircle,
    ArrowUp,
    MessageSquare,
    PartyPopper,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { useApp } from "../context/AppContext";
import { getAvatarFallback } from "../utils/fallbacks";

function formatRel(ts) {
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;

    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
}

const iconFor = (notification) => {
    if (notification.targetType === "birthday") {
        return PartyPopper;
    }
    
    switch (notification.type) {
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
    if (!notification.type) return "#";
    if (notification.type === "system_broadcast" || notification.type === "system_welcome" || notification.type === "follow") {
        return "#"; // Or could link to a dedicated page
    }
    if (notification.type.includes("resource")) {
        return `/resources/${notification.targetId}`;
    }

    return `/questions/${notification.targetId}`;
};

export default function NotificationDropdown({ children }) {
    const {
        notifications,
        markNotifRead,
        markAllNotifsRead,
        clearAllNotifs,
        unreadCount,
    } = useApp();

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                data-testid="notifications-dropdown"
                className="w-[380px] overflow-hidden border border-rule bg-paper p-0 shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-rule px-4 py-3">
                    <div className="flex items-baseline gap-2">
                        <span className="font-display text-base font-semibold text-ink">
                            Notifications
                        </span>

                        {unreadCount > 0 && (
                            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    {unreadCount > 0 ? (
                        <button
                            data-testid="mark-all-read-btn"
                            onClick={markAllNotifsRead}
                            className="flex items-center gap-1 text-xs text-ink-2 transition-colors hover:text-accent"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                        </button>
                    ) : (
                        <button
                            onClick={clearAllNotifs}
                            className="flex items-center gap-1 text-xs text-ink-2 transition-colors hover:text-red-500"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Clear all
                        </button>
                    )}
                </div>

                <div className="max-h-[440px] overflow-y-auto">
                    {notifications.length === 0 && (
                        <div className="px-4 py-12 text-center text-sm text-ink-3">
                            You're all caught up.
                        </div>
                    )}

                    {notifications.map((notification) => {
                        const Icon = iconFor(notification);

                        return (
                            <Link
                                key={notification.id}
                                to={linkFor(notification)}
                                onClick={() => markNotifRead(notification.id)}
                                data-testid={`notification-item-${notification.id}`}
                                className={`flex gap-3 border-b border-rule/60 px-4 py-3 transition-colors hover:bg-paper-2 ${!notification.read ? "bg-accent-soft/40" : ""
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={notification.actor?.avatar || getAvatarFallback(notification.actor?.name, notification.actor?.username)}
                                        alt={notification.actor?.name || ""}
                                        className="h-9 w-9 rounded-sm border border-rule object-cover bg-paper"
                                    />

                                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-paper bg-paper-2">
                                        <Icon className="h-3 w-3 text-accent" />
                                    </div>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm leading-snug text-ink-2">
                                        {notification.titleOverride ? (
                                            <span className="font-semibold text-accent">
                                                {notification.titleOverride}
                                            </span>
                                        ) : (
                                            <span className="font-semibold text-ink">
                                                {notification.actor?.name || "Someone"}
                                            </span>
                                        )}{" "}
                                        <span>{notification.text}</span>
                                    </p>

                                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-3">
                                        {notification.target}
                                    </p>

                                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">
                                        {formatRel(notification.createdAt)}
                                    </p>
                                </div>

                                {!notification.read && (
                                    <span className="pulse-dot h-2 w-2 self-center rounded-full bg-accent" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="border-t border-rule px-4 py-2 text-center">
                    <Link to="/notifications" className="text-xs text-ink-3 transition-colors hover:text-ink">
                        View all activity
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
