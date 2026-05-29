import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, MessageSquare, FileText, Bell, LogOut } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
    const { currentUser, unreadCount } = useApp();
    const { isAuthenticated, logout } = useAuth();

    const linkClass = ({ isActive }) =>
        `group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            isActive 
                ? "bg-accent/10 text-accent translate-x-1 shadow-[inset_2px_0_0_0_currentColor]" 
                : "text-ink-2 hover:bg-paper-2 hover:text-ink hover:translate-x-1"
        }`;

    return (
        <aside className="fixed left-0 top-[92px] bottom-0 z-30 hidden w-64 flex-col justify-between border-r border-rule bg-paper/50 backdrop-blur-md px-4 py-6 md:flex animate-in fade-in slide-in-from-left-8 duration-700 ease-out">
            <nav className="flex flex-col gap-1.5">
                <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">Menu</p>
                <NavLink to="/" className={linkClass} end>
                    <Home className="h-4 w-4" /> Feed
                </NavLink>
                <NavLink to="/resources" className={linkClass}>
                    <BookOpen className="h-4 w-4" /> Library
                </NavLink>
                <NavLink to="/questions" className={linkClass}>
                    <MessageSquare className="h-4 w-4" /> Q&A
                </NavLink>
                <NavLink to="/posts" className={linkClass}>
                    <FileText className="h-4 w-4" /> Posts
                </NavLink>
                
                {isAuthenticated && (
                    <NavLink to="/notifications" className={linkClass}>
                        <div className="flex flex-1 items-center gap-3">
                            <Bell className="h-4 w-4" /> Notifications
                        </div>
                        {unreadCount > 0 && (
                            <span className="flex h-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-paper">
                                {unreadCount}
                            </span>
                        )}
                    </NavLink>
                )}
            </nav>

            {isAuthenticated && currentUser ? (
                <div className="mt-auto flex flex-col gap-2 border-t border-rule pt-4">
                    <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">Profile</p>
                    <NavLink to={`/pv/${currentUser.username}`} className={linkClass}>
                        <img src={currentUser.avatar} alt="Avatar" className="h-6 w-6 rounded-sm object-cover border border-rule transition-transform group-hover:scale-105" />
                        <span className="truncate">{currentUser.name}</span>
                    </NavLink>
                    
                    <button 
                        onClick={() => logout()}
                        className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink-3 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 hover:translate-x-1 mt-1"
                    >
                        <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        Sign out
                    </button>
                </div>
            ) : (
                <div className="mt-auto flex flex-col gap-2 border-t border-rule pt-4">
                    <NavLink to="/login" className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-paper glow-btn transition-all hover:scale-[1.02]">
                        Sign in
                    </NavLink>
                    <NavLink to="/register" className="flex w-full items-center justify-center gap-2 rounded-md border border-rule bg-paper-2/50 px-4 py-2 text-sm font-semibold text-ink transition-all hover:border-ink-3 hover:bg-paper-2/80">
                        Sign up
                    </NavLink>
                </div>
            )}
        </aside>
    );
}
