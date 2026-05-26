import React from "react";
import {
    ChevronUp,
    ChevronDown,
} from "lucide-react";

import { useApp } from "../context/AppContext";

export default function VoteButtons({
    kind,
    id,
    upvotes = 0,
    downvotes = 0,
    layout = "vertical",
    size = "md",
}) {
    const { votes, voteOn } = useApp();

    const key = `${kind}_${id}`;
    const myVote = votes[key];
    const score =
        (upvotes || 0) - (downvotes || 0);

    const sizes = {
        sm: {
            btn: "h-7 w-7",
            icon: "h-3.5 w-3.5",
            text: "text-xs",
        },
        md: {
            btn: "h-9 w-9",
            icon: "h-4 w-4",
            text: "text-sm",
        },
        lg: {
            btn: "h-11 w-11",
            icon: "h-5 w-5",
            text: "text-base",
        },
    }[size];

    const wrapperClass =
        layout === "vertical"
            ? "flex flex-col items-center gap-1"
            : "flex items-center gap-1";

    const handleVote = (direction) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        voteOn(kind, id, direction);
    };

    return (
        <div className={wrapperClass}>
            {/* Upvote */}
            <button
                data-testid={`upvote-${kind}-${id}`}
                onClick={handleVote("up")}
                aria-label="Upvote"
                className={`${sizes.btn
                    } flex items-center justify-center rounded-md border transition-all active:scale-90 ${myVote === "up"
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-emerald-400"
                    }`}
            >
                <ChevronUp
                    className={sizes.icon}
                    strokeWidth={2.5}
                />
            </button>

            {/* Score */}
            <span
                data-testid={`score-${kind}-${id}`}
                className={`font-mono font-semibold tabular-nums ${sizes.text
                    } ${score > 0
                        ? "text-emerald-400"
                        : score < 0
                            ? "text-rose-400"
                            : "text-zinc-500"
                    }`}
            >
                {score}
            </span>

            {/* Downvote */}
            <button
                data-testid={`downvote-${kind}-${id}`}
                onClick={handleVote("down")}
                aria-label="Downvote"
                className={`${sizes.btn
                    } flex items-center justify-center rounded-md border transition-all active:scale-90 ${myVote === "down"
                        ? "border-rose-500/50 bg-rose-500/15 text-rose-400"
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-rose-400"
                    }`}
            >
                <ChevronDown
                    className={sizes.icon}
                    strokeWidth={2.5}
                />
            </button>
        </div>
    );
}