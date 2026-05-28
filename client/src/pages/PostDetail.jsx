import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ChevronUp, ChevronDown, Bookmark, Share2, Flag, Clock, Eye,
  Edit2, ChevronLeft, ChevronRight, List, Copy, Check,
  Code2, Briefcase, BookMarked, Layers, ExternalLink,
} from "lucide-react";
import { postsApi, votesApi, bookmarksApi, reportsApi } from "../services/api";
import { useApp } from "../context/AppContext";
import { CATEGORY_META } from "../components/PostCard";
import { MarkdownRenderer } from "../components/MarkdownEditor";
import CommentSection from "../components/CommentSection";


// ── Category metadata card ────────────────────────────────────────────────────
function CategoryMetaCard({ category, meta }) {
  if (!meta || Object.keys(meta).length === 0) return null;

  const DIFFICULTY_COLOR = {
    easy: "text-emerald-600",
    medium: "text-amber-600",
    hard: "text-red-600",
  };

  const fields = [];

  if (category === "dsa_editorial") {
    if (meta.platform) fields.push({ label: "Platform", value: meta.platform });
    if (meta.difficulty) fields.push({
      label: "Difficulty",
      value: <span className={`font-semibold capitalize ${DIFFICULTY_COLOR[meta.difficulty]}`}>{meta.difficulty}</span>,
    });
    if (meta.timeComplexity) fields.push({ label: "Time", value: <code className="font-mono text-xs">{meta.timeComplexity}</code> });
    if (meta.spaceComplexity) fields.push({ label: "Space", value: <code className="font-mono text-xs">{meta.spaceComplexity}</code> });
    if (meta.problemLink) fields.push({
      label: "Problem",
      value: <a href={meta.problemLink} target="_blank" rel="noopener" className="flex items-center gap-1 text-accent hover:underline text-sm">View <ExternalLink className="h-3 w-3" /></a>,
    });
  } else if (category === "interview_experience") {
    if (meta.company) fields.push({ label: "Company", value: meta.company });
    if (meta.role) fields.push({ label: "Role", value: meta.role });
    if (meta.experienceLevel) fields.push({ label: "Level", value: <span className="capitalize">{meta.experienceLevel.replace("_", " ")}</span> });
    if (meta.interviewMode) fields.push({ label: "Mode", value: <span className="capitalize">{meta.interviewMode}</span> });
    if (meta.year) fields.push({ label: "Year", value: meta.year });
    if (meta.topicsAsked?.length) fields.push({
      label: "Topics",
      value: (
        <div className="flex flex-wrap gap-1">
          {meta.topicsAsked.map((t) => (
            <span key={t} className="rounded-sm bg-paper px-1.5 py-0.5 font-mono text-[10px] border border-rule">{t}</span>
          ))}
        </div>
      ),
    });
  } else if (category === "learning_journal") {
    if (meta.dayNumber) fields.push({ label: "Day", value: `#${meta.dayNumber}` });
  } else if (category === "project_breakdown") {
    if (meta.techStack?.length) fields.push({
      label: "Stack",
      value: (
        <div className="flex flex-wrap gap-1">
          {meta.techStack.map((t) => (
            <span key={t} className="rounded-sm bg-paper-2 px-1.5 py-0.5 font-mono text-[10px] border border-rule">{t}</span>
          ))}
        </div>
      ),
    });
    if (meta.repoUrl) fields.push({
      label: "Repo",
      value: <a href={meta.repoUrl} target="_blank" rel="noopener" className="flex items-center gap-1 text-accent hover:underline text-sm">GitHub <ExternalLink className="h-3 w-3" /></a>,
    });
    if (meta.liveUrl) fields.push({
      label: "Live",
      value: <a href={meta.liveUrl} target="_blank" rel="noopener" className="flex items-center gap-1 text-accent hover:underline text-sm">Demo <ExternalLink className="h-3 w-3" /></a>,
    });
  }

  if (fields.length === 0) return null;

  const cat = CATEGORY_META[category];
  const Icon = cat?.icon || Code2;

  return (
    <div className={`mb-6 rounded-sm border p-4 ${cat?.bg || "bg-paper-2/40 border-rule"}`}>
      <div className={`mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] font-medium ${cat?.color || "text-ink-3"}`}>
        <Icon className="h-3.5 w-3.5" />
        {cat?.label || category}
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
        {fields.map(({ label, value }) => (
          <div key={label}>
            <dt className="font-mono text-[10px] uppercase text-ink-3">{label}</dt>
            <dd className="mt-0.5 text-sm text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ── Series navigation banner ──────────────────────────────────────────────────
function SeriesNav({ seriesNav }) {
  if (!seriesNav) return null;
  const { series, currentPart, totalParts, prev, next } = seriesNav;

  return (
    <div className="mb-6 rounded-sm border border-rule bg-paper-2/40 p-4">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
        Series · Part {currentPart} of {totalParts}
      </div>
      <Link
        to={`/series/${series.slug}`}
        className="block font-display text-base text-ink transition-colors hover:text-accent"
      >
        {series.title}
      </Link>
      <div className="mt-3 flex gap-3">
        {prev && (
          <Link
            to={`/posts/${prev.slug}`}
            className="flex items-center gap-1.5 rounded-sm border border-rule bg-paper px-3 py-2 text-xs text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="max-w-[120px] truncate">{prev.title}</span>
          </Link>
        )}
        {next && (
          <Link
            to={`/posts/${next.slug}`}
            className="ml-auto flex items-center gap-1.5 rounded-sm border border-rule bg-paper px-3 py-2 text-xs text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
          >
            <span className="max-w-[120px] truncate">{next.title}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Table of contents ─────────────────────────────────────────────────────────
function TableOfContents({ body }) {
  const headings = [];
  const lines = (body || "").split("\n");
  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)/);
    if (m) {
      const level = m[1].length;
      const text = m[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      headings.push({ level, text, id });
    }
  }
  if (headings.length < 2) return null;

  return (
    <div className="sticky top-24 rounded-sm border border-rule bg-paper p-4">
      <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
        <List className="h-3.5 w-3.5" />
        Contents
      </div>
      <nav className="flex flex-col gap-1">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`block truncate text-xs leading-relaxed text-ink-2 transition-colors hover:text-ink
              ${h.level === 3 ? "pl-3" : ""}`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await postsApi.getBySlug(slug);
        setPost(p);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("404");
        } else {
          setError(err.response?.data?.message || "Failed to load post");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleVote = async (direction) => {
    if (!currentUser) { navigate("/login"); return; }
    if (!post) return;
    try {
      const data = await votesApi.cast({ targetType: "blog", targetId: post.id, direction });
      setPost((p) => ({ ...p, upvotes: data.upvotes, downvotes: data.downvotes }));
      setUserVote(data.userVote);
    } catch {}
  };

  const handleBookmark = async () => {
    if (!currentUser) { navigate("/login"); return; }
    if (!post) return;
    try {
      await bookmarksApi.toggle({ targetType: "blog", targetId: post.id });
      setIsBookmarked((b) => !b);
    } catch {}
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  };

  const handleReport = async () => {
    if (!currentUser) { navigate("/login"); return; }
    if (!post) return;
    try {
      await reportsApi.submit({ targetType: "blog", targetId: post.id, reason: "other" });
      alert("Report submitted. Thank you.");
    } catch {}
  };


  // ── Render states ──────────────────────────────────────────────────────────
  if (loading) return <PostDetailSkeleton />;

  if (error === "404" || !post) {
    return (
      <div className="mx-auto max-w-7xl w-full px-4 py-20 text-center sm:px-6 lg:px-2">
        <p className="font-display text-4xl text-ink">404</p>
        <p className="mt-2 text-ink-2">Post not found</p>
        <Link to="/posts" className="mt-5 inline-block text-sm text-accent hover:underline">← Back to posts</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl w-full px-4 py-20 text-center sm:px-6 lg:px-2">
        <p className="text-ink-2">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 text-sm text-accent hover:underline">Retry</button>
      </div>
    );
  }

  const cat = CATEGORY_META[post.category];
  const isAuthor = currentUser?.id === post.authorId;

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-2">
      <div className="flex gap-8 xl:gap-12">
        {/* ── Left vote rail ─────────────────────────────────────────────── */}
        <div className="hidden flex-col items-center gap-3 pt-16 md:flex">
          <div className="sticky top-24 flex flex-col items-center gap-2">
            <button
              onClick={() => handleVote("up")}
              className={`flex h-9 w-9 items-center justify-center rounded-sm border transition-colors
                ${userVote === "up" ? "border-accent bg-accent/10 text-accent" : "border-rule text-ink-2 hover:border-ink-3 hover:text-ink"}`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <span className="font-mono text-sm font-semibold text-ink">
              {(post.upvotes || 0) - (post.downvotes || 0)}
            </span>
            <button
              onClick={() => handleVote("down")}
              className={`flex h-9 w-9 items-center justify-center rounded-sm border transition-colors
                ${userVote === "down" ? "border-red-400 bg-red-50 text-red-500" : "border-rule text-ink-2 hover:border-ink-3 hover:text-ink"}`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>

            <div className="my-1 h-px w-full bg-rule" />

            <button
              onClick={handleBookmark}
              title="Bookmark"
              className={`flex h-9 w-9 items-center justify-center rounded-sm border transition-colors
                ${isBookmarked ? "border-amber-400 bg-amber-50 text-amber-500" : "border-rule text-ink-2 hover:border-ink-3 hover:text-ink"}`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              title="Copy link"
              className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-rule text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
            >
              {shareToast ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
            </button>
            <button
              onClick={handleReport}
              title="Report"
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-rule text-ink-3 transition-colors hover:border-red-300 hover:text-red-400"
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Article content ────────────────────────────────────────────── */}
        <article className="min-w-0 flex-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
            <Link to="/posts" className="hover:text-ink">Posts</Link>
            <span>/</span>
            {cat && <span className={cat.color}>{cat.label}</span>}
          </div>

          {/* Cover image */}
          {post.coverImageUrl && (
            <div className="mt-4 overflow-hidden rounded-sm border border-rule">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="h-56 w-full object-cover sm:h-72"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="mt-5 font-display text-3xl leading-tight text-ink sm:text-4xl">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {post.author && (
              <Link
                to={`/pv/${post.author.username}`}
                className="flex items-center gap-2"
              >
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-ink transition-colors hover:text-accent">
                  {post.author.name}
                </span>
              </Link>
            )}
            <span className="text-ink-3">·</span>
            <span className="flex items-center gap-1 font-mono text-xs text-ink-3">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTimeMin} min read
            </span>
            <span className="flex items-center gap-1 font-mono text-xs text-ink-3">
              <Eye className="h-3.5 w-3.5" />
              {post.views?.toLocaleString()}
            </span>
            {post.publishedAt && (
              <span className="font-mono text-xs text-ink-3">
                {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            )}
            {isAuthor && (
              <Link
                to={`/posts/${post.id}/edit`}
                className="ml-auto flex items-center gap-1.5 rounded-sm border border-rule px-2 py-1 text-xs text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </Link>
            )}
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Link
                  key={t}
                  to={`/posts?tag=${t}`}
                  className="rounded-sm border border-rule bg-paper-2/40 px-2 py-0.5 font-mono text-xs text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}

          {/* Series navigation */}
          {post.seriesNav && (
            <div className="mt-6">
              <SeriesNav seriesNav={post.seriesNav} />
            </div>
          )}

          {/* Category metadata */}
          <div className="mt-6">
            <CategoryMetaCard category={post.category} meta={post.categoryMeta} />
          </div>

          {/* Markdown body — uses shared MarkdownRenderer (theme-adaptive syntax) */}
          <div className="mt-4">
            <MarkdownRenderer>{post.body}</MarkdownRenderer>
          </div>

          {/* Series navigation bottom */}
          {post.seriesNav && (
            <div className="mt-10">
              <SeriesNav seriesNav={post.seriesNav} />
            </div>
          )}

          {/* Mobile action bar */}
          <div className="mt-8 flex items-center gap-3 border-t border-rule pt-5 md:hidden">
            <button onClick={() => handleVote("up")} className={`flex items-center gap-1.5 rounded-sm border px-3 py-2 text-sm transition-colors ${userVote === "up" ? "border-accent bg-accent/10 text-accent" : "border-rule text-ink-2"}`}>
              <ChevronUp className="h-4 w-4" />
              {(post.upvotes || 0) - (post.downvotes || 0)}
            </button>
            <button onClick={handleBookmark} className={`flex items-center gap-1.5 rounded-sm border px-3 py-2 text-sm transition-colors ${isBookmarked ? "border-amber-400 text-amber-500" : "border-rule text-ink-2"}`}>
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              Save
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 rounded-sm border border-rule px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>

          {/* Author card */}
          {post.author && (
            <div className="mt-10 rounded-sm border border-rule bg-paper-2/40 p-5">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">Written by</p>
              <div className="flex items-start gap-4">
                <Link to={`/pv/${post.author.username}`}>
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-12 w-12 rounded-sm object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/pv/${post.author.username}`} className="font-display text-lg text-ink hover:text-accent">
                    {post.author.name}
                  </Link>
                  <p className="font-mono text-xs text-ink-3">@{post.author.username}</p>
                  {post.author.bio && <p className="mt-1.5 text-sm text-ink-2">{post.author.bio}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Comments — threaded */}
          <div className="mt-10">
            <CommentSection
              targetType="blog"
              targetId={post.id}
            />
          </div>
        </article>

        {/* ── Right sidebar: TOC ─────────────────────────────────────────── */}
        <aside className="hidden w-56 shrink-0 xl:block">
          <TableOfContents body={post.body} />
        </aside>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PostDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-2">
      <div className="flex gap-8">
        <div className="hidden w-9 md:block" />
        <div className="flex-1 space-y-4">
          <div className="h-4 w-32 animate-pulse rounded-sm bg-paper-2" />
          <div className="h-10 w-3/4 animate-pulse rounded-sm bg-paper-2" />
          <div className="h-10 w-1/2 animate-pulse rounded-sm bg-paper-2" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-4 w-20 animate-pulse rounded-sm bg-paper-2" />)}
          </div>
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded-sm bg-paper-2" style={{ width: `${60 + Math.random() * 40}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
