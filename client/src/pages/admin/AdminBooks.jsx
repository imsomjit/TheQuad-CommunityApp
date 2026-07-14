import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { Upload, FileText, Image as ImageIcon, Loader2, X, Plus, Pencil, Eye, Save } from "lucide-react";
import { booksApi } from "../../services/api";
import AutocompleteTagInput from "../../components/ui/AutocompleteTagInput";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { generateSlug } from "../../utils/slugify";
import { TableSkeleton } from "../../components/Skeletons";
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function AdminBooks() {
    useDocumentTitle("[Admin] Books Management");
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
    const [filePreview, setFilePreview] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    const watchFile = watch("file");
    const watchCover = watch("cover");

    const [books, setBooks] = useState([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);
    const [editingBook, setEditingBook] = useState(null);

    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    
    const [activeTab, setActiveTab] = useState("list");

    const fetchBooks = async () => {
        setIsLoadingBooks(true);
        try {
            const res = await booksApi.list({ limit: 100 });
            setBooks(res.data);
        } catch (error) {
            toast.error("Failed to load books");
        } finally {
            setIsLoadingBooks(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

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

    React.useEffect(() => {
        if (watchFile && watchFile[0]) {
            setFilePreview(watchFile[0].name);
        } else {
            setFilePreview(null);
        }
    }, [watchFile]);

    React.useEffect(() => {
        if (watchCover && watchCover[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result);
            };
            reader.readAsDataURL(watchCover[0]);
        } else {
            setCoverPreview(null);
        }
    }, [watchCover]);

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("author", data.author);
            if (data.description) formData.append("description", data.description);
            if (data.isbn) formData.append("isbn", data.isbn);
            if (data.subject) formData.append("subject", data.subject);
            formData.append("tags", JSON.stringify(tags));
            formData.append("file", data.file[0]);
            
            if (data.cover && data.cover[0]) {
                formData.append("cover", data.cover[0]);
            }

            await booksApi.upload(formData);
            toast.success("Book uploaded successfully");
            reset();
            setFilePreview(null);
            setCoverPreview(null);
            setTags([]);
            setTagInput("");
            setActiveTab("list");
            fetchBooks();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload book");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Manage Library</h1>
                <p className="mt-1 text-sm text-ink-2">Upload and manage books for the Library.</p>
            </div>

            <div className="flex gap-4 border-b border-rule">
                <button
                    onClick={() => setActiveTab("list")}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === "list" ? "border-accent text-accent" : "border-transparent text-ink-3 hover:text-ink"
                    }`}
                >
                    Existing Books
                </button>
                <button
                    onClick={() => setActiveTab("upload")}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === "upload" ? "border-accent text-accent" : "border-transparent text-ink-3 hover:text-ink"
                    }`}
                >
                    Upload New Book
                </button>
            </div>

            {activeTab === "upload" && (
                <div className="rounded-2xl border border-rule bg-paper p-6 sm:p-8 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-ink">Title *</label>
                                <input
                                    {...register("title", { required: "Title is required", minLength: { value: 3, message: "Title must be at least 3 characters" } })}
                                    className="w-full rounded-xl border border-rule bg-paper-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                                    placeholder="Book Title"
                                />
                                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-ink">Author *</label>
                                <input
                                    {...register("author", { required: "Author is required" })}
                                    className="w-full rounded-xl border border-rule bg-paper-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                                    placeholder="Author Name"
                                />
                                {errors.author && <p className="text-xs text-red-500">{errors.author.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-ink">Subject</label>
                                <input
                                    {...register("subject")}
                                    className="w-full rounded-xl border border-rule bg-paper-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                                    placeholder="e.g. Computer Science"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-ink">ISBN</label>
                                <input
                                    {...register("isbn")}
                                    className="w-full rounded-xl border border-rule bg-paper-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                                    placeholder="ISBN Number"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-ink">Description</label>
                            <textarea
                                {...register("description")}
                                rows={4}
                                className="w-full resize-none rounded-xl border border-rule bg-paper-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                                placeholder="Brief description or synopsis..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-ink">Tags</label>
                            <div className="flex gap-2">
                                <AutocompleteTagInput
                                    value={tagInput}
                                    existingTags={tags}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.endsWith(" ") || val.endsWith(",")) {
                                            const t = val.trim().replace(/^#/, "").toLowerCase();
                                            if (t && !tags.includes(t)) setTags([...tags, t]);
                                            setTagInput("");
                                        } else {
                                            setTagInput(val);
                                        }
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && addTag(e)}
                                    className="w-full rounded-xl border border-rule bg-paper-2 px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                                    placeholder="e.g. algorithms, computer-science (Press Enter)"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="flex shrink-0 items-center justify-center rounded-xl bg-paper-3 px-4 transition-colors hover:bg-rule"
                                >
                                    <Plus className="h-5 w-5 text-ink-2" />
                                </button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent"
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="rounded-full hover:bg-accent/20"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* PDF File Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-ink">PDF File *</label>
                                <div className="relative flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-rule bg-paper-2 p-6 transition-colors hover:border-accent hover:bg-paper-3">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        {...register("file", { 
                                            required: "PDF file is required",
                                            validate: {
                                                lessThan10MB: files => !files[0] || files[0].size <= 10485760 || "File size must be less than 10MB"
                                            }
                                        })}
                                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                    />
                                    <div className="flex flex-col items-center justify-center space-y-2 text-center">
                                        <FileText className="h-8 w-8 text-ink-3" />
                                        <div className="text-sm text-ink-2">
                                            {filePreview ? (
                                                <span className="font-medium text-accent">{filePreview}</span>
                                            ) : (
                                                <>
                                                    <span className="font-semibold text-accent">Click to upload</span> or drag and drop
                                                    <br />PDF (MAX. 10MB)
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {errors.file && <p className="text-xs text-red-500">{errors.file.message}</p>}
                            </div>

                            {/* Cover Image Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-ink">Cover Image (Optional)</label>
                                <div className="relative flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-rule bg-paper-2 p-6 transition-colors hover:border-accent hover:bg-paper-3 overflow-hidden h-[160px]">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...register("cover")}
                                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                    />
                                    {coverPreview ? (
                                        <img src={coverPreview} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center space-y-2 text-center relative z-0">
                                            <ImageIcon className="h-8 w-8 text-ink-3" />
                                            <div className="text-sm text-ink-2">
                                                <span className="font-semibold text-accent">Click to upload cover</span>
                                                <br />JPG, PNG, WebP
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-rule">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 font-medium text-paper transition-all hover:bg-accent-2 hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5" />
                                        Upload Book
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === "list" && (
                <div className="rounded-2xl border border-rule bg-paper p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-xl font-bold text-ink">Library Collection</h2>
                        <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                            {books.length} Books
                        </span>
                    </div>
                {isLoadingBooks ? (
                    <TableSkeleton />
                ) : books.length === 0 ? (
                    <p className="text-center text-ink-3 py-10">No books uploaded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-ink-2">
                            <thead className="border-b border-rule bg-paper-2 text-xs uppercase text-ink-3">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Title</th>
                                    <th className="px-4 py-3 font-medium">Author</th>
                                    <th className="px-4 py-3 font-medium">Subject</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-rule">
                                {books.map((book) => (
                                    <tr key={book.id} className="hover:bg-paper-2/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-ink">
                                            <div className="line-clamp-1" title={book.title}>{book.title}</div>
                                        </td>
                                        <td className="px-4 py-3">{book.author}</td>
                                        <td className="px-4 py-3">{book.subject || "-"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/library/${generateSlug(book.title, book.publicId)}`}
                                                    target="_blank"
                                                    className="p-2 text-ink-3 hover:text-accent rounded-lg hover:bg-paper-3 transition-colors"
                                                    title="View in Library"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setEditingBook(book)}
                                                    className="p-2 text-ink-3 hover:text-accent rounded-lg hover:bg-paper-3 transition-colors"
                                                    title="Edit Metadata"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            )}

            {/* Edit Modal */}
            {editingBook && (
                <EditBookModal
                    book={editingBook}
                    onClose={() => setEditingBook(null)}
                    onSuccess={() => {
                        setEditingBook(null);
                        fetchBooks();
                    }}
                />
            )}
        </div>
    );
}

function EditBookModal({ book, onClose, onSuccess }) {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            author: book.author,
            subject: book.subject || "",
            isbn: book.isbn || "",
            description: book.description || "",
        }
    });

    const watchCover = watch("cover");
    const [coverPreview, setCoverPreview] = useState(book.coverUrl || null);

    const [tags, setTags] = useState(book.tags || []);
    const [tagInput, setTagInput] = useState("");

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

    React.useEffect(() => {
        if (watchCover && watchCover[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result);
            };
            reader.readAsDataURL(watchCover[0]);
        }
    }, [watchCover]);

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append("author", data.author);
            if (data.description) formData.append("description", data.description);
            if (data.isbn) formData.append("isbn", data.isbn);
            if (data.subject) formData.append("subject", data.subject);
            formData.append("tags", JSON.stringify(tags));

            if (data.cover && data.cover[0]) {
                formData.append("cover", data.cover[0]);
            }

            await booksApi.update(book.id, formData);
            toast.success("Book metadata updated");
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update book");
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md overflow-hidden">
            <div className="w-full max-w-4xl rounded-2xl bg-paper p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] border border-rule/50">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="font-display text-2xl font-bold text-ink">Edit Book Metadata</h2>
                        <p className="text-sm text-ink-2 mt-1">Update information for {book.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-ink-3 hover:bg-paper-2 hover:text-ink rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-8">
                    {/* Left Column: Cover & File Update */}
                    <div className="w-full md:w-1/3 flex flex-col gap-6">
                        <div className="flex flex-col items-center p-4 rounded-xl border border-rule bg-paper-2 shadow-inner">
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover Preview" className="w-full aspect-[2/3] object-cover rounded-lg shadow-md border border-rule mb-4" />
                            ) : (
                                <div className="w-full aspect-[2/3] bg-paper-3 rounded-lg flex items-center justify-center border border-rule mb-4 shadow-inner">
                                    <ImageIcon className="h-10 w-10 text-ink-3/50" />
                                </div>
                            )}
                            
                            <div className="w-full relative overflow-hidden rounded-xl border border-dashed border-rule bg-paper p-3 text-center transition-colors hover:border-accent hover:bg-accent/5 cursor-pointer group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    {...register("cover")}
                                    className="absolute inset-0 cursor-pointer opacity-0 z-10"
                                />
                                <div className="flex flex-col items-center justify-center gap-1.5 transition-transform group-hover:scale-105">
                                    <ImageIcon className="h-5 w-5 text-ink-2 group-hover:text-accent" />
                                    <span className="text-xs font-medium text-ink-2 group-hover:text-accent">Change Cover Image</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Text Metadata */}
                    <div className="w-full md:w-2/3 flex flex-col gap-5">
                        <div className="space-y-1 bg-paper-2/50 p-4 rounded-xl border border-rule/50">
                            <p className="text-xs font-bold uppercase tracking-wider text-ink-3">Title (Read Only)</p>
                            <p className="text-lg font-bold text-ink leading-tight">{book.title}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-ink">Author <span className="text-red-500">*</span></label>
                                <input
                                    {...register("author", { required: "Author is required" })}
                                    className="w-full rounded-xl border border-rule bg-paper-2 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                                />
                                {errors.author && <p className="text-xs text-red-500">{errors.author.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-ink">Subject</label>
                                <input
                                    {...register("subject")}
                                    className="w-full rounded-xl border border-rule bg-paper-2 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-ink">ISBN</label>
                            <input
                                {...register("isbn")}
                                className="w-full rounded-xl border border-rule bg-paper-2 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-ink">Description</label>
                            <textarea
                                {...register("description")}
                                rows={4}
                                className="w-full resize-none rounded-xl border border-rule bg-paper-2 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-ink">Tags</label>
                            <div className="flex gap-2">
                                <AutocompleteTagInput
                                    value={tagInput}
                                    existingTags={tags}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.endsWith(" ") || val.endsWith(",")) {
                                            const t = val.trim().replace(/^#/, "").toLowerCase();
                                            if (t && !tags.includes(t)) setTags([...tags, t]);
                                            setTagInput("");
                                        } else {
                                            setTagInput(val);
                                        }
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && addTag(e)}
                                    className="w-full rounded-xl border border-rule bg-paper-2 px-4 py-2.5 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                                    placeholder="Add tags (Press Enter)"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="flex shrink-0 items-center justify-center rounded-xl bg-paper-3 px-4 transition-colors hover:bg-rule"
                                >
                                    <Plus className="h-5 w-5 text-ink-2" />
                                </button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent"
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="rounded-full hover:bg-accent/20 p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-4 border-t border-rule/50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto px-6 py-2.5 font-medium text-ink-2 hover:text-ink transition-colors rounded-xl hover:bg-paper-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-2.5 font-medium text-paper transition-all hover:bg-accent-2 disabled:opacity-50 hover:shadow-lg hover:shadow-accent/20"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
