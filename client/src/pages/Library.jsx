import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Upload, ArrowDownUp, BookText, Eye, Download, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { booksApi } from "../services/api";
import EmptyPlaceholder from "../components/EmptyPlaceholder";
import { ResourceCardSkeleton } from "../components/Skeletons";
import { Input } from "../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { format } from "date-fns";
import { generateSlug } from "../utils/slugify";
import BookCard from "../components/BookCard";
import { timeAgo } from "../utils/timeAgo";

const ALL = "__all__";

const SORTS = [
    { key: "newest", label: "Newest" },
    { key: "popular", label: "Popular" },
];

export default function Library() {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [q, setQ] = useState("");
    const [subject, setSubject] = useState(ALL);
    const [sort, setSort] = useState("newest");

    const activeSubjects = useMemo(() => Array.from(new Set(books.map(b => b.subject).filter(Boolean))).sort(), [books]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20, sort };
            if (q) params.search = q;
            if (subject !== ALL) params.subject = subject;

            const res = await booksApi.list(params);
            setBooks(res.data);
            setTotalPages(res.pagination.totalPages);
        } catch (error) {
            toast.error("Failed to load books");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, sort, subject, q]);

    return (
        <div className="mx-auto max-w-7xl pb-24 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="border-b-2 border-double border-rule pb-8 mb-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-syntax-mint">
                            &sect;05 &middot; the bookshelf
                        </p>

                        <h1 className="mt-2 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl">
                            Read. <span className="font-display-italic text-accent">Learn.</span> & <span className="italic marker">Grow.</span>
                        </h1>

                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-2">
                            Explore free PDF books and study materials from a wide range of subjects. Discover new topics and prepare for your next exam.
                        </p>
                    </div>

                    {user?.role === "admin" && (
                        <Link
                            to="/admin/books/upload"
                            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-paper transition-all hover:brightness-110 active:scale-95"
                        >
                            <Upload className="h-4 w-4" />
                            Upload Book
                        </Link>
                    )}
                </div>
            </header>

            {/* Filters */}
            <div className="flex flex-col gap-3 mb-8 bg-paper sm:flex-row">
                <div className="relative flex-1 border border-accent-soft rounded-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                    <Input
                        placeholder="Search title, author..."
                        className="pl-9 w-full bg-paper-2 border-transparent focus-visible:ring-accent"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    {q && (
                        <button
                            onClick={() => setQ("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex gap-2 sm:w-auto">
                    <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger className="w-full sm:w-[150px] bg-paper-2 border border-accent-soft rounded-md">
                            <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All Subjects</SelectItem>
                            {activeSubjects.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-[130px] bg-paper-2 border border-accent-soft rounded-md">
                            <div className="flex items-center gap-2">
                                <ArrowDownUp className="h-4 w-4 shrink-0 text-ink-3" />
                                <SelectValue placeholder="Sort" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {SORTS.map((s) => (
                                <SelectItem key={s.key} value={s.key}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Books Grid */}
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(6)].map((_, i) => (
                        <ResourceCardSkeleton key={i} />
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="flex items-center justify-center rounded-2xl border border-rule border-dashed bg-paper-2 py-16">
                    <EmptyPlaceholder
                        icon={BookText}
                        title="No books found"
                        description="Try adjusting your filters or search query."
                    />
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        {books.map((book) => (
                            <BookCard key={book.publicId} book={book} />
                        ))}
                    </div>

                    {/* Pagination - Simple prev/next for now */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="rounded-md border border-rule bg-paper px-4 py-2 text-sm font-medium disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm font-mono text-ink-2">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="rounded-md border border-rule bg-paper px-4 py-2 text-sm font-medium disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
