import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Bold, Italic, Heading2, Heading3, Code, Link2, List, ListOrdered,
  Quote, Table, ImageIcon, Eye, Edit3, Save, Send, ChevronDown,
  X, Plus, Check, Loader2, Upload, ExternalLink,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import AutocompleteTagInput from "../components/ui/AutocompleteTagInput";
import { postsApi } from "../services/api";
import { useApp } from "../context/AppContext";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "dsa_editorial", label: "DSA Editorial" },
  { value: "interview_experience", label: "Interview Experience" },
  { value: "learning_journal", label: "Learning Journal" },
  { value: "project_breakdown", label: "Project Breakdown" },
];

const PLATFORMS = ["LeetCode", "Codeforces", "CodeChef", "AtCoder", "HackerRank", "GeeksforGeeks", "Other"];
const DIFFICULTIES = ["easy", "medium", "hard"];
const EXP_LEVELS = ["internship", "new_grad", "mid", "senior"];
const INTERVIEW_MODES = ["online", "onsite", "hybrid"];

// ── Markdown toolbar helpers ──────────────────────────────────────────────────
const insertAtCursor = (textarea, before, after = "") => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const newText =
    textarea.value.substring(0, start) +
    before +
    selected +
    after +
    textarea.value.substring(end);
  return {
    newText,
    newCursor: start + before.length + selected.length + after.length,
  };
};

