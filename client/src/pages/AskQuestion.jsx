import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Input } from "../components/ui/input";
import MarkdownEditor from "../components/MarkdownEditor";
import { toast } from "sonner";
import { generateSlug } from "../utils/slugify";

export default function AskQuestion() {
    const { addQuestion, currentUser } = useApp();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const addTag = (e) => {
        e?.preventDefault();

        const t = tagInput.trim().replace(/^#/, "").toLowerCase();

        if (t && !tags.includes(t) && tags.length < 5) {
            setTags([...tags, t]);
        }

        setTagInput("");
    };

    const removeTag = (t) => {
        setTags(tags.filter((x) => x !== t));
    };

    const submit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !body.trim()) {
            toast.error("Title and body are required.");
            return;
        }

        setSubmitting(true);

        try {
            const q = await addQuestion({
                title: title.trim(),
                body: body.trim(),
                tags,
            });

            setSubmitting(false);
            toast.success("Question posted");
            navigate(`/questions/${generateSlug(q.title, q.publicId || q.id)}`);
        } catch (error) {
            setSubmitting(false);
            toast.error("Failed to post question");
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 text-sm text-ink-2 hover:text-accent mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                back
            </button>

            {/* Header */}
            <header className="mb-8">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-syntax-cyan mb-2">
          // new question
                </p>

                <h1 className="font-display text-4xl font-bold tracking-tighter text-ink">
                    <span className="italic">Ask</span> <span className="marker">the community.</span>
                </h1>

                <p className="mt-2 text-ink-2">
                    The clearer your question, the better the answers.
                </p>
            </header>

            {/* Tips */}
            <div className="mb-6 p-4 border border-syntax-cyan/20 bg-syntax-cyan/[0.04] rounded-sm">
                <h3 className="font-display font-semibold text-ink text-sm mb-2">
                    Tips for a great question
                </h3>

                <ul className="space-y-1 text-sm text-ink-2">
                    <li>
                        <span className="text-ink-3 font-mono mr-2">01</span>
                        Summarize the problem in the title.
                    </li>

                    <li>
                        <span className="text-ink-3 font-mono mr-2">02</span>
                        Include code snippets, error messages, and what you've tried.
                    </li>

                    <li>
                        <span className="text-ink-3 font-mono mr-2">03</span>
                        Add up to 5 relevant tags.
                    </li>
                </ul>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-6">
                {/* Title */}
                <Field label="Title *">
                    <Input
                        data-testid="ask-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Be specific and imagine you're asking another student"
                        className="bg-paper border-rule h-12 focus-visible:border-accent/40 focus-visible:ring-accent/30"
                    />

                    <p className="font-mono text-xs text-ink-3">
                        {title.length}/150
                    </p>
                </Field>

                {/* Body */}
                <Field label="Body *">
                    <MarkdownEditor
                        value={body}
                        onChange={setBody}
                        testId="ask-body"
                        placeholder="Describe your problem clearly. Use the toolbar for code blocks, formatting, and more."
                        minHeight="240px"
                    />
                </Field>

                {/* Tags */}
                <Field label="Tags (up to 5)">
                    <div className="flex gap-2">
                        <Input
                            data-testid="ask-tag-input"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") addTag(e);
                            }}
                            placeholder="add a tag and press Enter (e.g. react, dsa, mongodb)"
                            className="bg-paper border-rule h-11 flex-1 focus-visible:border-accent/40 focus-visible:ring-accent/30"
                        />

                        <button
                            type="button"
                            onClick={addTag}
                            data-testid="ask-add-tag-btn"
                            className="h-11 px-3 rounded-sm bg-paper-2 border border-rule hover:border-ink-3 text-sm text-ink-2 transition-colors flex items-center gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            add
                        </button>
                    </div>

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {tags.map((t) => (
                                <span
                                    key={t}
                                    className="inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-sm bg-accent-soft border border-accent text-accent"
                                >
                                    #{t}

                                    <button
                                        onClick={() => removeTag(t)}
                                        type="button"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </Field>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-rule">
                    <p className="font-mono text-xs text-ink-3">
            // posted as @{currentUser.username}
                    </p>

                    <button
                        type="submit"
                        disabled={submitting}
                        data-testid="submit-question-btn"
                        className="inline-flex items-center gap-1.5 h-11 px-6 rounded-sm text-sm font-semibold text-paper bg-accent btn-primary disabled:opacity-50"
                    >
                        {submitting ? "Posting..." : "Post question"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-ink-3">
                {label}
            </label>

            {children}
        </div>
    );
}
