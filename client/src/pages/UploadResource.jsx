import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Upload,
    X,
    FileText,
    ArrowLeft,
    Plus,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    RESOURCE_TYPES,
    COLLEGES,
    BRANCHES,
    SEMESTERS,
    SUBJECTS,
} from "../data/mockData";
import { toast } from "sonner";

export default function UploadResource() {
    const { addResource } = useApp();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("notes");
    const [college, setCollege] = useState("IIT Bombay");
    const [branch, setBranch] = useState("Computer Science");
    const [semester, setSemester] = useState("5");
    const [subject, setSubject] = useState("Operating Systems");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const onDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) setFile(f);
    };

    const onFileChange = (e) => {
        const f = e.target.files?.[0];
        if (f) setFile(f);
    };

    const addTag = (e) => {
        e.preventDefault();

        const t = tagInput.trim().replace(/^#/, "").toLowerCase();

        if (t && !tags.includes(t)) {
            setTags([...tags, t]);
        }

        setTagInput("");
    };

    const removeTag = (tag) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim() || !description.trim() || !file) {
            toast.error("Please fill all required fields and attach a file.");
            return;
        }

        setSubmitting(true);

        setTimeout(() => {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

            const newResource = addResource({
                title: title.trim(),
                description: description.trim(),
                type,
                college,
                branch,
                semester: Number(semester),
                subject,
                tags,
                file: {
                    name: file.name,
                    size: `${sizeMB} MB`,
                    pages: null,
                },
            });

            setSubmitting(false);
            toast.success("Resource published");
            navigate(`/resources/${newResource.id}`);
        }, 700);
    };

    return (
        <div className="max-w-3xl mx-auto fade-in-up">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-emerald-400 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                back
            </button>

            {/* Header */}
            <header className="mb-8">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400 mb-2">
          // new resource
                </p>

                <h1 className="font-display text-4xl font-bold tracking-tighter text-zinc-50">
                    Share something useful.
                </h1>

                <p className="mt-2 text-zinc-400">
                    Upload notes, papers, assignments — anything that helps someone
                    else level up.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <Field label="File *">
                    <label
                        data-testid="file-drop-zone"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onDrop}
                        className={`flex flex-col items-center justify-center gap-2 h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${file
                                ? "border-emerald-500/50 bg-emerald-500/5"
                                : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
                            }`}
                    >
                        <input
                            type="file"
                            className="hidden"
                            data-testid="file-input"
                            onChange={onFileChange}
                        />

                        {file ? (
                            <>
                                <FileText className="w-7 h-7 text-emerald-400" />
                                <p className="font-mono text-sm text-zinc-200">
                                    {file.name}
                                </p>
                                <p className="font-mono text-xs text-zinc-500">
                                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                                </p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-7 h-7 text-zinc-500" />
                                <p className="text-sm text-zinc-300">
                                    Drag & drop or click to upload
                                </p>
                                <p className="font-mono text-xs text-zinc-600">
                                    PDF, DOCX, PNG, MD — up to 25 MB
                                </p>
                            </>
                        )}
                    </label>
                </Field>

                {/* Title */}
                <Field label="Title *">
                    <Input
                        data-testid="upload-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Operating Systems Hand-Written Notes"
                        className="bg-zinc-950 border-zinc-800 h-11 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/30"
                    />
                </Field>

                {/* Description */}
                <Field label="Description *">
                    <Textarea
                        data-testid="upload-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What does this cover? Who is it for?"
                        className="bg-zinc-950 border-zinc-800 min-h-[120px] focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/30"
                    />
                </Field>

                {/* Select Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Type">
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger
                                data-testid="upload-type"
                                className="bg-zinc-950 border-zinc-800 h-11"
                            >
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                                {RESOURCE_TYPES.map((item) => (
                                    <SelectItem key={item.key} value={item.key}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="College">
                        <Select value={college} onValueChange={setCollege}>
                            <SelectTrigger
                                data-testid="upload-college"
                                className="bg-zinc-950 border-zinc-800 h-11"
                            >
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                                {COLLEGES.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Branch">
                        <Select value={branch} onValueChange={setBranch}>
                            <SelectTrigger
                                data-testid="upload-branch"
                                className="bg-zinc-950 border-zinc-800 h-11"
                            >
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                                {BRANCHES.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Semester">
                        <Select value={semester} onValueChange={setSemester}>
                            <SelectTrigger
                                data-testid="upload-semester"
                                className="bg-zinc-950 border-zinc-800 h-11"
                            >
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                                {SEMESTERS.map((item) => (
                                    <SelectItem key={item} value={String(item)}>
                                        Sem {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Subject" className="md:col-span-2">
                        <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger
                                data-testid="upload-subject"
                                className="bg-zinc-950 border-zinc-800 h-11"
                            >
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                                {SUBJECTS.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                {/* Tags */}
                <Field label="Tags">
                    <div className="flex gap-2">
                        <Input
                            data-testid="tag-input"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") addTag(e);
                            }}
                            placeholder="add a tag and press Enter"
                            className="bg-zinc-950 border-zinc-800 h-11 flex-1 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/30"
                        />

                        <button
                            type="button"
                            data-testid="add-tag-btn"
                            onClick={addTag}
                            className="h-11 px-3 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 transition-colors flex items-center gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            add
                        </button>
                    </div>

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                                >
                                    #{tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </Field>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/70">
                    <p className="font-mono text-xs text-zinc-500">
            // frontend preview · saved to local mock store
                    </p>

                    <button
                        type="submit"
                        disabled={submitting}
                        data-testid="publish-resource-btn"
                        className="inline-flex items-center gap-1.5 h-11 px-6 rounded-md text-sm font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 active:scale-95 transition-all"
                    >
                        {submitting ? "Publishing..." : "Publish resource"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({ label, children, className = "" }) {
    return (
        <div className={`space-y-2 ${className}`}>
            <label className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                {label}
            </label>
            {children}
        </div>
    );
}