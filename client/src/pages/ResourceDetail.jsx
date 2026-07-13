import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Download,
    Bookmark,
    Flag,
    Edit3,
    Trash2,
    FileText,
    BookOpen,
    ClipboardList,
    Sparkles,
    Folder,
    Calendar,
    Lock,
    Eye,
    Maximize,
    Minimize,
    Building2,
    GraduationCap,
    Share2,
    Check,
    MessageSquare,
    Send,
    X,
} from "lucide-react";

import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { useTheme } from "../context/ThemeContext";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import VoteButtons from "../components/VoteButtons";
import TagBadge from "../components/TagBadge";
import { DetailSkeleton } from "../components/Skeletons";
import { useViewTracker } from "../hooks/useViewTracker";
import { extractIdFromSlug } from "../utils/slugify";
import { adminApi, resourcesApi, usersApi } from "../services/api";
const RESOURCE_TYPES = [
  { key: "notes", label: "Notes", icon: "BookOpen" },
  { key: "pyq", label: "PYQ", icon: "FileText" },
  { key: "assignment", label: "Assignment", icon: "ClipboardList" },
  { key: "cheatsheet", label: "Cheat Sheet", icon: "Sparkles" },
  { key: "other", label: "Other", icon: "Folder" },
];
import CommentSection from "../components/CommentSection";
import { toast } from "sonner";
import { getAvatarFallback } from "../utils/fallbacks";

const ICONS = { BookOpen, FileText, ClipboardList, Sparkles, Folder };

const TYPE_VAR = {
    notes: "--syntax-mint",
    pyq: "--syntax-cyan",
    assignment: "--syntax-violet",
    cheatsheet: "--syntax-amber",
    other: "--ink-2",
};

