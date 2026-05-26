import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Send,
    Flag,
    CheckCircle2,
    Edit3,
    Trash2,
    Calendar,
    Eye,
    MessageSquare,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import VoteButtons from "../components/VoteButtons";
import TagBadge from "../components/TagBadge";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

function timeAgo(ts) {
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
}

function renderMarkdownLite(body) {
    // Lightweight markdown support:
    // - ```code blocks```
    // - `inline code`

    const blocks = body.split(/```/);

    return blocks.map((chunk, i) => {
        if (i % 2 === 1) {
            return (
                <pre key={i}>
                    <code>{chunk.trim()}</code>
                </pre>
            );
        }

        return chunk.split("\n").map((line, j) => {
            const parts = line.split(/`([^`]+)`/g);

            return (
                <p key={`${i}-${j}`}>
                    {parts.map((part, k) =>
                        k % 2 === 1 ? (
                            <code key={k}>{part}</code>
                        ) : (
                            part
                        )
                    )}
                </p>
            );
        });
    });
}

export default function QuestionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        questions,
        currentUser,
        addAnswer,
        acceptAnswer,
        deleteQuestion,
        incrementViews,
    } = useApp();

    const question = questions.find((q) => q.id === id);

    const [answerBody, setAnswerBody] = useState("");

    useEffect(() => {
        if (question) {
            incrementViews("question", id);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!question) {
        return (
            <div className="text-center py-20">
                <p className="font-display text-2xl text-zinc-300">
                    Question not found
                </p>

                <Link
                    to="/questions"
                    className="text-emerald-400 mt-2 inline-block"
                >
                    ← back to questions
                </Link>
            </div>
        );
    }

    const isOwner = question.author.id === currentUser.id;

    const submitAnswer = (e) => {
        e.preventDefault();

        if (!answerBody.trim()) return;

        addAnswer(question.id, answerBody.trim());
        setAnswerBody("");

        toast.success("Answer posted");
    };

    const handleDelete = () => {
        if (window.confirm("Delete this question?")) {
            deleteQuestion(question.id);
            navigate("/questions");
            toast.success("Question deleted");
        }
    };

    const sortedAnswers = [...question.answers].sort((a, b) => {
        if (a.accepted && !b.accepted) return -1;
        if (!a.accepted && b.accepted) return 1;

        return (
            b.upvotes -
            b.downvotes -
            (a.upvotes - a.downvotes)
        );
    });

    return (
        <div className="max-w-5xl mx-auto fade-in-up">
            {/* Back */}
            <Link
                to="/questions"
                className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-emerald-400 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                all questions
            </Link>

            {/* Header */}
            <header className="space-y-3 pb-6 border-b border-zinc-800">
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 leading-tight">
                    {question.title}
                </h1>

                <div className="flex items-center gap-4 flex-wrap text-xs font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        asked {timeAgo(question.created_at)}
                    </span>

                    <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {question.views} views
                    </span>

                    <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {question.answers.length} answers
                    </span>

                    {isOwner && (
                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                data-testid="delete-question-btn"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-1 text-zinc-400 hover:text-rose-400 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                delete
                            </button>

                            <button className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-50 transition-colors">
                                <Edit3 className="w-3.5 h-3.5" />
                                edit
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Question Body */}
            <article className="flex gap-5 py-6 border-b border-zinc-800">
                <div className="hidden sm:block pt-1">
                    <VoteButtons
                        kind="question"
                        id={question.id}
                        upvotes={question.upvotes}
                        downvotes={question.downvotes}
                        size="md"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="prose-dev">
                        {renderMarkdownLite(question.body)}
                    </div>

                    <div className="mt-5 flex items-center gap-1.5 flex-wrap">
                        {question.tags.map((tag) => (
                            <TagBadge key={tag}>#{tag}</TagBadge>
                        ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                        <button
                            data-testid="report-question-btn"
                            onClick={() => toast.info("Reported.")}
                            className="text-xs text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                        >
                            <Flag className="w-3 h-3" />
                            report
                        </button>

                        <Link
                            to={`/u/${question.author.username}`}
                            className="flex items-center gap-2 p-2 pr-3 bg-blue-500/5 border border-blue-500/20 rounded-md"
                        >
                            <img
                                src={question.author.avatar}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                            />

                            <div className="text-xs">
                                <div className="font-semibold text-zinc-50">
                                    {question.author.name}
                                </div>

                                <div className="font-mono text-zinc-500">
                                    @{question.author.username}
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </article>

            {/* Answers */}
            <section className="py-8 space-y-6">
                <h2 className="font-display text-2xl font-semibold text-zinc-50 flex items-center gap-3">
                    {question.answers.length}{" "}
                    {question.answers.length === 1
                        ? "answer"
                        : "answers"}

                    {question.answers.some((a) => a.accepted) && (
                        <span className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            solved
                        </span>
                    )}
                </h2>

                {sortedAnswers.map((answer) => (
                    <article
                        key={answer.id}
                        data-testid={`answer-${answer.id}`}
                        className={`flex gap-5 p-5 border rounded-lg ${answer.accepted
                                ? "border-emerald-500/40 bg-emerald-500/[0.03]"
                                : "border-zinc-800 bg-zinc-900/30"
                            }`}
                    >
                        <div className="hidden sm:block pt-1">
                            <VoteButtons
                                kind="answer"
                                id={answer.id}
                                upvotes={answer.upvotes}
                                downvotes={answer.downvotes}
                                size="sm"
                            />

                            {answer.accepted && (
                                <div
                                    title="Accepted answer"
                                    className="mt-3 w-9 h-9 rounded-md bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            {answer.accepted && (
                                <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    accepted answer
                                </div>
                            )}

                            <div className="prose-dev">
                                {renderMarkdownLite(answer.body)}
                            </div>

                            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                    {isOwner && !answer.accepted && (
                                        <button
                                            data-testid={`accept-answer-${answer.id}`}
                                            onClick={() => {
                                                acceptAnswer(question.id, answer.id);
                                                toast.success(
                                                    "Marked as accepted answer"
                                                );
                                            }}
                                            className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            accept
                                        </button>
                                    )}

                                    <button
                                        onClick={() => toast.info("Reported.")}
                                        className="text-xs text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                                    >
                                        <Flag className="w-3 h-3" />
                                        report
                                    </button>
                                </div>

                                <Link
                                    to={`/u/${answer.author.username}`}
                                    className="flex items-center gap-2 p-2 pr-3 bg-zinc-900 border border-zinc-800 rounded-md"
                                >
                                    <img
                                        src={answer.author.avatar}
                                        alt=""
                                        className="w-8 h-8 rounded-full object-cover"
                                    />

                                    <div className="text-xs">
                                        <div className="font-semibold text-zinc-50">
                                            {answer.author.name}
                                        </div>

                                        <div className="font-mono text-zinc-500">
                                            answered {timeAgo(answer.created_at)}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}

                {question.answers.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg">
                        <p className="font-display text-lg text-zinc-300">
                            No answers yet.
                        </p>

                        <p className="text-sm text-zinc-500 mt-1">
                            Be the helpful one.
                        </p>
                    </div>
                )}
            </section>

            {/* Answer Form */}
            <section className="space-y-3 pt-6 border-t border-zinc-800">
                <h3 className="font-display text-xl font-semibold text-zinc-50">
                    Your answer
                </h3>

                <form
                    onSubmit={submitAnswer}
                    className="space-y-3"
                >
                    <Textarea
                        data-testid="answer-input"
                        value={answerBody}
                        onChange={(e) =>
                            setAnswerBody(e.target.value)
                        }
                        placeholder="Share what you know. Code blocks with ``` are supported."
                        className="bg-zinc-950 border-zinc-800 min-h-[160px] font-body placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/30"
                    />

                    <div className="flex items-center justify-between">
                        <p className="font-mono text-xs text-zinc-500">
              // tip: backtick `code` for inline · ``` for
                            code blocks
                        </p>

                        <button
                            type="submit"
                            data-testid="submit-answer-btn"
                            disabled={!answerBody.trim()}
                            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-md text-sm font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 active:scale-95 transition-all"
                        >
                            <Send className="w-3.5 h-3.5" />
                            Post answer
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}