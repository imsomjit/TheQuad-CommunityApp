import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Flame,
    Sparkles,
    TrendingUp,
    ArrowRight,
    BookOpen,
    MessageSquare,
    Users,
    Terminal,
    Search,
    Target,
    Calendar,
    Clock,
    Trophy,
    CodeXml,
    FileText,
    BookText,
    PenLine,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { usersApi, postsApi, opportunitiesApi, booksApi, resourcesApi } from "../services/api";
import ResourceCard from "../components/ResourceCard";
import QuestionCard from "../components/QuestionCard";
import PostCard from "../components/PostCard";
import BookCard from "../components/BookCard";
import TagBadge from "../components/TagBadge";
import EmptyPlaceholder from "../components/EmptyPlaceholder";
import { ResourceCardSkeleton, QuestionCardSkeleton, Skeleton, PostCardSkeleton, BookCardSkeleton, OpportunityCardSkeleton } from "../components/Skeletons";
import { format } from "date-fns";
import { generateSlug } from "../utils/slugify";
import { getAvatarFallback } from "../utils/fallbacks";

const STAT_COLOR = {
    resources: "--syntax-mint",
    questions: "--syntax-cyan",
    students: "--syntax-violet",
    answers: "--syntax-amber",
};

const getRankAvatarStyle = (index) => {
    if (index === 0) return "ring-1 ring-yellow-400/80 shadow-[0_0_15px_rgba(250,204,21,0.3)] border-yellow-300/50";
    if (index === 1) return "ring-1 ring-slate-300/80 shadow-[0_0_10px_rgba(203,213,225,0.2)] border-slate-300/50";
    if (index === 2) return "ring-1 ring-orange-500/80 shadow-[0_0_10px_rgba(249,115,22,0.2)] border-orange-500/50";
    return "border-rule group-hover:border-accent";
};

const getRankNumberStyle = (index) => {
    if (index === 0) return "text-yellow-500 font-extrabold text-xs drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]";
    if (index === 1) return "text-slate-400 font-bold text-xs drop-shadow-[0_0_2px_rgba(203,213,225,0.3)]";
    if (index === 2) return "text-orange-500 font-bold text-xs drop-shadow-[0_0_2px_rgba(249,115,22,0.3)]";
    return "text-ink-3 font-bold text-[10px]";
};

