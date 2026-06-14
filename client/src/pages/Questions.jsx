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
import EmptyPlaceholder from "../components/EmptyPlaceholder";
import { QuestionCardSkeleton } from "../components/Skeletons";
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
    const { questions, apiLoaded, currentUser } = useApp();

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

            if (tag && !question.tags.includes(tag)) return false;

            return true;
        });

        if (sort === "newest") {
            list = list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sort === "votes") {
            list = list.sort(
                (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
            );
        } else if (sort === "unanswered") {
            list = list.filter((q2) => q2.answers.length === 0);
        } else if (sort === "active") {
            list = list.sort((a, b) => b.answers.length - a.answers.length);
        }

        return list;
    }, [questions, q, tag, sort]);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="border-b-2 border-double border-rule pb-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-syntax-cyan">
                            &sect;03 &middot; the forum
                        </p>

                        <h1 className="mt-2 font-display text-5xl font-medium leading-[1.02] tracking-tight text-ink sm:text-6xl">
                            Ask. <span className="font-display-italic text-accent">Answer. </span>&amp; <span className="italic marker">Argue.</span> 
                        </h1>

                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-2">
                            Stack-Overflow energy, with people who know your syllabus and
                            actually care about your grade. Feel free to ask, solve questions and grow together.
                        </p>
                    </div>

                    {currentUser && (
                        <Link
                            to="/ask"
                            data-testid="ask-question-button"
                            className="hidden md:inline-flex items-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-paper transition-all hover:brightness-110 active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            Ask a Question
                        </Link>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-9">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />

                            <Input
                                data-testid="questions-search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search questions…"
                                className="h-10 rounded-sm border-rule bg-paper pl-9 text-ink focus-visible:border-accent/60 focus-visible:ring-accent/30"
                            />
                        </div>

                        <Select value={sort} onValueChange={setSort}>
                            <SelectTrigger
                                data-testid="questions-sort"
                                className="h-10 w-full rounded-sm border-rule bg-paper-2/60 sm:w-[200px]"
                            >
                                <div className="flex items-center gap-2">
                                    <ArrowDownUp className="h-3.5 w-3.5 text-ink-3" />
                                    <SelectValue />
                                </div>
                            </SelectTrigger>

                            <SelectContent className="border-rule bg-paper text-ink">
                                {SORTS.map((s) => (
                                    <SelectItem key={s.key} value={s.key}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {tag && (
                        <div className="flex items-center gap-3 rounded-sm border border-accent bg-accent-soft p-3">
                            <span className="font-mono text-xs text-ink-2">tag:</span>

                            <TagBadge active>{tag}</TagBadge>

                            <button
                                onClick={() => setTag("")}
                                className="ml-auto text-xs text-ink-2 transition-colors hover:text-syntax-rose"
                            >
                                clear
                            </button>
                        </div>
                    )}

                    <p className="text-sm text-ink-2">
                        <span className="font-mono font-semibold text-ink">{filtered.length}</span>{" "}
                        question{filtered.length !== 1 && "s"}
                    </p>

                    <div className="space-y-3">
                        {!apiLoaded ? (
                            [1, 2, 3, 4, 5].map((i) => <QuestionCardSkeleton key={i} />)
                        ) : filtered.length === 0 ? (
                            <EmptyPlaceholder 
                                icon={MessageSquare}
                                title="No questions found"
                                description="Try clearing some filters or searching differently."
                            />
                        ) : (
                            filtered.map((question) => (
                                <QuestionCard key={question.id} question={question} />
                            ))
                        )}
                    </div>
                </div>

                <aside className="lg:col-span-3">
                    <div className="sticky top-24 space-y-4 rounded-sm border border-rule bg-paper-2/40 p-4">
                        <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                            // filter by tag
                        </h3>

                        <div className="flex max-h-[300px] flex-wrap gap-1.5 overflow-y-auto">
                            {allTags.length > 0 ? (
                                allTags.map(([t, count]) => (
                                    <button
                                        key={t}
                                        onClick={() => setTag(t === tag ? "" : t)}
                                        data-testid={`filter-tag-${t}`}
                                    >
                                        <TagBadge active={t === tag}>
                                            {t}
                                            <span className="ml-1.5 text-ink-3">{count}</span>
                                        </TagBadge>
                                    </button>
                                ))
                            ) : (
                                <span className="text-xs text-ink-3 font-mono py-2">No tags available.</span>
                            )}
                        </div>

                        <hr className="border-rule" />

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-ink-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-2" />
                                    accepted
                                </span>
                                <span className="font-mono text-ink">
                                    {
                                        questions.filter((qq) =>
                                            qq.answers.some((a) => a.accepted)
                                        ).length
                                    }
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-ink-2">unanswered</span>
                                <span className="font-mono text-syntax-rose">
                                    {questions.filter((qq) => qq.answers.length === 0).length}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-ink-2">total answers</span>
                                <span className="font-mono text-ink">
                                    {questions.reduce((acc, qq) => acc + qq.answers.length, 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
