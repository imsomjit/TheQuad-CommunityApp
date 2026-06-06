import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Github, ExternalLink, Star, GitFork, Users, BookOpen,
    MessageSquare, Award, MapPin, Calendar, Sparkles, FolderGit2,
    Bookmark, Edit3, Linkedin, Twitter, Instagram, Code2,
    Trophy, Globe, Building2, Camera, ChevronRight, UserCheck, UserPlus, LogOut, ShieldAlert
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { generateSlug } from "../utils/slugify";
import { usersApi, githubApi, leetcodeApi } from "../services/api";
import ContributionGraph from "../components/ContributionGraph";
import ResourceCard from "../components/ResourceCard";
import QuestionCard from "../components/QuestionCard";
import Loader from "../components/Loader";
import { GithubStatsSkeleton, LeetcodeStatsSkeleton } from "../components/Skeletons";
import TagBadge from "../components/TagBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { toast } from "sonner";
import NetworkBanner from "../components/NetworkBanner";

export const LANG_COLORS = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  "C#": "#239120",
  PHP: "#4F5D95",
  Ruby: "#CC342D",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#0175C2",
  Scala: "#DC322F",
  R: "#276DC3",
  MATLAB: "#E16737",
  Perl: "#39457E",
  Lua: "#000080",
  Haskell: "#5E5086",
  Elixir: "#6E4A7E",
  Clojure: "#DB5855",
  Groovy: "#4298B8",
  HTML: "#E34F26",
  CSS: "#663399",
  SCSS: "#CF649A",
  Less: "#1D365D",
  Sass: "#CC6699",
  Vue: "#41B883",
  Svelte: "#FF3E00",
  Shell: "#89E051",
  PowerShell: "#012456",
  Batchfile: "#C1F12E",
  SQL: "#E38C00",
  "PLpgSQL": "#336791",
  "PL/pgSQL": "#336791",
  Dockerfile: "#2496ED",
  YAML: "#CB171E",
  JSON: "#F4A261",
  XML: "#8BC34A",
  TOML: "#9C4221",
  Markdown: "#083FA1",
  Assembly: "#6E4C13",
  Solidity: "#AA6746",
  Zig: "#F7A41D",
  "Objective-C": "#438EFF",
  "Objective-C++": "#6866FB",
  "Jupyter Notebook": "#DA5B0B",
};

