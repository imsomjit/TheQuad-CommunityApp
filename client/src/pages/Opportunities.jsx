import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Target, Bookmark, Calendar, Clock, Trophy, ServerCrash, OctagonAlert, CodeXml } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { opportunitiesApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import Loader from "../components/Loader";
import { format } from "date-fns";

export default function Opportunities() {
    const { isAuthenticated } = useAuth();
    
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);
    
    // Filters
    const [search, setSearch] = useState("");
    const [organizer, setOrganizer] = useState("ALL");
    const [status, setStatus] = useState("UPCOMING"); // Default to upcoming
    const [type, setType] = useState("ALL");
    const [page, setPage] = useState(1);

    const loadOpportunities = async (resetPage = false) => {
        try {
            setLoading(true);
            const currentPage = resetPage ? 1 : page;
            const params = {
                page: currentPage,
                limit: 9,
                q: search,
                organizer: organizer === "ALL" ? "" : organizer,
                status: status === "ALL" ? "" : status,
                type: type === "ALL" ? "" : type,
                sort: status === "ENDED" ? "newest" : "start_date"
            };
            
            // Clean empty params
            Object.keys(params).forEach(k => !params[k] && delete params[k]);

            const res = await opportunitiesApi.list(params);
            setOpportunities(res.data || []);
            setPagination(res.pagination);
            if (resetPage) setPage(1);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load opportunities");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOpportunities(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizer, status, type]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadOpportunities(true);
    };

    const handleBookmark = async (e, oppId) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error("Please log in to bookmark opportunities");
            return;
        }
        try {
            const res = await opportunitiesApi.toggleBookmark(oppId);
            if (res.bookmarked) {
                toast.success("Opportunity bookmarked!");
            } else {
                toast.success("Bookmark removed.");
            }
            // we'd optimally update the local state but since bookmarked state is not directly on the list response unless we joined it,
            // we will let the detail page handle the exact state, or we can just show toast.
        } catch (err) {
            toast.error("Failed to bookmark opportunity");
        }
    };

    const getStatusColor = (s) => {
        switch(s) {
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

    return (
        <div className="max-w-7xl mx-auto pb-24 md:pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="border-b-2 border-double border-rule pb-8 mb-10">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-syntax-lime">
                            &sect;04 &middot; the board
                        </p>

                        <h1 className="mt-2 font-display text-5xl font-medium leading-[1.02] tracking-tight text-ink sm:text-6xl">
                            Code. <span className="font-display-italic text-accent">Compete.</span> & <span className="italic marker">Conquer.</span>
                            
                        </h1>

                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-2">
                            Discover coding contests, hackathons, and data science competitions from various of popular platforms like &mdash; LeetCode, CodeForces, Kaggle, Naukri etc.
                        </p>
                    </div>
                </div>
            </header>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
                    <input 
                        type="text"
                        placeholder="Search opportunities..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-md border border-rule bg-paper focus:ring-2 focus:ring-accent-soft focus:border-accent outline-none text-sm transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>

                <div className="flex overflow-x-auto pb-2 md:pb-0 gap-3 shrink-0 hide-scrollbar">
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-10 w-[150px] rounded-md border-rule bg-paper text-sm text-ink focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="border-rule bg-paper text-ink">
                            <SelectItem value="UPCOMING">Upcoming</SelectItem>
                            <SelectItem value="ONGOING">Ongoing</SelectItem>
                            <SelectItem value="ENDED">Ended</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={organizer} onValueChange={setOrganizer}>
                        <SelectTrigger className="h-10 w-[150px] rounded-md border-rule bg-paper text-sm text-ink focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                            <SelectValue placeholder="All Platforms" />
                        </SelectTrigger>
                        <SelectContent className="border-rule bg-paper text-ink">
                            <SelectItem value="ALL">All Platforms</SelectItem>
                            <SelectItem value="Codeforces">Codeforces</SelectItem>
                            <SelectItem value="LeetCode">LeetCode</SelectItem>
                            <SelectItem value="Kaggle">Kaggle</SelectItem>
                            <SelectItem value="GeeksforGeeks">GeeksForGeeks</SelectItem>
                            <SelectItem value="Code360 (Naukri)">Code360 (Naukri)</SelectItem>
                            <SelectItem value="AtCoder">AtCoder</SelectItem>
                            <SelectItem value="CodeChef">CodeChef</SelectItem>
                            <SelectItem value="HackerRank">HackerRank</SelectItem>
                            <SelectItem value="HackerEarth">HackerEarth</SelectItem>
                            <SelectItem value="TopCoder">TopCoder</SelectItem>
                            <SelectItem value="Google Coding Competitions">Google Coding Competitions</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="h-10 w-[170px] rounded-md border-rule bg-paper text-sm text-ink focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="border-rule bg-paper text-ink">
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="CODING_CONTEST">Coding Contest</SelectItem>
                            <SelectItem value="DATA_SCIENCE_COMPETITION">Data Science</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid */}
            {loading && page === 1 ? (
                <div className="py-20 flex justify-center">
                    <Loader text="Loading opportunities..." />
                </div>
            ) : error ? (
                <div className="py-24 w-full flex justify-center px-4">
                    <div className="w-full max-w-lg p-8 rounded-3xl border border-dashed border-red-500/30 bg-red-500/5 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5 text-red-500">
                            <ServerCrash className="w-8 h-8" />
                        </div>
                        <h3 className="font-display font-semibold text-2xl text-ink mb-2">Oops! Something went wrong</h3>
                        <p className="text-ink-2 text-sm max-w-sm mb-6 leading-relaxed">
                            {error || "We couldn't connect to the server to load the opportunities. Please try again later."}
                        </p>
                        <button 
                            onClick={() => loadOpportunities(true)}
                            className="px-6 py-2.5 rounded-full bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors shadow-sm"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            ) : opportunities.length === 0 ? (
                <div className="py-24 w-full flex justify-center px-4">
                    <div className="w-full max-w-lg p-8 rounded-3xl border border-dashed border-rule bg-paper text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-paper border border-rule flex items-center justify-center mb-5 text-syntax-rose shadow-sm">
                            <OctagonAlert className="w-8 h-8 opacity-60" />
                        </div>
                        <h3 className="font-display font-semibold text-2xl text-ink mb-2">No opportunities found</h3>
                        <p className="text-ink-2 text-sm max-w-sm mb-6 leading-relaxed">
                            We couldn't find any active challenges matching your current filters. Try adjusting your search criteria or clearing the filters!
                        </p>
                        <button 
                            onClick={() => {
                                setSearch("");
                                setOrganizer("ALL");
                                setStatus("ALL");
                                setType("ALL");
                            }}
                            className="px-6 py-2.5 rounded-full border border-rule bg-paper text-accent font-semibold text-sm hover:bg-paper-2 transition-colors shadow-sm"
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {opportunities.map(opp => (
                            <Link key={opp.id} to={`/opportunities/${opp.id}`} className="group flex flex-col p-6 rounded-2xl border border-rule bg-paper hover:bg-paper-2 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wide uppercase border ${getStatusColor(opp.status)}`}>
                                        {opp.status}
                                    </div>
                                    <button 
                                        onClick={(e) => handleBookmark(e, opp.id)}
                                        className="p-1.5 rounded-full text-ink-3 hover:text-accent hover:bg-accent/10 transition-colors"
                                    >
                                        <Bookmark className="w-4 h-4" />
                                    </button>
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
                                        <Trophy className="w-3.5 h-3.5" fill="var(--accent)" />
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

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="mt-8 flex justify-center gap-2">
                            <button
                                onClick={() => { setPage(p => p - 1); loadOpportunities(); window.scrollTo(0, 0); }}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl border border-rule bg-paper text-sm font-medium hover:bg-paper-2 disabled:opacity-50 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="flex items-center px-4 text-sm font-medium text-ink-2">
                                Page {page} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => { setPage(p => p + 1); loadOpportunities(); window.scrollTo(0, 0); }}
                                disabled={page === pagination.totalPages}
                                className="px-4 py-2 rounded-xl border border-rule bg-paper text-sm font-medium hover:bg-paper-2 disabled:opacity-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
