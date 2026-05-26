import React from "react";
import { Link } from "react-router-dom";
import {
    Eye,
    Download,
    Bookmark,
    MessageCircle,
    FileText,
    BookOpen,
    ClipboardList,
    Sparkles,
    Folder,
} from "lucide-react";

import VoteButtons from "./VoteButtons";
import TagBadge from "./TagBadge";
import { useApp } from "../context/AppContext";
import { RESOURCE_TYPES } from "../data/mockData";

const ICONS = {
    BookOpen,
    FileText,
    ClipboardList,
    Sparkles,
    Folder,
};

const TYPE_COLORS = {
    notes:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    pyq:
        "border-blue-500/30 bg-blue-500/10 text-blue-400",
    assignment:
        "border-violet-500/30 bg-violet-500/10 text-violet-400",
    cheatsheet:
        "border-amber-500/30 bg-amber-500/10 text-amber-400",
    other:
        "border-zinc-700 bg-zinc-800 text-zinc-300",
};

function timeAgo(ts) {
    const diff =
        (Date.now() - new Date(ts).getTime()) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600)
        return `${Math.floor(diff / 60)}m`;
    if (diff < 86400)
        return `${Math.floor(diff / 3600)}h`;
    if (diff < 86400 * 30)
        return `${Math.floor(diff / 86400)}d`;

    return `${Math.floor(
        diff / (86400 * 30)
    )}mo`;
}

export default function ResourceCard({
    resource,
    variant = "list",
}) {
    const { bookmarks, toggleBookmark } =
        useApp();

    const type =
        RESOURCE_TYPES.find(
            (t) => t.key === resource.type
        ) || RESOURCE_TYPES[4];

    const Icon =
        ICONS[type.icon] || Folder;

    const isBookmarked =
        bookmarks.has(resource.id);

    return (
        <article
            data-testid={`resource-card-${resource.id}`}
            className="group relative flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80"
        >
            {/* Left rail: votes */}
            <div className="hidden flex-col items-center gap-2 pt-1 sm:flex">
                <VoteButtons
                    kind="resource"
                    id={resource.id}
                    upvotes={resource.upvotes}
                    downvotes={resource.downvotes}
                    size="sm"
                />
            </div>

            {/* Main content */}
            <div className="min-w-0 flex-1">
                {/* Metadata */}
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${TYPE_COLORS[resource.type]
                            }`}
                    >
                        <Icon className="h-3 w-3" />
                        {type.label}
                    </span>

                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                        {resource.subject}
                    </span>

                    <span className="text-zinc-700">
                        ·
                    </span>

                    <span className="text-[10px] font-mono text-zinc-500">
                        {resource.college} · sem{" "}
                        {resource.semester}
                    </span>
                </div>

                {/* Title */}
                <Link
                    to={`/resources/${resource.id}`}
                    className="block"
                >
                    <h3
                        data-testid={`resource-title-${resource.id}`}
                        className="font-display text-lg font-semibold leading-snug text-zinc-50 transition-colors group-hover:text-emerald-400"
                    >
                        {resource.title}
                    </h3>
                </Link>

                {/* Description */}
                {variant !== "compact" && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                        {resource.description}
                    </p>
                )}

                {/* Tags */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {resource.tags
                        .slice(0, 4)
                        .map((tag) => (
                            <TagBadge key={tag}>
                                #{tag}
                            </TagBadge>
                        ))}
                </div>

                {/* Footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    {/* Uploader */}
                    <div className="flex items-center gap-2">
                        <img
                            src={
                                resource.uploader.avatar
                            }
                            alt={
                                resource.uploader.name
                            }
                            className="h-6 w-6 rounded-full object-cover"
                        />

                        <span className="text-xs text-zinc-400">
                            <span className="font-medium text-zinc-200">
                                {
                                    resource.uploader
                                        .name
                                }
                            </span>
                            <span className="text-zinc-600">
                                {" "}
                                ·{" "}
                                {timeAgo(
                                    resource.created_at
                                )}
                            </span>
                        </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 font-mono text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {resource.views}
                        </span>

                        <span className="flex items-center gap-1">
                            <Download className="h-3.5 w-3.5" />
                            {resource.downloads}
                        </span>

                        <span className="flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5" />
                            {resource.comments
                                ?.length || 0}
                        </span>

                        {/* Bookmark */}
                        <button
                            data-testid={`bookmark-resource-${resource.id}`}
                            onClick={() =>
                                toggleBookmark(
                                    resource.id
                                )
                            }
                            aria-label="Bookmark"
                            className={`rounded p-1 transition-colors ${isBookmarked
                                    ? "text-emerald-400"
                                    : "text-zinc-500 hover:text-emerald-400"
                                }`}
                        >
                            <Bookmark
                                className="h-3.5 w-3.5"
                                fill={
                                    isBookmarked
                                        ? "currentColor"
                                        : "none"
                                }
                            />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}