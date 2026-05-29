import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Bold, Italic, Heading2, Heading3, Code, Link2, List,
  ListOrdered, Quote, Eye, Edit3, Copy, Check,
} from "lucide-react";

// ── Detect theme from <html> class ────────────────────────────────────────────
function useCurrentTheme() {
  const [isLight, setIsLight] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("light")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains("light"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isLight;
}

// ── Toolbar insertion helper ──────────────────────────────────────────────────
const insert = (textarea, before, after = "") => {
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

// ── Code block with copy button (theme-adaptive) ─────────────────────────────
function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const isLight = useCurrentTheme();
  const language = className?.replace("language-", "") || "text";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="group relative my-4 overflow-hidden rounded-sm border border-rule">
      <div className="flex items-center justify-between border-b border-rule bg-paper-2/80 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-mono text-ink-3 transition-colors hover:bg-paper hover:text-ink"
          type="button"
        >
          {copied ? (
            <><Check className="h-3 w-3 text-emerald-500" /> Copied</>
          ) : (
            <><Copy className="h-3 w-3" /> Copy</>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={isLight ? oneLight : oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.8125rem",
          lineHeight: "1.6",
          background: isLight ? "var(--code-bg, #ebe2cc)" : "var(--code-bg, #0d1018)",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ── Markdown components for ReactMarkdown ─────────────────────────────────────
const mdComponents = {
  code({ inline, className, children, ...props }) {
    if (inline) {
      return (
        <code
          className="rounded-sm bg-paper-2 px-1.5 py-0.5 font-mono text-[0.8125rem] text-ink border border-rule"
          {...props}
        >
          {children}
        </code>
      );
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
  h2({ children }) {
    const id = String(children).toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return <h2 id={id}>{children}</h2>;
  },
  h3({ children }) {
    const id = String(children).toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return <h3 id={id}>{children}</h3>;
  },
  a({ href, children }) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-accent pl-4 italic text-ink-2">
        {children}
      </blockquote>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-rule text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return <th className="border border-rule bg-paper-2 px-3 py-2 text-left font-medium">{children}</th>;
  },
  td({ children }) {
    return <td className="border border-rule px-3 py-2">{children}</td>;
  },
};

/**
 * Shared MarkdownEditor — write/preview toggle with toolbar.
 *
 * Props:
 *   value        - markdown string
 *   onChange      - (newValue: string) => void
 *   placeholder  - textarea placeholder
 *   minHeight    - CSS min-height for the textarea (default "160px")
 *   compact      - boolean: hide some toolbar buttons for small contexts (comments)
 *   className    - extra wrapper class
 *   testId       - data-testid for the textarea
 */
export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write something…",
  minHeight = "160px",
  compact = false,
  className = "",
  testId,
}) {
  const [mode, setMode] = useState("write"); // "write" | "preview"
  const textareaRef = useRef(null);

  const insertMarkdown = (before, after = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { newText, newCursor } = insert(ta, before, after);
    onChange(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const insertCodeBlock = () => {
    insertMarkdown("```python\n", "\n```");
  };

  const ACTIONS = [
    { icon: Bold, title: "Bold", action: () => insertMarkdown("**", "**") },
    { icon: Italic, title: "Italic", action: () => insertMarkdown("*", "*") },
    ...(!compact
      ? [
          { icon: Heading2, title: "Heading 2", action: () => insertMarkdown("## ") },
          { icon: Heading3, title: "Heading 3", action: () => insertMarkdown("### ") },
        ]
      : []),
    { icon: Code, title: "Inline code", action: () => insertMarkdown("`", "`") },
    { icon: Quote, title: "Blockquote", action: () => insertMarkdown("> ") },
    { icon: List, title: "Bullet list", action: () => insertMarkdown("- ") },
    ...(!compact
      ? [
          { icon: ListOrdered, title: "Numbered list", action: () => insertMarkdown("1. ") },
          { icon: Link2, title: "Link", action: () => insertMarkdown("[text](", ")") },
        ]
      : []),
  ];

  return (
    <div className={`rounded-sm border border-rule ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule bg-paper-2/40 px-2 py-1">
        <div className="flex flex-wrap items-center gap-0.5">
          {ACTIONS.map(({ icon: Icon, title, action }) => (
            <button
              key={title}
              type="button"
              onClick={action}
              title={title}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
          <div className="mx-1 h-4 w-px bg-rule" />
          <button
            type="button"
            onClick={insertCodeBlock}
            title="Code block"
            className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
          >
            <Code className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center rounded-sm border border-rule bg-paper p-0.5">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={`flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] transition-colors
              ${mode === "write" ? "bg-paper-2 text-ink" : "text-ink-3 hover:text-ink"}`}
          >
            <Edit3 className="h-3 w-3" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] transition-colors
              ${mode === "preview" ? "bg-paper-2 text-ink" : "text-ink-3 hover:text-ink"}`}
          >
            <Eye className="h-3 w-3" />
            Preview
          </button>
        </div>
      </div>

      {/* Content */}
      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          data-testid={testId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full resize-y bg-paper p-3 font-mono text-sm text-ink placeholder:text-ink-3/50 focus:outline-none leading-relaxed"
        />
      ) : (
        <div
          className="prose-dev p-4 overflow-auto"
          style={{ minHeight }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="italic text-ink-3">Nothing to preview…</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Render markdown content (read-only) with syntax highlighting.
 * Use this as a drop-in replacement for renderMarkdownLite.
 */
export function MarkdownRenderer({ children, className = "" }) {
  if (!children) return null;

  return (
    <div className={`prose-dev ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Collapsible wrapper for long content with "Show more" / "Show less".
 * Use around MarkdownRenderer for long answers/posts.
 *
 * Props:
 *   maxHeight   - CSS max-height when collapsed (default "280px")
 *   children    - content to wrap
 */
export function CollapsibleContent({ maxHeight = "280px", children }) {
  const contentRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // Check if content exceeds maxHeight
    const maxPx = parseInt(maxHeight);
    setIsOverflowing(el.scrollHeight > maxPx + 40); // 40px buffer
  }, [children, maxHeight]);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        style={{
          maxHeight: expanded || !isOverflowing ? "none" : maxHeight,
          overflow: expanded || !isOverflowing ? "visible" : "hidden",
        }}
      >
        {children}
      </div>

      {/* Fade gradient + Show more button */}
      {isOverflowing && !expanded && (
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pt-12 pb-2"
          style={{ background: "linear-gradient(transparent, var(--paper) 60%)" }}
        >
          <button
            onClick={() => setExpanded(true)}
            className="rounded-sm border border-rule bg-paper px-4 py-1.5 text-xs font-mono text-ink-2 transition-colors hover:border-ink-3 hover:text-ink shadow-sm"
          >
            Show more ↓
          </button>
        </div>
      )}

      {isOverflowing && expanded && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => setExpanded(false)}
            className="rounded-sm border border-rule bg-paper px-4 py-1.5 text-xs font-mono text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
          >
            Show less ↑
          </button>
        </div>
      )}
    </div>
  );
}
