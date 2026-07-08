import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";

import Navbar from "./Navbar";
import AdminSidebar from "./AdminSidebar";
import { Toaster } from "./ui/sonner";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert } from "lucide-react";

export default function AdminLayout() {
    const { theme } = useTheme();
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    const [scrolled, setScrolled] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (loading) return null;

    // Double check protection just in case
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (user && user.role !== "admin" && user.role !== "moderator") {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-paper text-ink font-body">
            {/* Backdrop textures (theme-aware) */}
            <div className="dot-bg pointer-events-none fixed inset-0 opacity-40" />
            <div className="paper-grain pointer-events-none fixed inset-0" />

            <div className="relative z-10">
                {/* Mobile Not Accessible Message */}
                <div className="flex md:hidden min-h-screen flex-col items-center justify-center p-6 text-center">
                    <div className="mb-6 rounded-full bg-red-500/10 p-6 text-red-500">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="mb-2 font-display text-2xl font-bold text-ink">Access Denied on Mobile</h1>
                    <p className="mb-8 text-ink-2">The Admin Console is optimized for desktop view only. Please access this page from a larger screen.</p>
                    <a href="/" className="rounded-md bg-accent px-6 py-2.5 font-medium text-paper hover:bg-accent-2">
                        Return to App
                    </a>
                </div>

                {/* Desktop Admin Console */}
                <div className="hidden md:block">
                    <div className="fixed top-0 z-40 w-full flex flex-col transition-transform duration-300 pr-[var(--removed-body-scroll-bar-size,0px)]">
                    {/* Running header / monospace breadcrumb bar */}
                    <div 
                        className={`border-b border-rule/60 bg-paper-2/80 backdrop-blur-md transition-all duration-300 ease-out overflow-hidden ${
                            scrolled ? "h-0 border-transparent opacity-0" : "h-6 sm:h-7 opacity-100"
                        }`}
                    >
                        <div className="mx-auto flex h-full w-full items-center justify-between gap-3 px-4 font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.25em] text-ink-3 sm:px-6 lg:px-10">
                            <div className="flex items-center space-x-1.5 opacity-80">
                                <ShieldAlert size={14} className="text-accent" />
                                <span className="font-mono text-[10px] tracking-widest uppercase">
                                    the quad / {user?.role === 'admin' ? 'admin' : 'moderator'} console
                                </span>
                            </div>
                            <span className="hidden items-center gap-2 sm:flex">
                                <span>§admin</span>
                                <span>·</span>
                                <span className="text-ink-2">moderation</span>
                            </span>
                        </div>
                    </div>
                    <Navbar scrolled={scrolled} />
                </div>
                
                <AdminSidebar 
                    isCollapsed={isSidebarCollapsed} 
                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                    scrolled={scrolled}
                />

                {/* Main content area offset by sidebar on desktop */}
                <div 
                    className={`${isSidebarCollapsed ? "md:pl-[80px]" : "md:pl-64"} pt-[92px] flex flex-col min-h-screen transition-all duration-300 ease-in-out`}
                    style={{ "--sidebar-width": isSidebarCollapsed ? "80px" : "16rem" }}
                >
                    {/* Main content */}
                    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-2 flex-1 -mt-4 sm:-mt-2">
                        <div key={location.pathname} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
                            <Outlet />
                        </div>
                    </main>

                    {/* Footer for Admin Layout */}
                    <footer className="mt-10 border-t border-rule/60 py-6">
                        <div className="mx-auto max-w-6xl w-full flex flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-2">
                            <p className="font-mono text-[10px] text-ink-3">
                                © {new Date().getFullYear()} The Quad {user?.role === 'admin' ? 'Admin' : 'Moderator'}. Restricted Access.
                            </p>
                            <p className="font-mono text-[10px] text-ink-3">
                                Logged in as <span className="text-accent">{user?.username}</span>
                            </p>
                        </div>
                    </footer>
                </div>
                </div>
            </div>

            <Toaster position="bottom-right" theme={theme === "light" ? "light" : "dark"} />
        </div>
    );
}
