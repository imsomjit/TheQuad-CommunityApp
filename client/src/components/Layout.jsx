import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import { Toaster } from "./ui/sonner";
import { useTheme } from "../context/ThemeContext";

const ROUTE_LABELS = [
    { match: /^\/$/, label: "feed", section: "§01" },
    { match: /^\/resources(\/.*)?$/, label: "resources", section: "§02" },
    { match: /^\/questions(\/.*)?$/, label: "questions", section: "§03" },
    { match: /^\/ask$/, label: "ask", section: "§03" },
    { match: /^\/upload$/, label: "upload", section: "§02" },
    { match: /^\/pv\/.+$/, label: "profile", section: "§04" },
    { match: /^\/notifications$/, label: "notifications", section: "§05" },
    { match: /^\/auth\/callback$/, label: "authenticating", section: "§00" },
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
    const location = useLocation();
    const meta = getRouteMeta(location.pathname);

    return (
        <div className="relative min-h-screen bg-paper text-ink font-body">
            {/* Backdrop textures (theme-aware) */}
            <div className="dot-bg pointer-events-none fixed inset-0 opacity-40" />
            <div className="paper-grain pointer-events-none fixed inset-0" />

            <div className="relative z-10">
                {/* Running header / monospace breadcrumb bar */}
                <div className="border-b border-rule/60 bg-paper/70 backdrop-blur-md">
                    <div className="mx-auto flex h-7 w-full items-center justify-between gap-3 px-4 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-3 sm:px-6 lg:px-10">
                        <span className="flex items-center gap-2">
                            <span className="text-accent">●</span>
                            peerverse / vol.01 / a learning notebook
                        </span>

                        <span className="hidden items-center gap-2 sm:flex">
                            <span>{meta.section}</span>
                            <span>·</span>
                            <span className="text-ink-2">{meta.label}</span>
                            <span>·</span>
                            <span>{theme === "light" ? "paper" : "ink"}</span>
                        </span>
                    </div>
                </div>

                <Navbar />

                {/* Main content */}
                <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-2">
                    <Outlet />
                </main>

                {/* Footer / colophon */}
                <footer className="mt-20 border-t-2 border-double border-rule">
                    {/* Marquee separator */}
                    <div className="overflow-hidden border-b border-rule/60 py-2">
                        <div className="marquee whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3/50">
                            {Array(4)
                                .fill(
                                    "peerverse · share · learn · grow · collaborate · build · ship · "
                                )
                                .join("")}
                        </div>
                    </div>

                    <div className="mx-auto max-w-7xl w-full grid grid-cols-2 gap-10 px-4 py-12 sm:grid-cols-4 sm:px-6 lg:px-2">
                        {/* Brand column */}
                        <div className="col-span-2 sm:col-span-1">
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                                colophon
                            </p>
                            <p className="mt-3 font-display text-2xl leading-tight text-ink">
                                Peer<span className="font-display-italic text-accent">Verse</span>
                            </p>
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
                                    { label: "GitHub", href: "#" },
                                    { label: "Twitter", href: "#" },
                                    { label: "Discord", href: "#" },
                                    { label: "Contact", href: "#" },
                                ].map((link) => (
                                    <li key={link.label}>
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

                        {/* Typography / Legal */}
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                                set in
                            </p>
                            <ul className="mt-3 space-y-1 text-sm">
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
                                    built for students who{" "}
                                    <span className="text-ink-2">ship_</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-rule/60">
                        <div className="mx-auto max-w-7xl w-full flex flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-2">
                            <p className="font-mono text-[10px] text-ink-3">
                                © {new Date().getFullYear()} PeerVerse. All rights
                                reserved.
                            </p>
                            <div className="flex items-center gap-4">
                                <a
                                    href="#"
                                    className="font-mono text-[10px] text-ink-3 hover:text-ink transition-colors"
                                >
                                    Privacy
                                </a>
                                <span className="text-rule">·</span>
                                <a
                                    href="#"
                                    className="font-mono text-[10px] text-ink-3 hover:text-ink transition-colors"
                                >
                                    Terms
                                </a>
                                <span className="text-rule">·</span>
                                <a
                                    href="#"
                                    className="font-mono text-[10px] text-ink-3 hover:text-ink transition-colors"
                                >
                                    Status
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <Toaster position="bottom-right" theme={theme === "light" ? "light" : "dark"} />
        </div>
    );
}