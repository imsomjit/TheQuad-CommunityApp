import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Plus,
    ArrowDownUp,
    CheckCircle2,
    MessageSquare,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import QuestionCard from "../components/QuestionCard";
import TagBadge from "../components/TagBadge";
import { Input } from "../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

const SORTS = [
    { key: "newest", label: "Newest" },
    { key: "votes", label: "Most votes" },
    { key: "unanswered", label: "Unanswered" },
    { key: "active", label: "Active" },
];

export default function Questions() {
    const { questions } = useApp();

    const [q, setQ] = useState("");
    const [tag, setTag] = useState("");
    const [sort, setSort] = useState("newest");

    const allTags = useMemo(() => {
        const counts = {};

        questions.forEach((question) =>
            question.tags.forEach((t) => {
                counts[t] = (counts[t] || 0) + 1;
            })
        );

        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [questions]);

    const filtered = useMemo(() => {
        let list = questions.filter((question) => {
            if (
                q &&
                !`${question.title} ${question.body} ${question.tags.join(" ")}`
                    .toLowerCase()
                    .includes(q.toLowerCase())
            ) {
                return false;
            }

            if (tag && !question.tags.includes(tag)) {
                return false;
            }

            return true;
        });

        if (sort === "newest") {
            list = list.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
        } else if (sort === "votes") {
            list = list.sort(
                (a, b) =>
                    b.upvotes -
                    b.downvotes -
                    (a.upvotes - a.downvotes)
            );
        } else if (sort === "unanswered") {
            list = list.filter((q) => q.answers.length === 0);
        } else if (sort === "active") {
            list = list.sort(
                (a, b) => b.answers.length - a.answers.length
            );
        }

        return list;
    }, [questions, q, tag, sort]);

    return (
        <div className="space-y-8 fade-in-up">
            {/* Header */}
            <header className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400 mb-2">
            // q&amp;a
                    </p>

                    <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter text-zinc-50">
                        Ask. Answer. Argue.
                    </h1>

                    <p className="mt-2 text-zinc-400 max-w-2xl">
                        Stack Overflow energy, with people who know your syllabus.
                    </p>
                </div>

                <Link
                    to="/ask"
                    data-testid="ask-question-button"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Ask question
                </Link>
            </header>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Questions Section */}
                <div className="lg:col-span-9 space-y-4">
                    {/* Search + Sort */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />

                            <Input
                                data-testid="questions-search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search questions..."
                                className="pl-9 h-10 bg-zinc-900/60 border-zinc-800 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/30"
                            />
                        </div>

                        <Select value={sort} onValueChange={setSort}>
                            <SelectTrigger
                                data-testid="questions-sort"
                                className="w-full sm:w-[200px] h-10 bg-zinc-900/60 border-zinc-800"
                            >
                                <div className="flex items-center gap-2">
                                    <ArrowDownUp className="w-3.5 h-3.5 text-zinc-500" />
                                    <SelectValue />
                                </div>
                            </SelectTrigger>

                            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                                {SORTS.map((s) => (
                                    <SelectItem key={s.key} value={s.key}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Active Tag Filter */}
                    {tag && (
                        <div className="flex items-center gap-3 p-3 border border-emerald-500/30 rounded-md bg-emerald-500/5">
                            <span className="font-mono text-xs text-zinc-400">
                                tag:
                            </span>

                            <TagBadge active>#{tag}</TagBadge>

                            <button
                                onClick={() => setTag("")}
                                className="ml-auto text-xs text-zinc-400 hover:text-rose-400 transition-colors"
                            >
                                clear
                            </button>
                        </div>
                    )}

                    {/* Count */}
                    <p className="text-sm text-zinc-400">
                        <span className="font-mono text-zinc-200 font-semibold">
                            {filtered.length}
                        </span>{" "}
                        question{filtered.length !== 1 && "s"}
                    </p>

                    {/* Questions List */}
                    <div className="space-y-3">
                        {filtered.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-lg">
                                <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-2" />

                                <p className="font-display text-lg text-zinc-300">
                                    Nothing here yet
                                </p>

                                <p className="text-sm text-zinc-500 mt-1">
                                    Be the first to ask.
                                </p>
                            </div>
                        ) : (
                            filtered.map((question) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-3 space-y-4">
                    <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/40 sticky top-24">
                        <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-3">
              // filter by tag
                        </h3>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 max-h-[300px] overflow-y-auto">
                            {allTags.map(([t, count]) => (
                                <button
                                    key={t}
                                    onClick={() => setTag(t === tag ? "" : t)}
                                    data-testid={`filter-tag-${t}`}
                                >
                                    <TagBadge active={t === tag}>
                                        #{t}
                                        <span className="ml-1.5 text-zinc-600">
                                            {count}
                                        </span>
                                    </TagBadge>
                                </button>
                            ))}
                        </div>

                        <hr className="border-zinc-800 my-4" />

                        {/* Stats */}
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    accepted
                                </span>

                                <span className="font-mono text-zinc-200">
                                    {
                                        questions.filter((q) =>
                                            q.answers.some((a) => a.accepted)
                                        ).length
                                    }
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">
                                    unanswered
                                </span>

                                <span className="font-mono text-rose-400">
                                    {
                                        questions.filter(
                                            (q) => q.answers.length === 0
                                        ).length
                                    }
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">
                                    total answers
                                </span>

                                <span className="font-mono text-zinc-200">
                                    {questions.reduce(
                                        (acc, q) => acc + q.answers.length,
                                        0
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}