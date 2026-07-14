import useDocumentTitle from '../hooks/useDocumentTitle';
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, Calendar, User, FileDigit, ShieldAlert, Maximize, Minimize, ChevronLeft, Eye, FileText, Lock, BookOpen, Share2, Check } from "lucide-react";
import { DetailSkeleton } from "../components/Skeletons";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { useViewTracker } from "../hooks/useViewTracker";

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import { timeAgo } from "../utils/timeAgo";
import { extractIdFromSlug } from "../utils/slugify";
import { useAuth } from "../context/AuthContext";
import { booksApi } from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";

import CommentSection from "../components/CommentSection";
import VoteButtons from "../components/VoteButtons";
import BookmarkButton from "../components/BookmarkButton";
import ReportModal from "../components/ReportModal";

export default function BookDetail() {
  useDocumentTitle("Book Details");
    const { publicId: slugOrId } = useParams();
    const publicId = extractIdFromSlug(slugOrId) || slugOrId;
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { currentUser } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPdf, setShowPdf] = useState(true);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const viewerContainerRef = useRef(null);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            viewerContainerRef.current?.requestFullscreen().catch(err => {
                console.error("Error attempting to enable full-screen mode:", err.message);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const { theme } = useTheme();

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: (defaultTabs) => [], // Hide sidebar to make it cleaner
        renderToolbar: (Toolbar) => (
            <Toolbar>
                {(slots) => {
                    const {
                        CurrentPageInput,
                        GoToNextPage,
                        GoToPreviousPage,
                        NumberOfPages,
                        Zoom,
                        ZoomIn,
                        ZoomOut,
                    } = slots;
                    return (
                        <div className="flex w-full items-center justify-between px-4 py-2 bg-paper border-b border-rule shrink-0">
                            <div className="flex items-center gap-2">
                                <ZoomOut />
                                <Zoom />
                                <ZoomIn />
                            </div>
                            <div className="flex items-center gap-2">
                                <GoToPreviousPage />
                                <div className="flex items-center gap-1 font-mono text-sm text-ink-2">
                                    <CurrentPageInput />
                                    <span>/</span>
                                    <NumberOfPages />
                                </div>
                                <GoToNextPage />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={toggleFullscreen}
                                    className="p-1.5 rounded-md hover:bg-paper-2 transition-colors text-ink-2 hover:text-ink"
                                    title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                                >
                                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    );
                }}
            </Toolbar>
        ),
    });

    const [shareToast, setShareToast] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: book?.title || "Check out this book",
                    url: url
                });
                return;
            } catch (err) {
                if (err.name !== "AbortError") console.error(err);
            }
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(() => {
                setShareToast(true);
                setTimeout(() => setShareToast(false), 2000);
            });
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "absolute";
            textArea.style.left = "-999999px";
            document.body.prepend(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setShareToast(true);
                setTimeout(() => setShareToast(false), 2000);
            } catch (error) {
                console.error(error);
            } finally {
                textArea.remove();
            }
        }
    };

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const data = await booksApi.get(publicId);
                setBook(data);
            } catch (err) {
                toast.error("Failed to load book details");
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [publicId]);

    const handleDownload = async () => {
        if (!book) return;
        try {
            await booksApi.incrementDownloads(book.id);
            setBook(prev => ({ ...prev, downloads: prev.downloads + 1 }));
            window.open(book.fileUrl, "_blank");
        } catch (err) {
            toast.error("Failed to record download");
        }
    };

    if (authLoading) return null;

    useViewTracker("book", book?.id);

    if (loading) {
        return <DetailSkeleton />;
    }

    if (!book) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="mb-2 font-display text-2xl font-bold text-ink">Book not found</h2>
                <p className="mb-6 text-ink-2">The book you're looking for doesn't exist or has been removed.</p>
                <Link to="/library" className="rounded-md bg-accent px-4 py-2 font-medium text-paper hover:bg-accent-2">
                    Back to Library
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 pb-12 px-4 sm:px-6 md:px-8">
            <Link to="/library" className="group inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Library
            </Link>

            <div className="overflow-hidden rounded-2xl border border-rule bg-paper">
                <div className="relative p-6 sm:p-8 md:p-10">
                    <div className="pointer-events-none absolute -right-20 -top-20 z-0 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />

                    <div className="relative z-10 grid grid-cols-1 items-start gap-x-8 gap-y-6 md:grid-cols-[16rem_1fr] md:gap-y-8">

                        {/* 1. Cover (Top on mobile, Col 1 on desktop) */}
                        <div className="flex justify-center md:justify-start">
                            <div className="w-48 sm:w-56 md:w-full aspect-[3/4] items-center justify-center rounded-xl bg-paper-2 border border-rule overflow-hidden shadow-md">
                                {book.coverUrl ? (
                                    <img src={book.coverUrl} alt="Cover" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <FileText className="h-24 w-24 text-ink-3" strokeWidth={1} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Title & Author & Votes (Middle on mobile, Col 2 Row 1 on desktop) */}
                        <div className="flex flex-col gap-4 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="font-display text-4xl font-bold leading-tight text-ink md:text-6xl break-words">
                                        {book.title}
                                    </h1>
                                    <p className="mt-1 md:mt-2 text-md md:text-xl text-accent font-medium">by {book.author}</p>
                                </div>
                                <div className="flex flex-row md:flex-col shrink-0 items-center justify-center gap-2 sm:gap-3 bg-paper border border-accent-soft px-3 py-2 md:py-3 rounded-xl shadow-sm">
                                    <VoteButtons
                                        kind="book"
                                        id={book.id}
                                        upvotes={book.upvotes}
                                        downvotes={book.downvotes}
                                        layout="responsive"
                                    />
                                    <div className="w-px h-6 md:w-8 md:h-px bg-rule mx-1 my-0 md:mx-0 md:my-1" />
                                    <BookmarkButton targetType="book" targetId={book.id} initialCount={book.bookmarksCount} />
                                    
                                    <button
                                        onClick={handleShare}
                                        className="rounded-full p-2 text-ink-3 hover:bg-paper-2 hover:text-ink transition-colors"
                                        title="Share this book"
                                    >
                                        {shareToast ? <Check className="h-5 w-5 text-emerald-500" /> : <Share2 className="h-5 w-5" />}
                                    </button>

                                    {currentUser?.id !== (book.uploader?.id || book.uploaderId) && (
                                        <button
                                            onClick={() => setIsReportOpen(true)}
                                            className="rounded-full p-2 text-ink-3 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                            title="Report this book"
                                        >
                                            <ShieldAlert className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. Buttons (Bottom on mobile, Col 1 Row 2 on desktop) */}
                        <div className="flex flex-col gap-3 w-full max-w-[16rem] mx-auto md:mx-0">
                            <div className="relative">
                                <button
                                    disabled
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-medium text-paper opacity-60 cursor-not-allowed"
                                >
                                    <Download className="h-5 w-5" />
                                    Download PDF
                                </button>
                                <span className="absolute -top-2 -left-2 rounded-full bg-paper-2 px-2.5 py-1 text-[10px] border border-accent-soft font-mono uppercase tracking-wide text-accent shadow-lg">
                                    Soon
                                </span>
                            </div>
                            {currentUser ? (
                                <button
                                    onClick={() => setShowPdf(!showPdf)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-paper-2 px-4 py-3 font-medium text-ink hover:bg-paper-3 transition-colors border border-rule"
                                >
                                    <Eye className="h-5 w-5" />
                                    {showPdf ? "Hide Preview" : "Preview PDF"}
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-paper-2 px-4 py-3 font-medium text-ink hover:bg-paper-3 transition-colors border border-rule"
                                >
                                    <Lock className="h-5 w-5" />
                                    Login to Preview
                                </button>
                            )}
                        </div>

                        {/* 4. Details (Bottom on mobile, Col 2 Row 2 on desktop) */}
                        <div className="space-y-6 md:row-span-2">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-xl bg-paper-2 p-4 border border-rule/50">
                                <div className="space-y-1">
                                    <span className="flex items-center gap-1.5 text-xs text-ink-3"><Eye className="h-3.5 w-3.5" /> Views</span>
                                    <p className="font-mono text-sm font-medium text-ink">{book.views}</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="flex items-center gap-1.5 text-xs text-ink-3"><Download className="h-3.5 w-3.5" /> Downloads</span>
                                    <p className="font-mono text-sm font-medium text-ink">{book.downloads}</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="flex items-center gap-1.5 text-xs text-ink-3"><FileText className="h-3.5 w-3.5" /> File Size</span>
                                    <p className="font-mono text-sm font-medium text-ink">
                                        {book.fileSize ? `${(book.fileSize / (1024 * 1024)).toFixed(2)} MB` : "Unknown"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="flex items-center gap-1.5 text-xs text-ink-3"><Calendar className="h-3.5 w-3.5" /> Uploaded</span>
                                    <p className="font-mono text-sm font-medium text-ink">{timeAgo(book.createdAt)}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-sm text-ink-2">
                                {book.subject && (
                                    <div className="flex items-center gap-1.5 rounded-lg border border-rule px-3 py-1.5 bg-paper-2/50">
                                        <BookOpen className="h-4 w-4 text-accent" />
                                        <span className="font-medium text-ink">Subject:</span> {book.subject}
                                    </div>
                                )}
                                {book.isbn && (
                                    <div className="flex items-center gap-1.5 rounded-lg border border-rule px-3 py-1.5 bg-paper-2/50">
                                        <FileDigit className="h-4 w-4 text-accent" />
                                        <span className="font-medium text-ink">ISBN:</span> {book.isbn}
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 rounded-lg border border-rule px-3 py-1.5 bg-paper-2/50">
                                    <User className="h-4 w-4 text-accent" />
                                    <span className="font-medium text-ink">Uploader:</span>
                                    {book.uploader?.role === "admin" ? (
                                        <span className="text-ink-3">System</span>
                                    ) : (
                                        <Link to={`/u/${book.uploader?.username}`} className="text-accent hover:underline">@{book.uploader?.username}</Link>
                                    )}
                                </div>
                            </div>

                            {book.description && (
                                <div className="prose prose-invert max-w-none text-ink-2">
                                    <p className="whitespace-pre-wrap">{book.description}</p>
                                </div>
                            )}

                            {book.tags && book.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {book.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center rounded-md bg-paper-3 px-2.5 py-1 font-mono text-xs font-medium text-accent hover:bg-accent-soft cursor-pointer transition-colors">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PDF Viewer */}
            {showPdf && currentUser && (
                <div
                    ref={viewerContainerRef}
                    className="overflow-hidden rounded-2xl border border-rule bg-paper shadow-lg w-full h-[70vh] sm:h-[85vh] min-h-[500px] sm:min-h-[800px] flex flex-col relative"
                >
                    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                        <Viewer
                            fileUrl={book.fileUrl}
                            plugins={[defaultLayoutPluginInstance]}
                            theme={theme === 'dark' ? 'dark' : 'light'}
                        />
                    </Worker>
                </div>
            )}

            {/* Comments Section */}
            <div className="rounded-2xl border border-rule bg-paper p-6 sm:p-8">
                <CommentSection targetType="book" targetId={book.id} />
            </div>

            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                targetType="book"
                targetId={book.id}
            />
        </div>
    );
}
