import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, MessageSquare, FileText, Bell, LogOut, PanelLeftClose, Target, ShieldAlert, Library } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isCollapsed, onToggle, scrolled }) {
    const { currentUser, unreadCount } = useApp();
    const { isAuthenticated, logout } = useAuth();

    const linkClass = ({ isActive }) => {
        const base = "group flex items-center rounded-xl py-2 text-sm transition-all duration-300";
        const state = isActive 
            ? "bg-paper text-accent font-medium hover:bg-paper-2 border border-accent-soft transition-color duration-300" 
            : "text-ink-2 hover:bg-paper-2 hover:text-ink";
        const layout = isCollapsed 
            ? "justify-center w-12 mx-auto px-0" 
            : "gap-3 px-4 w-full";
        return `${base} ${state} ${layout}`;
    };

    return (
        <aside className={`fixed left-0 bottom-0 z-30 hidden flex-col justify-between border-r border-ink/10 bg-paper/50 backdrop-blur-md py-6 md:flex transition-all duration-300 ease-out ${scrolled ? 'top-[56px]' : 'top-[92px]'} ${isCollapsed ? 'w-[65px] px-2' : 'w-56 px-4'}`}>
            <nav className="flex flex-col gap-3">
                <div className={`flex items-center pb-1 ${isCollapsed ? 'justify-center' : 'justify-between px-3'}`}>
                    {!isCollapsed && <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">Contents</p>}
                    <button onClick={onToggle} className="text-ink-3 hover:text-ink transition-colors" title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                        <PanelLeftClose className={`h-4 w-4 transition-transform duration-700 text-accent ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                <NavLink to="/" className={linkClass} end title="Feed">
                    <Home className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>Feed</span>}
                </NavLink>
                <NavLink to="/resources" className={linkClass} title="Resources">
                    <BookOpen className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>Resources</span>}
                </NavLink>
                <NavLink to="/questions" className={linkClass} title="Q&A">
                    <MessageSquare className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>Q&A</span>}
                </NavLink>
                <NavLink to="/posts" className={linkClass} title="Posts">
                    <FileText className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>Posts</span>}
                </NavLink>
                <NavLink to="/library" className={linkClass} title="Library">
                    <Library className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>Library</span>}
                </NavLink>
                <NavLink to="/opportunities" className={linkClass} title="Opportunities">
                    <Target className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>Opportunities</span>}
                </NavLink>
                
                {isAuthenticated && (
                    <NavLink to="/notifications" className={linkClass} title="Notifications">
                        <div className={`flex flex-1 items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                            <div className="relative">
                                <Bell className="h-5 w-5 shrink-0" />
                                {isCollapsed && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent" />
                                )}
                            </div>
                            {!isCollapsed && <span>Notifications</span>}
                        </div>
                        {!isCollapsed && unreadCount > 0 && (
                            <span className="flex h-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-paper">
                                {unreadCount}
                            </span>
                        )}
                    </NavLink>
                )}
                
                {isAuthenticated && currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                    <NavLink to="/admin/reports" className={linkClass} title={currentUser.role === 'admin' ? "Admin Console" : "Moderator Console"}>
                        <ShieldAlert className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>{currentUser.role === 'admin' ? "Admin Console" : "Moderator Console"}</span>}
                    </NavLink>
                )}
            </nav>

            {isAuthenticated && currentUser ? (
                <div className="mt-auto flex flex-col gap-2 border-t border-rule pt-4">
                    {!isCollapsed && <p className="px-4 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">Profile</p>}
                    <NavLink to={`/u/${currentUser.username}`} className={linkClass} title="Profile">
                        <img src={currentUser.avatar} alt="Avatar" className="h-6 w-6 shrink-0 rounded-md object-cover border border-rule transition-transform group-hover:scale-110" />
                        {!isCollapsed && <span className="truncate text-accent">{currentUser.name}</span>}
                    </NavLink>
                    
                    <button 
                        onClick={() => logout()}
                        title="Sign out"
                        className={`group flex items-center ${isCollapsed ? 'justify-center w-12 mx-auto px-0' : 'w-full gap-3 px-4'} rounded-xl py-2.5 text-sm font-medium text-ink-3 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 mt-1`}
                    >
                        <LogOut className={`h-5 w-5 shrink-0 transition-transform ${isCollapsed ? '' : 'group-hover:-translate-x-0.5'}`} />
                        {!isCollapsed && <span>Sign out</span>}
                    </button>
                </div>
            ) : (
                <div className="mt-auto flex flex-col font-mono tracking-wide uppercase gap-2 border-t border-rule pt-4">
                    <NavLink to="/login" className={`flex items-center justify-center ${isCollapsed ? 'w-12 mx-auto px-0' : 'w-full gap-2 px-4'} rounded-md bg-paper-3 py-2.5 text-sm font-medium text-accent border border-accent-soft transition-all hover:bg-accent hover:text-paper hover:scale-105`} title="Sign in">
                        {isCollapsed ? <LogOut className="h-5 w-5 rotate-180" /> : "Sign in"}
                    </NavLink>
                    {!isCollapsed && (
                        <NavLink to="/register" className="flex w-full items-center justify-center gap-2 rounded-md border border-rule bg-paper px-4 py-2.5 text-sm font-medium text-ink-2 transition-all hover:border-ink-3 hover:text-ink">
                            Create Account
                        </NavLink>
                    )}
                </div>
            )}
        </aside>
    );
}
