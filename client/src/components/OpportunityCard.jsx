import React from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Calendar, Clock, Trophy, CodeXml, Target, Flag } from "lucide-react";
import { format } from "date-fns";
import { generateSlug } from "../utils/slugify";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { opportunitiesApi } from "../services/api";
import { toast } from "sonner";

export default function OpportunityCard({ opportunity }) {
    const { isAuthenticated } = useAuth();
    const { openReportModal } = useApp();
    const [isBookmarked, setIsBookmarked] = React.useState(opportunity.isBookmarked || false); // Might be initially false since we don't return it in list

    const handleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error("Please log in to bookmark opportunities");
            return;
        }
        try {
            const res = await opportunitiesApi.toggleBookmark(opportunity.id);
            setIsBookmarked(res.bookmarked);
            if (res.bookmarked) {
                toast.success("Opportunity bookmarked!");
            } else {
                toast.success("Bookmark removed.");
            }
        } catch (err) {
            toast.error("Failed to bookmark opportunity");
        }
    };

    const handleReport = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error("Please log in to report");
            return;
        }
        openReportModal("opportunity", opportunity.id, opportunity.title);
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
        <Link to={`/opportunities/${generateSlug(opportunity.title, opportunity.publicId || opportunity.id)}`} className="group flex flex-col p-6 rounded-2xl border border-rule bg-paper hover:bg-paper-2 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wide uppercase border ${getStatusColor(opportunity.status)}`}>
                    {opportunity.status}
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={handleReport}
                        className="p-1.5 rounded-full transition-colors text-ink-3 hover:text-red-500 hover:bg-red-500/10"
                        title="Report"
                    >
                        <Flag className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleBookmark}
                        className={`p-1.5 rounded-full transition-colors ${isBookmarked ? 'text-accent bg-accent/10' : 'text-ink-3 hover:text-accent hover:bg-accent/10'}`}
                        title="Bookmark"
                    >
                        {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            
            <h3 className="font-display font-semibold text-ink text-2xl leading-tight mb-3 group-hover:text-accent transition-colors line-clamp-2">
                {opportunity.title}
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 bg-paper border border-rule/60 rounded-full shadow-sm">
                    {getSourceLogo(opportunity.organizer)}
                    <span className="text-ink">{opportunity.organizer || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-ink-2 px-2.5 py-1 bg-paper border border-rule/60 rounded-full shadow-sm">
                    <Trophy className="w-3.5 h-3.5" fill="var(--accent)" />
                    <span>{opportunity.type === "CODING_CONTEST" ? "Contest" : "Competition"}</span>
                </div>
            </div>

            <p className="text-sm text-ink-2 line-clamp-2 mb-6 leading-relaxed">
                {opportunity.description || "Gear up and prepare to showcase your problem-solving skills! Join fellow developers in this exciting challenge and climb the leaderboard."}
            </p>

            <div className="mt-auto pt-4 border-t border-rule flex flex-col gap-2.5 text-xs font-medium text-ink-3">
                {opportunity.startTime && (
                    <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-ink-2" />
                        <span>Starts: {format(new Date(opportunity.startTime), "MMM d, yyyy h:mm a")}</span>
                    </div>
                )}
                {opportunity.deadline && (
                    <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-ink-2" />
                        <span>Deadline: {format(new Date(opportunity.deadline), "MMM d, yyyy h:mm a")}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}
