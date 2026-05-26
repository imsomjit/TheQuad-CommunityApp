import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
    Search,
    Bell,
    Upload,
    Plus,
    Code2,
    Command,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import NotificationDropdown from "./NotificationDropdown";
import { Input } from "./ui/input";

export default function Navbar() {
    const { currentUser, unreadCount } = useApp();

    const linkClass = ({ isActive }) =>
        `relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
            ? "text-emerald-400"
            : "text-zinc-400 hover:text-zinc-50"
        }`;

    return (
        <header
            data-testid="app-navbar"
            className="sticky top-0 z-40 border-b border-zinc-800/70 bg-zinc-950/75 backdrop-blur-xl"
        >
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link
                    to="/"
                    data-testid="nav-logo"
                    className="group flex items-center gap-2"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
                        <Code2
                            className="h-4 w-4 text-emerald-400"
                            strokeWidth={2.5}
                        />
                    </div>

                    <div className="flex items-baseline gap-0.5">
                        <span className="font-display text-lg font-bold tracking-tight text-zinc-50">
                            Peer
                        </span>
                        <span className="font-display text-lg font-bold tracking-tight text-emerald-400">
                            Verse
                        </span>
                        <span className="ml-1 hidden font-mono text-[10px] text-zinc-500 sm:inline">
                            /v1.0
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden items-center gap-1 md:flex">
                    <NavLink
                        to="/"
                        end
                        className={linkClass}
                        data-testid="nav-home"
                    >
                        Feed
                    </NavLink>

                    <NavLink
                        to="/resources"
                        className={linkClass}
                        data-testid="nav-resources"
                    >
                        Resources
                    </NavLink>

                    <NavLink
                        to="/questions"
                        className={linkClass}
                        data-testid="nav-questions"
                    >
                        Q&amp;A
                    </NavLink>

                    <NavLink
                        to={`/u/${currentUser.username}`}
                        className={linkClass}
                        data-testid="nav-profile"
                    >
                        Profile
                    </NavLink>
                </nav>

                {/* Search */}
                <div className="hidden max-w-md flex-1 sm:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                        <Input
                            data-testid="navbar-search-input"
                            placeholder="Search resources, questions, tags..."
                            className="h-9 border-zinc-800 bg-zinc-900/70 pl-9 pr-12 text-sm placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/30"
                        />

                        <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 font-mono text-[10px] text-zinc-500 lg:flex">
                            <Command className="h-3 w-3" />
                            K
                        </kbd>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="ml-auto flex items-center gap-2">
                    <Link
                        to="/upload"
                        data-testid="nav-upload-btn"
                        className="hidden h-9 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-50 sm:inline-flex"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        Upload
                    </Link>

                    <Link
                        to="/ask"
                        data-testid="nav-ask-btn"
                        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-500 px-3 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95"
                    >
                        <Plus
                            className="h-3.5 w-3.5"
                            strokeWidth={2.5}
                        />
                        Ask
                    </Link>

                    {/* Notifications */}
                    <NotificationDropdown>
                        <button
                            data-testid="notifications-bell"
                            aria-label="Notifications"
                            className="relative flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
                        >
                            <Bell className="h-4 w-4" />

                            {unreadCount > 0 && (
                                <span
                                    data-testid="notifications-unread-badge"
                                    className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-zinc-950"
                                >
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </NotificationDropdown>

                    {/* User Avatar */}
                    <Link
                        to={`/u/${currentUser.username}`}
                        data-testid="nav-avatar-link"
                        className="relative"
                    >
                        <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="h-9 w-9 rounded-full border border-zinc-800 object-cover transition-colors hover:border-emerald-500/60"
                        />

                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-500" />
                    </Link>
                </div>
            </div>

            {/* Mobile Nav */}
            <div className="flex gap-1 overflow-x-auto border-t border-zinc-900/70 px-4 py-2 md:hidden">
                <NavLink to="/" end className={linkClass}>
                    Feed
                </NavLink>

                <NavLink
                    to="/resources"
                    className={linkClass}
                >
                    Resources
                </NavLink>

                <NavLink
                    to="/questions"
                    className={linkClass}
                >
                    Q&amp;A
                </NavLink>

                <NavLink
                    to={`/u/${currentUser.username}`}
                    className={linkClass}
                >
                    Profile
                </NavLink>
            </div>
        </header>
    );
}