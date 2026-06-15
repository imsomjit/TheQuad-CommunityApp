import React, { useState, useEffect, useRef } from "react";
import { Hash } from "lucide-react";
import { tagsApi } from "../../services/api";

const PREDEFINED_TAGS = [
  "react", "node.js", "python", "javascript", "dsa",
  "machine-learning", "web-development", "app-development",
  "java", "c++", "database", "system-design", "interview-experience",
  "typescript", "next.js", "docker", "aws"
];

export default function AutocompleteTagInput({
  value,
  onChange,
  onAddTag,
  existingTags = [],
  className = "",
  placeholder = "Add tags...",
  ...props
}) {
  const [allTags, setAllTags] = useState(PREDEFINED_TAGS);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    tagsApi.getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const uniqueTags = Array.from(new Set([...PREDEFINED_TAGS, ...res.data]));
          setAllTags(uniqueTags);
        }
      })
      .catch((err) => console.error("Failed to fetch tags", err));
  }, []);

  useEffect(() => {
    const trimmed = value.trim().replace(/^#/, "").toLowerCase();
    if (trimmed) {
      const filtered = allTags.filter((t) =>
        t.includes(trimmed) && !existingTags.includes(t)
      );
      setSuggestions(filtered.slice(0, 3));
      setIsOpen(filtered.length > 0);
    } else {
      setIsOpen(false);
    }
  }, [value, allTags, existingTags]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (t) => {
    // We create a mock event object because the parent expects an event with target.value
    // that ends with a space to trigger the addition.
    // Or even better, we can just call onAddTag if provided, or pass it via onChange with a space.
    if (onAddTag) {
      onAddTag(t);
    } else {
      onChange({ target: { value: t + " " } });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1" ref={wrapperRef}>
      <input
        value={value}
        onChange={onChange}
        onFocus={() => {
          if (value.trim()) setIsOpen(suggestions.length > 0);
        }}
        placeholder={placeholder}
        className={className}
        {...props}
      />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full z-50 rounded-xl border border-rule bg-paper shadow-xl p-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="px-2 pb-1 pt-1.5 text-[10px] font-semibold font-mono uppercase tracking-wider text-ink-3">
            ~Suggestions
          </div>
          {suggestions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleSuggestionClick(t)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left text-ink-2 hover:bg-paper-2 hover:text-accent transition-colors"
            >
              <Hash className="h-3.5 w-3.5 text-accent opacity-80" />
              <span className="font-medium font-mono">{t}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
