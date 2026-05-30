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
    Award,
    Terminal,
    Search,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import ResourceCard from "../components/ResourceCard";
import QuestionCard from "../components/QuestionCard";
import TagBadge from "../components/TagBadge";
import EmptyPlaceholder from "../components/EmptyPlaceholder";
import { ResourceCardSkeleton, QuestionCardSkeleton, Skeleton } from "../components/Skeletons";
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
        <div className="group relative overflow-hidden rounded-sm border border-rule bg-paper-2 p-4 transition-colors hover:border-ink-3">
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

const TYPEWRITER_PHRASES = [
    "people who code",
    "curious learners",
    "ambitious minds",
    "problem solvers",
    "knowledge seekers",
    "lifelong learners",
    "collaborative learners",
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

    const trendingResources = useMemo(() => {
        const sorted = [...resources]
            .sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes))
            .slice(0, 3);
        
        if (sorted.length === 0) {
            return [
                {
                    id: "mock1",
                    title: "Operating Systems Fundamentals",
                    type: "NOTES",
                    category: "computer_science",
                    author: { name: "Alan Turing", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alan" },
                    upvotes: 42,
                    downvotes: 1,
                    tags: ["os", "fundamentals"],
                    created_at: new Date().toISOString()
                },
                {
                    id: "mock2",
                    title: "Data Structures & Algorithms PYQ 2024",
                    type: "PYQ",
                    category: "computer_science",
                    author: { name: "Grace Hopper", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace" },
                    upvotes: 38,
                    downvotes: 0,
                    tags: ["dsa", "pyq"],
                    created_at: new Date().toISOString()
                }
            ];
        }
        return sorted;
    }, [resources]);

    const recentQuestions = useMemo(() => {
        const sorted = [...questions]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
            
        if (sorted.length === 0) {
            return [
                {
                    id: "mock1",
                    title: "How to implement a LRU Cache?",
                    body: "I'm having trouble understanding the best data structure to use.",
                    author: { name: "Ada Lovelace", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ada" },
                    upvotes: 15,
                    downvotes: 0,
                    tags: ["dsa", "cache"],
                    answers: [{}, {}],
                    created_at: new Date().toISOString()
                },
                {
                    id: "mock2",
                    title: "What is the difference between TCP and UDP?",
                    body: "Can someone explain this with examples?",
                    author: { name: "Tim Berners-Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tim" },
                    upvotes: 12,
                    downvotes: 1,
                    tags: ["networks"],
                    answers: [{}],
                    created_at: new Date().toISOString()
                }
            ];
        }
        return sorted;
    }, [questions]);

    const allTags = useMemo(() => {
        const counts = {};
        
        resources.forEach(r => r.tags?.forEach(t => counts[t] = (counts[t] || 0) + 1));
        questions.forEach(q => q.tags?.forEach(t => counts[t] = (counts[t] || 0) + 1));

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (sorted.length === 0) {
            return [
                ["dsa", 42],
                ["react", 38],
                ["operating-systems", 25],
                ["networks", 18],
                ["system-design", 15],
                ["javascript", 12]
            ];
        }
        return sorted;
    }, [resources, questions]);

    const activeColleges = useMemo(() => {
        const counts = {};
        
        // Count colleges from resources
        resources.forEach(r => {
            if (r.college) counts[r.college] = (counts[r.college] || 0) + 1;
        });

        // Add current user's college if they are logged in
        if (isAuthenticated && currentUser?.college) {
            counts[currentUser.college] = (counts[currentUser.college] || 0) + 1;
        }

        const sorted = Object.entries(counts)
            .sort((a, b) => {
                if (b[1] !== a[1]) return b[1] - a[1];
                if (isAuthenticated && currentUser?.college) {
                    if (a[0] === currentUser.college) return -1;
                    if (b[0] === currentUser.college) return 1;
                }
                return a[0].localeCompare(b[0]);
            })
            .slice(0, 6);
            
        if (sorted.length === 0) {
            return [
                ["MIT", 124],
                ["Stanford University", 98],
                ["Harvard University", 85],
                ["IIT Bombay", 76],
                ["CMU", 64]
            ];
        }
        return sorted;
    }, [resources, currentUser, isAuthenticated]);

    return (
        <div className="space-y-16 fade-in-up">
            {!isAuthenticated && (
                <>
                    {/* ── EDITORIAL HERO ─────────────────────────────────── */}
                    <section className="relative overflow-hidden rounded-sm border border-rule bg-paper-2/40 card-elevated">
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
                                    volume one · summer '26 · for people who code
                                </p>

                                <h1 className="h-[180px] sm:h-auto font-display text-5xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[5.25rem]">
                                    A <span className="font-display-italic text-accent">learning</span>{" "}
                                    <span className="font-display-italic">space</span>
                                    <br />
                                    for <TypewriterEffect />
                                </h1>

                                <p className="-mt-2 sm:mt-8 max-w-2xl text-base  leading-relaxed text-ink-2 sm:text-lg">
                                    Share annotated notes, debate past-year papers, and grow a
                                    public technical profile linked to your GitHub. PeerVerse is
                                    built like a developer tool — and reads like a journal you
                                    actually want to open.
                                </p>

                                <div className="mt-9 flex flex-wrap items-center gap-4">
                                    <Link
                                        to="/resources"
                                        data-testid="hero-browse-btn"
                                        className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-semibold text-paper glow-btn shadow-xl shadow-accent/20 transition-all hover:scale-[1.02]"
                                    >
                                        Open the library <ArrowRight className="h-4 w-4" />
                                    </Link>

                                    <Link
                                        to="/ask"
                                        data-testid="hero-ask-btn"
                                        className="inline-flex items-center gap-2 rounded-sm border border-rule bg-paper-2/50 px-5 py-3 text-sm font-semibold text-ink transition-all hover:border-ink-3 hover:bg-paper-2/80 hover:shadow-lg"
                                    >
                                        Ask a question
                                    </Link>

                                    <span className="ml-2 hidden font-mono text-xs text-ink-3 md:inline bg-paper-2/50 px-2.5 py-1.5 rounded-md border border-rule/50">
                                        press <kbd className="font-bold text-ink-2">⌘ K</kbd> to jump anywhere
                                    </span>
                                </div>

                                {/* ── STATS SECTION ─────────────────────────────────── */}
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-9">
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
                                        value={questions.reduce((a, q) => a + (q.answers?.length || q.answerCount || 0), 0)}
                                        colorKey="answers"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── TICKER ─────────────────────────────── */}
                    <div className="overflow-hidden border-y-2 border-ink bg-ink py-4 shadow-lg w-[100vw] relative left-1/2 -ml-[50vw] md:w-[calc(100vw-var(--sidebar-width,16rem))] md:-ml-[calc(50vw-calc(var(--sidebar-width,16rem)/2))] transition-all duration-300 ease-in-out">
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
                <header className="">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
                                &sect;01 &middot; The feed
                            </p>

                            <h1 className="mt-2 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl">
                                {greeting} <span className="font-display-italic text-accent">{currentUser?.name?.split(' ')[0] || 'Peer'}</span>, <br className="hidden sm:inline" /><span className="hidden sm:inline">what are we <span className="marker">learning today?</span></span><span className="inline sm:hidden">ready to <span className="marker">explore?</span></span> 
                            </h1>

                            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-2">
                                Welcome to your learning space. Discover curated resources, engage in meaningful discussions, showcase your work, and stay connected with a community that believes knowledge grows when it's shared.
                            </p>
                        </div>
                        
                        <div className="flex items-center mt-2 gap-3">
                            <Link to="/ask" className="inline-flex items-center gap-2 rounded-sm bg-accent px-4 py-3 text-sm font-semibold text-paper transition-all hover:brightness-110 active:scale-95">
                                <MessageSquare className="h-4 w-4" /> Ask Question
                            </Link>
                            <Link to="/upload" className="inline-flex items-center gap-2 rounded-sm border border-rule bg-paper-2 px-4 py-3 text-sm font-semibold text-ink transition-all hover:border-ink-3 hover:bg-paper active:scale-95">
                                <BookOpen className="h-4 w-4" /> Share Note
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="mt-8 sm:hidden relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                        <input
                            type="text"
                            placeholder="Search notes, papers, questions…"
                            className="w-full h-10 rounded-sm border border-rule bg-paper-2/60 pl-9 pr-4 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30"
                        />
                    </div>
                </header>
            )}

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
                            <h2 className="mt-1 flex items-center gap-2 font-display text-4xl font-semibold tracking-tight text-ink">
                                <Flame className="h-7 w-7 text-accent" />
                                Most read
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
                    <div className="rounded-sm border border-rule bg-paper-2/60 p-5">
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

                    {/* Active colleges — old contents-page style */}
                    <div className="rounded-sm border border-rule bg-paper-2/60 p-5">
                        <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                            <Sparkles className="h-3.5 w-3.5 text-accent" />
                            // active colleges
                        </h3>

                        <ul className="mt-3 space-y-1">
                            {!apiLoaded ? (
                                [1, 2, 3, 4].map(i => (
                                    <li key={i} className="flex justify-between py-1.5 border-b border-dotted border-rule last:border-0">
                                        <div className="flex gap-2 w-full"><Skeleton className="h-4 w-4" /><Skeleton className="h-4 w-3/4" /></div>
                                        <Skeleton className="h-4 w-6" />
                                    </li>
                                ))
                            ) : activeColleges.length > 0 ? (
                                activeColleges.map(([c, count], i) => (
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
                                        <span className="font-mono text-xs text-ink-3">{count}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-xs text-ink-3 font-mono py-1.5">No active colleges.</li>
                            )}
                        </ul>
                    </div>
                    
                    {/* Profile card — index-card style */}
                    {isAuthenticated && currentUser && (
                    <div className="hidden sm:inline relative overflow-hidden rounded-sm border border-rule bg-paper-2/60 p-5">
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
                            <MiniStat value={currentUser.stats?.resources || 0} label="uploads" colorVar="--syntax-mint" />
                            <MiniStat value={currentUser.stats?.answers || 0} label="answers" colorVar="--syntax-cyan" />
                            <MiniStat value={currentUser.stats?.upvotes || 0} label="upvotes" colorVar="--syntax-amber" />
                        </div>

                        <Link
                            to={`/pv/${currentUser.username}`}
                            className="mt-4 block w-full rounded-sm border border-rule bg-paper py-2 text-center text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
                        >
                            View full profile →
                        </Link>
                    </div>
                    )}
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