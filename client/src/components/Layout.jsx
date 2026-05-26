import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import { Toaster } from "./ui/sonner";

export default function Layout() {
    return (
        <div className="relative min-h-screen bg-zinc-950 font-body text-zinc-50">
            {/* Faint grid backdrop */}
            <div className="dot-bg pointer-events-none fixed inset-0 opacity-40" />

            <div className="relative z-10">
                <Navbar />

                {/* Main content */}
                <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="mt-20 border-t border-zinc-900/70">
                    <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
                        <p className="font-mono text-xs text-zinc-500">
                            <span className="text-emerald-400">$</span>{" "}
                            peerverse{" "}
                            <span className="text-zinc-700">
                                ·
                            </span>{" "}
                            built for students who ship
                        </p>

                        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                            v1.0.0 · frontend-only preview
                        </p>
                    </div>
                </footer>
            </div>

            {/* Global toast notifications */}
            <Toaster
                position="bottom-right"
                theme="dark"
            />
        </div>
    );
}