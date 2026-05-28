import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Github, ExternalLink, Star, GitFork, Users, BookOpen,
    MessageSquare, Award, MapPin, Calendar, Sparkles, FolderGit2,
    Bookmark, Edit3, Linkedin, Twitter, Instagram, Code2,
    Globe, Building2, Camera, ChevronRight, Loader2, UserCheck, UserPlus,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { usersApi, githubApi } from "../services/api";
import ContributionGraph from "../components/ContributionGraph";
import ResourceCard from "../components/ResourceCard";
import QuestionCard from "../components/QuestionCard";
import TagBadge from "../components/TagBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { toast } from "sonner";
import NetworkBanner from "../components/NetworkBanner";

const LANG_COLORS = {
    "TypeScript": "#3178c6", "JavaScript": "#f1e05a", "Go": "#00ADD8",
    "Rust": "#dea584", "Python": "#3572A5", "Shell": "#89e051",
    "C++": "#f34b7d", "Java": "#b07219", "CSS": "#563d7c",
    "HTML": "#e34c26", "Swift": "#F05138", "Kotlin": "#A97BFF",
};

export default function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useApp();
    const { isAuthenticated } = useAuth();

    // Profile state
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // GitHub state
    const [ghProfile, setGhProfile] = useState(null);
    const [ghRepos, setGhRepos] = useState([]);
    const [ghLanguages, setGhLanguages] = useState([]);
    const [ghContribs, setGhContribs] = useState(null);
    const [ghLoading, setGhLoading] = useState(false);

    // UI state
    const [following, setFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const isOwnProfile = isAuthenticated && currentUser?.username === username;

    // ── Load profile ────────────────────────────────────────────────────────────
    useEffect(() => {
        setLoading(true);
        setError(null);
        usersApi.getProfile(username)
            .then((p) => {
                setProfile(p);
                setFollowing(p.viewerFollows);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Profile not found");
            })
            .finally(() => setLoading(false));
    }, [username]);

    // ── Load GitHub data when githubUsername is set ──────────────────────────────
    useEffect(() => {
        if (!profile?.githubUsername) return;
        const gh = profile.githubUsername;
        setGhLoading(true);
        Promise.all([
            githubApi.getProfile(gh).catch(() => null),
            githubApi.getRepos(gh, { limit: 4, pinned: true }).catch(() => []),
            githubApi.getLanguages(gh).catch(() => []),
            githubApi.getContributions(gh).catch(() => null),
        ]).then(([prof, repos, langs, contribs]) => {
            setGhProfile(prof);
            setGhRepos(repos.slice(0, 4));
            setGhLanguages(langs.slice(0, 7));
            setGhContribs(contribs);
        }).finally(() => setGhLoading(false));
    }, [profile?.githubUsername]);

    // ── Follow / Unfollow ────────────────────────────────────────────────────────
    const handleFollow = async () => {
        if (!isAuthenticated) { navigate("/login"); return; }
        setFollowLoading(true);
        try {
            if (following) {
                await usersApi.unfollow(username);
                setFollowing(false);
                setProfile(p => ({ ...p, stats: { ...p.stats, followers: (p.stats.followers || 1) - 1 } }));
                toast.success(`Unfollowed @${username}`);
            } else {
                await usersApi.follow(username);
                setFollowing(true);
                setProfile(p => ({ ...p, stats: { ...p.stats, followers: (p.stats.followers || 0) + 1 } }));
                toast.success(`Following @${username}`);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || "Action failed");
        }
        setFollowLoading(false);
    };

    // ── Avatar quick-upload ──────────────────────────────────────────────────────
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("avatar", file);
        setAvatarUploading(true);
        try {
            const updated = await usersApi.uploadAvatar(fd);
            setProfile(p => ({ ...p, avatar: updated.avatar, avatarUrl: updated.avatarUrl }));
            toast.success("Avatar updated");
        } catch {
            toast.error("Avatar upload failed");
        }
        setAvatarUploading(false);
    };

    // ── Banner quick-upload ──────────────────────────────────────────────────────
    const handleBannerUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("banner", file);
        setBannerUploading(true);
        try {
            const updated = await usersApi.uploadBanner(fd);
            setProfile(p => ({ ...p, bannerUrl: updated.bannerUrl }));
            toast.success("Banner updated");
        } catch {
            toast.error("Banner upload failed");
        }
        setBannerUploading(false);
    };


    // ── States ───────────────────────────────────────────────────────────────────
    if (loading) return <ProfileSkeleton />;
    if (error) return (
        <div className="py-24 text-center">
            <p className="font-display text-2xl text-ink">{error}</p>
            <Link to="/" className="mt-3 inline-block text-accent hover:underline">← Home</Link>
        </div>
    );

    const totalLangBytes = ghLanguages.reduce((a, l) => a + (l.bytes || 0), 0) || 1;

    return (
        <div className="space-y-8 fade-in-up">
            {/* ── Banner + Header ─────────────────────────────────────────────── */}
            <div>
                {/* Banner */}
                <div className="relative h-44 sm:h-56 overflow-hidden rounded-t-sm border border-rule group">
                    {profile.bannerUrl?.startsWith("data:image/svg+xml") ? (
                        <NetworkBanner username={profile.username} className="absolute inset-0 z-0" />
                    ) : (
                        <img src={profile.bannerUrl} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />
                    {isOwnProfile && (
                        <button
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={bannerUploading}
                            className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-sm border border-rule/60 bg-paper/80 px-3 py-1.5 text-xs font-mono text-ink backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-paper"
                        >
                            {bannerUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                            {bannerUploading ? "Uploading…" : "Change banner"}
                        </button>
                    )}
                    <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                </div>

                {/* Header */}
                <div className="relative px-4 sm:px-6 border border-t-0 border-rule rounded-b-sm bg-paper-2/20 pb-5">
                    <div className="flex justify-between items-end mb-4">
                        {/* Avatar */}
                        <div className="-mt-14 sm:-mt-16 relative group">
                            <img
                                src={profile.avatar}
                                alt={profile.name}
                                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-paper shadow-md object-cover bg-paper"
                            />
                            {isOwnProfile && (
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={avatarUploading}
                                    className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {avatarUploading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Camera className="h-6 w-6 text-white" />}
                                </button>
                            )}
                            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pb-2 flex-wrap justify-end">
                            {isOwnProfile ? (
                                <Link
                                    to="/settings/profile"
                                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-sm text-sm font-medium text-ink bg-paper border border-rule hover:border-ink-3 transition-colors"
                                >
                                    <Edit3 className="w-3.5 h-3.5" /> Edit profile
                                </Link>
                            ) : (
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-sm text-sm font-semibold transition-all ${
                                        following
                                            ? "text-ink bg-paper border border-rule hover:border-red-300 hover:text-red-400"
                                            : "text-paper bg-accent glow-btn hover:brightness-110"
                                    }`}
                                >
                                    {followLoading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : following ? (
                                        <><UserCheck className="w-3.5 h-3.5" /> Following</>
                                    ) : (
                                        <><UserPlus className="w-3.5 h-3.5" /> Follow</>
                                    )}
                                </button>
                            )}

                            {profile.githubUsername && (
                                <a
                                    href={`https://github.com/${profile.githubUsername}`}
                                    target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-sm text-sm font-medium text-ink bg-paper border border-rule hover:border-ink-3 transition-colors"
                                >
                                    <Github className="w-4 h-4" /> GitHub
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Name & username */}
                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight leading-tight">
                        {profile.name}
                    </h1>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm text-ink-2">
                        <span>@{profile.username}</span>
                        {profile.githubUsername && (
                            <>
                                <span className="text-ink-3">·</span>
                                <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-1 hover:text-accent transition-colors">
                                    <Github className="w-3.5 h-3.5" /> {profile.githubUsername}
                                </a>
                            </>
                        )}
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <p className="mt-3 text-ink-2 max-w-2xl leading-relaxed">{profile.bio}</p>
                    )}

                    {/* Location / org / website / joined */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono text-ink-3">
                        {profile.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {profile.location}
                            </span>
                        )}
                        {profile.organization && (
                            <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" /> {profile.organization}
                            </span>
                        )}
                        {profile.college && (
                            <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> {profile.college}
                                {profile.branch && ` · ${profile.branch}`}
                                {profile.graduationYear && ` · ${profile.graduationYear}`}
                            </span>
                        )}
                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1 hover:text-accent transition-colors">
                                <Globe className="w-3 h-3" /> {profile.website.replace(/^https?:\/\//, "")}
                            </a>
                        )}
                        {profile.joined && (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Joined {new Date(profile.joined).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                            </span>
                        )}
                    </div>

                    {/* Social links row */}
                    <div className="mt-3 flex items-center gap-3">
                        {profile.linkedinUrl && (
                            <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" title="LinkedIn"
                                className="text-ink-3 hover:text-[#0077B5] transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        )}
                        {profile.twitterHandle && (
                            <a href={`https://x.com/${profile.twitterHandle}`} target="_blank" rel="noreferrer" title="X / Twitter"
                                className="text-ink-3 hover:text-ink transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                        )}
                        {profile.instagramHandle && (
                            <a href={`https://instagram.com/${profile.instagramHandle}`} target="_blank" rel="noreferrer" title="Instagram"
                                className="text-ink-3 hover:text-[#E1306C] transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                        )}
                        {profile.leetcodeUsername && (
                            <a href={`https://leetcode.com/${profile.leetcodeUsername}`} target="_blank" rel="noreferrer" title="LeetCode"
                                className="text-ink-3 hover:text-[#FFA116] transition-colors text-xs font-mono font-bold">
                                LC
                            </a>
                        )}
                    </div>

                    {/* Follower / Following counts */}
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        {isOwnProfile ? (
                            <>
                                <Link to={`/pv/${username}/followers`} className="flex items-center gap-1.5 text-ink hover:text-accent transition-colors">
                                    <span className="font-semibold font-mono">{(profile.stats?.followers || 0).toLocaleString()}</span>
                                    <span className="text-ink-3 font-mono text-xs">followers</span>
                                </Link>
                                <Link to={`/pv/${username}/following`} className="flex items-center gap-1.5 text-ink hover:text-accent transition-colors">
                                    <span className="font-semibold font-mono">{(profile.stats?.following || 0).toLocaleString()}</span>
                                    <span className="text-ink-3 font-mono text-xs">following</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <span className="flex items-center gap-1.5">
                                    <span className="font-semibold font-mono">{(profile.stats?.followers || 0).toLocaleString()}</span>
                                    <span className="text-ink-3 font-mono text-xs">followers</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="font-semibold font-mono">{(profile.stats?.following || 0).toLocaleString()}</span>
                                    <span className="text-ink-3 font-mono text-xs">following</span>
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Skills ─────────────────────────────────────────────────────── */}
            {profile.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map(s => <TagBadge key={s} size="md">{s}</TagBadge>)}
                </div>
            )}

            {/* ── Stats bento ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile icon={BookOpen} colorVar="--syntax-mint" label="resources uploaded" value={profile.stats?.resources || 0} />
                <StatTile icon={MessageSquare} colorVar="--syntax-cyan" label="questions asked" value={profile.stats?.questions || 0} />
                <StatTile icon={Award} colorVar="--syntax-violet" label="questions answered" value={profile.stats?.answers || 0} />
                <StatTile icon={Sparkles} colorVar="--syntax-amber" label="total upvotes" value={profile.stats?.totalUpvotes || 0} />
            </div>

            {/* ── GitHub bento ────────────────────────────────────────────────── */}
            {profile.githubUsername ? (
                <section className="border border-rule rounded-sm bg-paper-2/30 overflow-hidden card-elevated">
                    <header className="flex items-center justify-between px-5 py-4 border-b border-rule">
                        <div className="flex items-center gap-3">
                            <Github className="w-5 h-5 text-ink-2" />
                            <h2 className="font-display text-lg font-semibold text-ink">GitHub</h2>
                            {ghProfile && <span className="font-mono text-xs text-ink-3">@{ghProfile.login}</span>}
                        </div>
                        <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer"
                            className="text-xs font-mono uppercase tracking-wider text-ink-3 hover:text-accent inline-flex items-center gap-1 transition-colors">
                            visit <ExternalLink className="w-3 h-3" />
                        </a>
                    </header>

                    {ghLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-ink-3" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                            {/* Stats column */}
                            <div className="lg:col-span-4 p-5 border-b lg:border-b-0 lg:border-r border-rule space-y-4">
                                {ghProfile && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <MiniStat icon={Users} label="followers" value={ghProfile.followers || 0} />
                                        <MiniStat icon={Users} label="following" value={ghProfile.following || 0} />
                                        <MiniStat icon={FolderGit2} label="repos" value={ghProfile.publicRepos || 0} />
                                        {ghContribs && <MiniStat icon={Sparkles} label="streak (days)" value={ghContribs.currentStreak || 0} />}
                                    </div>
                                )}

                                {ghLanguages.length > 0 && (
                                    <div>
                                        <p className="font-mono text-xs uppercase tracking-wider text-ink-3 mb-3">// top languages</p>
                                        <div className="h-2 rounded-full overflow-hidden flex bg-paper-3">
                                            {ghLanguages.map((l) => {
                                                const pct = Math.round((l.bytes / totalLangBytes) * 1000) / 10;
                                                const color = LANG_COLORS[l.name] || "#71717a";
                                                return <div key={l.name} style={{ width: `${pct}%`, backgroundColor: color }} title={`${l.name} ${pct}%`} />;
                                            })}
                                        </div>
                                        <ul className="mt-3 space-y-1.5">
                                            {ghLanguages.map(l => {
                                                const pct = Math.round((l.bytes / totalLangBytes) * 1000) / 10;
                                                const color = LANG_COLORS[l.name] || "#71717a";
                                                return (
                                                    <li key={l.name} className="flex items-center justify-between text-xs">
                                                        <span className="flex items-center gap-2 text-ink-2">
                                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                                            {l.name}
                                                        </span>
                                                        <span className="font-mono text-ink-3">{pct}%</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Contributions + repos */}
                            <div className="lg:col-span-8 p-5 space-y-5">
                                <ContributionGraph contributionData={ghContribs?.contributionsByDay} />

                                {ghRepos.length > 0 && (
                                    <div>
                                        <p className="font-mono text-xs uppercase tracking-wider text-ink-3 mb-3">// pinned repositories</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {ghRepos.map(repo => (
                                                <a key={repo.id || repo.name} href={repo.htmlUrl} target="_blank" rel="noreferrer"
                                                    className="block p-4 border border-rule rounded-sm hover:border-ink-3 bg-paper/50 transition-colors group">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FolderGit2 className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                                                        <span className="font-mono text-sm font-semibold text-accent group-hover:brightness-110 truncate">{repo.name}</span>
                                                    </div>
                                                    <p className="text-xs text-ink-2 line-clamp-2 mb-3">{repo.description || "No description"}</p>
                                                    <div className="flex items-center gap-3 text-xs font-mono text-ink-3">
                                                        {repo.language && (
                                                            <span className="flex items-center gap-1">
                                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG_COLORS[repo.language] || "#71717a" }} />
                                                                {repo.language}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {repo.stars || 0}</span>
                                                        <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {repo.forks || 0}</span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            ) : isOwnProfile ? (
                <section className="border border-dashed border-rule rounded-sm p-8 text-center">
                    <Github className="w-8 h-8 text-ink-3 mx-auto mb-3" />
                    <p className="text-sm text-ink-2">Connect your GitHub to show repos and contributions</p>
                    <Link to="/settings/profile"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
                        Add GitHub username <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </section>
            ) : null}

            {/* ── Activity tabs ────────────────────────────────────────────────── */}
            <ActivityTabs profile={profile} />
        </div>
    );
}

// ── Activity tabs (async-loaded) ─────────────────────────────────────────────
function ActivityTabs({ profile }) {
    const { resources, questions, bookmarks } = useApp();
    const { isAuthenticated } = useAuth();
    const { currentUser } = useApp();
    const isOwnProfile = isAuthenticated && currentUser?.username === profile.username;

    const myResources = resources.filter(r => r.uploader?.id === profile.id || r.uploader?.username === profile.username);
    const myQuestions = questions.filter(q => q.author?.id === profile.id || q.author?.username === profile.username);
    const myAnswers = [];
    questions.forEach(q => q.answers?.forEach(a => {
        if (a.author?.id === profile.id || a.author?.username === profile.username)
            myAnswers.push({ ...a, question: q });
    }));
    const savedResources = resources.filter(r => bookmarks.has(r.id));

    return (
        <Tabs defaultValue="resources" className="w-full">
            <TabsList className="bg-paper-2/60 border border-rule p-1 h-auto flex-wrap">
                <TabsTrigger value="resources" className="data-[state=active]:bg-paper data-[state=active]:text-accent px-4 py-2 text-sm">
                    Uploaded ({myResources.length})
                </TabsTrigger>
                <TabsTrigger value="questions" className="data-[state=active]:bg-paper data-[state=active]:text-accent px-4 py-2 text-sm">
                    Asked ({myQuestions.length})
                </TabsTrigger>
                <TabsTrigger value="answers" className="data-[state=active]:bg-paper data-[state=active]:text-accent px-4 py-2 text-sm">
                    Answered ({myAnswers.length})
                </TabsTrigger>
                {isOwnProfile && (
                    <TabsTrigger value="saved" className="data-[state=active]:bg-paper data-[state=active]:text-accent px-4 py-2 text-sm">
                        Saved ({savedResources.length})
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="resources" className="mt-5 space-y-3">
                {myResources.length === 0 ? <Empty label="No resources uploaded yet." /> : myResources.map(r => <ResourceCard key={r.id} resource={r} />)}
            </TabsContent>
            <TabsContent value="questions" className="mt-5 space-y-3">
                {myQuestions.length === 0 ? <Empty label="No questions asked yet." /> : myQuestions.map(q => <QuestionCard key={q.id} question={q} />)}
            </TabsContent>
            <TabsContent value="answers" className="mt-5 space-y-3">
                {myAnswers.length === 0 ? <Empty label="No answers yet." /> : myAnswers.map(a => (
                    <Link to={`/questions/${a.question.id}`} key={a.id} className="block p-4 border border-rule rounded-sm bg-paper-2/30 hover:border-ink-3 hover:bg-paper-2/60 transition-colors">
                        <p className="font-mono text-xs uppercase tracking-wider text-ink-3 mb-1">// answer on</p>
                        <p className="font-display font-semibold text-ink">{a.question.title}</p>
                        <p className="mt-2 text-sm text-ink-2 line-clamp-2">{a.body}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs font-mono text-ink-3">
                            <span>{(a.upvotes || 0) - (a.downvotes || 0)} votes</span>
                            {a.accepted && <span className="text-accent-2">✓ accepted</span>}
                        </div>
                    </Link>
                ))}
            </TabsContent>
            {isOwnProfile && (
                <TabsContent value="saved" className="mt-5 space-y-3">
                    {savedResources.length === 0 ? <Empty label="Bookmarked resources will show here." /> : savedResources.map(r => <ResourceCard key={r.id} resource={r} />)}
                </TabsContent>
            )}
        </Tabs>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatTile({ icon: Icon, label, value, colorVar }) {
    const c = `var(${colorVar})`;
    return (
        <div className="p-5 border border-rule rounded-sm bg-paper-2/40 card-elevated">
            <div className="w-9 h-9 rounded-sm border flex items-center justify-center" style={{ borderColor: c, color: c }}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-ink tabular-nums">{value.toLocaleString()}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-3 mt-1">{label}</div>
        </div>
    );
}

function MiniStat({ icon: Icon, label, value }) {
    return (
        <div className="p-3 border border-rule rounded-sm bg-paper/50">
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
            <p className="text-ink-2 text-sm">{label}</p>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-44 sm:h-56 rounded-t-sm bg-paper-2" />
            <div className="px-4 sm:px-6 space-y-3">
                <div className="h-10 w-48 rounded-sm bg-paper-2" />
                <div className="h-4 w-32 rounded-sm bg-paper-2" />
                <div className="h-4 w-72 rounded-sm bg-paper-2" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-sm bg-paper-2" />)}
            </div>
        </div>
    );
}