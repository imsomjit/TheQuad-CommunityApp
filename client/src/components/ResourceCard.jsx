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

// type → syntax-color variable token (used inline)
const TYPE_VAR = {
    notes: "--syntax-mint",
    pyq: "--syntax-cyan",
    assignment: "--syntax-violet",
    cheatsheet: "--syntax-amber",
    other: "--ink-2",
};

function timeAgo(ts) {
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d`;

    return `${Math.floor(diff / (86400 * 30))}mo`;
}

export default function ResourceCard({ resource, variant = "list" }) {
    const { bookmarks, toggleBookmark } = useApp();

    const type =
        RESOURCE_TYPES.find((t) => t.key === resource.type) ||
        RESOURCE_TYPES[4];

    const Icon = ICONS[type.icon] || Folder;
    const isBookmarked = bookmarks.has(resource.id);
    const colorVar = `var(${TYPE_VAR[resource.type] || "--ink-2"})`;

    return (
        <article
            data-testid={`resource-card-${resource.id}`}
            className="group relative flex gap-4 rounded-sm border border-rule bg-paper-2/50 p-5 transition-all duration-200 hover:border-ink-3 hover:bg-paper-2 card-elevated"
        >
            {/* color stripe (left rail) */}
            <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-[3px] rounded-sm opacity-70 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: colorVar }}
            />

            {/* Vote column */}
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
                <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">
                    <span
                        className="inline-flex items-center gap-1 rounded-sm border px-2 py-0.5"
                        style={{
                            color: colorVar,
                            borderColor: colorVar,
                            backgroundColor: "transparent",
                        }}
                    >
                        <Icon className="h-3 w-3" />
                        {type.label}
                    </span>

                    <span>{resource.subject}</span>
                    <span className="text-ink-3/60">·</span>
                    <span>{resource.college}</span>
                    <span className="text-ink-3/60">·</span>
                    <span>sem {resource.semester}</span>
                </div>

                {/* Title — editorial serif */}
                <Link to={`/resources/${resource.id}`} className="block">
                    <h3
                        data-testid={`resource-title-${resource.id}`}
                        className="font-display text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-accent"
                    >
                        {resource.title}
                    </h3>
                </Link>

                {/* Description */}
                {variant !== "compact" && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-2">
                        {resource.description}
                    </p>
                )}

                {/* Tags */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {resource.tags.slice(0, 4).map((tag) => (
                        <TagBadge key={tag}>{tag}</TagBadge>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-rule/60 pt-3">
                    {/* Uploader */}
                    <div className="flex items-center gap-2">
                        <img
                            src={resource.uploader.avatar}
                            alt={resource.uploader.name}
                            className="h-6 w-6 rounded-sm border border-rule object-cover"
                        />

                        <span className="text-xs text-ink-2">
                            <span className="font-medium text-ink">
                                {resource.uploader.name}
                            </span>{" "}
                            <span className="font-mono text-ink-3">
                                · {timeAgo(resource.created_at)}
                            </span>
                        </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 font-mono text-xs text-ink-3">
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
                            {resource.comments?.length || 0}
                        </span>

                        <button
                            data-testid={`bookmark-resource-${resource.id}`}
                            onClick={() => toggleBookmark(resource.id)}
                            aria-label="Bookmark"
                            className={`rounded-sm p-1 transition-colors ${isBookmarked
                                    ? "text-accent"
                                    : "text-ink-3 hover:text-accent"
                                }`}
                        >
                            <Bookmark
                                className="h-3.5 w-3.5"
                                fill={isBookmarked ? "currentColor" : "none"}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}