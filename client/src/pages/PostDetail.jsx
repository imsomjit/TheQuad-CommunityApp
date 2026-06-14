import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ChevronUp, ChevronDown, Bookmark, Share2, Flag, Clock, Eye,
  Edit2, ChevronLeft, ChevronRight, List, Copy, Check,
  Code2, Briefcase, BookMarked, Layers, ExternalLink, Trash2,
} from "lucide-react";
import { postsApi, votesApi, bookmarksApi, reportsApi, adminApi } from "../services/api";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import { CATEGORY_META } from "../components/PostCard";
import { MarkdownRenderer } from "../components/MarkdownEditor";
import { DetailSkeleton } from "../components/Skeletons";
import { DetailSkeleton } from "../components/Skeletons";
import CommentSection from "../components/CommentSection";
import { useViewTracker } from "../hooks/useViewTracker";


// ── Category metadata card ────────────────────────────────────────────────────
function CategoryMetaCard({ category, meta, variant }) {
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

  if (variant === "sidebar") {
    return (
      <div className="space-y-4">
        <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] font-semibold ${cat?.color || "text-ink-3"}`}>
          <Icon className="h-4 w-4" />
          {cat?.label || category}
        </div>
        <dl className="space-y-3">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <dt className="font-mono text-[10px] uppercase text-ink-3 mb-1">{label}</dt>
              <dd className="text-sm font-medium text-ink leading-tight">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-rule bg-paper-2/30 px-5 py-4">
      <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] font-semibold ${cat?.color || "text-ink-3"}`}>
        <Icon className="h-4 w-4" />
        {cat?.label || category}
      </div>
      <div className="hidden h-5 w-px bg-rule sm:block" />
      <dl className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex items-baseline gap-2">
            <dt className="font-mono text-[10px] uppercase text-ink-3">{label}:</dt>
            <dd className="text-sm font-medium text-ink">{value}</dd>
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
    <div className="rounded-xl border border-rule bg-paper-2/30 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-semibold text-ink">
        <List className="h-4 w-4" />
        Contents
      </div>
      <nav className="flex flex-col gap-2.5">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`block truncate text-[13px] leading-relaxed text-ink-2 transition-colors hover:text-accent
              ${h.level === 3 ? "pl-4 text-ink-3" : "font-medium"}`}
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
  const { currentUser, openReportModal, bookmarks, toggleBookmark } = useApp();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [shareToast, setShareToast] = useState(false);

  const [toc, setToc] = useState([]);
  const [activeHeadingId, setActiveHeadingId] = useState("");

  useViewTracker("post", post?.id);

  const isBookmarked = post ? bookmarks.has(`blog:${post.id}`) : false;

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
  }, [slug, currentUser]);

  const handleVote = async (direction) => {
    if (!currentUser) { navigate("/login"); return; }
    if (!post) return;
    try {
      const data = await votesApi.cast({ targetType: "blog", targetId: post.id, direction });
      setPost((p) => ({ ...p, upvotes: data.upvotes, downvotes: data.downvotes }));
      setUserVote(data.userVote);
    } catch {}
  };

  const handleBookmarkClick = async () => {
    if (!currentUser) { navigate("/login"); return; }
    if (!post) return;
    try {
      await toggleBookmark(post.id, "blog");
    } catch {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || "Check this out",
          url: url
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        if (err.name !== "AbortError") console.error(err);
      }
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      document.body.prepend(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      } catch (error) {
        console.error(error);
      } finally {
        textArea.remove();
      }
    }
  };

  const handleReport = () => {
    if (!currentUser) { navigate("/login"); return; }
    if (!post) return;
    openReportModal("blog", post.id, post.title);
  };

  const isOwner = currentUser?.id === post?.author?.id;
  const isModerator = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  const handleDelete = async () => {
    if (window.confirm("Delete this post?")) {
      try {
        if (isOwner) {
          await postsApi.delete(post.id);
        } else if (isModerator) {
          await adminApi.removeContent("blog", post.id, "Moderator deletion");
        }
        toast.success("Post deleted");
        navigate("/posts");
      } catch (err) {
        toast.error("Failed to delete post");
      }
    }
  };


  // ── Render states ──────────────────────────────────────────────────────────
  if (loading) return <DetailSkeleton />;

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
              onClick={handleBookmarkClick}
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
            {!isOwner && (
              <button
                onClick={handleReport}
                title="Report"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-rule text-ink-3 transition-colors hover:border-red-300 hover:text-red-400"
              >
                <Flag className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Article content ────────────────────────────────────────────── */}
        <article className="min-w-0 flex-1 max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3 mb-6">
            <Link to="/posts" className="hover:text-ink">Posts</Link>
            <span>/</span>
            {cat && <span className={cat.color}>{cat.label}</span>}
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-[3.5rem] font-bold mb-8">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-rule">
            <div className="flex items-center gap-4">
              {post.author && (
                <Link to={`/u/${post.author.username}`}>
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-12 w-12 rounded-full object-cover shadow-sm border border-rule"
                  />
                </Link>
              )}
              <div className="flex flex-col justify-center">
                {post.author && (
                  <div className="flex items-center gap-2">
                    <Link to={`/u/${post.author.username}`} className="text-base font-medium text-ink transition-colors hover:text-accent">
                      {post.author.name}
                    </Link>
                    {isAuthor && (
                      <Link
                        to={`/posts/${post.id}/edit`}
                        className="flex items-center gap-1 rounded-full bg-paper border border-rule px-2 py-0.5 text-[10px] uppercase font-mono tracking-widest text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </Link>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-[13px] text-ink-3 mt-1">
                  {post.publishedAt && (
                    <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  )}
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {post.readingTimeMin} min read
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {post.views?.toLocaleString()} views
                  </span>
                </div>
              </div>
            </div>
            
            {/* Social Share / Bookmark (Desktop Inline) */}
            <div className="hidden md:flex items-center gap-3">
               <button
                 onClick={handleShare}
                 title="Copy link"
                 className="flex h-9 w-9 items-center justify-center rounded-full border border-rule text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
               >
                 {shareToast ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
               </button>
               <button
                 onClick={handleBookmarkClick}
                 title="Bookmark"
                 className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                   isBookmarked ? "border-amber-400 bg-amber-50 text-amber-500" : "border-rule text-ink-2 hover:bg-paper-2 hover:text-ink"
                 }`}
               >
                 <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
               </button>
               {(isOwner || isModerator) && (
                 <button
                   onClick={handleDelete}
                   title="Delete Post"
                   className="flex h-9 w-9 items-center justify-center rounded-full border border-error/20 text-error transition-colors hover:bg-error/10"
                 >
                   <Trash2 className="h-4 w-4" />
                 </button>
               )}
            </div>
          </div>

          {/* Cover image / Banner */}
          {post.coverImageUrl && (
            <figure className="mb-12 overflow-hidden rounded-xl border border-rule shadow-sm">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </figure>
          )}

          {/* Series navigation */}
          {post.seriesNav && (
            <div className="mb-10">
              <SeriesNav seriesNav={post.seriesNav} />
            </div>
          )}

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
            <button onClick={handleBookmarkClick} className={`flex items-center gap-1.5 rounded-sm border px-3 py-2 text-sm transition-colors ${isBookmarked ? "border-amber-400 text-amber-500" : "border-rule text-ink-2"}`}>
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
                <Link to={`/u/${post.author.username}`}>
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-12 w-12 rounded-sm object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/u/${post.author.username}`} className="font-display text-lg text-ink hover:text-accent">
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

        {/* ── Right sidebar: TOC & Meta ────────────────────────────────── */}
        <aside className="hidden w-64 shrink-0 xl:block">
          <div className="sticky top-24 space-y-6">
            <TableOfContents body={post.body} />
            
            {/* Sidebar Tags & Meta Card */}
            {(post.tags?.length > 0 || (post.categoryMeta && Object.keys(post.categoryMeta).length > 0)) && (
              <div className="rounded-xl border border-rule bg-paper-2/30 p-5 shadow-sm">
                {post.categoryMeta && Object.keys(post.categoryMeta).length > 0 && (
                  <div className={post.tags?.length > 0 ? "mb-6 pb-6 border-b border-rule" : ""}>
                    <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-semibold text-ink">
                      <Layers className="h-4 w-4" />
                      Details
                    </div>
                    <CategoryMetaCard category={post.category} meta={post.categoryMeta} variant="sidebar" />
                  </div>
                )}
                
                {post.tags?.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-semibold text-ink">
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((t) => (
                        <Link
                          key={t}
                          to={`/posts?tag=${t}`}
                          className="rounded-md border border-rule bg-paper px-2 py-1 font-mono text-[10px] text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
                        >
                          #{t}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

