import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PenLine, Search, SlidersHorizontal, X, ArrowDownUp } from "lucide-react";
import { postsApi } from "../services/api";
import PostCard, { CATEGORY_META } from "../components/PostCard";
import { useApp } from "../context/AppContext";

import { Input } from "../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

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
    <div className="space-y-10 fade-in-up">
      {/* Editorial header */}
      <header className="border-b-2 border-double border-rule pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
              &sect;05 &middot; knowledge
            </p>

            <h1 className="mt-2 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl">
              Published <span className="font-display-italic text-accent">Posts</span>,
              <br />
              shared by peers.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-2">
              DSA editorials, interview experiences, learning journals, and project breakdowns.
            </p>
          </div>

          {currentUser && (
            <Link
              to="/posts/new"
              className="inline-flex items-center gap-2 rounded-sm bg-accent px-4 py-3 text-sm font-semibold text-paper transition-all hover:brightness-110 active:scale-95"
            >
              <PenLine className="h-4 w-4" />
              Write a post
            </Link>
          )}
        </div>
      </header>

      {/* Filter bar */}
      <div className="space-y-4 rounded-sm border border-rule bg-paper-2/40 p-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />

            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              placeholder="Search by title, description or tag (press Enter)..."
              className="h-10 rounded-sm border-rule bg-paper pl-9 text-sm text-ink placeholder:text-ink-3 focus-visible:border-accent/60 focus-visible:ring-accent/30"
            />
          </div>

          <div className="hidden items-center gap-2 font-mono text-xs text-ink-3 sm:flex">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            filters
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          <FilterSelect
            testId="filter-category"
            placeholder="Category"
            value={category || "__all__"}
            setValue={(v) => {
              if (v === "__all__") setParam("category", "");
              else setParam("category", v);
            }}
            options={[
              { value: "__all__", label: "All categories" },
              ...CATEGORY_TABS.slice(1).map(c => ({ value: c.value, label: c.label }))
            ]}
          />

          <div className="relative">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value.toLowerCase().replace(/\s/g, "-"))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              placeholder="Filter by tag (press Enter)..."
              className="h-10 w-full rounded-sm border-rule bg-paper px-3 text-sm text-ink placeholder:text-ink-3 focus-visible:border-accent/60 focus-visible:ring-accent/30"
            />
          </div>

          <FilterSelect
            testId="filter-sort"
            placeholder="Sort"
            value={sort}
            setValue={(v) => setParam("sort", v)}
            icon={ArrowDownUp}
            options={SORT_OPTIONS}
          />
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-3">
            <span className="font-mono text-xs text-ink-3">// active filters:</span>

            <div className="flex flex-wrap gap-1.5">
              {category && (
                <Chip onRemove={() => setParam("category", "")}>
                  {CATEGORY_META[category]?.label || category}
                </Chip>
              )}
              {tag && (
                <Chip onRemove={() => { setTagInput(""); setParam("tag", ""); }}>
                  #{tag}
                </Chip>
              )}
              {q && (
                <Chip onRemove={() => { setSearchInput(""); setParam("q", ""); }}>
                  "{q}"
                </Chip>
              )}
            </div>

            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-ink-2 transition-colors hover:text-syntax-rose"
            >
              clear all
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-2">
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

function FilterSelect({ value, setValue, options, placeholder, testId, icon: Icon }) {
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger
        data-testid={testId}
        className="h-10 rounded-sm border-rule bg-paper text-sm text-ink hover:border-ink-3"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 text-ink-3" />}
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>

      <SelectContent className="max-h-[300px] border-rule bg-paper text-ink">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-sm">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-accent bg-accent-soft px-2 py-1 font-mono text-xs text-accent">
      {children}
      <button onClick={onRemove} className="transition-colors hover:text-syntax-rose">
        <X className="h-3 w-3" />
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
