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
    { match: /^\/u\/.+$/, label: "profile", section: "§04" },
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
                    <div className="mx-auto max-w-7xl w-full grid grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-2">
                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                                colophon
                            </p>
                            <p className="mt-3 font-display text-2xl leading-tight text-ink">
                                Peer<span className="font-display-italic text-accent">Verse</span>
                            </p>
                            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-2">
                                A community-driven study notebook for tech students.
                                Built like a developer tool. Read like a journal.
                            </p>
                        </div>

                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                                set in
                            </p>
                            <ul className="mt-3 space-y-1 text-sm">
                                <li className="font-display text-lg text-ink">Fraunces</li>
                                <li className="text-ink-2">Inter · for body</li>
                                <li className="font-mono text-xs text-ink-3">JetBrains Mono · for code</li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                                published
                            </p>
                            <p className="mt-3 font-mono text-sm text-ink-2">
                                v1.0.0 · frontend preview
                            </p>
                            <p className="mt-2 font-mono text-xs text-ink-3">
                                <span className="text-accent">$</span> built for students who ship_
                            </p>
                        </div>
                    </div>
                </footer>
            </div>

            <Toaster position="bottom-right" theme={theme === "light" ? "light" : "dark"} />
        </div>
    );
}