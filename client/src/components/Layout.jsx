import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { Toaster } from "./ui/sonner";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { Braces, AlertCircle, Info, CheckCircle2 } from "lucide-react";

const ROUTE_LABELS = [
    { match: /^\/$/, label: "feed", section: "§01" },
    { match: /^\/resources(\/.*)?$/, label: "resources", section: "§02" },
    { match: /^\/questions(\/.*)?$/, label: "questions", section: "§03" },
    { match: /^\/ask$/, label: "ask", section: "§03" },
    { match: /^\/upload$/, label: "upload", section: "§02" },
    { match: /^\/pv\/.+$/, label: "profile", section: "§05" },
    { match: /^\/notifications$/, label: "notifications", section: "§06" },
    { match: /^\/auth\/callback$/, label: "authenticating", section: "§00" },
    { match: /^\/posts$/, label: "posts", section: "§04" },
    { match: /^\/posts\/new$/, label: "write", section: "§04" },
    { match: /^\/posts\/.+\/edit$/, label: "editing", section: "§04" },
    { match: /^\/posts\/.+$/, label: "post", section: "§04" },
];

function getRouteMeta(pathname) {
    return (
        ROUTE_LABELS.find((r) => r.match.test(pathname)) || {
            label: "page",
            section: "§",
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
                <div className="fixed top-0 z-40 w-full flex flex-col transition-transform duration-700 pr-[var(--removed-body-scroll-bar-size,0px)]">
                    {/* Running header / monospace breadcrumb bar */}
                    <div 
                        className={`border-b border-rule/60 bg-paper-2 backdrop-blur-md transition-all duration-700 overflow-hidden ${
                            scrolled ? "h-0 border-transparent opacity-0" : "h-6 sm:h-7 opacity-100"
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
                                    the peerverse / vol.01 / a learning space
                                </span>

                                <span className="hidden items-center gap-2 sm:flex">
                                    <span>{meta.section}</span>
                                    <span>·</span>
                                    <span className="text-ink-2">{meta.label}</span>
                                    <span>·</span>
                                    <span>{theme === "light" ? "paper" : "ink"}</span>
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

                    {/* Footer / colophon */}
                    <footer className="mt-10 border-t-2 border-double border-rule">
                    {/* Marquee separator (hidden when authenticated) */}
                        <div className="overflow-hidden border-b border-rule/60 py-2">
                            <div className="marquee whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3/50">
                                {Array(4)
                                    .fill(
                                        "peerverse - share · debate · learn · grow · collaborate · build · ship | "
                                    )
                                    .join("")}
                            </div>
                        </div>

                    <div className="mx-auto max-w-7xl w-full grid grid-cols-2 gap-10 px-4 py-12 sm:grid-cols-4 sm:px-6 lg:px-2">
                        {/* Brand column */}
                        <div className="col-span-2 sm:col-span-1">
                                <span className="flex items-baseline gap-0.5">
                                    <span className="font-display text-3xl font-semibold leading-none tracking-tight text-ink">
                                        Peer
                                    </span>

                                    <span className="font-display-italic text-3xl font-semibold leading-none tracking-tight text-accent">
                                        Verse
                                    </span>

                                    <span className="ml-1 font-mono text-[10px] text-ink-3">
                                        /vol.01
                                    </span>
                                </span>
                            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-2">
                                A community-driven study notebook for tech
                                students. Built like a developer tool. Read like
                                a journal.
                            </p>
                            <div className="mt-5 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-accent-2 animate-pulse" />
                                <span className="font-mono text-[10px] text-ink-3">
                                    systems online
                                </span>
                            </div>
                        </div>

                        {/* Explore links */}
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                                explore
                            </p>
                            <ul className="mt-3 space-y-2.5">
                                {[
                                    { label: "Resources", href: "/resources" },
                                    { label: "Questions", href: "/questions" },
                                    { label: "Posts", href: "/posts" },
                                    { label: "Upload", href: "/upload" },
                                    { label: "Ask a question", href: "/ask" },
                                ].map((link) => (
                                    <li key={link.href}>
                                        <a
                                            href={link.href}
                                            className="group flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
                                        >
                                            <span className="font-mono text-[10px] text-accent opacity-0 transition-opacity group-hover:opacity-100">
                                                →
                                            </span>
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Connect */}
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                                connect
                            </p>
                            <ul className="mt-3 space-y-2.5">
                                {[
                                    { label: "LinkedIn", href: siteSettings?.socialLinks?.linkedin },
                                    { label: "Twitter", href: siteSettings?.socialLinks?.twitter },
                                    { label: "Instagram", href: siteSettings?.socialLinks?.instagram },
                                    { label: "Discord", href: siteSettings?.socialLinks?.discord },
                                    { label: "Email", href: siteSettings?.socialLinks?.email ? `mailto:${siteSettings.socialLinks.email}` : "" },
                                ]
                                .filter(link => !!link.href)
                                .map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            target={link.href.startsWith("http") ? "_blank" : undefined}
                                            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                            className="group flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
                                        >
                                            <span className="font-mono text-[10px] text-accent opacity-0 transition-opacity group-hover:opacity-100">
                                                →
                                            </span>
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Typography / Legal */}
                        <div>
                            <p className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                                colophon
                            </p>
                            <ul className="mt-3 space-y-1 text-sm hidden sm:inline">
                                <li className="font-display text-lg text-ink">
                                    Fraunces
                                </li>
                                <li className="text-ink-2">
                                    Inter · for body
                                </li>
                                <li className="font-mono text-xs text-ink-3">
                                    JetBrains Mono · for code
                                </li>
                            </ul>
                            <div className="mt-5 pt-4 border-t border-rule/60">
                                <p className="font-mono text-[10px] text-ink-3">
                                    v1.0.0 · production
                                </p>
                                <p className="mt-1 font-mono text-[10px] text-ink-3">
                                    <span className="text-accent">$</span>{" "}
                                    build with ❤️ for peers by <span className="text-ink"><a href="https://github.com/soumyajiitdas" target="_blank" rel="noopener noreferrer">me_</a></span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-rule/60">
                        <div className="mx-auto mb-20 sm:mb-2 max-w-7xl w-full flex flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-2">
                            <p className="font-mono text-[10px] text-ink-3">
                                © {new Date().getFullYear()} PeerVerse. All rights
                                reserved.
                            </p>
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/privacy"
                                    className="font-mono text-[10px] text-ink-3 hover:text-ink transition-colors"
                                >
                                    Privacy
                                </Link>
                                <span className="text-rule">·</span>
                                <Link
                                    to="/terms"
                                    className="font-mono text-[10px] text-ink-3 hover:text-ink transition-colors"
                                >
                                    Terms
                                </Link>
                                <span className="text-rule">·</span>
                                <Link
                                    to="/faq"
                                    className="font-mono text-[10px] text-ink-3 hover:text-ink transition-colors"
                                >
                                    FAQ
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>

        <Toaster position="bottom-right" theme={theme === "light" ? "light" : "dark"} />
    </div>
  );
}
