import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Target, Filter, ChevronRight, Bookmark, BookmarkCheck, Calendar, Clock, Trophy, ArrowDownUp } from "lucide-react";
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
    const [source, setSource] = useState("ALL");
    const [status, setStatus] = useState("UPCOMING"); // Default to upcoming
    const [type, setType] = useState("ALL");
    const [page, setPage] = useState(1);

    const loadOpportunities = async (resetPage = false) => {
        try {
            setLoading(true);
            const currentPage = resetPage ? 1 : page;
            const params = {
                page: currentPage,
                limit: 12,
                q: search,
                source: source === "ALL" ? "" : source,
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
    }, [source, status, type]);

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
        if (s === "CODEFORCES") return <span className="font-bold text-red-500">CF</span>;
        if (s === "KAGGLE") return <span className="font-bold text-sky-500">K</span>;
        return <Target className="w-4 h-4" />;
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

                        <h1 className="mt-2 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl">
                            Code. <span className="font-display-italic text-accent">Compete.</span>{" "}
                            Conquer.
                        </h1>

                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-2">
                            Discover coding contests, hackathons, and data science competitions from Codeforces and Kaggle.
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

                    <Select value={source} onValueChange={setSource}>
                        <SelectTrigger className="h-10 w-[150px] rounded-md border-rule bg-paper text-sm text-ink focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                            <SelectValue placeholder="All Sources" />
                        </SelectTrigger>
                        <SelectContent className="border-rule bg-paper text-ink">
                            <SelectItem value="ALL">All Sources</SelectItem>
                            <SelectItem value="CODEFORCES">Codeforces</SelectItem>
                            <SelectItem value="KAGGLE">Kaggle</SelectItem>
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
                <div className="py-20 text-center text-red-500">{error}</div>
            ) : opportunities.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-paper-2 flex items-center justify-center mb-4 text-ink-3">
                        <Target className="w-8 h-8 opacity-50" />
                    </div>
                    <h3 className="font-semibold text-lg text-ink mb-1">No opportunities found</h3>
                    <p className="text-ink-2 text-sm max-w-sm">We couldn't find any opportunities matching your filters. Try adjusting your search criteria.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {opportunities.map(opp => (
                            <Link key={opp.id} to={`/opportunities/${opp.id}`} className="group flex flex-col p-5 rounded-2xl border border-rule bg-paper card-elevated">
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(opp.status)}`}>
                                        {opp.status}
                                    </div>
                                    <button 
                                        onClick={(e) => handleBookmark(e, opp.id)}
                                        className="p-1.5 rounded-full text-ink-3 hover:text-accent hover:bg-accent/10 transition-colors"
                                    >
                                        <Bookmark className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <h3 className="font-sans font-bold text-ink text-lg leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
                                    {opp.title}
                                </h3>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-paper-2 rounded-md border border-rule">
                                        {getSourceLogo(opp.source)}
                                        <span className="text-ink">{opp.source === "CODEFORCES" ? "Codeforces" : "Kaggle"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-ink-2 px-2 py-1 bg-paper-2 rounded-md border border-rule">
                                        <Trophy className="w-3.5 h-3.5" />
                                        <span>{opp.type === "CODING_CONTEST" ? "Contest" : "Competition"}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-rule/50 flex flex-col gap-2 text-xs text-ink-2">
                                    {opp.startTime && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Starts: {format(new Date(opp.startTime), "MMM d, yyyy h:mm a")}</span>
                                        </div>
                                    )}
                                    {opp.deadline && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" />
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
