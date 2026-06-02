import React from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Eye,
  ChevronUp,
  BookOpen,
  Code2,
  Briefcase,
  BookMarked,
  Layers,
} from "lucide-react";
import { generateSlug } from "../utils/slugify";

// ── Category display helpers ─────────────────────────────────────────────────
export const CATEGORY_META = {
  dsa_editorial: {
    label: "DSA Editorial",
    icon: Code2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40",
  },
  interview_experience: {
    label: "Interview Experience",
    icon: Briefcase,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40 border-violet-200/60 dark:border-violet-800/40",
  },
  learning_journal: {
    label: "Learning Journal",
    icon: BookMarked,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40",
  },
  project_breakdown: {
    label: "Project Breakdown",
    icon: Layers,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200/60 dark:border-sky-800/40",
  },
};

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function PostCard({ post, variant = "default" }) {
  const cat = CATEGORY_META[post.category] || CATEGORY_META.dsa_editorial;
  const Icon = cat.icon;
  const isCompact = variant === "compact";

  return (
    <article
      className={`group relative flex flex-col rounded-sm border border-rule bg-paper transition-all duration-200
        hover:border-ink-3/50 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]
        ${isCompact ? "p-4" : "p-5"}`}
    >
      {/* Category badge */}
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.08em] font-medium ${cat.bg} ${cat.color}`}
        >
          <Icon className="h-3 w-3" />
          {cat.label}
        </span>

        {post.seriesOrder && (
          <span className="font-mono text-[10px] text-ink-3">
            Part {post.seriesOrder}
          </span>
        )}
      </div>

      {/* Cover image */}
      {!isCompact && post.coverImageUrl && (
        <Link to={`/posts/${generateSlug(post.title, post.publicId || post.id)}`} className="mt-3 block">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="h-40 w-full rounded-sm object-cover"
            loading="lazy"
          />
        </Link>
      )}

      {/* Title */}
      <Link
        to={`/posts/${generateSlug(post.title, post.publicId || post.id)}`}
        className={`mt-3 block font-display leading-snug text-ink transition-colors group-hover:text-accent
          ${isCompact ? "text-base" : "text-xl"}`}
      >
        {post.title}
      </Link>

      {/* Excerpt */}
      {!isCompact && post.excerpt && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-2">
          {post.excerpt}
        </p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-sm bg-paper-2 px-2 py-0.5 font-mono text-[10px] text-ink-3"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: author + stats */}
      <div className={`mt-4 flex items-center gap-3 ${isCompact ? "mt-3" : ""}`}>
        {post.author && (
          <Link
            to={`/u/${post.author.username}`}
            className="flex min-w-0 items-center gap-2"
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="truncate text-xs font-medium text-ink-2 transition-colors hover:text-ink">
              {post.author.name}
            </span>
          </Link>
        )}

        <div className="ml-auto flex items-center gap-3 text-ink-3">
          {post.readingTimeMin && (
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <Clock className="h-3 w-3" />
              {post.readingTimeMin}m
            </span>
          )}
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <Eye className="h-3 w-3" />
            {post.views?.toLocaleString() || 0}
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <ChevronUp className="h-3 w-3" />
            {post.upvotes || 0}
          </span>
          {post.publishedAt && (
            <span className="font-mono text-[10px]">
              {formatDate(post.publishedAt)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
