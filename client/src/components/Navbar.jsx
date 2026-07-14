import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Search,
    Bell,
    Upload,
    Plus,
    Command,
    Sun,
    Moon,
    Braces,
    LogIn,
    MessageSquare,
    PenLine,
    Bookmark
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getAvatarFallback } from "../utils/fallbacks";
import NotificationDropdown from "./NotificationDropdown";
import { Input } from "./ui/input";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "./ui/dropdown-menu";

export default function Navbar({ scrolled }) {
    const { currentUser, unreadCount } = useApp();
    const { isAuthenticated } = useAuth();
    const { theme, toggle } = useTheme();
    const searchInputRef = React.useRef(null);

    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === "Enter" && e.target.value.trim()) {
            navigate(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
            e.target.blur();
        }
    };

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <header
            data-testid="app-navbar"
            className={`border-b border-rule bg-paper/85 backdrop-blur-xl transition-all duration-300 ease-out ${
                scrolled ? "h-14 shadow-sm" : "h-16"
            }`}
        >
            <div className="mx-auto flex h-full w-full items-center gap-5 px-4 sm:px-6 lg:px-10">
                {/* Logo — bracket mark + serif wordmark */}
                <Link
                    to="/"
                    data-testid="nav-logo"
                    className={`group flex items-center gap-1 transition-transform duration-300 origin-left ${
                        scrolled ? "scale-90" : "scale-100"
                    }`}
                >
                    <img 
                        src="/logo.png" 
                        alt="The Quad" 
                        className="h-9 w-9 object-contain drop-shadow-sm transition-transform group-hover:scale-105" 
                    />

                    <span className="flex items-baseline">
                        <span className="font-display text-[28px] sm:text-3xl font-bold sm:font-semibold leading-none tracking-tight text-ink group-hover:text-accent transition-colors">
                            The
                        </span>

                        <span className="font-display-italic text-[28px] sm:text-3xl font-bold sm:font-semibold leading-none tracking-tight text-accent group-hover:text-ink transition-colors pl-1">
                            Quad
                        </span>

                        <span className="ml-1 hidden font-mono text-[10px] text-ink-3 sm:inline">
                            /vol.02
                        </span>
                    </span>
                </Link>

                {/* Search */}
                {!isAuthenticated && (
                    <div className="hidden max-w-md flex-1 sm:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />

                            <Input
                                ref={searchInputRef}
                                data-testid="navbar-search-input"
                                onKeyDown={handleSearch}
                                placeholder="search notes, papers, questions…"
                                className="h-9 rounded-sm border-rule rounded-md bg-paper pl-9 pr-14 text-sm text-ink placeholder:text-ink-3 focus-visible:border-accent/60 focus-visible:ring-accent/30"
                            />

                            <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-sm border border-rule bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink-3 lg:flex">
                                <Command className="h-3 w-3" />
                                K
                            </kbd>
                        </div>
                    </div>
                )}

                {/* Right Actions */}
                <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
                    {isAuthenticated ? (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        data-testid="nav-add-btn"
                                        className="hidden h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-semibold text-paper sm:inline-flex hover:brightness-110 active:scale-95 transition-all"
                                    >
                                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                                        Create
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link to="/upload" className="cursor-pointer flex items-center gap-2">
                                            <Upload className="h-4 w-4" />
                                            <span>Share a Resource</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/ask" className="cursor-pointer flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>Ask a Question</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/posts/new" className="cursor-pointer flex items-center gap-2">
                                            <PenLine className="h-4 w-4" />
                                            <span>Write a Post</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                data-testid="nav-login-btn"
                                className="hidden h-9 items-center gap-1.5 rounded-md border border-rule bg-paper-2 px-3 text-sm font-medium text-ink-2 transition-colors hover:border-ink-3 hover:text-ink sm:inline-flex"
                            >
                                <LogIn className="h-3.5 w-3.5" />
                                Sign in
                            </Link>

                            <Link
                                to="/register"
                                data-testid="nav-register-btn"
                                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-semibold text-paper"
                            >
                                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                                Join
                            </Link>
                        </>
                    )}

                    {/* Theme toggle */}
                    <button
                        type="button"
                        onClick={toggle}
                        data-testid="theme-toggle"
                        aria-label="Toggle theme"
                        title={theme === "light" ? "Switch to ink (dark)" : "Switch to paper (light)"}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-rule bg-paper-2 text-syntax-cyan transition-colors hover:border-accent"
                    >
                        {theme === "light" ? (
                            <Moon className="h-4 w-4" />
                        ) : (
                            <Sun className="h-4 w-4" />
                        )}
                    </button>

                    {isAuthenticated && (
                        <>
                            {/* Bookmarks */}
                            <Link
                                to={`/u/${currentUser?.username}/bookmarks`}
                                data-testid="nav-bookmarks-link"
                                aria-label="Bookmarks"
                                title="Saved Bookmarks"
                                className="hidden sm:flex shrink-0 h-9 w-9 items-center justify-center rounded-md border border-rule bg-paper-2 text-syntax-rose transition-colors hover:border-accent"
                            >
                                <Bookmark className="h-4 w-4" />
                            </Link>

                            {/* Notifications */}
                            <NotificationDropdown>
                                <button
                                    data-testid="notifications-bell"
                                    aria-label="Notifications"
                                    className="relative flex h-9 w-9 items-center justify-center rounded-md border border-rule bg-paper-2 text-syntax-lime transition-colors hover:border-accent"
                                >
                                    <Bell className="h-4 w-4" />

                                    {unreadCount > 0 && (
                                        <span
                                            data-testid="notifications-unread-badge"
                                            className="absolute right-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px]  text-paper"
                                        >
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            </NotificationDropdown>

                            {/* User Avatar */}
                            <Link
                                to={`/u/${currentUser?.username || ''}`}
                                data-testid="nav-avatar-link"
                                className="relative inline-block"
                            >
                                <img
                                    src={currentUser?.avatar || getAvatarFallback(currentUser?.name, currentUser?.username)}
                                    alt={currentUser?.name || ''}
                                    className="h-9 w-9 rounded-md border border-rule object-cover transition-colors hover:border-accent"
                                />

                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-accent-2" />
                            </Link>
                        </>
                    )}
                </div>
            </div>

        </header>
    );
}
