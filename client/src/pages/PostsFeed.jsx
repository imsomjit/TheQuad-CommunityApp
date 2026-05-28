import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PenLine, Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { postsApi } from "../services/api";
import PostCard, { CATEGORY_META } from "../components/PostCard";
import { useApp } from "../context/AppContext";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "top", label: "Top Voted" },
  { value: "trending", label: "Trending" },
];

const CATEGORY_TABS = [
  { value: "", label: "All Posts" },
  { value: "dsa_editorial", label: "DSA" },
  { value: "interview_experience", label: "Interviews" },
  { value: "learning_journal", label: "Journals" },
  { value: "project_breakdown", label: "Projects" },
];

export default function PostsFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useApp();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Controlled filter state from URL
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "latest";
  const tag = searchParams.get("tag") || "";
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const [searchInput, setSearchInput] = useState(q);
  const [tagInput, setTagInput] = useState(tag);

  const setParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page"); // reset page on filter change
      return next;
    });
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { sort, page, limit: 12 };
      if (category) params.category = category;
      if (tag) params.tag = tag;
      if (q) params.q = q;

      const result = await postsApi.list(params);
      setPosts(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [category, sort, tag, q, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Debounced search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setParam("q", searchInput);
    setParam("tag", tagInput);
  };

  const clearFilters = () => {
    setSearchInput("");
    setTagInput("");
    setSearchParams({});
  };

  const hasActiveFilters = category || tag || q;

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-2">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
            §05 · knowledge
          </p>
          <h1 className="mt-1 font-display text-4xl leading-tight text-ink">
            Published <span className="font-display-italic text-accent">Posts</span>
          </h1>
          <p className="mt-2 text-sm text-ink-2">
            DSA editorials, interview experiences, learning journals, and project breakdowns
          </p>
        </div>

        {currentUser && (
          <Link
            to="/posts/new"
            className="flex shrink-0 items-center gap-2 rounded-sm bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/80"
          >
            <PenLine className="h-4 w-4" />
            Write
          </Link>
        )}
      </div>

      {/* Category tabs */}
      <div className="mt-8 flex items-center gap-0 overflow-x-auto border-b border-rule pb-0 scrollbar-none">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setParam("category", tab.value)}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors
              ${category === tab.value
                ? "text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent"
                : "text-ink-2 hover:text-ink"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar: search + sort + filters */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search posts…"
              className="h-9 w-full rounded-sm border border-rule bg-paper-2/40 pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex h-9 items-center gap-1.5 rounded-sm border px-3 text-sm transition-colors
              ${showFilters ? "border-accent/60 bg-accent/5 text-accent" : "border-rule text-ink-2 hover:border-ink-3 hover:text-ink"}`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
          <button
            type="submit"
            className="h-9 rounded-sm bg-ink px-4 text-sm font-medium text-paper hover:bg-ink/80"
          >
            Search
          </button>
        </form>

        {/* Sort dropdown */}
        <div className="relative flex shrink-0 items-center gap-2">
          <span className="font-mono text-[10px] text-ink-3">Sort:</span>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="h-9 rounded-sm border border-rule bg-paper-2/40 px-2 pr-7 text-sm text-ink focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Extended filters panel */}
      {showFilters && (
        <div className="mt-3 rounded-sm border border-rule bg-paper-2/40 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase text-ink-3">Tag</label>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value.toLowerCase().replace(/\s/g, "-"))}
                placeholder="e.g. dynamic-programming"
                className="h-8 w-48 rounded-sm border border-rule bg-paper px-2 text-sm text-ink placeholder:text-ink-3 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleSearch}
              className="rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-ink/80"
            >
              Apply
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-ink-3 hover:text-ink"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] text-ink-3">Active:</span>
          {category && (
            <FilterChip
              label={CATEGORY_META[category]?.label || category}
              onRemove={() => setParam("category", "")}
            />
          )}
          {tag && <FilterChip label={`#${tag}`} onRemove={() => setParam("tag", "")} />}
          {q && <FilterChip label={`"${q}"`} onRemove={() => { setSearchInput(""); setParam("q", ""); }} />}
        </div>
      )}

      {/* Content */}
      <div className="mt-8">
        {loading ? (
          <PostsGrid>
            {Array(6).fill(0).map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </PostsGrid>
        ) : error ? (
          <div className="rounded-sm border border-rule bg-paper-2/40 p-10 text-center">
            <p className="text-sm text-ink-2">{error}</p>
            <button
              onClick={fetchPosts}
              className="mt-3 text-sm text-accent hover:underline"
            >
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState category={category} currentUser={currentUser} />
        ) : (
          <>
            <PostsGrid>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </PostsGrid>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setParam("page", String(page - 1))}
                  className="rounded-sm border border-rule px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="font-mono text-xs text-ink-3">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setParam("page", String(page + 1))}
                  className="rounded-sm border border-rule px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PostsGrid({ children }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 rounded-sm border border-rule bg-paper-2 px-2 py-0.5 font-mono text-[10px] text-ink-2">
      {label}
      <button onClick={onRemove} className="ml-0.5 text-ink-3 hover:text-ink">
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

function PostSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-rule bg-paper p-5">
      <div className="h-5 w-24 animate-pulse rounded-sm bg-paper-2" />
      <div className="h-6 w-full animate-pulse rounded-sm bg-paper-2" />
      <div className="h-4 w-3/4 animate-pulse rounded-sm bg-paper-2" />
      <div className="h-4 w-1/2 animate-pulse rounded-sm bg-paper-2" />
      <div className="mt-2 flex gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-4 w-16 animate-pulse rounded-sm bg-paper-2" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ category, currentUser }) {
  const cat = CATEGORY_META[category];
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-rule border-dashed bg-paper py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-rule bg-paper-2">
        <PenLine className="h-6 w-6 text-ink-3" />
      </div>
      <p className="mt-4 font-display text-xl text-ink">
        {cat ? `No ${cat.label} posts yet` : "No posts yet"}
      </p>
      <p className="mt-2 max-w-sm text-sm text-ink-2">
        {currentUser
          ? "Be the first to share your knowledge with the community."
          : "Log in to be the first to write a post."}
      </p>
      {currentUser && (
        <Link
          to="/posts/new"
          className="mt-5 flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/80"
        >
          <PenLine className="h-4 w-4" />
          Write a post
        </Link>
      )}
    </div>
  );
}
