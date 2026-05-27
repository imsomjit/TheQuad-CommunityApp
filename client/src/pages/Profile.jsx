import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Github, ExternalLink, Star, GitFork, Users, BookOpen,
    MessageSquare, Award, MapPin, Calendar, Sparkles, FolderGit2, Bookmark
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { USERS, GITHUB_MOCK } from "../data/mockData";
import ContributionGraph from "../components/ContributionGraph";
import ResourceCard from "../components/ResourceCard";
import QuestionCard from "../components/QuestionCard";
import TagBadge from "../components/TagBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const LANG_COLORS = {
    "TypeScript": "#3178c6",
    "JavaScript": "#f1e05a",
    "Go": "#00ADD8",
    "Rust": "#dea584",
    "Python": "#3572A5",
    "Shell": "#89e051",
    "C++": "#f34b7d",
};

export default function Profile() {
    const { username } = useParams();
    const { resources, questions, bookmarks, currentUser } = useApp();
    const user = USERS.find(u => u.username === username) || currentUser;

    const myResources = useMemo(() => resources.filter(r => r.uploader.id === user.id), [resources, user.id]);
    const myQuestions = useMemo(() => questions.filter(q => q.author.id === user.id), [questions, user.id]);

    const myAnswers = useMemo(() => {
        const out = [];
        questions.forEach(q => {
            q.answers.forEach(a => {
                if (a.author.id === user.id) out.push({ ...a, question: q });
            });
        });
        return out;
    }, [questions, user.id]);

    const savedResources = useMemo(() => resources.filter(r => bookmarks.has(r.id)), [resources, bookmarks]);

    const totalUpvotes = useMemo(() => {
        return myResources.reduce((a, r) => a + r.upvotes, 0)
            + myQuestions.reduce((a, q) => a + q.upvotes, 0)
            + myAnswers.reduce((a, a2) => a + a2.upvotes, 0);
    }, [myResources, myQuestions, myAnswers]);

    return (
        <div className="space-y-8 fade-in-up">
            {/* Cover + Header Section (Grouped to avoid space-y interference) */}
            <div>
                {/* Cover */}
                <div className="relative h-44 sm:h-56 rounded-t-sm overflow-hidden border border-rule">
                <img
                    src="https://images.unsplash.com/photo-1761599821310-da0d6356b4f3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvZGluZyUyMGJhY2tncm91bmQlMjBkYXJrfGVufDB8fHx8MT77981174MHww&ixlib=rb-4.1.0&q=85"
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 grid-bg opacity-40" />
            </div>

            {/* Header */}
            <div className="relative px-4 sm:px-6">
                <div className="flex justify-between items-end mb-3">
                    {/* Avatar overlapping banner */}
                    <div className="-mt-14 sm:-mt-16">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-paper shadow-md object-cover relative z-10 bg-paper"
                        />
                    </div>

                    {/* Action Buttons (Right aligned, below banner) */}
                    <div className="flex gap-2 pb-2">
                        <a
                            href={`https://github.com/${user.github_username || "aaravmehta"}`}
                            target="_blank" rel="noreferrer"
                            data-testid="profile-github-link"
                            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-sm text-sm font-medium text-ink bg-paper-2 border border-rule hover:border-ink-3 transition-colors"
                        >
                            <Github className="w-4 h-4" /> GitHub
                        </a>
                        <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-sm text-sm font-semibold text-paper bg-accent glow-btn">
                            Follow
                        </button>
                    </div>
                </div>

                {/* Profile Text */}
                <div>
                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">{user.name}</h1>
                    <div className="mt-1 flex items-center gap-2 font-mono text-sm text-ink-2">
                        <span>@{user.username}</span>
                        {user.github_username && (
                            <>
                                <span className="text-ink-3">·</span>
                                <a href={`https://github.com/${user.github_username}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-accent transition-colors">
                                    <Github className="w-3.5 h-3.5" /> {user.github_username}
                                </a>
                            </>
                        )}
                    </div>
                    <p className="mt-3 text-ink-2 max-w-2xl leading-relaxed">{user.bio}</p>
                    <div className="mt-3 flex items-center gap-4 flex-wrap text-xs font-mono text-ink-3">
                        {user.college && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {user.college}</span>}
                        {user.branch && <span>{user.branch} · Sem {user.semester}</span>}
                        {user.joined && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> joined {new Date(user.joined).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>}
                    </div>
                </div>
            </div>
            </div>

            {/* Skills */}
            {user.skills && (
                <div className="px-4 sm:px-6">
                    <div className="flex flex-wrap gap-1.5">
                        {user.skills.map(s => <TagBadge key={s} size="md">{s}</TagBadge>)}
                    </div>
                </div>
            )}

            {/* Bento stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile icon={BookOpen} colorVar="--syntax-mint" label="resources uploaded" value={myResources.length} />
                <StatTile icon={MessageSquare} colorVar="--syntax-cyan" label="questions asked" value={myQuestions.length} />
                <StatTile icon={Award} colorVar="--syntax-violet" label="questions answered" value={myAnswers.length} />
                <StatTile icon={Sparkles} colorVar="--syntax-amber" label="total upvotes" value={totalUpvotes} />
            </div>

            {/* GitHub bento */}
            <section className="border border-rule rounded-sm bg-paper-2/30 overflow-hidden card-elevated">
                <header className="flex items-center justify-between px-5 py-4 border-b border-rule">
                    <div className="flex items-center gap-3">
                        <Github className="w-5 h-5 text-ink-2" />
                        <h2 className="font-display text-lg font-semibold text-ink">GitHub</h2>
                        <span className="font-mono text-xs text-ink-3">@{GITHUB_MOCK.username}</span>
                    </div>
                    <a href={`https://github.com/${GITHUB_MOCK.username}`} target="_blank" rel="noreferrer" className="text-xs font-mono uppercase tracking-wider text-ink-3 hover:text-accent inline-flex items-center gap-1 transition-colors">
                        visit <ExternalLink className="w-3 h-3" />
                    </a>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Stats column */}
                    <div className="lg:col-span-4 p-5 border-b lg:border-b-0 lg:border-r border-rule space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <MiniStat icon={Users} label="followers" value={GITHUB_MOCK.followers} />
                            <MiniStat icon={Users} label="following" value={GITHUB_MOCK.following} />
                            <MiniStat icon={FolderGit2} label="repos" value={GITHUB_MOCK.public_repos} />
                            <MiniStat icon={Star} label="stars" value={GITHUB_MOCK.total_stars} />
                        </div>

                        <div>
                            <p className="font-mono text-xs uppercase tracking-wider text-ink-3 mb-3">// top languages</p>
                            <div className="h-2 rounded-full overflow-hidden flex bg-paper-3">
                                {GITHUB_MOCK.top_languages.map((l) => (
                                    <div key={l.name} style={{ width: `${l.percent}%`, backgroundColor: l.color }} title={`${l.name} ${l.percent}%`} />
                                ))}
                            </div>
                            <ul className="mt-3 space-y-1.5">
                                {GITHUB_MOCK.top_languages.map(l => (
                                    <li key={l.name} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 text-ink-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                                            {l.name}
                                        </span>
                                        <span className="font-mono text-ink-3">{l.percent}%</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Contributions + repos */}
                    <div className="lg:col-span-8 p-5 space-y-5">
                        <ContributionGraph />

                        <div>
                            <p className="font-mono text-xs uppercase tracking-wider text-ink-3 mb-3">// pinned repositories</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {GITHUB_MOCK.repos.slice(0, 4).map(repo => (
                                    <a
                                        key={repo.name}
                                        href={`https://github.com/${GITHUB_MOCK.username}/${repo.name}`}
                                        target="_blank" rel="noreferrer"
                                        className="block p-4 border border-rule rounded-sm hover:border-ink-3 bg-paper/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <FolderGit2 className="w-3.5 h-3.5 text-ink-3" />
                                            <span className="font-mono text-sm font-semibold text-accent group-hover:brightness-110 truncate">{repo.name}</span>
                                        </div>
                                        <p className="text-xs text-ink-2 line-clamp-2 mb-3">{repo.description}</p>
                                        <div className="flex items-center gap-3 text-xs font-mono text-ink-3">
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG_COLORS[repo.language] || "#71717a" }} />
                                                {repo.language}
                                            </span>
                                            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {repo.stars}</span>
                                            <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {repo.forks}</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Activity tabs */}
            <Tabs defaultValue="resources" className="w-full">
                <TabsList className="bg-paper-2/60 border border-rule p-1 h-auto">
                    <TabsTrigger data-testid="profile-tab-resources" value="resources" className="data-[state=active]:bg-paper data-[state=active]:text-accent px-4 py-2 text-sm">Uploaded ({myResources.length})</TabsTrigger>
                    <TabsTrigger data-testid="profile-tab-questions" value="questions" className="data-[state=active]:bg-paper data-[state=active]:text-accent px-4 py-2 text-sm">Asked ({myQuestions.length})</TabsTrigger>
                    <TabsTrigger data-testid="profile-tab-answers" value="answers" className="data-[state=active]:bg-paper data-[state=active]:text-accent px-4 py-2 text-sm">Answered ({myAnswers.length})</TabsTrigger>
                    {user.id === currentUser.id && (
                        <TabsTrigger data-testid="profile-tab-saved" value="saved" className="data-[state=active]:bg-paper data-[state=active]:text-accent px-4 py-2 text-sm">Saved ({savedResources.length})</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="resources" className="mt-5 space-y-3">
                    {myResources.length === 0 ? <Empty label="No resources yet." /> : myResources.map(r => <ResourceCard key={r.id} resource={r} />)}
                </TabsContent>
                <TabsContent value="questions" className="mt-5 space-y-3">
                    {myQuestions.length === 0 ? <Empty label="No questions yet." /> : myQuestions.map(q => <QuestionCard key={q.id} question={q} />)}
                </TabsContent>
                <TabsContent value="answers" className="mt-5 space-y-3">
                    {myAnswers.length === 0 ? <Empty label="No answers yet." /> : myAnswers.map(a => (
                        <Link to={`/questions/${a.question.id}`} key={a.id} className="block p-4 border border-rule rounded-sm bg-paper-2/30 hover:border-ink-3 hover:bg-paper-2/60 transition-colors">
                            <p className="font-mono text-xs uppercase tracking-wider text-ink-3 mb-1">// answer on</p>
                            <p className="font-display font-semibold text-ink group-hover:text-accent">{a.question.title}</p>
                            <p className="mt-2 text-sm text-ink-2 line-clamp-2">{a.body}</p>
                            <div className="mt-2 flex items-center gap-3 text-xs font-mono text-ink-3">
                                <span>{a.upvotes - a.downvotes} votes</span>
                                {a.accepted && <span className="text-accent-2">✓ accepted</span>}
                            </div>
                        </Link>
                    ))}
                </TabsContent>
                {user.id === currentUser.id && (
                    <TabsContent value="saved" className="mt-5 space-y-3">
                        {savedResources.length === 0 ? <Empty label="Bookmarked resources will show here." /> : savedResources.map(r => <ResourceCard key={r.id} resource={r} />)}
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

function StatTile({ icon: Icon, label, value, colorVar }) {
    const c = `var(${colorVar})`;

    return (
        <div className="p-5 border border-rule rounded-sm bg-paper-2/40 card-elevated">
            <div
                className="w-9 h-9 rounded-sm border flex items-center justify-center"
                style={{ borderColor: c, color: c, backgroundColor: "transparent" }}
            >
                <Icon className="w-4 h-4" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-ink tabular-nums">{value}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-3 mt-1">{label}</div>
        </div>
    );
}

function MiniStat({ icon: Icon, label, value }) {
    return (
        <div className="p-3 border border-rule rounded-sm bg-paper/50 card-elevated">
            <div className="flex items-center gap-1.5 text-ink-3">
                <Icon className="w-3 h-3" />
                <span className="font-mono text-[10px] uppercase tracking-wider">{label}</span>
            </div>
            <div className="mt-1 font-display text-xl font-bold text-ink tabular-nums">{value.toLocaleString()}</div>
        </div>
    );
}

function Empty({ label }) {
    return (
        <div className="text-center py-12 border border-dashed border-rule rounded-sm">
            <Bookmark className="w-7 h-7 text-ink-3 mx-auto mb-2" />
            <p className="text-ink-2">{label}</p>
        </div>
    );
}