function format(ts) {
    return new Date(ts).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function timeAgo(ts) {
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
}

export default function ResourceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        resources,
        bookmarks,
        toggleBookmark,
        currentUser,
        deleteResource,
        incrementDownloads,
        openReportModal,
        apiLoaded,
    } = useApp();
    const { isAuthenticated } = useAuth();
    const { theme } = useTheme();

    const [showPreview, setShowPreview] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const viewerContainerRef = React.useRef(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [shareToast, setShareToast] = useState(false);

    // Chat Sidebar State
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatContainerRef = React.useRef(null);
    
    // Drag logic for Chat Window
    const [chatPos, setChatPos] = useState({ 
        x: Math.max(20, window.innerWidth / 2 - 190), 
        y: Math.max(20, window.innerHeight / 2 - 275) 
    });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = React.useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

    const handleDragStart = (e) => {
        // Only allow dragging on header (not on buttons inside header)
        if (e.target.closest('button')) return;
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: chatPos.x,
            initialY: chatPos.y
        };
    };

    useEffect(() => {
        const handleDrag = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            setChatPos({
                x: dragRef.current.initialX + dx,
                y: dragRef.current.initialY + dy
            });
        };

        const handleDragEnd = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleDrag);
            window.addEventListener('mouseup', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging]);

    // Auto scroll chat to bottom
    useEffect(() => {
        if (showChat && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages, showChat]);

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || chatLoading) return;

        const userMsg = { role: "user", content: chatInput };
        setChatMessages((prev) => [...prev, userMsg]);
        setChatInput("");
        setChatLoading(true);

        try {
            const res = await resourcesApi.chat(resource.id, userMsg.content, chatMessages);
            setChatMessages((prev) => [...prev, { role: "ai", content: res.data.data.reply }]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to chat with PDF");
        } finally {
            setChatLoading(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: resource?.title || "Check out this resource",
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

    const extractedId = extractIdFromSlug(id);
    const resource = resources.find(
        (r) => r.publicId === extractedId || r.id === parseInt(extractedId, 10)
    );

    useEffect(() => {
        if (currentUser && resource?.uploader) {
            usersApi.getProfile(resource.uploader.username)
                .then(p => setIsFollowing(p.viewerFollows))
                .catch(() => {});
        }
    }, [resource, currentUser]);

    const handleFollowToggle = async () => {
        if (!currentUser) { navigate("/login"); return; }
        if (followLoading || !resource?.uploader) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await usersApi.unfollowUser(resource.uploader.id);
                setIsFollowing(false);
                toast.success(`Unfollowed ${resource.uploader.name}`);
            } else {
                await usersApi.followUser(resource.uploader.id);
                setIsFollowing(true);
                toast.success(`Following ${resource.uploader.name}`);
            }
        } catch (error) {
            toast.error("Failed to toggle follow status");
        } finally {
            setFollowLoading(false);
        }
    };

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

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: () => [], 
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

    useViewTracker("resource", resource?.id);

    if (!apiLoaded && !resource) {
        return <DetailSkeleton />;
    }

    if (!resource) {
        return (
            <div className="py-20 text-center">
                <p className="font-display text-2xl text-ink">Resource not found</p>
                <Link to="/resources" className="mt-2 inline-block text-accent">
                    ← back to resources
                </Link>
            </div>
        );
    }

    const type =
        RESOURCE_TYPES.find((t) => t.key === resource.type) || RESOURCE_TYPES[4];
    const Icon = ICONS[type.icon] || Folder;
    const colorVar = `rgb(var(${TYPE_VAR[resource.type] || "--ink-2"}))`;

    const isMine = currentUser?.id === resource.uploader.id;
    const isModerator = currentUser?.role === 'admin' || currentUser?.role === 'moderator';
    const isBookmarked = bookmarks.has(`resource:${resource.id}`);

    const handleDownload = async () => {
        if (!isAuthenticated) {
            toast.error("Please log in to download resources");
            navigate("/login");
            return;
        }
        
        try {
            toast.success("Download started", { description: resource.file.name });
            const fileUrl = await resourcesApi.download(resource.id);
            incrementDownloads("resource", resource.id);
            window.open(fileUrl, "_blank");
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || "Could not retrieve the file.";
            toast.error("Download failed", { description: msg });
        }
    };

    const handleBookmark = () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        toggleBookmark(resource.id);
    };

    const handleDelete = async () => {
        if (window.confirm("Delete this resource? This cannot be undone.")) {
            if (isMine) {
                deleteResource(resource.id);
            } else if (isModerator) {
                await adminApi.removeContent("resource", resource.id, "Moderator deletion");
            }
            navigate("/resources");
            toast.success("Resource deleted");
        }
    };

    return (
        <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link
                to="/resources"
                data-testid="back-to-resources"
                className="mb-6 inline-flex items-center gap-1 text-sm text-ink-2 transition-colors hover:text-accent"
            >
                <ArrowLeft className="h-4 w-4" />
                all resources
            </Link>

            <article className="space-y-6">
                <header className="border-b-2 border-double border-rule pb-8">
                    <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">
                        &sect;02 &middot; the notes
                    </p>

                    <h1 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
                        {resource.title}
                    </h1>

                    <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-3">
                        <span
                            className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1"
                            style={{ color: colorVar, borderColor: colorVar }}
                        >
                            <Icon className="h-3 w-3" />
                            {type.label}
                        </span>

                        {resource.subject && (
                            <div className="flex items-center gap-1.5 rounded-md border border-rule px-2.5 py-1 bg-paper-2/50 text-ink-2">
                                <BookOpen className="h-3 w-3 text-accent" />
                                <span>{resource.subject}</span>
                            </div>
                        )}
                        
                        {resource.college && (
                            <div className="flex items-center gap-1.5 rounded-md border border-rule px-2.5 py-1 bg-paper-2/50 text-ink-2">
                                <Building2 className="h-3 w-3 text-accent" />
                                <span>{resource.college}</span>
                            </div>
                        )}
                        
                        {resource.branch && (
                            <div className="flex items-center gap-1.5 rounded-md border border-rule px-2.5 py-1 bg-paper-2/50 text-ink-2">
                                <GraduationCap className="h-3 w-3 text-accent" />
                                <span>{resource.branch} · Sem {resource.semester}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 flex items-center gap-4 font-mono text-xs text-ink-3">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                uploaded {format(resource.createdAt)}
                                {resource.updatedAt && resource.updatedAt !== resource.createdAt && (
                                    <> · updated {timeAgo(resource.updatedAt)}</>
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            <span>{resource.views || 0} views</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Download className="h-3.5 w-3.5" />
                            <span>{resource.downloads || 0} downloads</span>
                        </div>
                    </div>
                </header>

                {/* Action bar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl border border-accent-soft bg-paper shadow-sm p-3">
                    {/* Primary Group */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                        <VoteButtons
                            kind="resource"
                            id={resource.id}
                            upvotes={resource.upvotes}
                            downvotes={resource.downvotes}
                            layout="horizontal"
                            size="md"
                        />

                        <div className="hidden sm:block h-8 w-px bg-rule mx-1" />

                        <button
                            onClick={handleDownload}
                            data-testid="download-resource-btn"
                            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-paper transition-all hover:brightness-110 active:scale-95"
                        >
                            {isAuthenticated ? (
                                <Download className="h-4 w-4" />
                            ) : (
                                <Lock className="h-4 w-4" />
                            )}
                            Download
                        </button>

                        {isAuthenticated ? (
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 rounded-lg border border-rule bg-paper-2 px-4 py-2.5 text-sm font-medium text-ink transition-all hover:bg-paper-3"
                            >
                                <Eye className="h-4 w-4" />
                                {showPreview ? "Hide Preview" : "Preview"}
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate("/login")}
                                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 rounded-lg border border-rule bg-paper-2 px-4 py-2.5 text-sm font-medium text-ink transition-all hover:bg-paper-3"
                            >
                                <Lock className="h-4 w-4" />
                                Preview
                            </button>
                        )}

                        {isAuthenticated && (
                            <button
                                onClick={() => setShowChat(true)}
                                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 rounded-lg border border-rule bg-paper-2 px-4 py-2.5 text-sm font-medium text-ink transition-all hover:bg-paper-3 hover:border-accent hover:text-accent"
                            >
                                <Sparkles className="h-4 w-4" />
                                Chat with PDF
                            </button>
                        )}
                    </div>

                    <div className="hidden sm:block flex-1" />

                    {/* Secondary Group */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t border-rule sm:border-0">
                        <div className="flex gap-2">
                            <button
                                onClick={handleBookmark}
                                data-testid="bookmark-detail-btn"
                                className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${isBookmarked
                                        ? "border-accent bg-accent-soft text-accent"
                                        : "border-rule bg-paper-2 text-ink-2 hover:border-ink-3 hover:text-ink"
                                    }`}
                            >
                                <Bookmark
                                    className="h-4 w-4"
                                    fill={isBookmarked ? "currentColor" : "none"}
                                />
                                {isBookmarked ? "Saved" : "Save"}
                            </button>
                            
                            <button
                                onClick={handleShare}
                                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 rounded-lg border border-rule bg-paper-2 px-4 py-2.5 text-sm font-medium text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
                            >
                                {shareToast ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                                {shareToast ? "Copied!" : "Share"}
                            </button>
                        </div>
                                
                        {!isMine && (
                            <button
                                data-testid="report-resource-btn"
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        toast.error("Please log in to report resources");
                                        navigate("/login");
                                        return;
                                    }
                                    openReportModal("resource", resource.id, resource.title);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm text-ink-2 transition-colors hover:text-syntax-rose"
                            >
                                <Flag className="h-4 w-4" />
                                <span className="hidden sm:inline">Report</span>
                            </button>
                        )}

                        {(isMine || isModerator) && (
                            <button
                                data-testid="delete-resource-btn"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm text-ink-2 transition-colors hover:text-syntax-rose"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Delete</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="hidden md:grid md:grid-cols-3 gap-4">
                    <Stat label="views" value={resource.views.toLocaleString()} />
                    <Stat label="downloads" value={resource.downloads.toLocaleString()} />
                    <Stat
                        label="bookmarks"
                        value={resource.bookmarks?.toLocaleString() || "0"}
                    />
                </div>

                {/* File preview */}
                <div className="flex items-center gap-4 rounded-md border border-rule bg-paper-2/40 p-5">
                    <div
                        className="flex h-14 w-14 items-center justify-center rounded-md border shrink-0"
                        style={{ borderColor: colorVar, color: colorVar }}
                    >
                        <FileText className="h-7 w-7" strokeWidth={1.5} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-sm text-ink">
                            {resource.file.name}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-ink-3">
                            {resource.file.size}
                            {resource.file.pages && <> · {resource.file.pages} pages</>}
                        </p>
                    </div>
                </div>

                {showPreview && isAuthenticated && (
                    <div className="mt-6">
                        {resource.fileUrl?.toLowerCase().endsWith('.pdf') ? (
                            <div
                                ref={viewerContainerRef}
                                className="overflow-hidden rounded-2xl border border-rule bg-paper shadow-lg w-full h-[70vh] sm:h-[85vh] min-h-[500px] sm:min-h-[800px] flex flex-col relative"
                            >
                                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                                    <Viewer
                                        fileUrl={resource.fileUrl}
                                        plugins={[defaultLayoutPluginInstance]}
                                        theme={theme === 'dark' ? 'dark' : 'light'}
                                    />
                                </Worker>
                            </div>
                        ) : resource.fileUrl?.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                            <div className="overflow-hidden rounded-2xl border border-rule shadow-lg bg-paper flex justify-center items-center p-4">
                                <img src={resource.fileUrl} alt="Resource Preview" className="max-w-full max-h-[85vh] object-contain rounded-md" />
                            </div>
                        ) : (
                            <div className="p-8 text-center border border-rule rounded-md bg-paper-2/40">
                                <p className="text-ink-2 text-sm font-mono uppercase tracking-widest">Preview not available for this file type.</p>
                                <button onClick={handleDownload} className="mt-4 text-accent hover:underline text-sm font-medium">Download to view</button>
                            </div>
                        )}
                    </div>
                )}

                <section className="space-y-3">
                    <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                        // description
                    </h2>

                    <div className="prose-dev">
                        <p>{resource.description}</p>
                    </div>
                </section>

                <div className="flex flex-wrap gap-1.5">
                    {resource.tags.map((t) => (
                        <TagBadge key={t}>{t}</TagBadge>
                    ))}
                </div>

                <div className="mt-10 rounded-md border border-rule bg-paper-2/40 p-5">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">Shared by</p>
                    <div className="flex items-center gap-4">
                        <Link to={`/u/${resource.uploader.username}`}>
                            <img
                                src={resource.uploader.avatar || getAvatarFallback(resource.uploader.name, resource.uploader.username)}
                                alt={resource.uploader.name}
                                className="h-12 w-12 rounded-md border border-rule object-cover bg-paper-2"
                            />
                        </Link>

                        <div className="min-w-0 flex-1">
                            <Link
                                to={`/u/${resource.uploader.username}`}
                                className="font-display text-lg text-ink hover:text-accent transition-colors"
                            >
                                {resource.uploader.name}
                            </Link>
                            <p className="font-mono text-xs text-ink-3">
                                @{resource.uploader.username}
                            </p>
                        </div>
                        {(!currentUser || currentUser.username !== resource.uploader.username) && (
                            <button
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                                className={`shrink-0 rounded-md border border-rule px-4 py-1.5 text-xs font-medium transition-all ${
                                    isFollowing
                                        ? "bg-paper-2 text-ink-2 hover:border-error/30 hover:bg-error/10 hover:text-error"
                                        : "bg-paper text-ink shadow-sm hover:bg-paper-2 hover:text-accent"
                                }`}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                        )}
                    </div>
                </div>

                <CommentSection
                    targetType="resource"
                    targetId={parseInt(resource.id) || resource.id}
                />
            </article>

            {/* Chat Floating Window */}
            {showChat && (
                <div 
                    style={{ left: chatPos.x, top: chatPos.y }}
                    className="fixed z-50 w-[380px] max-w-[90vw] h-[550px] max-h-[85vh] border border-rule bg-paper shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                >
                    <div 
                        onMouseDown={handleDragStart}
                        className={`flex items-center justify-between border-b border-rule px-4 py-3 bg-paper-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} active:cursor-grabbing`}
                    >
                        <div className="flex items-center gap-2 text-ink pointer-events-none">
                            <Sparkles className="h-4 w-4 text-accent" />
                            <h3 className="font-display font-bold text-sm">Chat with Document</h3>
                        </div>
                        <button 
                            onClick={() => setShowChat(false)}
                            className="p-1.5 rounded-md text-ink-2 hover:text-ink hover:bg-paper-3 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.length === 0 ? (
                                <div className="text-center py-10 text-ink-3">
                                    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Ask me anything about this document!</p>
                                    <div className="mt-4 flex flex-col gap-2 px-6">
                                        <button onClick={() => setChatInput("Summarize this document in 3 bullet points.")} className="text-xs text-left px-3 py-2 bg-paper-2 rounded border border-rule hover:border-accent transition-colors">"Summarize this document..."</button>
                                        <button onClick={() => setChatInput("What are the key concepts covered here?")} className="text-xs text-left px-3 py-2 bg-paper-2 rounded border border-rule hover:border-accent transition-colors">"What are the key concepts..."</button>
                                    </div>
                                </div>
                            ) : (
                                chatMessages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                                            msg.role === 'user' 
                                                ? 'bg-accent text-white rounded-br-none' 
                                                : 'bg-paper-2 border border-rule text-ink rounded-bl-none'
                                        }`}>
                                            {msg.role === 'ai' ? (
                                                <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[85%] rounded-2xl bg-paper-2 border border-rule text-ink rounded-bl-none px-4 py-2 text-sm flex items-center gap-1.5">
                                        <Sparkles className="h-3 w-3 animate-pulse text-accent" />
                                        Thinking...
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleChatSubmit} className="border-t border-rule p-3 bg-paper">
                            <div className="flex items-center gap-2 rounded-xl border border-rule bg-paper-2 p-1 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-3 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim() || chatLoading}
                                    className="rounded-lg bg-accent p-2 text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </div>
            )}
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="rounded-md border border-rule bg-paper-2/40 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-3">
                {label}
            </div>
            <div className="mt-1 font-display text-2xl font-bold tabular-nums text-ink">
                {value}
            </div>
        </div>
    );
}