function StatTile({ icon: Icon, label, value, colorKey }) {
    const c = `rgb(var(${STAT_COLOR[colorKey]}))`;

    return (
        <div className="group relative overflow-hidden rounded-md border border-rule bg-paper-2 p-4 transition-colors hover:border-ink-3">
            <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-[2px]"
                style={{ backgroundColor: c }}
            />

            <div className="flex items-center gap-3">
                <span
                    className="flex h-9 w-9 items-center justify-center rounded-md border"
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

const TYPEWRITER_PHRASES = [
    "people who code",
    "curious learners",
    "ambitious minds",
    "problem solvers",
    "knowledge seekers",
    "lifelong learners",
    "peers helping peers"
];

function TypewriterEffect() {
    const [text, setText] = useState(TYPEWRITER_PHRASES[0]);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(true);

    useEffect(() => {
        const currentPhrase = TYPEWRITER_PHRASES[phraseIndex];
        const typeSpeed = isDeleting
            ? Math.random() * 20 + 20
            : Math.random() * 40 + 40;

        let timer;

        if (isPaused) {
            timer = setTimeout(() => {
                setIsPaused(false);
                setIsDeleting(true);
            }, 2500);
            return () => clearTimeout(timer);
        }

        timer = setTimeout(() => {
            if (!isDeleting && text === currentPhrase) {
                setIsPaused(true);
            } else if (isDeleting && text === "") {
                setIsDeleting(false);
                setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
            } else {
                setText(
                    currentPhrase.substring(0, text.length + (isDeleting ? -1 : 1))
                );
            }
        }, typeSpeed);

        return () => clearTimeout(timer);
    }, [text, isDeleting, phraseIndex, isPaused]);

    return (
        <>
            <span className="marker">{text}</span>
            <span className="caret" />
        </>
    );
}

export default function Home() {
    const { resources, questions, currentUser, apiLoaded } = useApp();
    const { isAuthenticated } = useAuth();

    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour >= 5 && hour < 12) greeting = "Good morning";
    else if (hour >= 12 && hour < 17) greeting = "Good afternoon";

    const [topContributors, setTopContributors] = useState([]);
    const [contributorsLoading, setContributorsLoading] = useState(true);

    const [recentPosts, setRecentPosts] = useState([]);
    const [recentOpportunities, setRecentOpportunities] = useState([]);
    const [recentBooks, setRecentBooks] = useState([]);
    const [extrasLoading, setExtrasLoading] = useState(true);

    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const [opportunitiesCount, setOpportunitiesCount] = useState(0);
    const [contentsCount, setContentsCount] = useState(0);

    useEffect(() => {
        const fetchContributors = async () => {
            try {
                const data = await usersApi.getTopContributors();
                setTopContributors(data);
            } catch (err) {
                console.error("Failed to fetch top contributors", err);
            } finally {
                setContributorsLoading(false);
            }
        };
        fetchContributors();
    }, []);

    useEffect(() => {
        const fetchExtras = async () => {
            try {
                // Fetch top read posts, recent ongoing opportunities, and recent books
                const [postsData, oppsData, booksData, usersCount, upcomingOpps, resourcesData] = await Promise.all([
                    postsApi.list({ sort: "top", limit: 3 }),
                    opportunitiesApi.list({ status: "ONGOING", limit: 3 }),
                    booksApi.list({ limit: 4 }),
                    usersApi.getTotalUsers().catch(() => 0),
                    opportunitiesApi.list({ status: "UPCOMING", limit: 1 }).catch((err) => { console.error(err); return null; }),
                    resourcesApi.list({ limit: 1 }).catch(() => null)
                ]);

                setRecentPosts(postsData?.data || []);
                setRecentOpportunities(oppsData?.data || []);
                setRecentBooks(booksData?.data || []);
                setTotalUsersCount(usersCount || 0);

                const getCount = (res) => {
                    if (!res) return 0;
                    if (res.pagination?.total) return Number(res.pagination.total);
                    if (res.data?.pagination?.total) return Number(res.data.pagination.total);
                    return 0;
                };

                setOpportunitiesCount(getCount(oppsData) + getCount(upcomingOpps));

                const resourcesCount = getCount(resourcesData);
                const booksCount = getCount(booksData);
                setContentsCount(resourcesCount + booksCount);

            } catch (err) {
                console.error("Failed to fetch home extras", err);
            } finally {
                setExtrasLoading(false);
            }
        };
        fetchExtras();
    }, []);

    const getStatusColor = (s) => {
        switch (s) {
            case "UPCOMING": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "ONGOING": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "ENDED": return "bg-ink-3/10 text-ink-3 border-ink-3/20";
            default: return "bg-paper-2 text-ink-2 border-rule";
        }
    };

    const getSourceLogo = (s) => {
        if (!s) return <Target className="w-4 h-4" />;
        const sourceName = s.toLowerCase();
        if (sourceName.includes("codeforces")) return <span className="font-bold text-syntax-rose">CF</span>;
        if (sourceName.includes("kaggle")) return <span className="font-bold text-syntax-cyan">K</span>;
        if (sourceName.includes("leetcode")) return <span className="font-bold text-accent">LC</span>;
        if (sourceName.includes("codechef")) return <span className="font-bold text-syntax-violet">CC</span>;
        if (sourceName.includes("atcoder")) return <span className="font-bold text-syntax-mint">AC</span>;
        if (sourceName.includes("naukri")) return <span className="font-bold text-syntax-magenta">N</span>;
        if (sourceName.includes("google")) return <span className="font-bold text-syntax-red-500">G</span>;
        if (sourceName.includes("hackerrank")) return <span className="font-bold text-syntax-blue-500">H</span>;
        return <CodeXml className="w-4 h-4" />;
    };

    const trendingResources = useMemo(() => {
        return [...resources]
            .sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes))
            .slice(0, 3);
    }, [resources]);

    const recentQuestions = useMemo(() => {
        return [...questions]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
    }, [questions]);

    const allTags = useMemo(() => {
        const counts = {};

        resources.forEach(r => r.tags?.forEach(t => counts[t] = (counts[t] || 0) + 1));
        questions.forEach(q => q.tags?.forEach(t => counts[t] = (counts[t] || 0) + 1));

        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    }, [resources, questions]);

    return (
        <div className="px-2 sm:px-6 md:px-0 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!isAuthenticated && (
                <>
                    {/* ── EDITORIAL HERO ─────────────────────────────────── */}
                    <section className="relative overflow-hidden rounded-md border border-rule bg-paper-2/40 card-elevated">
                        <div className="aurora" />
                        <div className="absolute inset-0 grid-bg opacity-50" />

                        <div className="relative grid grid-cols-12 gap-0">
                            {/* Left margin like a notebook gutter */}
                            <aside className="hidden sm:block col-span-12 border-b border-rule px-6 py-4 sm:col-span-2 sm:border-b-0 sm:border-r sm:px-4 sm:py-10">
                                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                                    chapter
                                </p>
                                <p className="mt-1 font-display text-3xl font-bold text-accent">01</p>

                                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                                    section
                                </p>
                                <p className="mt-1 font-mono text-xs text-ink-2">// hero</p>

                                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                                    status
                                </p>
                                <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-ink-2">
                                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent-2" />
                                    in development
                                </p>
                            </aside>

                            {/* Hero text */}
                            <div className="col-span-12 px-6 py-10 sm:col-span-10 sm:px-10 sm:py-14">
                                <p className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-3">
                                    <Terminal className="h-3.5 w-3.5 text-accent" />
                                    TQ · volume 01 · powered by peers <span className="hidden sm:inline">for peers</span>
                                </p>

                                <h1 className="relative grid grid-cols-1 font-display text-5xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[5.25rem]">
                                    {/* Hidden sizing layers for all phrases to establish exact max height dynamically */}
                                    {TYPEWRITER_PHRASES.map((phrase) => (
                                        <div key={phrase} className="col-start-1 row-start-1 invisible pointer-events-none" aria-hidden="true">
                                            A <span className="font-display-italic text-accent">learning</span>{" "}
                                            <span className="font-display-italic">space</span>
                                            <br />
                                            for <span className="marker">{phrase}</span>
                                        </div>
                                    ))}

                                    {/* Visible typing layer */}
                                    <div className="col-start-1 row-start-1">
                                        A <span className="font-display-italic text-accent">learning</span>{" "}
                                        <span className="font-display-italic">space</span>
                                        <br />
                                        for <TypewriterEffect />
                                    </div>
                                </h1>

                                <p className="mt-4 sm:mt-8 max-w-2xl text-base leading-relaxed text-ink-2 sm:text-lg">
                                    Your campus quad, digitized. Share annotated notes, debate technical concepts, 
                                    and socialize with peers while growing a public profile linked to your GitHub. 
                                    The Quad combines collaborative study spaces with dev-grade tools.
                                </p>

                                <div className="mt-9 flex flex-wrap items-center gap-4">
                                    <Link
                                        to="/resources"
                                        data-testid="hero-browse-btn"
                                        className="group inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm text-paper btn-primary shadow-xl shadow-accent/20 transition-all hover:scale-[1.02]"
                                    >
                                        <Flame className="h-4 w-4 group-hover:animate-bounce" /> Trending notes
                                    </Link>

                                    <Link
                                        to="/questions"
                                        data-testid="hero-ask-btn"
                                        className="group inline-flex items-center gap-2 rounded-md border border-rule bg-paper-2/50 px-5 py-3 text-sm text-ink transition-all hover:border-ink-3 hover:bg-paper-2/80 hover:shadow-lg"
                                    >
                                        Questions feed <ArrowRight className="h-4 w-4 group-hover:-rotate-45 duration-300" />
                                    </Link>

                                    <span className="ml-2 hidden font-mono text-xs text-ink-3 md:inline bg-paper-2/50 px-2.5 py-1.5 rounded-md border border-rule/50">
                                        press <kbd className="font-bold text-ink-2">⌘ K</kbd> to search anything
                                    </span>
                                </div>

                                {/* ── STATS SECTION ─────────────────────────────────── */}
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-9">
                                    <StatTile
                                        icon={BookOpen}
                                        label="contents"
                                        value={contentsCount.toLocaleString()}
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
                                        label="learners"
                                        value={totalUsersCount.toLocaleString()}
                                        colorKey="students"
                                    />
                                    <StatTile
                                        icon={Target}
                                        label="Openings"
                                        value={opportunitiesCount.toLocaleString()}
                                        colorKey="answers"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── TICKER ─────────────────────────────── */}
                    <div className="overflow-hidden border-y-2 border-ink bg-ink py-4 shadow-lg w-[100vw] relative left-1/2 -ml-[50vw] md:w-[calc(100vw-var(--sidebar-width,16rem))] md:-ml-[calc(50vw-calc(var(--sidebar-width,16rem)/2))] transition-all duration-700 ease-in-out">
                        <div className="flex w-max whitespace-nowrap marquee">
                            {[...Array(2)].map((_, k) => (
                                <div
                                    key={k}
                                    className="flex shrink-0 items-center gap-12 px-6 font-mono text-[13px] font-bold uppercase tracking-[0.2em] text-paper"
                                >
                                    <span>· operating systems</span>
                                    <span>· data structures</span>
                                    <span>· system design</span>
                                    <span>· dbms</span>
                                    <span>· compilers</span>
                                    <span>· machine learning</span>
                                    <span className="text-accent flex items-center gap-2"><Sparkles className="h-4 w-4" /> pyq archive</span>
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
                </>
            )}

            {isAuthenticated && (
                <header className="relative pb-8 mb-10 border-b border-rule/50">
                    {/* Subtle Desktop Background Glows */}
                    <div className="hidden md:block absolute top-10 right-20 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10 max-w-3xl">
                        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
                            &sect;01 &middot; The feed
                        </p>

                        <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
                            {greeting} <span className="font-display-italic text-accent">{currentUser?.name?.split(' ')[0] || 'Peer'}</span>, <br/><span className="hidden md:inline">what are you <span className="marker italic">learning today?</span></span><span className="inline md:hidden">ready to <span className="marker italic">explore?</span></span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-md md:text-lg leading-relaxed text-ink-2">
                            Welcome to your learning space. Discover curated resources, engage in meaningful discussions, showcase your work, and stay connected with a community that believes knowledge grows when it's shared.
                        </p>
                    </div>

                    {/* Premium Search & Quick Actions - Unified for Mobile & Desktop */}
                    <div className="relative z-10 mt-10 max-w-3xl space-y-6">
                        
                        {/* Premium Search Bar */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-accent to-syntax-cyan opacity-20 blur transition duration-500 group-hover:opacity-40"></div>
                            <div className="relative flex items-center w-full h-14 md:h-16 rounded-full bg-paper border border-rule/50 shadow-lg overflow-hidden focus-within:ring-2 focus-within:ring-accent/50 focus-within:border-transparent transition-all">
                                <div className="pl-5 md:pl-6 flex items-center justify-center">
                                    <Search className="h-5 w-5 md:h-6 md:w-6 text-accent animate-pulse" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search notes, questions, papers..."
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.target.value.trim()) {
                                            window.location.href = `/search?q=${encodeURIComponent(e.target.value.trim())}`;
                                        }
                                    }}
                                    className="w-full h-full bg-transparent pl-4 pr-4 text-[15px] md:text-lg text-ink placeholder:text-ink-3 focus:outline-none"
                                />
                                <div className="pr-2 md:pr-3">
                                    <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-paper-2 border border-rule text-ink-3 shadow-sm hover:bg-paper-3 hover:text-ink active:scale-95 transition-all cursor-pointer" onClick={() => {
                                        const input = document.querySelector('input[placeholder="Search notes, questions, papers..."]');
                                        if (input && input.value.trim()) {
                                            window.location.href = `/search?q=${encodeURIComponent(input.value.trim())}`;
                                        }
                                    }}>
                                        <span className="text-sm md:text-base font-mono leading-none">&rarr;</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-2 gap-3 md:hidden">
                            <Link to="/explore" className="group relative overflow-hidden flex flex-col items-start justify-center gap-2 rounded-2xl bg-paper-2 border border-rule p-4 md:p-5 transition-all active:scale-95 shadow-sm hover:shadow-md hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-accent/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-accent/20 text-accent transition-transform group-hover:scale-110">
                                    <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div className="mt-1 md:mt-2">
                                    <span className="block text-[15px] md:text-base font-bold text-ink leading-none">Explore</span>
                                    <span className="text-[10px] md:text-[11px] text-ink-3 font-mono mt-1.5 block uppercase tracking-wider">Start discovering...</span>
                                </div>
                            </Link>
                            
                            <Link to="/ask" className="group relative overflow-hidden flex flex-col items-start justify-center gap-2 rounded-2xl bg-paper-2 border border-rule p-4 md:p-5 transition-all active:scale-95 shadow-sm hover:shadow-md hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-syntax-magenta/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-syntax-magenta/20 text-syntax-magenta transition-transform group-hover:scale-110">
                                    <PenLine className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div className="mt-1 md:mt-2">
                                    <span className="block text-[15px] md:text-base font-bold text-ink leading-none">Discuss</span>
                                    <span className="text-[10px] md:text-[11px] text-ink-3 font-mono mt-1.5 block uppercase tracking-wider">Ask the community...</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </header>
            )}

            {/* ── EDITORIAL DIVIDER ─────────────────────────────── */}
            <div className="hidden md:flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                    §02 · the Resources
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
                            <h2 className="mt-1 flex items-center gap-2 font-display text-4xl font-semibold tracking-tight text-ink">
                                <Flame className="h-7 w-7 text-syntax-rose" />
                                Most downloaded
                            </h2>
                        </div>
                    </header>

                    <div className="space-y-3">
                        {!apiLoaded ? (
                            [1, 2, 3].map((i) => <ResourceCardSkeleton key={i} />)
                        ) : trendingResources.length > 0 ? (
                            trendingResources.map((r) => (
                                <ResourceCard key={r.id} resource={r} />
                            ))
                        ) : (
                            <EmptyPlaceholder
                                icon={BookOpen}
                                title="No resources found"
                                description="The library is currently empty. Be the first to share your notes or past year papers!"
                                linkTo="/resources"
                                linkText="Upload Resource"
                            />
                        )}
                    </div>
                </section>

                <aside className="space-y-6 lg:col-span-5">
                    {/* Popular tags */}
                    <div className="rounded-md border border-rule bg-paper-2/60 p-5">
                        <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                            <TrendingUp className="h-3.5 w-3.5 text-accent" />
                            // popular tags
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {!apiLoaded ? (
                                <>
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-6 w-14" />
                                </>
                            ) : allTags.length > 0 ? (
                                allTags.map(([tag, count]) => (
                                    <Link key={tag} to={`/resources?tag=${tag}`}>
                                        <TagBadge>
                                            {tag}
                                            <span className="ml-1.5 text-ink-3">{count}</span>
                                        </TagBadge>
                                    </Link>
                                ))
                            ) : (
                                <span className="text-xs text-ink-3 font-mono py-2">No tags available.</span>
                            )}
                        </div>
                    </div>

                    {/* Monthly Top Contributors */}
                    <div className="rounded-md border border-rule bg-paper-2/60 p-5">
                        <h3 className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                            <span className="flex items-center gap-2">
                                <Trophy className="h-3.5 w-3.5 text-accent" />
                                // monthly top contributors
                            </span>
                        </h3>

                        <ul className="mt-4 space-y-3">
                            {contributorsLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <li key={i} className="flex gap-3 items-center py-2">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-3 w-1/2" /></div>
                                        <Skeleton className="h-4 w-6" />
                                    </li>
                                ))
                            ) : topContributors.length > 0 ? (
                                topContributors.map((user, i) => (
                                    <Link
                                        key={user.id}
                                        to={`/u/${user.username}`}
                                        className="group flex cursor-pointer items-center justify-between last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className={`font-mono w-4 shrink-0 transition-all ${getRankNumberStyle(i)}`}>#{i + 1}</span>
                                            <div className="relative shrink-0 flex items-center justify-center">
                                                <img src={user.avatar || getAvatarFallback(user.name, user.username)} alt="" className={`h-8 w-8 rounded-md object-cover border transition-all bg-paper-2 ${getRankAvatarStyle(i)}`} />
                                                {i === 0 && <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-yellow-400 drop-shadow-md" />}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="truncate text-sm font-medium text-ink transition-colors group-hover:text-accent">
                                                    {user.username} <span className="font-mono text-xs text-ink-3 font-normal ml-1"></span>
                                                </span>
                                                {(user.college || user.branch) && (
                                                    <span className="truncate text-[11px] text-ink-2">
                                                        {user.college}{user.college && user.branch ? ' · ' : ''}{user.branch}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0 pl-2">
                                            <span className="font-mono text-xs font-bold text-syntax-lime">+{user.score}</span>
                                            <span className="font-mono text-[9px] uppercase tracking-wider text-ink-3">pts</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <li className="text-xs text-ink-3 font-mono py-1.5">No contributors this month yet.</li>
                            )}
                        </ul>
                    </div>

                    {/* Profile card — index-card style */}
                    {isAuthenticated && currentUser && (
                        <div className="hidden sm:inline relative overflow-hidden rounded-md border border-rule bg-paper-2/60 p-5">
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                            // profile card
                            </p>

                            <div className="mt-3 flex items-center gap-3">
                                <img
                                    src={currentUser.avatar || getAvatarFallback(currentUser.name, currentUser.username)}
                                    alt=""
                                    className="h-14 w-14 rounded-md border border-rule object-cover bg-paper-2"
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
                                <MiniStat value={currentUser.stats?.resources || 0} label="uploads" colorVar="--syntax-mint" />
                                <MiniStat value={currentUser.stats?.answers || 0} label="answers" colorVar="--syntax-cyan" />
                                <MiniStat value={currentUser.stats?.upvotes || 0} label="upvotes" colorVar="--syntax-amber" />
                            </div>

                            <Link
                                to={`/u/${currentUser.username}`}
                                className="mt-4 block w-full rounded-md border border-rule bg-paper py-2 text-center text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
                            >
                                View full profile →
                            </Link>
                        </div>
                    )}
                </aside>
            </div>

            {/* ── Divider ─────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-4">
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
                    <h2 className="mt-1 flex items-center gap-2 font-display text-4xl font-semibold tracking-tight text-ink">
                        <MessageSquare className="h-7 w-7 text-syntax-cyan" />
                        Recently asked
                    </h2>
                </header>

                <div className="space-y-3">
                    {!apiLoaded ? (
                        [1, 2, 3].map((i) => <QuestionCardSkeleton key={i} />)
                    ) : recentQuestions.length > 0 ? (
                        recentQuestions.map((q) => (
                            <QuestionCard key={q.id} question={q} />
                        ))
                    ) : (
                        <EmptyPlaceholder
                            icon={MessageSquare}
                            title="No questions asked"
                            description="The forum is quiet. Start a discussion or ask a question to the community!"
                            linkTo="/questions"
                            linkText="Ask a Question"
                        />
                    )}
                </div>
            </section>

            {/* ── Divider ─────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                    §04 · the blog
                </span>
                <span className="h-px flex-1 bg-rule" />
                <Link
                    to="/posts"
                    className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-2 transition-colors hover:text-accent"
                >
                    all posts →
                </Link>
            </div>

            {/* ── MOST READ POSTS ────────────────────────────── */}
            <section className="space-y-4">
                <header>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                        trending in articles
                    </p>
                    <h2 className="mt-1 flex items-center gap-2 font-display text-4xl font-semibold tracking-tight text-ink">
                        <FileText className="h-7 w-7 text-syntax-violet" />
                        Most read
                    </h2>
                </header>

                <div className="space-y-3">
                    {extrasLoading ? (
                        <div className="flex flex-col gap-5">
                            {[1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}
                        </div>
                    ) : recentPosts.length > 0 ? (
                        <div className="flex flex-col gap-5">
                            {recentPosts.map((p) => (
                                <PostCard key={p.id} post={p} />
                            ))}
                        </div>
                    ) : (
                        <EmptyPlaceholder
                            icon={FileText}
                            title="No posts found"
                            description="The blog is currently empty."
                            linkTo="/posts/new"
                            linkText="Write a Post"
                        />
                    )}
                </div>
            </section>

            {/* ── Divider ─────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                    §05 · the library
                </span>
                <span className="h-px flex-1 bg-rule" />
                <Link
                    to="/library"
                    className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-2 transition-colors hover:text-accent"
                >
                    all books →
                </Link>
            </div>

            {/* ── RECENT BOOKS ────────────────────────────── */}
            <section className="space-y-4">
                <header>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                        explore new knowledge
                    </p>
                    <h2 className="mt-1 flex items-center gap-2 font-display text-4xl font-semibold tracking-tight text-ink">
                        <BookOpen className="h-7 w-7 text-syntax-mint" />
                        New arrivals
                    </h2>
                </header>

                <div className="space-y-3">
                    {extrasLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {[1, 2, 3, 4].map((i) => <BookCardSkeleton key={i} />)}
                        </div>
                    ) : recentBooks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {recentBooks.map((book) => (
                                <BookCard key={book.publicId} book={book} />
                            ))}
                        </div>
                    ) : (
                        <EmptyPlaceholder
                            icon={BookText}
                            title="No books yet"
                            description="The library is empty."
                            linkTo="/posts/new"
                            linkText="Go to Library"
                        />
                    )}
                </div>
            </section>

            {/* ── Divider ─────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                    §06 · the board
                </span>
                <span className="h-px flex-1 bg-rule" />
                <Link
                    to="/opportunities"
                    className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-2 transition-colors hover:text-accent"
                >
                    all opportunities →
                </Link>
            </div>

            {/* ── RECENT OPPORTUNITIES ────────────────────────────── */}
            <section className="space-y-4">
                <header>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                        compete and conquer
                    </p>
                    <h2 className="mt-1 flex items-center gap-2 font-display text-4xl font-semibold tracking-tight text-ink">
                        <Target className="h-7 w-7 text-syntax-lime" />
                        Ongoing opportunities
                    </h2>
                </header>

                <div className="space-y-3">
                    {extrasLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => <OpportunityCardSkeleton key={i} />)}
                        </div>
                    ) : recentOpportunities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {recentOpportunities.map((opp) => (
                                <Link key={opp.id} to={`/opportunities/${generateSlug(opp.title, opp.publicId || opp.id)}`} className="group flex flex-col p-6 rounded-2xl border border-rule bg-paper hover:bg-paper-2 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wide uppercase border ${getStatusColor(opp.status)}`}>
                                            {opp.status}
                                        </div>
                                    </div>

                                    <h3 className="font-display font-semibold text-ink text-2xl leading-tight mb-3 group-hover:text-accent transition-colors line-clamp-2">
                                        {opp.title}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <div className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 bg-paper border border-rule/60 rounded-full shadow-sm">
                                            {getSourceLogo(opp.organizer)}
                                            <span className="text-ink">{opp.organizer || "Unknown"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-ink-2 px-2.5 py-1 bg-paper border border-rule/60 rounded-full shadow-sm">
                                            <Trophy className="w-3.5 h-3.5 text-accent" fill="currentColor" />
                                            <span>{opp.type === "CODING_CONTEST" ? "Contest" : "Competition"}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-ink-2 line-clamp-2 mb-6 leading-relaxed">
                                        {opp.description || "Gear up and prepare to showcase your problem-solving skills! Join fellow developers in this exciting challenge and climb the leaderboard."}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-rule flex flex-col gap-2.5 text-xs font-medium text-ink-3">
                                        {opp.startTime && (
                                            <div className="flex items-center gap-2.5">
                                                <Calendar className="w-4 h-4 text-ink-2" />
                                                <span>Starts: {format(new Date(opp.startTime), "MMM d, yyyy h:mm a")}</span>
                                            </div>
                                        )}
                                        {opp.deadline && (
                                            <div className="flex items-center gap-2.5">
                                                <Clock className="w-4 h-4 text-ink-2" />
                                                <span>Deadline: {format(new Date(opp.deadline), "MMM d, yyyy h:mm a")}</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <EmptyPlaceholder
                            icon={Target}
                            title="No ongoing opportunities"
                            description="There are no ongoing opportunities at the moment. Check back later!"
                            linkTo="/opportunities"
                            linkText="Browse Opportunities"
                        />
                    )}
                </div>
            </section>
        </div>
    );
}

function MiniStat({ value, label, colorVar }) {
    return (
        <div className="rounded-md border border-rule bg-paper p-2">
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
