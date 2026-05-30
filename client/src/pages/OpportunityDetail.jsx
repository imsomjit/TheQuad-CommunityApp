import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ExternalLink, Target, Bookmark, BookmarkCheck, Calendar, Clock, Trophy, ArrowLeft, Share2 } from "lucide-react";
import { opportunitiesApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import Loader from "../components/Loader";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function OpportunityDetail() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();

    const [opp, setOpp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await opportunitiesApi.getById(id);
                setOpp(res);
            } catch (err) {
                setError(err.response?.data?.message || "Opportunity not found");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleBookmark = async () => {
        if (!isAuthenticated) {
            toast.error("Please log in to bookmark opportunities");
            return;
        }
        try {
            const res = await opportunitiesApi.toggleBookmark(opp.id);
            setOpp(prev => ({ ...prev, isBookmarked: res.bookmarked }));
            toast.success(res.bookmarked ? "Opportunity bookmarked!" : "Bookmark removed.");
        } catch (err) {
            toast.error("Failed to bookmark opportunity");
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case "UPCOMING": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "ONGOING": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "ENDED": return "bg-ink-3/10 text-ink-3 border-ink-3/20";
            default: return "bg-paper-2 text-ink-2 border-rule";
        }
    };

    if (loading) return <div className="py-20 flex justify-center"><Loader text="Loading details..." /></div>;
    if (error) return <div className="py-20 text-center text-red-500">{error}</div>;
    if (!opp) return <div className="py-20 text-center">Not found</div>;

    // Check if it's restricted for non-logged in users (User asked: "users who logged in can only bookmark and view the details.")
    // Actually, I'll redirect them or show a message if not authenticated.
    if (!isAuthenticated) {
        return (
            <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-paper-2 flex items-center justify-center mb-4 text-ink-3">
                    <Target className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="font-semibold text-lg text-ink mb-1">Restricted Access</h3>
                <p className="text-ink-2 text-sm max-w-sm mb-6">You need to be logged in to view opportunity details and save them to your bookmarks.</p>
                <Link to="/login" className="px-6 py-2 bg-accent text-white font-bold rounded-xl hover:scale-105 transition-transform">
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-24 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link to="/opportunities" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-2 hover:text-ink transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Opportunities
            </Link>

            <div className="border border-rule rounded-2xl bg-paper card-elevated overflow-hidden">
                <header className="p-6 md:p-8 border-b border-rule bg-paper-2/20">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(opp.status)}`}>
                            {opp.status}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleBookmark}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${opp.isBookmarked
                                        ? "bg-accent/10 border-accent/20 text-accent"
                                        : "bg-paper-2 border-rule text-ink-2 hover:text-ink"
                                    }`}
                            >
                                {opp.isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                <span className="hidden sm:inline">{opp.isBookmarked ? "Saved" : "Save"}</span>
                            </button>
                            <a
                                href={opp.officialUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-accent text-paper text-sm font-semibold hover:scale-105 transition-transform"
                            >
                                <span className="hidden sm:inline">View Official</span> <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <h1 className="font-display text-3xl md:text-4xl font-bold text-ink leading-tight mb-4">
                        {opp.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-ink-2">
                        <div className="flex items-center gap-1.5">
                            {opp.source === "CODEFORCES" ? <span className="font-bold text-red-500">CF</span> : <span className="font-bold text-sky-500">K</span>}
                            <span className="text-ink">{opp.source === "CODEFORCES" ? "Codeforces" : "Kaggle"}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                            <Trophy className="w-4 h-4" />
                            <span>{opp.type === "CODING_CONTEST" ? "Coding Contest" : "Data Science Competition"}</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-rule">
                    <div className="col-span-2 p-6 md:p-8">
                        <h3 className="font-sans font-bold text-lg mb-4">About this opportunity</h3>
                        <div className="prose prose-invert max-w-none prose-p:text-ink-2">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {opp.description || "No description provided."}
                            </ReactMarkdown>
                        </div>

                        {opp.tags && opp.tags.length > 0 && (
                            <div className="mt-8">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3 mb-3">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {opp.tags.map(tag => (
                                        <span key={tag} className="px-2.5 py-1 rounded-md bg-paper-2 border border-rule text-xs font-medium text-ink-2">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-8 bg-paper-2/20 flex flex-col gap-6">
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3 mb-3">Timeline</h4>
                            <div className="space-y-4">
                                {opp.startTime && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-paper border border-rule flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4 text-ink-2" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-ink-2">Starts</p>
                                            <p className="font-semibold text-sm text-ink">{format(new Date(opp.startTime), "PP p")}</p>
                                        </div>
                                    </div>
                                )}
                                {opp.endTime && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-paper border border-rule flex items-center justify-center shrink-0">
                                            <Clock className="w-4 h-4 text-ink-2" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-ink-2">Ends</p>
                                            <p className="font-semibold text-sm text-ink">{format(new Date(opp.endTime), "PP p")}</p>
                                        </div>
                                    </div>
                                )}
                                {opp.deadline && !opp.endTime && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-paper border border-rule flex items-center justify-center shrink-0">
                                            <Clock className="w-4 h-4 text-ink-2" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-ink-2">Deadline</p>
                                            <p className="font-semibold text-sm text-ink">{format(new Date(opp.deadline), "PP p")}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-rule">
                            <p className="text-xs text-ink-3 leading-relaxed">
                                This opportunity is imported from <strong className="text-ink-2">{opp.source === "CODEFORCES" ? "Codeforces" : "Kaggle"}</strong>. We sync periodically, but times and details might change on the official platform.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
