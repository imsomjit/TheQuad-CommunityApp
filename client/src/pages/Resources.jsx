import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    Search,
    SlidersHorizontal,
    X,
    Upload,
    ArrowDownUp,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import ResourceCard from "../components/ResourceCard";
import {
    RESOURCE_TYPES,
    COLLEGES,
    BRANCHES,
    SEMESTERS,
    SUBJECTS,
} from "../data/mockData";

import { Input } from "../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

const SORTS = [
    { key: "newest", label: "Newest" },
    { key: "top", label: "Top voted" },
    { key: "downloads", label: "Most downloaded" },
];

const ALL = "__all__";

export default function Resources() {
    const { resources } = useApp();
    const [params, setParams] = useSearchParams();

    const [q, setQ] = useState("");
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

            if (q && !searchableText.includes(q.toLowerCase()))
                return false;

            if (type !== ALL && r.type !== type)
                return false;

            if (college !== ALL && r.college !== college)
                return false;

            if (branch !== ALL && r.branch !== branch)
                return false;

            if (
                semester !== ALL &&
                String(r.semester) !== semester
            )
                return false;

            if (subject !== ALL && r.subject !== subject)
                return false;

            if (
                activeTag &&
                !(r.tags || []).includes(activeTag)
            )
                return false;

            return true;
        });

        if (sort === "newest") {
            list = list.sort(
                (a, b) =>
                    new Date(b.created_at) -
                    new Date(a.created_at)
            );
        } else if (sort === "top") {
            list = list.sort(
                (a, b) =>
                    b.upvotes -
                    b.downvotes -
                    (a.upvotes - a.downvotes)
            );
        } else if (sort === "downloads") {
            list = list.sort(
                (a, b) => b.downloads - a.downloads
            );
        }

        return list;
    }, [
        resources,
        q,
        type,
        college,
        branch,
        semester,
        subject,
        sort,
        activeTag,
    ]);

    const clearAll = () => {
        setQ("");
        setType(ALL);
        setCollege(ALL);
        setBranch(ALL);
        setSemester(ALL);
        setSubject(ALL);

        if (activeTag) {
            setParams({});
        }
    };

    const hasActive =
        q ||
        type !== ALL ||
        college !== ALL ||
        branch !== ALL ||
        semester !== ALL ||
        subject !== ALL ||
        activeTag;

    return (
        <div className="space-y-8 fade-in-up">
            {/* Header */}
            <header className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400 mb-2">
            // resources
                    </p>

                    <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter text-zinc-50">
                        Study library.
                    </h1>

                    <p className="mt-2 text-zinc-400 max-w-2xl">
                        Notes, previous-year papers,
                        assignments and cheat sheets —
                        uploaded and curated by students.
                    </p>
                </div>

                <Link
                    to="/upload"
                    data-testid="resources-upload-btn"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all"
                >
                    <Upload className="w-4 h-4" />
                    Upload resource
                </Link>
            </header>

            {/* Filters */}
            <div className="p-5 border border-zinc-800 rounded-lg bg-zinc-900/40 space-y-4">
                {/* Search */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />

                        <Input
                            data-testid="resources-search"
                            value={q}
                            onChange={(e) =>
                                setQ(e.target.value)
                            }
                            placeholder="Search by title, description or tag..."
                            className="pl-9 h-10 bg-zinc-950 border-zinc-800 placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/30"
                        />
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400 font-mono">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        filters
                    </div>
                </div>

                {/* Filter dropdowns */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    <FilterSelect
                        testId="filter-type"
                        placeholder="Type"
                        value={type}
                        setValue={setType}
                        options={[
                            {
                                value: ALL,
                                label: "All types",
                            },
                            ...RESOURCE_TYPES.map((t) => ({
                                value: t.key,
                                label: t.label,
                            })),
                        ]}
                    />

                    <FilterSelect
                        testId="filter-college"
                        placeholder="College"
                        value={college}
                        setValue={setCollege}
                        options={[
                            {
                                value: ALL,
                                label: "All colleges",
                            },
                            ...COLLEGES.map((c) => ({
                                value: c,
                                label: c,
                            })),
                        ]}
                    />

                    <FilterSelect
                        testId="filter-branch"
                        placeholder="Branch"
                        value={branch}
                        setValue={setBranch}
                        options={[
                            {
                                value: ALL,
                                label: "All branches",
                            },
                            ...BRANCHES.map((b) => ({
                                value: b,
                                label: b,
                            })),
                        ]}
                    />

                    <FilterSelect
                        testId="filter-semester"
                        placeholder="Sem"
                        value={semester}
                        setValue={setSemester}
                        options={[
                            {
                                value: ALL,
                                label: "Any sem",
                            },
                            ...SEMESTERS.map((s) => ({
                                value: String(s),
                                label: `Sem ${s}`,
                            })),
                        ]}
                    />

                    <FilterSelect
                        testId="filter-subject"
                        placeholder="Subject"
                        value={subject}
                        setValue={setSubject}
                        options={[
                            {
                                value: ALL,
                                label: "All subjects",
                            },
                            ...SUBJECTS.map((s) => ({
                                value: s,
                                label: s,
                            })),
                        ]}
                    />

                    <FilterSelect
                        testId="filter-sort"
                        placeholder="Sort"
                        value={sort}
                        setValue={setSort}
                        icon={ArrowDownUp}
                        options={SORTS.map((s) => ({
                            value: s.key,
                            label: s.label,
                        }))}
                    />
                </div>

                {/* Active filters */}
                {hasActive && (
                    <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/70">
                        <span className="font-mono text-xs text-zinc-500">
                            active filters:
                        </span>

                        <div className="flex flex-wrap gap-1.5">
                            {activeTag && (
                                <Chip
                                    onRemove={() =>
                                        setParams({})
                                    }
                                >
                                    #{activeTag}
                                </Chip>
                            )}

                            {q && (
                                <Chip
                                    onRemove={() =>
                                        setQ("")
                                    }
                                >
                                    "{q}"
                                </Chip>
                            )}

                            {type !== ALL && (
                                <Chip
                                    onRemove={() =>
                                        setType(ALL)
                                    }
                                >
                                    {
                                        RESOURCE_TYPES.find(
                                            (t) => t.key === type
                                        )?.label
                                    }
                                </Chip>
                            )}

                            {college !== ALL && (
                                <Chip
                                    onRemove={() =>
                                        setCollege(ALL)
                                    }
                                >
                                    {college}
                                </Chip>
                            )}

                            {branch !== ALL && (
                                <Chip
                                    onRemove={() =>
                                        setBranch(ALL)
                                    }
                                >
                                    {branch}
                                </Chip>
                            )}

                            {semester !== ALL && (
                                <Chip
                                    onRemove={() =>
                                        setSemester(ALL)
                                    }
                                >
                                    Sem {semester}
                                </Chip>
                            )}

                            {subject !== ALL && (
                                <Chip
                                    onRemove={() =>
                                        setSubject(ALL)
                                    }
                                >
                                    {subject}
                                </Chip>
                            )}
                        </div>

                        <button
                            onClick={clearAll}
                            data-testid="clear-filters-btn"
                            className="ml-auto text-xs text-zinc-400 hover:text-rose-400 transition-colors"
                        >
                            clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">
                    <span className="font-mono text-zinc-200 font-semibold">
                        {filtered.length}
                    </span>{" "}
                    resource
                    {filtered.length !== 1 && "s"}
                </p>
            </div>

            {/* Resource list */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-lg">
                        <p className="font-display text-xl text-zinc-300">
                            No matches
                        </p>
                        <p className="text-sm text-zinc-500 mt-1">
                            Try clearing some filters
                            or searching differently.
                        </p>
                    </div>
                ) : (
                    filtered.map((resource) => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function FilterSelect({
    value,
    setValue,
    options,
    placeholder,
    testId,
    icon: Icon,
}) {
    return (
        <Select
            value={value}
            onValueChange={setValue}
        >
            <SelectTrigger
                data-testid={testId}
                className="h-10 bg-zinc-950 border-zinc-800 text-sm text-zinc-300 hover:border-zinc-700"
            >
                <div className="flex items-center gap-2">
                    {Icon && (
                        <Icon className="w-3.5 h-3.5 text-zinc-500" />
                    )}

                    <SelectValue
                        placeholder={placeholder}
                    />
                </div>
            </SelectTrigger>

            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[300px]">
                {options.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-sm"
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function Chip({ children, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            {children}

            <button
                onClick={onRemove}
                className="hover:text-rose-400 transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}