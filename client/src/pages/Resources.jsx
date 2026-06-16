import React, { useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { Search, SlidersHorizontal, X, Upload, ArrowDownUp } from "lucide-react";

import { useApp } from "../context/AppContext";
import ResourceCard from "../components/ResourceCard";

import EmptyPlaceholder from "../components/EmptyPlaceholder";
import { ResourceCardSkeleton } from "../components/Skeletons";

import { Input } from "../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

const RESOURCE_TYPES = [
    { key: "notes", label: "Notes" },
    { key: "pyq", label: "PYQ" },
    { key: "assignment", label: "Assignment" },
    { key: "cheatsheet", label: "Cheat Sheet" },
    { key: "other", label: "Other" },
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const SORTS = [
    { key: "newest", label: "Newest" },
    { key: "top", label: "Top voted" },
    { key: "most_downloaded", label: "Most downloaded" },
    { key: "oldest", label: "Oldest" },
];

const ALL = "__all__";

export default function Resources({ inExplore = false }) {
    const { resources, apiLoaded, currentUser } = useApp();
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    React.useEffect(() => {
        if (!isDesktop && !inExplore) {
            navigate("/explore?tab=resources", { replace: true });
        }
    }, [isDesktop, inExplore, navigate]);

    // Dynamically compute filters from available resources
    const activeColleges = useMemo(() => Array.from(new Set(resources.map(r => r.college).filter(Boolean))).sort(), [resources]);
    const activeBranches = useMemo(() => Array.from(new Set(resources.map(r => r.branch).filter(Boolean))).sort(), [resources]);
    const activeSubjects = useMemo(() => Array.from(new Set(resources.map(r => r.subject).filter(Boolean))).sort(), [resources]);
    
    const allTags = useMemo(() => {
        const counts = {};
        resources.forEach(r => {
            if (r.tags) {
                r.tags.forEach(t => {
                    counts[t] = (counts[t] || 0) + 1;
                });
            }
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [resources]);

    const totalDownloads = useMemo(() => resources.reduce((acc, r) => acc + (r.downloads || 0), 0), [resources]);
    const totalContributors = useMemo(() => new Set(resources.map(r => r.uploader?.id).filter(Boolean)).size, [resources]);

    const [q, setQ] = useState(params.get("q") || "");
    
    React.useEffect(() => {
        if (params.get("q") !== null && params.get("q") !== q) {
            setQ(params.get("q"));
        }
    }, [params.get("q")]);

    const [type, setType] = useState(ALL);
    const [college, setCollege] = useState(ALL);
    const [branch, setBranch] = useState(ALL);
    const [semester, setSemester] = useState(ALL);
    const [subject, setSubject] = useState(ALL);
    const [sort, setSort] = useState("newest");

    const activeTag = params.get("tag");

    const filtered = useMemo(() => {
        let list = resources.filter((r) => {
            const searchableText =
                `${r.title} ${r.description} ${(r.tags || []).join(" ")}`.toLowerCase();

            if (q && !searchableText.includes(q.toLowerCase())) return false;
            if (type !== ALL && r.type !== type) return false;
            if (college !== ALL && r.college !== college) return false;
            if (branch !== ALL && r.branch !== branch) return false;
            if (semester !== ALL && String(r.semester) !== semester) return false;
            if (subject !== ALL && r.subject !== subject) return false;
            if (activeTag && !(r.tags || []).includes(activeTag)) return false;

            return true;
        });

        if (sort === "newest") {
            list = list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sort === "top") {
            list = list.sort(
                (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
            );
        } else if (sort === "most_downloaded") {
            list = list.sort((a, b) => b.downloads - a.downloads);
        } else if (sort === "oldest") {
            list = list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        return list;
    }, [resources, q, type, college, branch, semester, subject, sort, activeTag]);

    const clearAll = () => {
        setQ("");
        setType(ALL);
        setCollege(ALL);
        setBranch(ALL);
        setSemester(ALL);
        setSubject(ALL);

        if (activeTag) setParams({});
    };

    const hasActive =
        q ||
        type !== ALL ||
        college !== ALL ||
        branch !== ALL ||
        semester !== ALL ||
        subject !== ALL ||
        activeTag;

    if (!isDesktop && !inExplore) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Editorial header */}
            <header className="border-b-2 border-double border-rule pb-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-syntax-rose">
                            &sect;02 &middot; the notes
                        </p>

                        <h1 className="hidden md:inline mt-2 font-display text-5xl md:text-6xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl">
                            Share. <span className="font-display-italic text-accent">Save. </span>&amp; <span className="italic marker">Study.</span> 
                        </h1>

                        <p className="mt-4 max-w-2xl text-md md:text-lg leading-relaxed text-ink-2">
                            A growing archive of hand-written notes, previous-year papers,
                            assignments and cheat-sheets &mdash; uploaded by the learners who
                            already appeared the exam.
                        </p>
                    </div>

                    {currentUser && (
                        <Link
                            to="/upload"
                            data-testid="resources-upload-btn"
                            className="hidden md:inline-flex items-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-paper transition-all hover:brightness-110 active:scale-95"
                        >
                            <Upload className="h-4 w-4" />
                            Share a Note
                        </Link>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-9">
                    {/* Filter bar */}
                    <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />

                        <Input
                            data-testid="resources-search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by title, description or tag…"
                            className="h-10 rounded-md border-rule bg-paper pl-9 text-sm text-ink placeholder:text-ink-3 focus-visible:border-accent/60 focus-visible:ring-accent/30"
                        />
                    </div>

                    <div className="hidden items-center gap-2 font-mono text-xs text-ink-3 sm:flex">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        filters
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
                    <FilterSelect
                        testId="filter-type"
                        placeholder="Type"
                        value={type}
                        setValue={setType}
                        options={[
                            { value: ALL, label: "All types" },
                            ...RESOURCE_TYPES.map((t) => ({ value: t.key, label: t.label })),
                        ]}
                    />

                    <FilterSelect
                        testId="filter-college"
                        placeholder="College"
                        value={college}
                        setValue={setCollege}
                        options={[
                            { value: ALL, label: "All colleges" },
                            ...activeColleges.map((c) => ({ value: c, label: c })),
                        ]}
                    />

                    <FilterSelect
                        testId="filter-branch"
                        placeholder="Branch"
                        value={branch}
                        setValue={setBranch}
                        options={[
                            { value: ALL, label: "All branches" },
                            ...activeBranches.map((b) => ({ value: b, label: b })),
                        ]}
                    />

                    <FilterSelect
                        testId="filter-semester"
                        placeholder="Sem"
                        value={semester}
                        setValue={setSemester}
                        options={[
                            { value: ALL, label: "Any sem" },
                            ...SEMESTERS.map((s) => ({ value: String(s), label: `Sem ${s}` })),
                        ]}
                    />

                    <FilterSelect
                        testId="filter-subject"
                        placeholder="Subject"
                        value={subject}
                        setValue={setSubject}
                        options={[
                            { value: ALL, label: "All subjects" },
                            ...activeSubjects.map((s) => ({ value: s, label: s })),
                        ]}
                    />

                    <FilterSelect
                        testId="filter-sort"
                        placeholder="Sort"
                        value={sort}
                        setValue={setSort}
                        icon={ArrowDownUp}
                        options={SORTS.map((s) => ({ value: s.key, label: s.label }))}
                    />
                </div>

                {hasActive && (
                    <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-3">
                        <span className="font-mono text-xs text-ink-3">// active filters:</span>

                        <div className="flex flex-wrap gap-1.5">
                            {activeTag && <Chip onRemove={() => setParams({})}>#{activeTag}</Chip>}
                            {q && <Chip onRemove={() => setQ("")}>"{q}"</Chip>}
                            {type !== ALL && (
                                <Chip onRemove={() => setType(ALL)}>
                                    {RESOURCE_TYPES.find((t) => t.key === type)?.label}
                                </Chip>
                            )}
                            {college !== ALL && <Chip onRemove={() => setCollege(ALL)}>{college}</Chip>}
                            {branch !== ALL && <Chip onRemove={() => setBranch(ALL)}>{branch}</Chip>}
                            {semester !== ALL && <Chip onRemove={() => setSemester(ALL)}>Sem {semester}</Chip>}
                            {subject !== ALL && <Chip onRemove={() => setSubject(ALL)}>{subject}</Chip>}
                        </div>

                        <button
                            onClick={clearAll}
                            data-testid="clear-filters-btn"
                            className="ml-auto text-xs text-ink-2 transition-colors hover:text-syntax-rose"
                        >
                            clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-ink-2">
                    <span className="font-mono font-semibold text-ink">{filtered.length}</span>{" "}
                    resource{filtered.length !== 1 && "s"}
                </p>
            </div>

                    {/* Resource list */}
                    <div className="space-y-3">
                        {!apiLoaded ? (
                            [1, 2, 3, 4, 5].map((i) => <ResourceCardSkeleton key={i} />)
                        ) : filtered.length === 0 ? (
                            <EmptyPlaceholder 
                                icon={Search}
                                title="No matches found"
                                description="Try clearing some filters or searching differently."
                            />
                        ) : (
                            filtered.map((resource) => (
                                <ResourceCard key={resource.id} resource={resource} />
                            ))
                        )}
                    </div>
                </div>

                <aside className="lg:col-span-3">
                    <div className="sticky top-24 space-y-4 rounded-sm border border-rule bg-paper-2/40 p-4">
                        <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                            // filter by tag
                        </h3>

                        <div className="flex max-h-[300px] flex-wrap gap-1.5 overflow-y-auto pr-1">
                            {allTags.length > 0 ? (
                                allTags.map(([t, count]) => (
                                    <button
                                        key={t}
                                        onClick={() => setParams(t === activeTag ? {} : { tag: t })}
                                        data-testid={`filter-tag-${t}`}
                                    >
                                        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-xs transition-colors ${
                                            t === activeTag 
                                                ? "border-accent bg-accent-soft text-accent" 
                                                : "border-rule bg-paper-2 text-ink-2 hover:border-ink-3 hover:text-ink"
                                        }`}>
                                            {t}
                                            <span className="ml-1 text-ink-3/70">{count}</span>
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <span className="text-xs text-ink-3 font-mono py-2">No tags available.</span>
                            )}
                        </div>

                        <hr className="border-rule" />

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-ink-2">total documents</span>
                                <span className="font-mono text-ink">
                                    {resources.length}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-ink-2">total downloads</span>
                                <span className="font-mono text-ink">
                                    {totalDownloads}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-ink-2">total contributors</span>
                                <span className="font-mono text-ink">
                                    {totalContributors}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function FilterSelect({ value, setValue, options, placeholder, testId, icon: Icon }) {
    return (
        <Select value={value} onValueChange={setValue}>
            <SelectTrigger
                data-testid={testId}
                className="h-10 rounded-md border-rule bg-paper text-sm text-ink hover:border-ink-3"
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-3.5 w-3.5 text-ink-3" />}
                    <SelectValue placeholder={placeholder} />
                </div>
            </SelectTrigger>

            <SelectContent className="max-h-[300px] border-rule bg-paper text-ink">
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-sm">
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function Chip({ children, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-accent bg-accent-soft px-2 py-1 font-mono text-xs text-accent">
            {children}
            <button onClick={onRemove} className="transition-colors hover:text-syntax-rose">
                <X className="h-3 w-3" />
            </button>
        </span>
    );
}