function ToolbarButton({ icon: Icon, title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

// ── Category-specific metadata forms ─────────────────────────────────────────
function DsaMetaForm({ meta, onChange }) {
  const set = (k, v) => onChange({ ...meta, [k]: v });
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div>
        <label className="label-xs">Platform</label>
        <Select value={meta.platform || ""} onValueChange={(v) => set("platform", v)}>
          <SelectTrigger className="h-8 w-full border-rule bg-paper-2/40 px-2 text-[0.8125rem]">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="label-xs">Difficulty</label>
        <Select value={meta.difficulty || ""} onValueChange={(v) => set("difficulty", v)}>
          <SelectTrigger className="h-8 w-full border-rule bg-paper-2/40 px-2 text-[0.8125rem] capitalize">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTIES.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label className="label-xs">Problem Link</label>
        <input type="url" value={meta.problemLink || ""} onChange={(e) => set("problemLink", e.target.value)} placeholder="https://leetcode.com/..." className="field-sm" />
      </div>
      <div>
        <label className="label-xs">Time Complexity</label>
        <input value={meta.timeComplexity || ""} onChange={(e) => set("timeComplexity", e.target.value)} placeholder="O(n log n)" className="field-sm font-mono" />
      </div>
      <div>
        <label className="label-xs">Space Complexity</label>
        <input value={meta.spaceComplexity || ""} onChange={(e) => set("spaceComplexity", e.target.value)} placeholder="O(n)" className="field-sm font-mono" />
      </div>
    </div>
  );
}

function InterviewMetaForm({ meta, onChange }) {
  const set = (k, v) => onChange({ ...meta, [k]: v });
  const [topicInput, setTopicInput] = useState("");
  const topics = meta.topicsAsked || [];

  const addTopic = () => {
    const t = topicInput.trim();
    if (t && !topics.includes(t)) {
      onChange({ ...meta, topicsAsked: [...topics, t] });
      setTopicInput("");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div>
        <label className="label-xs">Company</label>
        <input value={meta.company || ""} onChange={(e) => set("company", e.target.value)} placeholder="Google" className="field-sm" />
      </div>
      <div>
        <label className="label-xs">Role</label>
        <input value={meta.role || ""} onChange={(e) => set("role", e.target.value)} placeholder="SWE Intern" className="field-sm" />
      </div>
      <div>
        <label className="label-xs">Level</label>
        <Select value={meta.experienceLevel || ""} onValueChange={(v) => set("experienceLevel", v)}>
          <SelectTrigger className="h-8 w-full border-rule bg-paper-2/40 px-2 text-[0.8125rem] capitalize">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {EXP_LEVELS.map((l) => <SelectItem key={l} value={l} className="capitalize">{l.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="label-xs">Mode</label>
        <Select value={meta.interviewMode || ""} onValueChange={(v) => set("interviewMode", v)}>
          <SelectTrigger className="h-8 w-full border-rule bg-paper-2/40 px-2 text-[0.8125rem] capitalize">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {INTERVIEW_MODES.map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="label-xs">Year</label>
        <input type="number" value={meta.year || ""} onChange={(e) => set("year", parseInt(e.target.value) || "")} placeholder="2024" min="2000" max="2100" className="field-sm" />
      </div>
      <div className="col-span-2 sm:col-span-3">
        <label className="label-xs">Topics Asked</label>
        <div className="flex gap-2">
          <input
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
            placeholder="Add topic (press Enter)"
            className="field-sm flex-1"
          />
          <button type="button" onClick={addTopic} className="flex h-8 w-8 items-center justify-center rounded-sm border border-rule text-ink-2 hover:text-ink">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {topics.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-sm border border-rule bg-paper-2 px-2 py-0.5 text-xs">
                {t}
                <button type="button" onClick={() => onChange({ ...meta, topicsAsked: topics.filter((x) => x !== t) })} className="text-ink-3 hover:text-ink">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JournalMetaForm({ meta, onChange }) {
  return (
    <div>
      <label className="label-xs">Day Number</label>
      <input
        type="number"
        value={meta.dayNumber || ""}
        onChange={(e) => onChange({ ...meta, dayNumber: parseInt(e.target.value) || undefined })}
        placeholder="e.g. 12"
        min="1"
        className="field-sm w-32"
      />
    </div>
  );
}

function ProjectMetaForm({ meta, onChange }) {
  const set = (k, v) => onChange({ ...meta, [k]: v });
  const [stackInput, setStackInput] = useState("");
  const stack = meta.techStack || [];

  const addStack = () => {
    const t = stackInput.trim();
    if (t && !stack.includes(t)) {
      onChange({ ...meta, techStack: [...stack, t] });
      setStackInput("");
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="label-xs">Tech Stack</label>
        <div className="flex gap-2">
          <input value={stackInput} onChange={(e) => setStackInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStack())} placeholder="React, Node.js…" className="field-sm flex-1" />
          <button type="button" onClick={addStack} className="flex h-8 w-8 items-center justify-center rounded-sm border border-rule text-ink-2 hover:text-ink">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {stack.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {stack.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-sm border border-rule bg-paper-2 px-2 py-0.5 font-mono text-xs">
                {t}
                <button type="button" onClick={() => onChange({ ...meta, techStack: stack.filter((x) => x !== t) })} className="text-ink-3 hover:text-ink">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs">Repository URL</label>
          <input type="url" value={meta.repoUrl || ""} onChange={(e) => set("repoUrl", e.target.value)} placeholder="https://github.com/..." className="field-sm" />
        </div>
        <div>
          <label className="label-xs">Live URL</label>
          <input type="url" value={meta.liveUrl || ""} onChange={(e) => set("liveUrl", e.target.value)} placeholder="https://..." className="field-sm" />
        </div>
      </div>
    </div>
  );
}

// ── Main editor component ─────────────────────────────────────────────────────
export default function PostEditor() {
  const { id } = useParams(); // present when editing existing post
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const textareaRef = useRef(null);

  const [mode, setMode] = useState("write"); // "write" | "preview"
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("dsa_editorial");
  const [categoryMeta, setCategoryMeta] = useState({});
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [postId, setPostId] = useState(id ? parseInt(id) : null);
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!!id);

  // Load existing post for editing
  useEffect(() => {
    if (!id) return;
    postsApi.getById(parseInt(id)).then((p) => {
      setTitle(p.title);
      setBody(p.body);
      setCategory(p.category);
      setCategoryMeta(p.categoryMeta || {});
      setTags(p.tags || []);
      setExcerpt(p.excerpt || "");
      setCoverImageUrl(p.coverImageUrl || "");
      setCoverPreview(p.coverImageUrl || "");
      setStatus(p.status);
      setPostId(p.id);
      setLoading(false);
    }).catch(() => { navigate("/posts"); });
  }, [id]);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser]);

  // ── Autosave (debounced, 30s) ────────────────────────────────────────────
  const autosaveTimerRef = useRef(null);
  const pendingAutosave = useRef(false);

  const triggerAutosave = useCallback(() => {
    if (!postId) return;
    pendingAutosave.current = true;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(async () => {
      if (!pendingAutosave.current) return;
      try {
        await postsApi.autosave(postId, { title, body, excerpt, categoryMeta });
        setLastSaved(new Date());
        pendingAutosave.current = false;
      } catch {}
    }, 5000); // 5s debounce for responsive feel
  }, [postId, title, body, excerpt, categoryMeta]);

  useEffect(() => {
    if (postId && status === "draft") triggerAutosave();
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
  }, [title, body, excerpt, categoryMeta]);

  // ── Toolbar actions ───────────────────────────────────────────────────────
  const insertMarkdown = (before, after = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { newText, newCursor } = insertAtCursor(ta, before, after);
    setBody(newText);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(newCursor, newCursor); }, 0);
  };

  const toolbarActions = [
    { icon: Bold, title: "Bold", action: () => insertMarkdown("**", "**") },
    { icon: Italic, title: "Italic", action: () => insertMarkdown("*", "*") },
    { icon: Heading2, title: "Heading 2", action: () => insertMarkdown("## ") },
    { icon: Heading3, title: "Heading 3", action: () => insertMarkdown("### ") },
    { icon: Code, title: "Inline code", action: () => insertMarkdown("`", "`") },
    { icon: Quote, title: "Blockquote", action: () => insertMarkdown("> ") },
    { icon: List, title: "Bullet list", action: () => insertMarkdown("- ") },
    { icon: ListOrdered, title: "Numbered list", action: () => insertMarkdown("1. ") },
    { icon: Link2, title: "Link", action: () => insertMarkdown("[text](", ")") },
    { icon: Table, title: "Table", action: () => insertMarkdown("| Col 1 | Col 2 |\n|-------|-------|\n| A     | B     |\n") },
  ];

  // Code block snippet
  const insertCodeBlock = () => {
    const lang = prompt("Language (e.g. python, javascript, cpp):", "python");
    if (lang !== null) insertMarkdown(`\`\`\`${lang}\n`, "\n```");
  };

  // ── Cover image ───────────────────────────────────────────────────────────
  const handleCoverFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  // ── Tags ──────────────────────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.toLowerCase().trim().replace(/\s+/g, "-");
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  };

  // ── Save as draft ─────────────────────────────────────────────────────────
  const saveDraft = async () => {
    if (!title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        body,
        category,
        categoryMeta,
        tags,
        excerpt: excerpt || undefined,
        status: "draft",
      };

      let post;
      if (postId) {
        post = await postsApi.update(postId, payload);
      } else {
        post = await postsApi.create(payload);
        setPostId(post.id);
        // Update URL without reloading
        window.history.replaceState({}, "", `/posts/${post.id}/edit`);
      }

      // Upload cover if selected
      if (coverFile && post.id) {
        const formData = new FormData();
        formData.append("cover", coverFile);
        try {
          const result = await postsApi.uploadCover(post.id, formData);
          setCoverImageUrl(result.coverImageUrl || "");
          setCoverFile(null);
        } catch {}
      }

      setStatus("draft");
      setLastSaved(new Date());
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Publish ───────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!title.trim()) { setError("Title is required to publish"); return; }
    if (body.length < 50) { setError("Post needs at least 50 characters in the body to publish"); return; }

    setPublishing(true);
    setError(null);
    try {
      // Save first if needed
      let pid = postId;
      if (!pid) {
        const post = await postsApi.create({ title: title.trim(), body, category, categoryMeta, tags, status: "draft" });
        pid = post.id;
        setPostId(pid);
        window.history.replaceState({}, "", `/posts/${pid}/edit`);
      } else {
        await postsApi.update(pid, { title: title.trim(), body, category, categoryMeta, tags, excerpt: excerpt || undefined });
      }

      // Upload cover
      if (coverFile) {
        const formData = new FormData();
        formData.append("cover", coverFile);
        try {
          await postsApi.uploadCover(pid, formData);
          setCoverFile(null);
        } catch {}
      }

      const published = await postsApi.publish(pid);
      setStatus("published");
      navigate(`/posts/${published.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const categoryMetaForms = {
    dsa_editorial: <DsaMetaForm meta={categoryMeta} onChange={setCategoryMeta} />,
    interview_experience: <InterviewMetaForm meta={categoryMeta} onChange={setCategoryMeta} />,
    learning_journal: <JournalMetaForm meta={categoryMeta} onChange={setCategoryMeta} />,
    project_breakdown: <ProjectMetaForm meta={categoryMeta} onChange={setCategoryMeta} />,
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-2">
        <div className="flex items-center gap-2 text-ink-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading post…
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-2">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 border-b border-rule pb-4">
        <div className="flex items-center gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-syntax-violet">
            {postId ? "// editing draft" : "// new post"}
          </p>
          {lastSaved && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-ink-3">
              <Check className="h-3 w-3 text-emerald-500" />
              Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={saveDraft}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-sm border border-rule px-3 py-2 text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Save draft</span><span className="inline sm:hidden">Draft</span>
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/80 disabled:opacity-40"
          >
            {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* ── Editor column ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your post title…"
              rows={2}
              maxLength={300}
              className="w-full resize-none border-0 border-b-2 border-rule bg-transparent pb-3 font-display text-3xl text-ink placeholder:text-ink-3/50 focus:border-accent/60 focus:outline-none"
            />
          </div>

          {/* Markdown toolbar + mode toggle */}
          <div className="flex flex-wrap items-center justify-between rounded-sm border border-rule bg-paper-2/40 px-2 py-1">
            <div className="flex items-center gap-0.5">
              {toolbarActions.map(({ icon, title: t, action }) => (
                <ToolbarButton key={t} icon={icon} title={t} onClick={action} />
              ))}
              <div className="mx-1 h-4 w-px bg-rule" />
              <ToolbarButton icon={Code} title="Code block" onClick={insertCodeBlock} />
            </div>

            <div className="flex items-center rounded-sm border border-rule bg-paper p-0.5">
              <button
                type="button"
                onClick={() => setMode("write")}
                className={`flex items-center gap-1 rounded-sm px-2 py-1 text-xs transition-colors ${mode === "write" ? "bg-paper-2 text-ink" : "text-ink-3 hover:text-ink"}`}
              >
                <Edit3 className="h-3 w-3" />
                Write
              </button>
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={`flex items-center gap-1 rounded-sm px-2 py-1 text-xs transition-colors ${mode === "preview" ? "bg-paper-2 text-ink" : "text-ink-3 hover:text-ink"}`}
              >
                <Eye className="h-3 w-3" />
                Preview
              </button>
            </div>
          </div>

          {/* Editor / Preview */}
          {mode === "write" ? (
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Write your ${category === "dsa_editorial" ? "editorial" : category === "interview_experience" ? "experience" : category === "learning_journal" ? "journal" : "breakdown"}…\n\nMarkdown is supported. Use the toolbar above for formatting.`}
              className="min-h-[480px] w-full resize-y rounded-sm border border-rule bg-paper p-4 font-mono text-sm text-ink placeholder:text-ink-3/50 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30 leading-relaxed"
            />
          ) : (
            <div className="prose-dev min-h-[480px] rounded-sm border border-rule bg-paper p-6 overflow-auto">
              {body ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children }) {
                      if (inline) return <code className="rounded-sm bg-paper-2 px-1.5 py-0.5 font-mono text-[0.8125rem] border border-rule">{children}</code>;
                      const lang = className?.replace("language-", "") || "text";
                      return (
                        <div className="my-4 overflow-hidden rounded-sm border border-rule">
                          <div className="border-b border-rule bg-paper-2/80 px-4 py-1.5 font-mono text-[10px] uppercase text-ink-3">{lang}</div>
                          <SyntaxHighlighter style={oneDark} language={lang} PreTag="div" customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.8125rem" }}>
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      );
                    },
                  }}
                >
                  {body}
                </ReactMarkdown>
              ) : (
                <p className="italic text-ink-3">Nothing to preview yet…</p>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar settings ──────────────────────────────────────────── */}
        <aside className="flex flex-col gap-5">
          {/* Category */}
          <div className="rounded-sm border border-rule bg-paper p-4">
            <label className="block font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3 mb-2">
              Category *
            </label>
            <Select
              value={category}
              onValueChange={(v) => { setCategory(v); setCategoryMeta({}); }}
            >
              <SelectTrigger className="w-full border-rule bg-paper-2/40 focus:border-accent/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category metadata */}
          <div className="rounded-sm border border-rule bg-paper p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
              Details
            </p>
            {categoryMetaForms[category]}
          </div>

          {/* Tags */}
          <div className="rounded-sm border border-rule bg-paper p-4">
            <label className="block font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3 mb-2">
              Tags <span className="normal-case">(up to 10)</span>
            </label>
            <div className="flex gap-2">
              <AutocompleteTagInput
                value={tagInput}
                existingTags={tags}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.endsWith(" ") || val.endsWith(",")) {
                    const t = val.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
                    if (t && !tags.includes(t) && tags.length < 10) setTags((prev) => [...prev, t]);
                    setTagInput("");
                  } else {
                    setTagInput(val.toLowerCase().replace(/[^a-z0-9- ]/g, ""));
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="add-a-tag"
                className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/30"
              />
              <button type="button" onClick={addTag} className="flex h-8 w-8 items-center justify-center rounded-sm border border-rule text-ink-2 hover:text-ink">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-sm border border-rule bg-paper-2 px-2 py-0.5 font-mono text-xs">
                    #{t}
                    <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="text-ink-3 hover:text-ink">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover image */}
          <div className="rounded-sm border border-rule bg-paper p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
              Cover Image
            </p>
            {coverPreview ? (
              <div className="relative">
                <img src={coverPreview} alt="Cover preview" className="h-32 w-full rounded-sm object-cover" />
                <button
                  type="button"
                  onClick={() => { setCoverPreview(""); setCoverImageUrl(""); setCoverFile(null); }}
                  className="absolute right-1.5 top-1.5 rounded-sm bg-black/50 p-0.5 text-white hover:bg-black/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-rule text-ink-3 transition-colors hover:border-ink-3 hover:text-ink">
                <Upload className="h-5 w-5" />
                <span className="text-xs">Upload image</span>
                <input type="file" accept="image/*" onChange={handleCoverFile} className="hidden" />
              </label>
            )}
          </div>

          {/* Excerpt */}
          <div className="rounded-sm border border-rule bg-paper p-4">
            <label className="block font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3 mb-2">
              Excerpt <span className="normal-case text-ink-3/60">(optional)</span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary shown in cards (auto-generated if blank)"
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-sm border border-rule bg-paper-2/40 p-2 text-xs text-ink placeholder:text-ink-3/50 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30 leading-relaxed"
            />
            <p className="mt-1 text-right font-mono text-[10px] text-ink-3">{excerpt.length}/500</p>
          </div>
        </aside>
      </div>

      {/* ── Local styles for this page ────────────────────────────────────── */}
      <style>{`
        .label-xs {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-ink-3);
          margin-bottom: 4px;
        }
        .field-sm {
          display: block;
          width: 100%;
          height: 32px;
          padding: 0 8px;
          font-size: 0.8125rem;
          color: var(--color-ink);
          background: color-mix(in srgb, var(--color-paper-2) 40%, transparent);
          border: 1px solid var(--color-rule);
          border-radius: 2px;
          outline: none;
          transition: border-color 0.15s;
        }
        .field-sm:focus {
          border-color: color-mix(in srgb, var(--color-accent) 60%, transparent);
          box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-accent) 30%, transparent);
        }
      `}</style>
    </div>
  );
}
