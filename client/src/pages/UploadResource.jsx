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
const RESOURCE_TYPES = [
  { key: "notes", label: "Notes" },
  { key: "pyq", label: "PYQ" },
  { key: "assignment", label: "Assignment" },
  { key: "cheatsheet", label: "Cheat Sheet" },
  { key: "other", label: "Other" },
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
import { toast } from "sonner";

export default function UploadResource() {
    const { addResource } = useApp();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("notes");
    const [college, setCollege] = useState("");
    const [branch, setBranch] = useState("");
    const [semester, setSemester] = useState("all");
    const [subject, setSubject] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleFile = (f) => {
        if (!f) return;
        if (f.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }
        setFile(f);
    };

    const onDrop = (e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0]);
    };

    const onFileChange = (e) => {
        handleFile(e.target.files?.[0]);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !description.trim() || !file) {
            toast.error("Please fill all required fields and attach a file.");
            return;
        }

        setSubmitting(true);

        try {
            const newResource = await addResource({
                title: title.trim(),
                description: description.trim(),
                type,
                college,
                branch,
                semester: semester === "all" ? undefined : Number(semester),
                subject,
                tags,
            }, file);

            if (newResource) {
                toast.success("Resource published");
                navigate(`/resources/${newResource.id}`);
            } else {
                toast.error("Failed to publish resource.");
            }
        } catch (err) {
            console.error("Resource upload error:", err);
            toast.error(err.response?.data?.message || "Failed to publish resource.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 text-sm text-ink-2 hover:text-accent mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                back
            </button>

            {/* Header */}
            <header className="mb-8">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-syntax-rose mb-2">
          // new resource
                </p>

                <h1 className="font-display text-4xl font-bold tracking-tighter text-ink">
                    <span className="italic">Share</span> <span className="marker">something useful.</span>
                </h1>

                <p className="mt-2 text-ink-2">
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
                        className={`flex flex-col items-center justify-center gap-2 h-40 border-2 border-dashed rounded-sm cursor-pointer transition-colors ${file
                                ? "border-accent/50 bg-accent-soft"
                                : "border-rule hover:border-ink-3 bg-paper-2/40"
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
                                <FileText className="w-7 h-7 text-accent" />
                                <p className="font-mono text-sm text-ink">
                                    {file.name}
                                </p>
                                <p className="font-mono text-xs text-ink-3">
                                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                                </p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-7 h-7 text-ink-3" />
                                <p className="text-sm text-ink-2">
                                    Drag & drop or click to upload
                                </p>
                                <p className="font-mono text-xs text-ink-3">
                                    PDF, DOCX, PNG, MD — up to 10 MB
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
                        className="bg-paper border-rule h-11 focus-visible:border-accent/40 focus-visible:ring-accent/30"
                    />
                </Field>

                {/* Description */}
                <Field label="Description *">
                    <Textarea
                        data-testid="upload-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What does this cover? Who is it for?"
                        className="bg-paper border-rule min-h-[120px] focus-visible:border-accent/40 focus-visible:ring-accent/30"
                    />
                </Field>

                {/* Select Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Type">
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger
                                data-testid="upload-type"
                                className="bg-paper border-rule h-11"
                            >
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent className="bg-paper border-rule text-ink">
                                {RESOURCE_TYPES.map((item) => (
                                    <SelectItem key={item.key} value={item.key}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="College">
                        <Input
                            data-testid="upload-college"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            placeholder="e.g. IIT Bombay"
                            className="bg-paper border-rule h-11 focus-visible:border-accent/40 focus-visible:ring-accent/30"
                        />
                    </Field>

                    <Field label="Branch">
                        <Input
                            data-testid="upload-branch"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            placeholder="e.g. Computer Science"
                            className="bg-paper border-rule h-11 focus-visible:border-accent/40 focus-visible:ring-accent/30"
                        />
                    </Field>

                    <Field label="Semester">
                        <Select value={semester} onValueChange={setSemester}>
                            <SelectTrigger
                                data-testid="upload-semester"
                                className="bg-paper border-rule h-11"
                            >
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent className="bg-paper border-rule text-ink">
                                <SelectItem value="all">All Sem</SelectItem>
                                {SEMESTERS.map((item) => (
                                    <SelectItem key={item} value={String(item)}>
                                        Sem {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Subject" className="md:col-span-2">
                        <Input
                            data-testid="upload-subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Operating Systems"
                            className="bg-paper border-rule h-11 focus-visible:border-accent/40 focus-visible:ring-accent/30"
                        />
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
                            className="bg-paper border-rule h-11 flex-1 focus-visible:border-accent/40 focus-visible:ring-accent/30"
                        />

                        <button
                            type="button"
                            data-testid="add-tag-btn"
                            onClick={addTag}
                            className="h-11 px-3 rounded-sm bg-paper-2 border border-rule hover:border-ink-3 text-sm text-ink-2 transition-colors flex items-center gap-1.5"
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
                                    className="inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-sm bg-accent-soft border border-accent text-accent"
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
                <div className="flex items-center justify-between pt-4 border-t border-rule">
                    <p className="font-mono text-xs text-ink-3">
            // share and learn together
                    </p>

                    <button
                        type="submit"
                        disabled={submitting}
                        data-testid="publish-resource-btn"
                        className="inline-flex items-center gap-1.5 h-11 px-6 rounded-sm text-sm font-semibold text-paper bg-accent btn-primary disabled:opacity-50"
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
            <label className="font-mono text-xs uppercase tracking-wider text-ink-3">
                {label}
            </label>
            {children}
        </div>
    );
}
