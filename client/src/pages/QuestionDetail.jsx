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
import { useAuth } from "../context/AuthContext";
import VoteButtons from "../components/VoteButtons";
import TagBadge from "../components/TagBadge";
import { extractIdFromSlug } from "../utils/slugify";
import MarkdownEditor from "../components/MarkdownEditor";
import { MarkdownRenderer, CollapsibleContent } from "../components/MarkdownEditor";
import CommentSection from "../components/CommentSection";
import { toast } from "sonner";

function timeAgo(ts) {
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
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
        fetchQuestion,
    } = useApp();
    const { isAuthenticated } = useAuth();

    const extractedId = extractIdFromSlug(id);
    const question = questions.find(
        (qq) => qq.publicId === extractedId || qq.id === parseInt(extractedId, 10)
    );
    const [answerBody, setAnswerBody] = useState("");
    const [isLoading, setIsLoading] = useState(!question || !question.answers);

    useEffect(() => {
        const loadFullQuestion = async () => {
            if (extractedId) {
                await fetchQuestion(extractedId);
            }
            if (question) {
                incrementViews("question", id);
            }
            setIsLoading(false);
        };
        loadFullQuestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, extractedId]);

    if (isLoading) {
        return (
            <div className="py-20 text-center">
                <p className="font-display text-2xl text-ink">Loading...</p>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="py-20 text-center">
                <p className="font-display text-2xl text-ink">Question not found</p>
                <Link to="/questions" className="mt-2 inline-block text-accent">
                    &larr; back to questions
                </Link>
            </div>
        );
    }

    const isOwner = currentUser?.id === question.author.id;

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

        return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
    });

    return (
        <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link
                to="/questions"
                className="mb-6 inline-flex items-center gap-1 text-sm text-ink-2 transition-colors hover:text-accent"
            >
                <ArrowLeft className="h-4 w-4" />
                all questions
            </Link>

            <header className="border-b-2 border-double border-rule pb-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
                    &sect;03 &middot; question / #{question.id}
                </p>

                <h1 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
                    {question.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-ink-3">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        asked {timeAgo(question.createdAt)}
                    </span>

                    <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {question.views} views
                    </span>

                    <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {question.answers.length} answers
                    </span>

                    {isOwner && (
                        <div className="ml-auto flex items-center gap-3">
                            <button
                                data-testid="delete-question-btn"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-1 text-ink-2 transition-colors hover:text-syntax-rose"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                delete
                            </button>

                            <button className="inline-flex items-center gap-1 text-ink-2 transition-colors hover:text-ink">
                                <Edit3 className="h-3.5 w-3.5" />
                                edit
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* ── Question body ──────────────────────────────────────── */}
            <article className="flex gap-5 border-b border-rule py-6">
                <div className="hidden pt-1 sm:block">
                    <VoteButtons
                        kind="question"
                        id={question.id}
                        upvotes={question.upvotes}
                        downvotes={question.downvotes}
                        size="md"
                    />
                </div>

                <div className="min-w-0 flex-1">
                    {/* Markdown-rendered body with syntax highlighting */}
                    <MarkdownRenderer>{question.body}</MarkdownRenderer>

                    <div className="mt-5 flex flex-wrap items-center gap-1.5">
                        {question.tags.map((tag) => (
                            <TagBadge key={tag}>{tag}</TagBadge>
                        ))}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <button
                            data-testid="report-question-btn"
                            onClick={() => toast.info("Reported.")}
                            className="flex items-center gap-1 text-xs text-ink-3 transition-colors hover:text-syntax-rose"
                        >
                            <Flag className="h-3 w-3" />
                            report
                        </button>

                        <Link
                            to={`/u/${question.author.username}`}
                            className="flex items-center gap-2 rounded-sm border border-rule bg-paper-2 p-2 pr-3"
                        >
                            <img
                                src={question.author.avatar}
                                alt=""
                                className="h-8 w-8 rounded-sm object-cover"
                            />

                            <div className="text-xs">
                                <div className="font-semibold text-ink">
                                    {question.author.name}
                                </div>
                                <div className="font-mono text-ink-3">
                                    @{question.author.username}
                                </div>
                            </div>
                        </Link>
                    </div>


                </div>
            </article>

            {/* ── Answers ────────────────────────────────────────────── */}
            <section className="space-y-6 py-8">
                <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-ink">
                    {question.answers.length}{" "}
                    {question.answers.length === 1 ? "answer" : "answers"}
                    {question.answers.some((a) => a.accepted) && (
                        <span className="inline-flex items-center gap-1 rounded-sm border border-accent-2 bg-accent-2-soft px-2 py-0.5 font-mono text-xs uppercase tracking-[0.15em] text-accent-2">
                            <CheckCircle2 className="h-3 w-3" />
                            solved
                        </span>
                    )}
                </h2>

                {sortedAnswers.map((answer) => (
                    <article
                        key={answer.id}
                        data-testid={`answer-${answer.id}`}
                        className={`flex gap-5 rounded-sm border p-5 ${answer.accepted
                                ? "border-accent-2 bg-accent-2-soft"
                                : "border-rule bg-paper-2/40"
                            }`}
                    >
                        <div className="hidden pt-1 sm:block">
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
                                    className="mt-3 flex h-9 w-9 items-center justify-center rounded-sm border border-accent-2 bg-accent-2-soft"
                                >
                                    <CheckCircle2 className="h-5 w-5 text-accent-2" />
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            {answer.accepted && (
                                <div className="mb-3 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.15em] text-accent-2">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    accepted answer
                                </div>
                            )}

                            {/* Markdown-rendered answer body — collapsible for long content */}
                            <CollapsibleContent maxHeight="300px">
                                <MarkdownRenderer>{answer.body}</MarkdownRenderer>
                            </CollapsibleContent>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    {isOwner && !answer.accepted && (
                                        <button
                                            data-testid={`accept-answer-${answer.id}`}
                                            onClick={() => {
                                                acceptAnswer(question.id, answer.id);
                                                toast.success("Marked as accepted answer");
                                            }}
                                            className="flex items-center gap-1 text-xs text-ink-2 transition-colors hover:text-accent-2"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            accept
                                        </button>
                                    )}

                                    <button
                                        onClick={() => toast.info("Reported.")}
                                        className="flex items-center gap-1 text-xs text-ink-3 transition-colors hover:text-syntax-rose"
                                    >
                                        <Flag className="h-3 w-3" />
                                        report
                                    </button>
                                </div>

                                <Link
                                    to={`/u/${answer.author.username}`}
                                    className="flex items-center gap-2 rounded-sm border border-rule bg-paper-2 p-2 pr-3"
                                >
                                    <img
                                        src={answer.author.avatar}
                                        alt=""
                                        className="h-8 w-8 rounded-sm object-cover"
                                    />

                                    <div className="text-xs">
                                        <div className="font-semibold text-ink">
                                            {answer.author.name}
                                        </div>
                                        <div className="font-mono text-ink-3">
                                            answered {timeAgo(answer.created_at)}
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* Comments on this answer */}
                            <div className="mt-5 border-t border-rule pt-4">
                                <CommentSection
                                    targetType="answer"
                                    targetId={parseInt(answer.id) || answer.id}
                                />
                            </div>
                        </div>
                    </article>
                ))}

                {question.answers.length === 0 && (
                    <div className="rounded-sm border border-dashed border-rule py-12 text-center">
                        <p className="font-display text-lg text-ink">No answers yet.</p>
                        <p className="mt-1 text-sm text-ink-3">Be the helpful one.</p>
                    </div>
                )}
            </section>

            {/* ── Answer form with MarkdownEditor ─────────────────── */}
            <section className="space-y-3 border-t-2 border-double border-rule pt-6">
                <h3 className="font-display text-xl font-semibold text-ink">Your answer</h3>

                {isAuthenticated ? (
                    <form onSubmit={submitAnswer} className="space-y-3">
                        <MarkdownEditor
                            value={answerBody}
                            onChange={setAnswerBody}
                            testId="answer-input"
                            placeholder="Share what you know. Use the toolbar for code blocks, lists, and formatting."
                            minHeight="160px"
                        />

                        <div className="flex items-center justify-between">
                            <p className="font-mono text-xs text-ink-3">
                                // tip: use toolbar for bold, code, headings, and more
                            </p>

                            <button
                                type="submit"
                                data-testid="submit-answer-btn"
                                disabled={!answerBody.trim()}
                                className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-paper transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
                            >
                                <Send className="h-3.5 w-3.5" />
                                Post answer
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="rounded-sm border border-dashed border-rule py-8 text-center">
                        <p className="text-sm text-ink-2">
                            <Link to="/login" className="text-accent hover:underline">Log in</Link> to post an answer
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
