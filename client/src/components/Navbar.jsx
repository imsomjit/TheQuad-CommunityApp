import React from "react";
import { Link, NavLink } from "react-router-dom";
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
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationDropdown from "./NotificationDropdown";
import { Input } from "./ui/input";

export default function Navbar() {
    const { currentUser, unreadCount } = useApp();
    const { isAuthenticated } = useAuth();
    const { theme, toggle } = useTheme();

    const linkClass = ({ isActive }) =>
        `relative px-3 py-2 text-sm font-medium transition-colors ${isActive ? "text-ink" : "text-ink-2 hover:text-ink"
        }`;

    return (
        <header
            data-testid="app-navbar"
            className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-xl"
        >
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-2">
                {/* Logo — bracket mark + serif wordmark */}
                <Link
                    to="/"
                    data-testid="nav-logo"
                    className="group flex items-baseline gap-2"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-rule bg-paper-2 transition-colors group-hover:border-accent">
                        <Braces
                            className="h-4 w-4 text-accent"
                            strokeWidth={2}
                        />
                    </span>

                    <span className="flex items-baseline gap-0.5">
                        <span className="font-display text-2xl font-bold leading-none tracking-tight text-ink">
                            Peer
                        </span>

                        <span className="font-display-italic text-2xl font-bold leading-none tracking-tight text-accent">
                            Verse
                        </span>

                        <span className="ml-1 hidden font-mono text-[10px] text-ink-3 sm:inline">
                            /vol.01
                        </span>
                    </span>
                </Link>

                {/* Desktop Nav Links — magazine-style indices */}
                <nav className="hidden items-center gap-0.5 md:flex">
                    <NavItem to="/" index="01" label="Feed" testId="nav-home" linkClass={linkClass} end />
                    <NavItem to="/resources" index="02" label="Library" testId="nav-resources" linkClass={linkClass} />
                    <NavItem to="/questions" index="03" label="Q&A" testId="nav-questions" linkClass={linkClass} />
                </nav>

                {/* Search */}
                <div className="hidden max-w-md flex-1 sm:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />

                        <Input
                            data-testid="navbar-search-input"
                            placeholder="search notes, papers, questions…"
                            className="h-9 rounded-sm border-rule bg-paper-2/60 pl-9 pr-14 text-sm text-ink placeholder:text-ink-3 focus-visible:border-accent/60 focus-visible:ring-accent/30"
                        />

                        <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-sm border border-rule bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink-3 lg:flex">
                            <Command className="h-3 w-3" />
                            K
                        </kbd>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="ml-auto flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/upload"
                                data-testid="nav-upload-btn"
                                className="hidden h-9 items-center gap-1.5 rounded-sm border border-rule bg-paper-2 px-3 text-sm font-medium text-ink-2 transition-colors hover:border-ink-3 hover:text-ink sm:inline-flex"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                Upload
                            </Link>

                            <Link
                                to="/ask"
                                data-testid="nav-ask-btn"
                                className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-accent px-3 text-sm font-semibold text-paper glow-btn"
                            >
                                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                                Ask
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                data-testid="nav-login-btn"
                                className="hidden h-9 items-center gap-1.5 rounded-sm border border-rule bg-paper-2 px-3 text-sm font-medium text-ink-2 transition-colors hover:border-ink-3 hover:text-ink sm:inline-flex"
                            >
                                <LogIn className="h-3.5 w-3.5" />
                                Sign in
                            </Link>

                            <Link
                                to="/register"
                                data-testid="nav-register-btn"
                                className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-accent px-3 text-sm font-semibold text-paper glow-btn"
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
                        className="flex h-9 w-9 items-center justify-center rounded-sm border border-rule bg-paper-2 text-ink-2 transition-colors hover:border-accent hover:text-accent"
                    >
                        {theme === "light" ? (
                            <Moon className="h-4 w-4" />
                        ) : (
                            <Sun className="h-4 w-4" />
                        )}
                    </button>

                    {isAuthenticated && (
                        <>
                            {/* Notifications */}
                            <NotificationDropdown>
                                <button
                                    data-testid="notifications-bell"
                                    aria-label="Notifications"
                                    className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-transparent text-ink-2 transition-colors hover:border-rule hover:bg-paper-2 hover:text-ink"
                                >
                                    <Bell className="h-4 w-4" />

                                    {unreadCount > 0 && (
                                        <span
                                            data-testid="notifications-unread-badge"
                                            className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-bold text-paper"
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
                                className="relative"
                            >
                                <img
                                    src={currentUser?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=user`}
                                    alt={currentUser?.name || ''}
                                    className="h-9 w-9 rounded-sm border border-rule object-cover transition-colors hover:border-accent"
                                />

                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-accent-2" />
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Nav */}
            <div className="flex gap-1 overflow-x-auto border-t border-rule/60 px-4 py-2 md:hidden">
                <NavLink to="/" end className={linkClass}>
                    Feed
                </NavLink>
                <NavLink to="/resources" className={linkClass}>
                    Library
                </NavLink>
                <NavLink to="/questions" className={linkClass}>
                    Q&A
                </NavLink>
            </div>
        </header>
    );
}

function NavItem({ to, index, label, testId, linkClass, end = false }) {
    return (
        <NavLink to={to} end={end} className={linkClass} data-testid={testId}>
            {({ isActive }) => (
                <span className="flex items-baseline gap-1.5">
                    <span
                        className={`font-mono text-[10px] tracking-wider ${isActive ? "text-accent" : "text-ink-3"
                            }`}
                    >
                        {index}
                    </span>
                    <span>{label}</span>
                </span>
            )}
        </NavLink>
    );
}