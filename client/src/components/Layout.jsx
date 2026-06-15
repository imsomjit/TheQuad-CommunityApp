import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import Footer from "./Footer";
import { Toaster } from "./ui/sonner";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const ROUTE_LABELS = [
    { match: /^\/$/, label: "the feed", section: "§01", pathName: "Home feed" },
    { match: /^\/resources$/, label: "the notes", section: "§02", pathName: "Resources" },
    { match: /^\/resources\/.+$/, label: "the notes", section: "§02", pathName: "Resources / details" },
    { match: /^\/questions$/, label: "the forum", section: "§03", pathName: "Questions" },
    { match: /^\/questions\/.+$/, label: "the forum", section: "§03", pathName: "Questions / discuss" },
    { match: /^\/ask$/, label: "new question", section: "§03", pathName: "Questions / ask" },
    { match: /^\/upload$/, label: "new note", section: "§02", pathName: "Resources / upload" },
    { match: /^\/posts$/, label: "the post", section: "§04", pathName: "Posts" },
    { match: /^\/posts\/new$/, label: "new post", section: "§04", pathName: "Posts / create" },
    { match: /^\/posts\/.+\/edit$/, label: "post edit", section: "§04", pathName: "Posts / edit" },
    { match: /^\/posts\/.+$/, label: "the post", section: "§04", pathName: "Posts / view" },
    { match: /^\/library$/, label: "the library", section: "§05", pathName: "library" },
    { match: /^\/library\/.+$/, label: "the library", section: "§05", pathName: "library / book details" },
    { match: /^\/opportunities$/, label: "the board", section: "§06", pathName: "opportunities" },
    { match: /^\/opportunities\/.+$/, label: "the board", section: "§06", pathName: "opportunities / apply" },
    { match: /^\/u\/.+\/bookmarks$/, label: "the bookmarks", section: "§07", pathName: "My Bookmarks" },
    { match: /^\/u\/.+\/followers$/, label: "The followers", section: "§07", pathName: "My Profile / Followers" },
    { match: /^\/u\/.+\/following$/, label: "The followings", section: "§07", pathName: "My Profile / Followings" },
    { match: /^\/u\/.+$/, label: "the profile", section: "§07", pathName: "My Profile" },
    { match: /^\/settings\/profile$/, label: "the profile", section: "§07", pathName: "My Profile / edit" },
    { match: /^\/notifications(\/.*)?$/, label: "notifications", section: "§08", pathName: "recent Activities" },
    { match: /^\/search(\/.*)?$/, label: "search", section: "§09", pathName: "Search" },
    { match: /^\/login$/, label: "Sign in", section: "§00", pathName: "login account" },
    { match: /^\/register$/, label: "Sign up", section: "§00", pathName: "create account" },
    { match: /^\/auth\/callback$/, label: "authenticating", section: "§00", pathName: "Authenticating" },
    { match: /^\/privacy$/, label: "the policy", section: "§10", pathName: "Privacy policy" },
    { match: /^\/terms$/, label: "the terms", section: "§10", pathName: "Terms of service" },
    { match: /^\/faq$/, label: "the FAQs", section: "§10", pathName: "Asked questions" },
    { match: /^\/admin(\/.*)?$/, label: "admin console", section: "§00", pathName: "Admin Console" },
];

function getRouteMeta(pathname) {
    return (
        ROUTE_LABELS.find((r) => r.match.test(pathname)) || {
            label: "page",
            section: "§",
            pathName: "a learning space"
        }
    );
}

export default function Layout() {
    const { theme } = useTheme();
    const { isAuthenticated } = useAuth();
    const { siteSettings } = useApp();
    const location = useLocation();
    const meta = getRouteMeta(location.pathname);
    const hideSidebar = location.pathname === "/login" || location.pathname === "/register";

    const [scrolled, setScrolled] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-paper text-ink font-body">
            {/* Backdrop textures (theme-aware) */}
            <div className="dot-bg pointer-events-none fixed inset-0 opacity-40" />
            <div className="paper-grain pointer-events-none fixed inset-0" />

            <div className="relative z-10">
                <div className={`fixed top-0 z-40 w-full flex flex-col transition-transform duration-300 ease-out pr-[var(--removed-body-scroll-bar-size,0px)] ${scrolled ? '-translate-y-6 sm:-translate-y-7' : 'translate-y-0'}`}>
                    {/* Running header / monospace breadcrumb bar */}
                    <div 
                        className={`border-b border-rule/60 bg-paper-2 backdrop-blur-md h-6 sm:h-7 transition-opacity duration-300 ease-out overflow-hidden ${
                            scrolled ? "opacity-0" : "opacity-100"
                        }`}
                    >
                        {siteSettings?.announcementActive && siteSettings?.announcementText ? (
                            <div className="flex h-full w-full overflow-hidden whitespace-nowrap font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.25em]">
                                <div className="flex h-full w-max animate-marquee-infinite">
                                    <div className="flex min-w-[100vw] shrink-0 items-center justify-around gap-8 px-4">
                                        <span className="font-semibold text-accent">📢 {siteSettings.announcementText}</span>  
                                    </div>
                                    <div className="flex min-w-[100vw] shrink-0 items-center justify-around gap-8 px-4" aria-hidden="true">
                                        <span className="font-semibold text-accent">📢 {siteSettings.announcementText}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mx-auto flex h-full w-full items-center justify-between gap-3 px-4 font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.25em] text-ink-3 sm:px-6 lg:px-10">
                                <span className="flex items-center gap-2">
                                    <span className="text-accent animate-pulse">●</span>
                                    peerverse / vol.01 / {meta.pathName}
                                </span>

                                <span className="hidden items-center gap-2 sm:flex">
                                    <span>{meta.section}</span>
                                    <span>·</span>
                                    <span className="text-ink-2">{meta.label}</span>
                                    <span>·</span>
                                    <span>{now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
                                    <span>·</span>
                                    <span>{now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                                </span>
                            </div>
                        )}
                    </div>
                    <Navbar scrolled={scrolled} />
                </div>
                
                {!hideSidebar && (
                    <>
                        <Sidebar 
                            isCollapsed={isSidebarCollapsed} 
                            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                            scrolled={scrolled}
                        />
                        <MobileNav />
                    </>
                )}

                {/* Main content area offset by sidebar on desktop */}
                <div 
                    className={`${hideSidebar ? "" : isSidebarCollapsed ? "md:pl-[80px]" : "md:pl-64"} pt-[92px] flex flex-col min-h-screen transition-all duration-300 ease-in-out`}
                    style={{ "--sidebar-width": hideSidebar ? "0px" : isSidebarCollapsed ? "80px" : "16rem" }}
                >

                    {/* Main content */}
                    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-2 flex-1 -mt-4 sm:-mt-2">
                        <div key={location.pathname} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
                            <Outlet />
                        </div>
                    </main>

                    <Footer />
            </div>
        </div>

        <Toaster position="bottom-right" theme={theme === "light" ? "light" : "dark"} />
    </div>
  );
}
