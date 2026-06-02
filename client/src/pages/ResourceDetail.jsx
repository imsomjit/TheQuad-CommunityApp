import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Download,
    Bookmark,
    Flag,
    Edit3,
    Trash2,
    FileText,
    BookOpen,
    ClipboardList,
    Sparkles,
    Folder,
    Calendar,
    Lock,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import VoteButtons from "../components/VoteButtons";
import TagBadge from "../components/TagBadge";
const RESOURCE_TYPES = [
  { key: "notes", label: "Notes", icon: "BookOpen" },
  { key: "pyq", label: "PYQ", icon: "FileText" },
  { key: "assignment", label: "Assignment", icon: "ClipboardList" },
  { key: "cheatsheet", label: "Cheat Sheet", icon: "Sparkles" },
  { key: "other", label: "Other", icon: "Folder" },
];
import CommentSection from "../components/CommentSection";
import { toast } from "sonner";

const ICONS = { BookOpen, FileText, ClipboardList, Sparkles, Folder };

const TYPE_VAR = {
    notes: "--syntax-mint",
    pyq: "--syntax-cyan",
    assignment: "--syntax-violet",
    cheatsheet: "--syntax-amber",
    other: "--ink-2",
};

function format(ts) {
    return new Date(ts).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function timeAgo(ts) {
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
}

export default function ResourceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        resources,
        bookmarks,
        toggleBookmark,
        currentUser,
        deleteResource,
        incrementViews,
    } = useApp();
    const { isAuthenticated } = useAuth();

    const resource = resources.find((r) => r.id === id);

    useEffect(() => {
        if (resource) incrementViews("resource", id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!resource) {
        return (
            <div className="py-20 text-center">
                <p className="font-display text-2xl text-ink">Resource not found</p>
                <Link to="/resources" className="mt-2 inline-block text-accent">
                    ← back to resources
                </Link>
            </div>
        );
    }

    const type =
        RESOURCE_TYPES.find((t) => t.key === resource.type) || RESOURCE_TYPES[4];
    const Icon = ICONS[type.icon] || Folder;
    const colorVar = `var(${TYPE_VAR[resource.type] || "--ink-2"})`;

    const isMine = resource.uploader.id === currentUser.id;
    const isBookmarked = bookmarks.has(resource.id);

    const handleDownload = () => {
        if (!isAuthenticated) {
            toast.error("Please log in to download resources");
            navigate("/login");
            return;
        }
        toast.success("Download started", { description: resource.file.name });
    };

    const handleBookmark = () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        toggleBookmark(resource.id);
    };

    const handleDelete = () => {
        if (window.confirm("Delete this resource? This cannot be undone.")) {
            deleteResource(resource.id);
            navigate("/resources");
            toast.success("Resource deleted");
        }
    };

    return (
        <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link
                to="/resources"
                data-testid="back-to-resources"
                className="mb-6 inline-flex items-center gap-1 text-sm text-ink-2 transition-colors hover:text-accent"
            >
                <ArrowLeft className="h-4 w-4" />
                all resources
            </Link>

            <article className="space-y-6">
                <header className="border-b-2 border-double border-rule pb-8">
                    <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
                        &sect;02 &middot; the library
                    </p>

                    <h1 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
                        {resource.title}
                    </h1>

                    <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">
                        <span
                            className="inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1"
                            style={{ color: colorVar, borderColor: colorVar }}
                        >
                            <Icon className="h-3 w-3" />
                            {type.label}
                        </span>

                        <span>{resource.subject}</span>
                        <span className="text-ink-3/60">·</span>
                        <span>{resource.college}</span>
                        <span className="text-ink-3/60">·</span>
                        <span>{resource.branch} · Sem {resource.semester}</span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 font-mono text-xs text-ink-3">
                        <Calendar className="h-3.5 w-3.5" />
                        uploaded {format(resource.created_at)}
                        {resource.updated_at !== resource.created_at && (
                            <> · updated {timeAgo(resource.updated_at)}</>
                        )}
                    </div>
                </header>

                {/* Action bar */}
                <div className="flex flex-wrap items-center gap-3 rounded-sm border border-rule bg-paper-2/50 p-4">
                    <VoteButtons
                        kind="resource"
                        id={resource.id}
                        upvotes={resource.upvotes}
                        downvotes={resource.downvotes}
                        layout="horizontal"
                        size="md"
                    />

                    <div className="h-8 w-px bg-rule" />

                    <button
                        onClick={handleDownload}
                        data-testid="download-resource-btn"
                        className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-3 py-2 text-sm font-medium text-paper transition-all hover:brightness-110 active:scale-95"
                    >
                        {isAuthenticated ? (
                            <Download className="h-4 w-4" />
                        ) : (
                            <Lock className="h-4 w-4" />
                        )}
                        {isAuthenticated ? "Download" : "Login to Download"}
                    </button>

                    <button
                        onClick={handleBookmark}
                        data-testid="bookmark-detail-btn"
                        className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-2 text-sm font-medium transition-colors ${isBookmarked
                                ? "border-accent bg-accent-soft text-accent"
                                : "border-rule bg-paper-2 text-ink-2 hover:border-ink-3 hover:text-ink"
                            }`}
                    >
                        <Bookmark
                            className="h-4 w-4"
                            fill={isBookmarked ? "currentColor" : "none"}
                        />
                        {isBookmarked ? "Saved" : "Save"}
                    </button>

                    <button
                        data-testid="report-resource-btn"
                        onClick={() =>
                            toast.info("Reported. Thanks for keeping the library clean.")
                        }
                        className="ml-auto inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm text-ink-2 transition-colors hover:text-syntax-rose"
                    >
                        <Flag className="h-3.5 w-3.5" />
                        Report
                    </button>

                    {isMine && (
                        <>
                            <Link
                                to={`/upload?edit=${resource.id}`}
                                className="inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                                Edit
                            </Link>

                            <button
                                data-testid="delete-resource-btn"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm text-ink-2 transition-colors hover:text-syntax-rose"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                            </button>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Stat label="views" value={resource.views.toLocaleString()} />
                    <Stat label="downloads" value={resource.downloads.toLocaleString()} />
                    <Stat
                        label="bookmarks"
                        value={resource.bookmarks?.toLocaleString() || "0"}
                    />
                </div>

                {/* File preview */}
                <div className="flex items-center gap-4 rounded-sm border border-rule bg-paper-2/40 p-5">
                    <div
                        className="flex h-14 w-14 items-center justify-center rounded-sm border"
                        style={{ borderColor: colorVar, color: colorVar }}
                    >
                        <FileText className="h-7 w-7" strokeWidth={1.5} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-sm text-ink">
                            {resource.file.name}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-ink-3">
                            {resource.file.size}
                            {resource.file.pages && <> · {resource.file.pages} pages</>}
                        </p>
                    </div>
                </div>

                <section className="space-y-3">
                    <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                        // description
                    </h2>

                    <div className="prose-dev">
                        <p>{resource.description}</p>
                    </div>
                </section>

                <div className="flex flex-wrap gap-1.5">
                    {resource.tags.map((t) => (
                        <TagBadge key={t}>{t}</TagBadge>
                    ))}
                </div>

                <div className="flex items-center gap-3 rounded-sm border border-rule bg-paper-2/40 p-4">
                    <Link to={`/pv/${resource.uploader.username}`}>
                        <img
                            src={resource.uploader.avatar}
                            alt=""
                            className="h-12 w-12 rounded-sm border border-rule object-cover"
                        />
                    </Link>

                    <div className="flex-1">
                        <Link
                            to={`/pv/${resource.uploader.username}`}
                            className="font-semibold text-ink transition-colors hover:text-accent"
                        >
                            {resource.uploader.name}
                        </Link>
                        <p className="font-mono text-xs text-ink-3">
                            @{resource.uploader.username}
                        </p>
                    </div>
                </div>

                <CommentSection
                    targetType="resource"
                    targetId={parseInt(resource.id) || resource.id}
                />
            </article>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="rounded-sm border border-rule bg-paper-2/40 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-3">
                {label}
            </div>
            <div className="mt-1 font-display text-2xl font-bold tabular-nums text-ink">
                {value}
            </div>
        </div>
    );
}
