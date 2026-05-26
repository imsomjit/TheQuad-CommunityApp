import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Flame, Sparkles, TrendingUp, ArrowRight, BookOpen, MessageSquare, Users, Award } from "lucide-react";
import { useApp } from "../context/AppContext";
import ResourceCard from "../components/ResourceCard";
import QuestionCard from "../components/QuestionCard";
import TagBadge from "../components/TagBadge";
import { COLLEGES } from "../data/mockData";

const StatTile = ({ icon: Icon, label, value, accent }) => (
    <div className="flex items-center gap-3 p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center border ${accent}`}>
            <Icon className="w-4 h-4" />
        </div>
        <div>
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-500">{label}</div>
            <div className="font-display text-2xl font-bold text-zinc-50">{value}</div>
        </div>
    </div>
);

export default function Home() {
    const { resources, questions, currentUser } = useApp();

    const trendingResources = useMemo(() =>
        [...resources].sort((a, b) => (b.upvotes + b.downloads / 5) - (a.upvotes + a.downloads / 5)).slice(0, 4),
        [resources]);

    const recentQuestions = useMemo(() =>
        [...questions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4),
        [questions]);

    const allTags = useMemo(() => {
        const counts = {};
        [...resources, ...questions].forEach(item => {
            (item.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 14);
    }, [resources, questions]);

    return (
        <div className="space-y-12 fade-in-up">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <div className="aurora" />
                <div className="absolute inset-0 grid-bg opacity-50" />
                <div className="relative px-6 sm:px-10 py-12 sm:py-16">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                            now in beta
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500">// 2,400+ students shipping resources</span>
                    </div>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-zinc-50 max-w-3xl leading-[1.05]">
                        The dev-shaped study hub for{" "}
                        <span className="text-emerald-400">people who code</span>{" "}
                        <span className="text-zinc-500">→</span>{" "}
                        <span className="text-zinc-500">people who ship.</span>
                    </h1>
                    <p className="mt-5 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed">
                        Share notes & PYQs, debate answers, and build a public technical profile linked to your GitHub. Designed like a developer tool, not another forum.
                    </p>
                    <div className="mt-7 flex items-center gap-3 flex-wrap">
                        <Link
                            to="/resources"
                            data-testid="hero-browse-btn"
                            className="inline-flex items-center gap-2 h-11 px-5 rounded-md text-sm font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all"
                        >
                            Browse resources <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/ask"
                            data-testid="hero-ask-btn"
                            className="inline-flex items-center gap-2 h-11 px-5 rounded-md text-sm font-semibold text-zinc-50 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                        >
                            Ask a question
                        </Link>
                        <span className="hidden md:inline font-mono text-xs text-zinc-600 ml-2">⌘K to jump anywhere</span>
                    </div>

                    <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatTile icon={BookOpen} label="resources" value={resources.length.toLocaleString()} accent="bg-emerald-500/10 border-emerald-500/30 text-emerald-400" />
                        <StatTile icon={MessageSquare} label="questions" value={questions.length.toLocaleString()} accent="bg-blue-500/10 border-blue-500/30 text-blue-400" />
                        <StatTile icon={Users} label="students" value="2.4k" accent="bg-violet-500/10 border-violet-500/30 text-violet-400" />
                        <StatTile icon={Award} label="answers" value={questions.reduce((a, q) => a + q.answers.length, 0)} accent="bg-amber-500/10 border-amber-500/30 text-amber-400" />
                    </div>
                </div>
            </section>

            {/* Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Trending Resources */}
                <section className="lg:col-span-7 space-y-4">
                    <header className="flex items-center justify-between">
                        <h2 className="font-display text-2xl font-semibold text-zinc-50 flex items-center gap-2">
                            <Flame className="w-5 h-5 text-emerald-400" />
                            Trending resources
                        </h2>
                        <Link to="/resources" className="text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1">
                            all resources <ArrowRight className="w-3 h-3" />
                        </Link>
                    </header>
                    <div className="space-y-3">
                        {trendingResources.map(r => <ResourceCard key={r.id} resource={r} />)}
                    </div>
                </section>

                {/* Sidebar */}
                <aside className="lg:col-span-5 space-y-6">
                    <div className="p-5 border border-zinc-800 rounded-lg bg-zinc-900/40">
                        <div className="flex items-center gap-3 mb-4">
                            <img src={currentUser.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-zinc-800" />
                            <div>
                                <div className="font-display font-semibold text-zinc-50">{currentUser.name}</div>
                                <div className="font-mono text-xs text-zinc-500">@{currentUser.username}</div>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">{currentUser.bio}</p>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 border border-zinc-800 rounded">
                                <div className="font-mono text-lg font-bold text-emerald-400 tabular-nums">{currentUser.stats.resources}</div>
                                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">uploads</div>
                            </div>
                            <div className="p-2 border border-zinc-800 rounded">
                                <div className="font-mono text-lg font-bold text-blue-400 tabular-nums">{currentUser.stats.answers}</div>
                                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">answers</div>
                            </div>
                            <div className="p-2 border border-zinc-800 rounded">
                                <div className="font-mono text-lg font-bold text-amber-400 tabular-nums">{currentUser.stats.upvotes}</div>
                                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">upvotes</div>
                            </div>
                        </div>
                        <Link
                            to={`/u/${currentUser.username}`}
                            className="mt-4 block w-full text-center h-9 leading-9 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 transition-colors"
                        >
                            View profile
                        </Link>
                    </div>

                    <div className="p-5 border border-zinc-800 rounded-lg bg-zinc-900/40">
                        <h3 className="font-display font-semibold text-zinc-50 flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            Popular tags
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {allTags.map(([tag, count]) => (
                                <Link key={tag} to={`/resources?tag=${tag}`}>
                                    <TagBadge>#{tag}<span className="ml-1.5 text-zinc-600">{count}</span></TagBadge>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 border border-zinc-800 rounded-lg bg-zinc-900/40">
                        <h3 className="font-display font-semibold text-zinc-50 mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            Active colleges
                        </h3>
                        <ul className="space-y-1">
                            {COLLEGES.slice(0, 6).map((c, i) => (
                                <li key={c} className="flex items-center justify-between text-sm py-1 group cursor-pointer">
                                    <span className="text-zinc-400 group-hover:text-zinc-50 transition-colors">
                                        <span className="font-mono text-zinc-600 mr-2">{String(i + 1).padStart(2, "0")}</span>
                                        {c}
                                    </span>
                                    <span className="font-mono text-xs text-zinc-600">{180 - i * 17}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>

            {/* Recent questions */}
            <section className="space-y-4">
                <header className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-semibold text-zinc-50 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                        Recent questions
                    </h2>
                    <Link to="/questions" className="text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1">
                        all questions <ArrowRight className="w-3 h-3" />
                    </Link>
                </header>
                <div className="space-y-3">
                    {recentQuestions.map(q => <QuestionCard key={q.id} question={q} />)}
                </div>
            </section>
        </div>
    );
}