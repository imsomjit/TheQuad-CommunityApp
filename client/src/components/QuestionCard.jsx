import React from "react";
import { Link } from "react-router-dom";
import {
    Eye,
    MessageSquare,
    CheckCircle2,
} from "lucide-react";

import TagBadge from "./TagBadge";

function timeAgo(ts) {
    const diff =
        (Date.now() - new Date(ts).getTime()) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600)
        return `${Math.floor(diff / 60)}m`;
    if (diff < 86400)
        return `${Math.floor(diff / 3600)}h`;
    if (diff < 86400 * 30)
        return `${Math.floor(diff / 86400)}d`;

    return `${Math.floor(
        diff / (86400 * 30)
    )}mo`;
}

export default function QuestionCard({
    question,
}) {
    const score =
        (question.upvotes || 0) -
        (question.downvotes || 0);

    const hasAccepted =
        question.answers?.some(
            (answer) => answer.accepted
        );

    const answerCount =
        question.answers?.length || 0;

    const previewText = question.body
        .replace(/```[\s\S]*?```/g, "")
        .replace(/\n/g, " ")
        .slice(0, 200);

    return (
        <article
            data-testid={`question-card-${question.id}`}
            className="group flex gap-5 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80"
        >
            {/* Stats column */}
            <div className="hidden min-w-[90px] flex-col items-end gap-3 pt-1 text-right sm:flex">
                {/* Votes */}
                <div>
                    <div
                        className={`font-mono text-xl font-semibold tabular-nums ${score > 0
                                ? "text-zinc-50"
                                : "text-zinc-500"
                            }`}
                    >
                        {score}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                        votes
                    </div>
                </div>

                {/* Answers */}
                <div
                    className={`rounded border px-2 py-1 ${hasAccepted
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : answerCount > 0
                                ? "border-zinc-700 bg-zinc-900"
                                : "border-zinc-800 bg-transparent"
                        }`}
                >
                    <div
                        className={`flex items-center gap-1 font-mono text-sm font-semibold tabular-nums ${hasAccepted
                                ? "text-emerald-400"
                                : answerCount > 0
                                    ? "text-zinc-200"
                                    : "text-zinc-500"
                            }`}
                    >
                        {hasAccepted && (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        {answerCount}
                    </div>

                    <div
                        className={`text-[10px] font-mono uppercase tracking-wider ${hasAccepted
                                ? "text-emerald-400/70"
                                : "text-zinc-500"
                            }`}
                    >
                        answers
                    </div>
                </div>

                {/* Views */}
                <div>
                    <div className="font-mono text-sm tabular-nums text-zinc-500">
                        {question.views}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                        views
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="min-w-0 flex-1">
                {/* Title */}
                <Link
                    to={`/questions/${question.id}`}
                >
                    <h3
                        data-testid={`question-title-${question.id}`}
                        className="font-display text-lg font-semibold leading-snug text-zinc-50 transition-colors group-hover:text-emerald-400"
                    >
                        {question.title}
                    </h3>
                </Link>

                {/* Preview */}
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                    {previewText}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {question.tags
                        .slice(0, 5)
                        .map((tag) => (
                            <TagBadge key={tag}>
                                #{tag}
                            </TagBadge>
                        ))}
                </div>

                {/* Footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    {/* Author */}
                    <div className="flex items-center gap-2">
                        <img
                            src={question.author.avatar}
                            alt={question.author.name}
                            className="h-6 w-6 rounded-full object-cover"
                        />

                        <span className="text-xs text-zinc-400">
                            asked by{" "}
                            <span className="font-medium text-zinc-200">
                                {question.author.name}
                            </span>
                            <span className="text-zinc-600">
                                {" "}
                                ·{" "}
                                {timeAgo(
                                    question.created_at
                                )}
                            </span>
                        </span>
                    </div>

                    {/* Mobile stats */}
                    <div className="flex items-center gap-3 font-mono text-xs text-zinc-500 sm:hidden">
                        <span>
                            {score} votes
                        </span>

                        <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {answerCount}
                        </span>

                        <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {question.views}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}