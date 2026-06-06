import React, { useState } from "react";
import { Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookmarksApi } from "../services/api";
import { toast } from "sonner";

export default function BookmarkButton({ targetType, targetId, initialCount = 0 }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [count, setCount] = useState(initialCount || 0);

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            toast.error("Please log in to bookmark");
            navigate("/login");
            return;
        }

        const prevBookmarked = isBookmarked;
        setIsBookmarked(!prevBookmarked);
        setCount((prev) => prev + (prevBookmarked ? -1 : 1));

        try {
            await bookmarksApi.toggle({ targetType, targetId });
        } catch (err) {
            // Revert on failure
            setIsBookmarked(prevBookmarked);
            setCount((prev) => prev + (prevBookmarked ? 1 : -1));
            toast.error("Failed to update bookmark");
        }
    };

    return (
        <button
            onClick={handleToggle}
            aria-label="Bookmark"
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all active:scale-95 ${
                isBookmarked 
                    ? "border-accent bg-accent/10 text-accent" 
                    : "border-rule bg-paper-2 text-ink-3 hover:border-ink-3 hover:text-ink"
            }`}
        >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            <span className="font-mono tabular-nums">{count}</span>
        </button>
    );
}
