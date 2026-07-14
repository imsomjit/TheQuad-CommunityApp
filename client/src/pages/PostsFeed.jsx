import useDocumentTitle from '../hooks/useDocumentTitle';
import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { PenLine, Search, SlidersHorizontal, X, ArrowDownUp } from "lucide-react";
import { postsApi } from "../services/api";
import PostCard, { CATEGORY_META } from "../components/PostCard";
import { PostCardSkeleton } from "../components/Skeletons";
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
  { value: "recommended", label: "Recommended ✨" },
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

export default function PostsFeed({ inExplore = false }) {
  useDocumentTitle("Posts, Journals, Editorials");
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
      if (!isDesktop && !inExplore) {
          navigate("/explore?tab=posts", { replace: true });
      }
  }, [isDesktop, inExplore, navigate]);


  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Controlled filter state from URL
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || (currentUser ? "recommended" : "latest");
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
      if (tag) params.tag = tag;
      if (q) params.q = q;

      let result;
      if (sort === "recommended") {
        if (!currentUser) {
           setError("Please log in to view recommended posts.");
           setLoading(false);
           return;
        }
        if (category) params.category = category;
        result = await postsApi.recommendations(params);
      } else {
        if (category) params.category = category;
        result = await postsApi.list(params);
      }
      
      setPosts(result.data);
      setPagination(result.pagination);
    } catch (err) {
      if (sort === "recommended") {
        try {
          const fallbackParams = { ...params, sort: "latest" };
          const result = await postsApi.list(fallbackParams);
          setPosts(result.data);
          setPagination(result.pagination);
          return;
        } catch (fallbackErr) {
          setError(fallbackErr.response?.data?.message || "Failed to load posts");
        }
      } else {
        setError(err.response?.data?.message || "Failed to load posts");
      }
    } finally {
      setLoading(false);
    }
  }, [category, sort, tag, q, page, currentUser]);

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

  if (!isDesktop && !inExplore) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Editorial header */}
      <header className="border-b-2 border-double border-rule pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-syntax-violet">
              &sect;04 &middot; the Post
            </p>

            <h1 className="hidden md:inline mt-2 font-display text-5xl md:text-6xl font-medium leading-[1.02] tracking-tight text-ink sm:text-6xl">
              Write. <span className="font-display-italic text-accent">Read. </span>&amp; <span className="italic marker">Inspire. </span>
            </h1>

            <p className="mt-4 max-w-2xl text-md md:text-lg leading-relaxed text-ink-2">
              A constellation of &mdash; DSA editorials, interview experiences, learning journals, and project breakdowns written by learners based on their learnings, experiences and late night sessions.
            </p>
          </div>

          {currentUser && (
            <Link
              to="/posts/new"
              className="hidden md:inline-flex items-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-paper transition-all hover:brightness-110 active:scale-95"
            >
              <PenLine className="h-4 w-4" />
              Write a Post
            </Link>
          )}
        </div>
      </header>

      {/* Filter bar */}
      <div className="space-y-4 rounded-md border border-rule bg-paper-2/40 p-5">
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
              className="h-10 rounded-md border-rule bg-paper pl-9 text-sm text-ink placeholder:text-ink-3 focus-visible:border-accent/60 focus-visible:ring-accent/30"
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
              placeholder="Filter by tag..."
              className="h-10 w-full rounded-md border-rule bg-paper px-3 text-sm text-ink placeholder:text-ink-3 focus-visible:border-accent/60 focus-visible:ring-accent/30"
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
            {Array(3).fill(0).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </PostsGrid>
        ) : error ? (
          <div className="rounded-md border border-rule bg-paper-2/40 p-10 text-center">
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
                  className="rounded-md border border-rule px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="font-mono text-xs text-ink-3">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setParam("page", String(page + 1))}
                  className="rounded-md border border-rule px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink disabled:pointer-events-none disabled:opacity-40"
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {children}
    </div>
  );
}

function FilterSelect({ value, setValue, options, placeholder, testId, icon: Icon }) {
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger
        data-testid={testId}
        className="h-10 rounded-md border-rule bg-paper text-sm text-ink hover:border-ink-3"
      >
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="h-3.5 w-3.5 text-ink-3 shrink-0" />}
          <div className="truncate"><SelectValue placeholder={placeholder} /></div>
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
    <span className="inline-flex items-center gap-1.5 rounded-md border border-accent bg-accent-soft px-2 py-1 font-mono text-xs text-accent">
      {children}
      <button onClick={onRemove} className="transition-colors hover:text-syntax-rose">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}



function EmptyState({ category, currentUser }) {
  const cat = CATEGORY_META[category];
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-rule border-dashed bg-paper py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-md border border-rule bg-paper-2">
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
          className="mt-5 flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/80"
        >
          <PenLine className="h-4 w-4" />
          Write a post
        </Link>
      )}
    </div>
  );
}
