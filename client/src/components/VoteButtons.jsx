import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown } from "lucide-react";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function VoteButtons({
    kind,
    id,
    upvotes = 0,
    downvotes = 0,
    layout = "vertical",
    size = "md",
}) {
    const { votes, voteOn } = useApp();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const key = `${kind}_${id}`;
    const myVote = votes[key];
    const score = (upvotes || 0) - (downvotes || 0);

    const sizes = {
        sm: { btn: "h-7 w-7", icon: "h-3.5 w-3.5", text: "text-xs" },
        md: { btn: "h-9 w-9", icon: "h-4 w-4", text: "text-sm" },
        lg: { btn: "h-11 w-11", icon: "h-5 w-5", text: "text-base" },
    }[size];

    const wrapperClass =
        layout === "vertical"
            ? "flex flex-col items-center gap-1"
            : "flex items-center gap-1";

    const handleVote = (direction) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        voteOn(kind, id, direction);
    };

    return (
        <div className={wrapperClass}>
            <button
                data-testid={`upvote-${kind}-${id}`}
                onClick={handleVote("up")}
                aria-label="Upvote"
                className={`${sizes.btn} flex items-center justify-center rounded-sm border transition-all active:scale-90 ${myVote === "up"
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-rule bg-paper-2 text-ink-3 hover:border-ink-3 hover:text-accent"
                    }`}
            >
                <ChevronUp className={sizes.icon} strokeWidth={2.5} />
            </button>

            <span
                data-testid={`score-${kind}-${id}`}
                className={`font-mono font-semibold tabular-nums ${sizes.text} ${score > 0
                        ? "text-accent"
                        : score < 0
                            ? "text-syntax-rose"
                            : "text-ink-3"
                    }`}
            >
                {score}
            </span>

            <button
                data-testid={`downvote-${kind}-${id}`}
                onClick={handleVote("down")}
                aria-label="Downvote"
                className={`${sizes.btn} flex items-center justify-center rounded-sm border transition-all active:scale-90 ${myVote === "down"
                        ? "border-syntax-rose bg-paper-2 text-syntax-rose"
                        : "border-rule bg-paper-2 text-ink-3 hover:border-ink-3 hover:text-syntax-rose"
                    }`}
            >
                <ChevronDown className={sizes.icon} strokeWidth={2.5} />
            </button>
        </div>
    );
}