export default function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useApp();
    const { isAuthenticated, logout } = useAuth();

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
    const [leetcodeStats, setLeetcodeStats] = useState(null);
    const [leetcodeLoading, setLeetcodeLoading] = useState(false);
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
            githubApi.getRepos(gh, { limit: 2, sort: 'updated' }).catch(() => []),
            githubApi.getLanguages(gh).catch(() => []),
            githubApi.getContributions(gh).catch(() => null),
        ]).then(([prof, repos, langs, contribs]) => {
            setGhProfile(prof);
            setGhRepos(repos.slice(0, 4));
            setGhLanguages(langs.slice(0, 7));
            setGhContribs(contribs);
        }).finally(() => setGhLoading(false));
    }, [profile?.githubUsername]);

    // ── Load LeetCode data when leetcodeUsername is set ────────────────────────
    useEffect(() => {
        if (!profile?.leetcodeUsername) return;
        setLeetcodeLoading(true);
        leetcodeApi.getProfileStats(profile.leetcodeUsername)
            .then(setLeetcodeStats)
            .catch(() => setLeetcodeStats(null))
            .finally(() => setLeetcodeLoading(false));
    }, [profile?.leetcodeUsername]);

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Banner + Header ─────────────────────────────────────────────── */}
            <div>
                {/* Banner */}
                <div className="relative h-44 sm:h-56 overflow-hidden rounded-t-md border border-rule group">
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
                            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-md border border-rule/60 bg-paper/80 px-3 py-1.5 text-xs font-mono text-ink backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-paper"
                        >
                            {bannerUploading ? <Loader inline size="sm" /> : <Camera className="h-3 w-3" />}
                            {bannerUploading ? "Uploading…" : "Change banner"}
                        </button>
                    )}
                    
                    {isOwnProfile && (profile.role === 'admin' || profile.role === 'moderator') && (
                        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-md border border-accent-soft bg-accent px-3 py-1 text-xs font-medium font-mono uppercase tracking-wider text-paper backdrop-blur-md shadow-md" title={`${profile.role} Console Access`}>
                            <ShieldAlert className="h-3.5 w-3.5" />
                            {profile.role}
                        </div>
                    )}

                    <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                </div>

                {/* Header */}
                <div className="relative px-4 sm:px-6 border border-t-0 border-rule rounded-b-md bg-paper-2/20 pb-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-4 mb-4">
                        {/* Avatar */}
                        <div className="-mt-14 sm:-mt-16 relative group self-start shrink-0">
                            <img
                                src={profile.avatar}
                                alt={profile.name}
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-accent shadow-md object-cover bg-paper"
                            />
                            {isOwnProfile && (
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={avatarUploading}
                                    className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {avatarUploading ? <Loader inline size="md" className="text-white" /> : <Camera className="h-6 w-6 text-white" />}
                                </button>
                            )}
                            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pb-2 flex-wrap sm:justify-end self-start sm:self-auto w-full sm:w-auto">
                            {isOwnProfile ? (
                                <>
                                    <Link
                                        to="/settings/profile"
                                        className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium text-ink font-mono bg-paper border border-rule hover:border-ink-3 transition-colors shrink-0"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Edit profile</span><span className="sm:hidden">Edit</span>
                                    </Link>
                                    <button
                                        onClick={() => logout()}
                                        className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium text-red-500 font-mono bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors shrink-0"
                                    >
                                        <LogOut className="w-3.5 h-3.5" /><span className="hidden sm:inline">Logout</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className={`inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                                        following
                                            ? "text-ink bg-paper border border-rule hover:border-red-300 hover:text-red-400"
                                            : "text-paper bg-accent btn-primary hover:brightness-110"
                                    }`}
                                >
                                    {followLoading ? (
                                        <Loader inline size="sm" />
                                    ) : following ? (
                                        <><UserCheck className="w-3.5 h-3.5" /> Following</>
                                    ) : (
                                        <><UserPlus className="w-3.5 h-3.5" /> Follow</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Name & tags */}
                    <div className="flex flex-col gap-3 mt-2">
                        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-ink tracking-tight leading-none">
                            <span className="marker">{profile.name}</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-paper-2 border border-rule text-xs sm:text-sm font-medium text-ink-2">
                                @{profile.username}
                            </span>
                            {profile.website && (
                                <a href={profile.website} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-2 border border-rule text-xs sm:text-sm font-medium text-ink-2 hover:text-ink hover:border-ink-3 transition-colors truncate max-w-[150px] sm:max-w-none">
                                    <Globe className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{profile.website.replace(/^https?:\/\//, "")}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <p className="mt-5 text-ink-2 text-base sm:text-lg max-w-2xl leading-relaxed">{profile.bio}</p>
                    )}

                    {/* Metadata Grid */}
                    <div className="mt-6 flex flex-wrap gap-4 text-sm font-mono text-ink-2">
                        {profile.organization && (
                            <div className="flex items-center gap-2">
                                <div className="p-1"><Building2 className="w-4 h-4 text-ink-2" fill="var(--syntax-amber)" /></div>
                                <span>{profile.organization}</span>
                            </div>
                        )}
                        {profile.location && (
                            <div className="flex items-center gap-2">
                                <div className="p-1"><MapPin className="w-4 h-4 text-ink-2" fill="var(--syntax-rose)" /></div>
                                <span>{profile.location}</span>
                            </div>
                        )}
                        {profile.college && (
                            <div className="flex items-center gap-2">
                                <div className="p-1"><BookOpen className="w-4 h-4 text-ink-2" fill="var(--syntax-mint)" /></div>
                                <span>
                                    {profile.college}
                                    {profile.branch && <span className="text-accent mx-1">•</span>}
                                    {profile.branch}
                                    {profile.graduationYear && <span className="text-accent mx-1">•</span>}
                                    {profile.graduationYear && `'${String(profile.graduationYear).slice(-2)}`}
                                </span>
                            </div>
                        )}
                        {profile.joined && (
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-paper"><Calendar className="w-4 h-4 text-ink-3" /></div>
                                <span>Joined {new Date(profile.joined).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-5">
                        {/* Follower / Following counts */}
                        <div className="flex items-center gap-3 sm:gap-6">
                            {isOwnProfile ? (
                                <>
                                    <Link to={`/u/${username}/followers`} className="group flex items-baseline font-mono gap-1">
                                        <span className="font-bold text-accent group-hover:text-accent transition-colors">{(profile.stats?.followers || 0).toLocaleString()}</span>
                                        <span className="text-ink-3 text-sm font-medium group-hover:text-ink-2 transition-colors">followers</span>
                                    </Link>
                                    <Link to={`/u/${username}/following`} className="group flex items-baseline font-mono gap-1">
                                        <span className="font-bold text-accent group-hover:text-accent transition-colors">{(profile.stats?.following || 0).toLocaleString()}</span>
                                        <span className="text-ink-3 text-sm font-medium group-hover:text-ink-2 transition-colors">following</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-baseline font-mono gap-1.5">
                                        <span className="font-sans font-bold text-ink">{(profile.stats?.followers || 0).toLocaleString()}</span>
                                        <span className="text-ink-3 text-sm font-medium">followers</span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="font-sans font-bold text-ink">{(profile.stats?.following || 0).toLocaleString()}</span>
                                        <span className="text-ink-3 text-sm font-medium">following</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Social links row */}
                        <div className="flex items-center gap-2">
                            {profile.githubUsername && (
                                <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" title="GitHub"
                                    className="p-2 rounded-full bg-paper border border-rule text-ink-2 hover:text-white hover:bg-black hover:border-black transition-all">
                                    <Github className="w-4 h-4" />
                                </a>
                            )}
                            {profile.leetcodeUsername && (
                                <a href={`https://leetcode.com/${profile.leetcodeUsername}`} target="_blank" rel="noreferrer" title="LeetCode"
                                    className="p-2 rounded-full bg-paper border border-rule text-ink-2 hover:text-black hover:bg-[#FFA116] hover:border-[#FFA116] transition-all flex items-center justify-center font-mono font-bold text-xs" style={{ width: 34, height: 34 }}>
                                    LC
                                </a>
                            )}
                            {profile.linkedinUrl && (
                                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" title="LinkedIn"
                                    className="p-2 rounded-full bg-paper border border-rule text-ink-2 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                            )}
                            {profile.instagramHandle && (
                                <a href={`https://instagram.com/${profile.instagramHandle}`} target="_blank" rel="noreferrer" title="Instagram"
                                    className="p-2 rounded-full bg-paper border border-rule text-ink-2 hover:text-white hover:bg-[#E1306C] hover:border-[#E1306C] transition-all">
                                    <Instagram className="w-4 h-4" />
                                </a>
                            )}
                            {profile.twitterHandle && (
                                <a href={`https://x.com/${profile.twitterHandle}`} target="_blank" rel="noreferrer" title="X / Twitter"
                                    className="p-2 rounded-full bg-paper border border-rule text-ink-2 hover:text-white hover:bg-blue-400 hover:border-blue-400 transition-all">
                                    <Twitter className="w-4 h-4" />
                                </a>
                            )}
                        </div>
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

            {/* ── LeetCode bento ──────────────────────────────────────────────── */}
            {profile.leetcodeUsername && (
                <section className="border border-rule rounded-xl bg-paper overflow-hidden card-elevated mt-8">
                    <header className="flex flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-rule bg-paper-2/20">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-ink shrink-0" />
                            <h2 className="font-sans text-lg sm:text-xl font-bold text-ink tracking-tight">LeetCode Stats</h2>
                        </div>
                        <a href={`https://leetcode.com/u/${profile.leetcodeUsername}`} target="_blank" rel="noreferrer"
                            className="inline-flex self-start sm:self-auto items-center gap-1.5 px-3 py-1.5 rounded-full bg-paper border border-rule text-[10px] sm:text-xs font-bold font-mono text-ink-2 hover:text-ink hover:border-ink-3 transition-colors uppercase tracking-wider shrink-0">
                            visit profile <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </header>

                    {leetcodeLoading ? (
                        <LeetcodeStatsSkeleton />
                    ) : leetcodeStats ? (
                        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                            {/* Left: Stats */}
                            <div className="flex flex-col justify-center gap-4">
                                <div className="p-5 border border-rule rounded-lg bg-paper-2/40 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">Contest Rating</p>
                                            <p className="font-display text-2xl font-bold text-ink leading-none">
                                                {leetcodeStats.contest?.rating || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">Global Rank</p>
                                        <p className="font-display text-xl font-bold text-ink leading-none">
                                            {leetcodeStats.contest?.globalRanking ? `#${leetcodeStats.contest.globalRanking.toLocaleString()}` : "N/A"}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center mt-2">
                                    <div className="bg-paper border border-rule rounded-md p-3">
                                            <p className="text-[10px] uppercase font-bold text-[#0d8336ff] mb-1">Easy</p>
                                        <p className="text-lg font-bold text-ink">{leetcodeStats.solved.easy}</p>
                                    </div>
                                    <div className="bg-paper border border-rule rounded-md p-3">
                                        <p className="text-[10px] uppercase font-bold text-[#ffc01e] mb-1">Medium</p>
                                        <p className="text-lg font-bold text-ink">{leetcodeStats.solved.medium}</p>
                                    </div>
                                    <div className="bg-paper border border-rule rounded-md p-3">
                                        <p className="text-[10px] uppercase font-bold text-[#ff375f] mb-1">Hard</p>
                                        <p className="text-lg font-bold text-ink">{leetcodeStats.solved.hard}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Right: Pie Chart */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center shadow-lg"
                                    style={{
                                        background: `conic-gradient(
                                            #0d8336ff 0% ${(leetcodeStats.solved.easy / (leetcodeStats.solved.all || 1)) * 100}%,
                                            #ffc01e ${(leetcodeStats.solved.easy / (leetcodeStats.solved.all || 1)) * 100}% ${((leetcodeStats.solved.easy + leetcodeStats.solved.medium) / (leetcodeStats.solved.all || 1)) * 100}%,
                                            #ff375f ${((leetcodeStats.solved.easy + leetcodeStats.solved.medium) / (leetcodeStats.solved.all || 1)) * 100}% 100%
                                        )`
                                    }}>
                                    {/* Inner circle to make it a doughnut chart */}
                                    <div className="absolute inset-2 sm:inset-3 rounded-full bg-paper flex flex-col items-center justify-center">
                                        <span className="text-[10px] sm:text-xs font-semibold text-ink-2 uppercase tracking-wider mb-0.5">Solved</span>
                                        <span className="font-display text-2xl sm:text-3xl font-bold text-ink leading-none">{leetcodeStats.solved.all}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-sm text-ink-3">Failed to load LeetCode stats.</div>
                    )}
                </section>
            )}

            {/* ── GitHub bento ────────────────────────────────────────────────── */}
            {profile.githubUsername ? (
                <section className="border border-rule rounded-xl bg-paper overflow-hidden card-elevated mt-8">
                    <header className="flex flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-rule bg-paper-2/20">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <Github className="w-5 h-5 sm:w-6 sm:h-6 text-ink shrink-0" />
                            <h2 className="text-lg sm:text-xl font-bold text-ink tracking-tight"><span className="hidden sm:inline">GitHub Overview</span> <span className="inline sm:hidden">Github Stats</span></h2>
                        </div>
                        <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer"
                            className="inline-flex self-start sm:self-auto items-center gap-1.5 px-3 py-1.5 rounded-full bg-paper border border-rule text-[10px] sm:text-xs font-bold font-mono text-ink-2 hover:text-ink hover:border-ink-3 transition-colors uppercase tracking-wider shrink-0">
                            visit profile <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </header>

                    {ghLoading ? (
                        <GithubStatsSkeleton />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                            {/* Stats column */}
                            <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-rule space-y-6 bg-paper-2/10">
                                {ghProfile && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <MiniStat icon={Users} label="followers" value={ghProfile.followers || 0} />
                                        <MiniStat icon={Users} label="following" value={ghProfile.following || 0} />
                                        <MiniStat icon={FolderGit2} label="repos" value={ghProfile.publicRepos || 0} />
                                        {ghContribs && <MiniStat icon={Sparkles} label="streak (days)" value={ghContribs.currentStreak || 0} />}
                                    </div>
                                )}

                                {ghLanguages.length > 0 && (
                                    <div>
                                        <h3 className="font-sans text-sm font-bold text-ink mb-3 uppercase tracking-wider">Top Languages</h3>
                                        <div className="h-2.5 rounded-full overflow-hidden flex bg-paper-3 shadow-inner">
                                            {ghLanguages.map((l) => {
                                                const pct = Math.round((l.bytes / totalLangBytes) * 1000) / 10;
                                                const color = LANG_COLORS[l.name] || "#71717a";
                                                return <div key={l.name} style={{ width: `${pct}%`, backgroundColor: color }} title={`${l.name} ${pct}%`} />;
                                            })}
                                        </div>
                                        <ul className="mt-4 space-y-2.5">
                                            {ghLanguages.map(l => {
                                                const pct = Math.round((l.bytes / totalLangBytes) * 1000) / 10;
                                                const color = LANG_COLORS[l.name] || "#71717a";
                                                return (
                                                    <li key={l.name} className="flex items-center justify-between text-sm">
                                                        <span className="flex items-center gap-2.5 text-ink-2 font-medium">
                                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                                            {l.name}
                                                        </span>
                                                        <span className="font-mono text-ink-3 text-xs">{pct}%</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Contributions + repos */}
                            <div className="lg:col-span-8 p-6 space-y-8">
                                <div>
                                    <h3 className="font-sans text-sm font-bold text-ink mb-4 uppercase tracking-wider">Contributions</h3>
                                    <ContributionGraph contributionData={ghContribs?.contributionsByDay} />
                                </div>

                                {ghRepos.length > 0 && (
                                    <div>
                                        <h3 className="font-sans text-sm font-bold text-ink mb-4 uppercase tracking-wider">Recent Repositories</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {ghRepos.map(repo => (
                                                <a key={repo.id || repo.name} href={repo.htmlUrl} target="_blank" rel="noreferrer"
                                                    className="block p-5 border border-rule rounded-xl hover:border-ink-3 bg-paper-2/20 hover:bg-paper-2/50 transition-all hover:-translate-y-0.5 hover:shadow-md group flex flex-col justify-between h-full">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FolderGit2 className="w-4 h-4 text-ink-3 shrink-0 group-hover:text-accent transition-colors" />
                                                            <span className="font-sans text-base font-bold text-ink group-hover:text-accent truncate transition-colors">{repo.name}</span>
                                                        </div>
                                                        <p className="text-sm text-ink-2 line-clamp-2 mb-4 leading-relaxed">{repo.description || "No description"}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs font-semibold text-ink-3">
                                                        {repo.language && (
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: LANG_COLORS[repo.language] || "#71717a" }} />
                                                                {repo.language}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1.5 hover:text-ink transition-colors"><Star className="w-3.5 h-3.5" /> {repo.stars || 0}</span>
                                                        <span className="flex items-center gap-1.5 hover:text-ink transition-colors"><GitFork className="w-3.5 h-3.5" /> {repo.forks || 0}</span>
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
                <section className="border border-dashed border-rule rounded-md p-8 text-center">
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
            <TabsContent value="answers" className="mt-5 space-y-4">
                {myAnswers.length === 0 ? <Empty label="No answers yet." /> : myAnswers.map(a => (
                    <Link to={`/questions/${generateSlug(a.question.title, a.question.publicId || a.question.id)}`} key={a.id} className="block p-5 border border-rule rounded-xl bg-paper-2/40 hover:border-ink-3 hover:bg-paper-2/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-md card-elevated">
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
        <div className="relative overflow-hidden p-4 sm:p-6 border border-rule rounded-xl bg-paper-2/40 card-elevated group transition-all duration-300 hover:border-ink-3 hover:-translate-y-1 hover:shadow-lg">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40" style={{ backgroundColor: c }} />
            <div className="relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border flex items-center justify-center mb-3 sm:mb-4 transition-colors" style={{ borderColor: c, color: c, backgroundColor: `color-mix(in srgb, ${c} 10%, transparent)` }}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="font-sans text-2xl sm:text-4xl font-extrabold text-ink tabular-nums tracking-tight">{value.toLocaleString()}</div>
                <div className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-ink-3 mt-1 sm:mt-2 group-hover:text-ink-2 transition-colors">{label}</div>
            </div>
        </div>
    );
}

function MiniStat({ icon: Icon, label, value }) {
    return (
        <div className="p-4 border border-rule rounded-lg bg-paper/40 hover:bg-paper/80 group transition-colors flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-ink-3 group-hover:text-ink-2 transition-colors mb-1.5">
                <Icon className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] uppercase tracking-wider">{label}</span>
            </div>
            <div className="font-sans text-2xl font-bold text-ink tabular-nums tracking-tight">{value.toLocaleString()}</div>
        </div>
    );
}

function Empty({ label }) {
    return (
        <div className="text-center py-12 border border-dashed border-rule rounded-md">
            <Bookmark className="w-7 h-7 text-ink-3 mx-auto mb-2" />
            <p className="text-ink-2 text-sm">{label}</p>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="space-y-6 shimmer">
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
