import React from "react";
import { Link } from "react-router-dom";
import { Eye, MessageSquare, CheckCircle2 } from "lucide-react";

import TagBadge from "./TagBadge";

function timeAgo(ts) {
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d`;

    return `${Math.floor(diff / (86400 * 30))}mo`;
}

export default function QuestionCard({ question }) {
    const score = (question.upvotes || 0) - (question.downvotes || 0);

    const hasAccepted = question.answers?.some((answer) => answer.accepted);
    const answerCount = question.answers?.length || question.answerCount || 0;

    const previewText = (question.body || "")
        .replace(/```[\s\S]*?```/g, "")
        .replace(/\n/g, " ")
        .slice(0, 200);

    return (
        <article
            data-testid={`question-card-${question.id}`}
            className="group flex gap-5 rounded-xl border border-rule bg-paper-2/40 p-5 transition-all duration-300 hover:border-ink-3 hover:bg-paper-2/80 hover:-translate-y-1 hover:shadow-md card-elevated"
        >
            {/* Stats column — IDE gutter style */}
            <div className="hidden min-w-[88px] flex-col items-end gap-3 border-r border-rule/60 pr-4 pt-1 text-right sm:flex">
                <div>
                    <div
                        className={`font-mono text-xl font-semibold tabular-nums ${score > 0 ? "text-ink" : "text-ink-3"
                            }`}
                    >
                        {score}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">
                        votes
                    </div>
                </div>

                <div
                    className={`w-full rounded-sm border px-2 py-1.5 text-right ${hasAccepted
                            ? "border-accent-2 bg-accent-2-soft"
                            : answerCount > 0
                                ? "border-rule bg-paper"
                                : "border-rule/60 bg-transparent"
                        }`}
                >
                    <div
                        className={`flex items-center justify-end gap-1 font-mono text-sm font-semibold tabular-nums ${hasAccepted
                                ? "text-accent-2"
                                : answerCount > 0
                                    ? "text-ink"
                                    : "text-ink-3"
                            }`}
                    >
                        {hasAccepted && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {answerCount}
                    </div>

                    <div
                        className={`font-mono text-[10px] uppercase tracking-[0.15em] ${hasAccepted ? "text-accent-2" : "text-ink-3"
                            }`}
                    >
                        answers
                    </div>
                </div>

                <div>
                    <div className="font-mono text-sm tabular-nums text-ink-3">
                        {question.views}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">
                        views
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="min-w-0 flex-1">
                <Link to={`/questions/${question.id}`}>
                    <h3
                        data-testid={`question-title-${question.id}`}
                        className="font-display text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-accent"
                    >
                        {question.title}
                    </h3>
                </Link>

                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-2">
                    {previewText}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {question.tags.slice(0, 5).map((tag) => (
                        <TagBadge key={tag}>{tag}</TagBadge>
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-rule/60 pt-3">
                    <div className="flex items-center gap-2">
                        <img
                            src={question.author.avatar}
                            alt={question.author.name}
                            className="h-6 w-6 rounded-sm border border-rule object-cover"
                        />

                        <span className="text-xs text-ink-2">
                            asked by{" "}
                            <span className="font-medium text-ink">
                                {question.author.name}
                            </span>
                            <span className="font-mono text-ink-3">
                                {" "}· {timeAgo(question.created_at)}
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs text-ink-3 sm:hidden">
                        <span>{score} votes</span>
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