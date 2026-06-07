import React, { useState } from "react";
import { Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

export default function BookmarkButton({ targetType, targetId, initialCount = 0 }) {
    const { isAuthenticated } = useAuth();
    const { bookmarks, toggleBookmark } = useApp();
    const navigate = useNavigate();
    
    // We can't rely on global state for count (unless we add it there), so we keep a local delta.
    const isBookmarked = bookmarks.has(`${targetType}:${targetId}`);
    const [localCount, setLocalCount] = useState(initialCount || 0);
    const [prevBookmarked, setPrevBookmarked] = useState(isBookmarked);

    // Sync count if isBookmarked changes externally
    if (isBookmarked !== prevBookmarked) {
        setLocalCount((prev) => prev + (isBookmarked ? 1 : -1));
        setPrevBookmarked(isBookmarked);
    }

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            toast.error("Please log in to bookmark");
            navigate("/login");
            return;
        }

        try {
            await toggleBookmark(targetId, targetType);
        } catch (err) {
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
            <span className="font-mono tabular-nums">{localCount}</span>
        </button>
    );
}
