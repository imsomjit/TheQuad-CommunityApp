import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
    Flame,
    Sparkles,
    TrendingUp,
    ArrowRight,
    BookOpen,
    MessageSquare,
    Users,
    Award,
    Terminal,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import ResourceCard from "../components/ResourceCard";
import QuestionCard from "../components/QuestionCard";
import TagBadge from "../components/TagBadge";
import { COLLEGES } from "../data/mockData";

const STAT_COLOR = {
    resources: "--syntax-mint",
    questions: "--syntax-cyan",
    students: "--syntax-violet",
    answers: "--syntax-amber",
};

function StatTile({ icon: Icon, label, value, colorKey }) {
    const c = `var(${STAT_COLOR[colorKey]})`;

    return (
        <div className="group relative overflow-hidden rounded-sm border border-rule bg-paper-2/60 p-4 transition-colors hover:border-ink-3">
            <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-[2px]"
                style={{ backgroundColor: c }}
            />

            <div className="flex items-center gap-3">
                <span
                    className="flex h-9 w-9 items-center justify-center rounded-sm border"
                    style={{ borderColor: c, color: c, backgroundColor: "transparent" }}
                >
                    <Icon className="h-4 w-4" />
                </span>

                <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-3">
                        {label}
                    </div>

                    <div className="font-display text-2xl font-bold tabular-nums text-ink">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const { resources, questions, currentUser } = useApp();

    const trendingResources = useMemo(
        () =>
            [...resources]
                .sort((a, b) => b.upvotes + b.downloads / 5 - (a.upvotes + a.downloads / 5))
                .slice(0, 4),
        [resources]
    );

    const recentQuestions = useMemo(
        () =>
            [...questions]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 4),
        [questions]
    );

    const allTags = useMemo(() => {
        const counts = {};

        [...resources, ...questions].forEach((item) => {
            (item.tags || []).forEach((t) => {
                counts[t] = (counts[t] || 0) + 1;
            });
        });

        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 14);
    }, [resources, questions]);

    return (
        <div className="space-y-16 fade-in-up">
            {/* ── EDITORIAL HERO ─────────────────────────────────── */}
            <section className="relative overflow-hidden rounded-sm border border-rule bg-paper-2/40 card-elevated">
                <div className="aurora" />
                <div className="absolute inset-0 grid-bg opacity-50" />

                <div className="relative grid grid-cols-12 gap-0">
                    {/* Left margin like a notebook gutter */}
                    <aside className="hidden sm:block col-span-12 border-b border-rule px-6 py-4 sm:col-span-2 sm:border-b-0 sm:border-r sm:px-4 sm:py-10">
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                            issue
                        </p>
                        <p className="mt-1 font-display text-3xl font-bold text-accent">01</p>

                        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                            section
                        </p>
                        <p className="mt-1 font-mono text-xs text-ink-2">// feed</p>

                        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                            status
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-ink-2">
                            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent-2" />
                            now in beta
                        </p>
                    </aside>

                    {/* Hero text */}
                    <div className="col-span-12 px-6 py-10 sm:col-span-10 sm:px-10 sm:py-14">
                        <p className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-3">
                            <Terminal className="h-3.5 w-3.5 text-accent" />
                            volume one · winter '26 · for people who code
                        </p>

                        <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[5.25rem]">
                            A <span className="font-display-italic text-accent">learning</span>{" "}
                            <span className="font-display-italic">notebook</span>
                            <br />
                            for <span className="marker">people who code</span>
                            <span className="caret" />
                        </h1>

                        <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-2 sm:text-lg">
                            Share annotated notes, debate past-year papers, and grow a
                            public technical profile linked to your GitHub. PeerVerse is
                            built like a developer tool — and reads like a journal you
                            actually want to open.
                        </p>

                        <div className="mt-9 flex flex-wrap items-center gap-3">
                            <Link
                                to="/resources"
                                data-testid="hero-browse-btn"
                                className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-semibold text-paper glow-btn"
                            >
                                Open the library <ArrowRight className="h-4 w-4" />
                            </Link>

                            <Link
                                to="/ask"
                                data-testid="hero-ask-btn"
                                className="inline-flex items-center gap-2 rounded-sm border border-rule bg-paper-2 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink-3"
                            >
                                Ask a question
                            </Link>

                            <span className="ml-1 hidden font-mono text-xs text-ink-3 md:inline">
                                press <kbd className="kbd">⌘ K</kbd> to jump anywhere
                            </span>
                        </div>

                        {/* Stats */}
                        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <StatTile
                                icon={BookOpen}
                                label="resources"
                                value={resources.length.toLocaleString()}
                                colorKey="resources"
                            />
                            <StatTile
                                icon={MessageSquare}
                                label="questions"
                                value={questions.length.toLocaleString()}
                                colorKey="questions"
                            />
                            <StatTile
                                icon={Users}
                                label="students"
                                value="2.4k"
                                colorKey="students"
                            />
                            <StatTile
                                icon={Award}
                                label="answers"
                                value={questions.reduce((a, q) => a + q.answers.length, 0)}
                                colorKey="answers"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer ticker */}
                <div className="overflow-hidden border-t border-rule bg-paper py-2.5">
                    <div className="flex whitespace-nowrap marquee">
                        {[...Array(2)].map((_, k) => (
                            <div
                                key={k}
                                className="flex shrink-0 items-center gap-8 px-4 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-3"
                            >
                                <span>· operating systems</span>
                                <span>· data structures</span>
                                <span>· system design</span>
                                <span>· dbms</span>
                                <span>· compilers</span>
                                <span>· machine learning</span>
                                <span className="text-accent">★ pyq archive</span>
                                <span>· networks</span>
                                <span>· algorithms</span>
                                <span>· react</span>
                                <span>· python</span>
                                <span>· rust</span>
                                <span>· interview prep</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── EDITORIAL DIVIDER ─────────────────────────────── */}
            <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                    §02 · the library
                </span>
                <span className="h-px flex-1 bg-rule" />
                <Link
                    to="/resources"
                    className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-2 transition-colors hover:text-accent"
                >
                    all resources →
                </Link>
            </div>

            {/* ── TRENDING + SIDEBAR ────────────────────────────── */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                <section className="space-y-4 lg:col-span-7">
                    <header className="flex items-end justify-between gap-3">
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                                trending this week
                            </p>
                            <h2 className="mt-1 flex items-center gap-2 font-display text-3xl font-semibold tracking-tight text-ink">
                                <Flame className="h-6 w-6 text-accent" />
                                Most read
                            </h2>
                        </div>
                    </header>

                    <div className="space-y-3">
                        {trendingResources.map((r) => (
                            <ResourceCard key={r.id} resource={r} />
                        ))}
                    </div>
                </section>

                <aside className="space-y-6 lg:col-span-5">
                    {/* Profile card — index-card style */}
                    <div className="relative overflow-hidden rounded-sm border border-rule bg-paper-2/60 p-5">
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                            // profile card
                        </p>

                        <div className="mt-3 flex items-center gap-3">
                            <img
                                src={currentUser.avatar}
                                alt=""
                                className="h-14 w-14 rounded-sm border border-rule object-cover"
                            />

                            <div>
                                <div className="font-display text-xl font-semibold text-ink">
                                    {currentUser.name}
                                </div>
                                <div className="font-mono text-xs text-ink-3">
                                    @{currentUser.username}
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 text-sm leading-relaxed text-ink-2">
                            {currentUser.bio}
                        </p>

                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                            <MiniStat value={currentUser.stats.resources} label="uploads" colorVar="--syntax-mint" />
                            <MiniStat value={currentUser.stats.answers} label="answers" colorVar="--syntax-cyan" />
                            <MiniStat value={currentUser.stats.upvotes} label="upvotes" colorVar="--syntax-amber" />
                        </div>

                        <Link
                            to={`/u/${currentUser.username}`}
                            className="mt-4 block w-full rounded-sm border border-rule bg-paper py-2 text-center text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
                        >
                            View full profile →
                        </Link>
                    </div>

                    {/* Popular tags */}
                    <div className="rounded-sm border border-rule bg-paper-2/60 p-5">
                        <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                            <TrendingUp className="h-3.5 w-3.5 text-accent" />
                            // popular tags
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {allTags.map(([tag, count]) => (
                                <Link key={tag} to={`/resources?tag=${tag}`}>
                                    <TagBadge>
                                        {tag}
                                        <span className="ml-1.5 text-ink-3">{count}</span>
                                    </TagBadge>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Active colleges — old contents-page style */}
                    <div className="rounded-sm border border-rule bg-paper-2/60 p-5">
                        <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                            <Sparkles className="h-3.5 w-3.5 text-accent" />
                            // active colleges
                        </h3>

                        <ul className="mt-3 space-y-1">
                            {COLLEGES.slice(0, 6).map((c, i) => (
                                <li
                                    key={c}
                                    className="group flex cursor-pointer items-center justify-between border-b border-dotted border-rule py-1.5 text-sm last:border-b-0"
                                >
                                    <span className="text-ink-2 transition-colors group-hover:text-ink">
                                        <span className="mr-3 font-mono text-ink-3">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        {c}
                                    </span>
                                    <span className="font-mono text-xs text-ink-3">{180 - i * 17}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>

            {/* ── Divider ─────────────────────────────────────── */}
            <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                    §03 · the forum
                </span>
                <span className="h-px flex-1 bg-rule" />
                <Link
                    to="/questions"
                    className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-2 transition-colors hover:text-accent"
                >
                    all questions →
                </Link>
            </div>

            {/* ── RECENT QUESTIONS ────────────────────────────── */}
            <section className="space-y-4">
                <header>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                        fresh from the community
                    </p>
                    <h2 className="mt-1 flex items-center gap-2 font-display text-3xl font-semibold tracking-tight text-ink">
                        <MessageSquare className="h-6 w-6 text-syntax-cyan" />
                        Recently asked
                    </h2>
                </header>

                <div className="space-y-3">
                    {recentQuestions.map((q) => (
                        <QuestionCard key={q.id} question={q} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function MiniStat({ value, label, colorVar }) {
    return (
        <div className="rounded-sm border border-rule bg-paper p-2">
            <div
                className="font-mono text-lg font-bold tabular-nums"
                style={{ color: `var(${colorVar})` }}
            >
                {value}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">
                {label}
            </div>
        </div>
    );
}