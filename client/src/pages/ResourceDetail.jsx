import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Download,
    Bookmark,
    Flag,
    MessageCircle,
    Edit3,
    Trash2,
    FileText,
    BookOpen,
    ClipboardList,
    Sparkles,
    Folder,
    Calendar,
    Send,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import VoteButtons from "../components/VoteButtons";
import TagBadge from "../components/TagBadge";
import { RESOURCE_TYPES } from "../data/mockData";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

const ICONS = {
    BookOpen,
    FileText,
    ClipboardList,
    Sparkles,
    Folder,
};

const TYPE_COLORS = {
    notes: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    pyq: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    assignment: "text-violet-400 bg-violet-500/10 border-violet-500/30",
    cheatsheet: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    other: "text-zinc-300 bg-zinc-800 border-zinc-700",
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
        addCommentToResource,
        deleteResource,
        incrementViews,
    } = useApp();

    const resource = resources.find((r) => r.id === id);
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (resource) incrementViews("resource", id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!resource) {
        return (
            <div className="text-center py-20">
                <p className="font-display text-2xl text-zinc-300">
                    Resource not found
                </p>
                <Link
                    to="/resources"
                    className="text-emerald-400 mt-2 inline-block"
                >
                    ← back to resources
                </Link>
            </div>
        );
    }

    const type =
        RESOURCE_TYPES.find((t) => t.key === resource.type) ||
        RESOURCE_TYPES[4];

    const Icon = ICONS[type.icon] || Folder;

    const isMine = resource.uploader.id === currentUser.id;
    const isBookmarked = bookmarks.has(resource.id);

    const handleComment = (e) => {
        e.preventDefault();

        if (!comment.trim()) return;

        addCommentToResource(resource.id, comment.trim());
        setComment("");
        toast.success("Comment posted");
    };

    const handleDownload = () => {
        toast.success("Download started", {
            description: resource.file.name,
        });
    };

    const handleDelete = () => {
        if (window.confirm("Delete this resource? This cannot be undone.")) {
            deleteResource(resource.id);
            navigate("/resources");
            toast.success("Resource deleted");
        }
    };

    return (
        <div className="max-w-5xl mx-auto fade-in-up">
            {/* Back Button */}
            <Link
                to="/resources"
                data-testid="back-to-resources"
                className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-emerald-400 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                all resources
            </Link>

            <article className="space-y-6">
                {/* Header */}
                <header className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span
                            className={`inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded border ${TYPE_COLORS[resource.type]}`}
                        >
                            <Icon className="w-3 h-3" />
                            {type.label}
                        </span>

                        <span className="font-mono text-xs text-zinc-500">
                            {resource.subject}
                        </span>

                        <span className="text-zinc-700">·</span>

                        <span className="font-mono text-xs text-zinc-500">
                            {resource.college}
                        </span>

                        <span className="text-zinc-700">·</span>

                        <span className="font-mono text-xs text-zinc-500">
                            {resource.branch} · Sem {resource.semester}
                        </span>
                    </div>

                    <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 leading-tight">
                        {resource.title}
                    </h1>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        uploaded {format(resource.created_at)}
                        {resource.updated_at !== resource.created_at && (
                            <> · updated {timeAgo(resource.updated_at)}</>
                        )}
                    </div>
                </header>

                {/* Action Bar */}
                <div className="flex items-center gap-3 flex-wrap p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg">
                    <VoteButtons
                        kind="resource"
                        id={resource.id}
                        upvotes={resource.upvotes}
                        downvotes={resource.downvotes}
                        layout="horizontal"
                        size="md"
                    />

                    <div className="h-8 w-px bg-zinc-800" />

                    <button
                        onClick={handleDownload}
                        data-testid="download-resource-btn"
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium text-zinc-950 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>

                    <button
                        onClick={() => toggleBookmark(resource.id)}
                        data-testid="bookmark-detail-btn"
                        className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium border transition-colors ${isBookmarked
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                            }`}
                    >
                        <Bookmark
                            className="w-4 h-4"
                            fill={isBookmarked ? "currentColor" : "none"}
                        />
                        {isBookmarked ? "Saved" : "Save"}
                    </button>

                    <button
                        data-testid="report-resource-btn"
                        onClick={() =>
                            toast.info(
                                "Reported. Thanks for keeping the library clean."
                            )
                        }
                        className="ml-auto inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm text-zinc-400 hover:text-rose-400 transition-colors"
                    >
                        <Flag className="w-3.5 h-3.5" />
                        Report
                    </button>

                    {isMine && (
                        <>
                            <Link
                                to={`/upload?edit=${resource.id}`}
                                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                            </Link>

                            <button
                                data-testid="delete-resource-btn"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm text-zinc-400 hover:text-rose-400 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </button>
                        </>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <Stat label="views" value={resource.views.toLocaleString()} />
                    <Stat
                        label="downloads"
                        value={resource.downloads.toLocaleString()}
                    />
                    <Stat
                        label="bookmarks"
                        value={resource.bookmarks?.toLocaleString() || "0"}
                    />
                </div>

                {/* File Preview */}
                <div className="p-5 border border-zinc-800 rounded-lg bg-gradient-to-br from-zinc-900/80 to-zinc-950 flex items-center gap-4">
                    <div className="w-14 h-16 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <FileText
                            className="w-7 h-7 text-emerald-400"
                            strokeWidth={1.5}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-zinc-50 truncate">
                            {resource.file.name}
                        </p>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">
                            {resource.file.size}
                            {resource.file.pages && (
                                <> · {resource.file.pages} pages</>
                            )}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <section className="space-y-3">
                    <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
            // description
                    </h2>

                    <div className="prose-dev">
                        <p>{resource.description}</p>
                    </div>
                </section>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                    {resource.tags.map((t) => (
                        <TagBadge key={t}>#{t}</TagBadge>
                    ))}
                </div>

                {/* Uploader */}
                <div className="flex items-center gap-3 p-4 border border-zinc-800 rounded-lg bg-zinc-900/40">
                    <Link to={`/u/${resource.uploader.username}`}>
                        <img
                            src={resource.uploader.avatar}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover border border-zinc-800"
                        />
                    </Link>

                    <div className="flex-1">
                        <Link
                            to={`/u/${resource.uploader.username}`}
                            className="font-semibold text-zinc-50 hover:text-emerald-400 transition-colors"
                        >
                            {resource.uploader.name}
                        </Link>

                        <p className="font-mono text-xs text-zinc-500">
                            @{resource.uploader.username}
                        </p>
                    </div>
                </div>

                {/* Comments */}
                <section className="space-y-4">
                    <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5" />
            // comments ({resource.comments?.length || 0})
                    </h2>

                    <form
                        onSubmit={handleComment}
                        className="flex flex-col gap-2"
                    >
                        <Textarea
                            data-testid="comment-input"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Leave a thoughtful comment..."
                            className="bg-zinc-950 border-zinc-800 text-sm placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/30 min-h-[80px]"
                        />

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                data-testid="post-comment-btn"
                                disabled={!comment.trim()}
                                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                            >
                                <Send className="w-3.5 h-3.5" />
                                Post
                            </button>
                        </div>
                    </form>

                    <ul className="space-y-3">
                        {(resource.comments || []).map((c) => (
                            <li
                                key={c.id}
                                className="flex gap-3 p-4 border border-zinc-800 rounded-lg bg-zinc-900/30"
                            >
                                <img
                                    src={c.author.avatar}
                                    alt=""
                                    className="w-9 h-9 rounded-full object-cover"
                                />

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-semibold text-zinc-50">
                                            {c.author.name}
                                        </span>
                                        <span className="font-mono text-xs text-zinc-600">
                                            · {timeAgo(c.created_at)}
                                        </span>
                                    </div>

                                    <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                                        {c.text}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </article>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/40">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                {label}
            </div>
            <div className="font-display text-2xl font-bold text-zinc-50 tabular-nums mt-1">
                {value}
            </div>
        </div>
    );
}