import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Footer() {
    const { siteSettings } = useApp();

    return (
        <footer className="mt-10 border-t-2 border-double bg-paper-2/50 border-rule">
            {/* Marquee separator (hidden when authenticated) */}
            <div className="overflow-hidden border-b border-rule/60 bg-paper-2 py-2">
                <div className="marquee whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-ink-3">
                    {Array(4)
                        .fill(
                            "the quad - share · debate · learn · grow · collaborate · build · ship | "
                        )
                        .join("")}
                </div>
            </div>

            <div className="mx-auto max-w-7xl w-full grid grid-cols-2 gap-10 px-4 py-12 sm:grid-cols-4 sm:px-6 lg:px-2">
                {/* Brand column */}
                <div className="col-span-2 sm:col-span-1">
                    <span className="flex items-baseline gap-0.5">
                        <span className="font-display text-3xl font-semibold leading-none tracking-tight text-ink">
                            The
                        </span>

                        <span className="font-display-italic text-3xl font-semibold leading-none tracking-tight text-accent pl-1">
                            Quad
                        </span>

                        <span className="ml-1 font-mono text-[10px] text-ink-3">
                            /vol.02
                        </span>
                    </span>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-2">
                        Your digital campus quad. A dedicated space for tech students 
                        to socialize, study together, and build the future.
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
                            { label: "Library", href: "/library" },
                            { label: "Opportunities", href: "/opportunities" },
                        ].map((link) => (
                            <li key={link.href}>
                                <Link
                                    to={link.href}
                                    className="group flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
                                >
                                    <span className="font-mono text-[10px] text-accent opacity-0 transition-opacity group-hover:opacity-100">
                                        →
                                    </span>
                                    {link.label}
                                </Link>
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
                            v2.3.0 · production
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-ink-3">
                            <span className="text-accent">$</span>{" "}
                            build with ❤️ for peers by <span className="text-ink"><a href="https://github.com/imsomjit" target="_blank" rel="noopener noreferrer">me_</a></span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-rule/60">
                <div className="mx-auto mb-20 sm:mb-2 max-w-7xl w-full flex flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-2">
                    <p className="font-mono text-[10px] text-ink-3">
                        © {new Date().getFullYear()} The Quad. All rights
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
    );
}
