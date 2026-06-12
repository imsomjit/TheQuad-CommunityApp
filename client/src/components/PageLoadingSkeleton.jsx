import React from "react";

export default function PageLoadingSkeleton() {
    return (
        <div className="relative min-h-screen bg-paper text-ink overflow-hidden pointer-events-none">
            {/* Fake Top Navbar */}
            <div className="fixed top-0 z-40 w-full flex flex-col border-b border-rule bg-paper/85">
                <div className="h-6 sm:h-7 border-b border-rule/60 bg-paper-2" />
                <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="h-8 w-32 rounded bg-paper-2 shimmer" />
                    <div className="hidden md:block h-10 w-96 rounded-md bg-paper-2 shimmer" />
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-24 rounded bg-paper-2 shimmer hidden sm:block" />
                        <div className="h-9 w-9 rounded bg-paper-2 shimmer" />
                        <div className="h-9 w-9 rounded-full bg-paper-2 shimmer" />
                    </div>
                </div>
            </div>

            {/* Fake Sidebar (Desktop only) */}
            <div className="hidden md:flex fixed top-[92px] left-0 h-[calc(100vh-92px)] w-64 flex-col border-r border-rule bg-paper p-4">
                <div className="h-3 w-16 rounded bg-paper-2 shimmer mb-6 mt-4 ml-4" />
                <div className="space-y-2 px-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-10 w-full rounded-md bg-paper-2 shimmer" />
                    ))}
                </div>
                <div className="mt-auto pt-8 border-t border-rule/50 mx-2 pb-4">
                    <div className="h-3 w-16 rounded bg-paper-2 shimmer mb-4" />
                    <div className="flex gap-3 items-center">
                        <div className="h-10 w-10 rounded-full bg-paper-2 shimmer shrink-0" />
                        <div className="h-4 w-24 rounded bg-paper-2 shimmer" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="pt-[92px] md:pl-64 flex flex-col min-h-screen">
                <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-2 animate-in fade-in duration-500">
                    {/* Generic Header Area */}
                    <div className="mb-10 max-w-3xl space-y-4">
                        <div className="h-12 w-3/4 sm:w-1/2 rounded-md bg-paper-2 border border-rule shimmer"></div>
                        <div className="space-y-2">
                            <div className="h-5 w-full sm:w-2/3 rounded-md bg-paper-2 border border-rule shimmer"></div>
                            <div className="h-5 w-4/5 sm:w-1/2 rounded-md bg-paper-2 border border-rule shimmer"></div>
                        </div>
                    </div>

                    {/* Filter / Subnav Bar */}
                    <div className="h-14 sm:h-16 w-full rounded-xl bg-paper-2/40 border border-rule shimmer mb-8"></div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex flex-col gap-4 rounded-xl bg-paper-2/30 border border-rule p-5 sm:p-6 shadow-sm">
                                {/* Card Header */}
                                <div className="flex gap-4 items-center">
                                    <div className="h-12 w-12 rounded-xl bg-paper-2 border border-rule shrink-0 shimmer"></div>
                                    <div className="flex-1 space-y-2.5">
                                        <div className="h-4 w-3/4 rounded-md bg-paper-2 shimmer"></div>
                                        <div className="h-3 w-1/2 rounded-md bg-paper-2 shimmer"></div>
                                    </div>
                                </div>
                                
                                {/* Card Body */}
                                <div className="space-y-2.5 pt-4">
                                    <div className="h-3 w-full rounded-md bg-paper-2 shimmer"></div>
                                    <div className="h-3 w-full rounded-md bg-paper-2 shimmer"></div>
                                    <div className="h-3 w-4/5 rounded-md bg-paper-2 shimmer"></div>
                                </div>
                                
                                {/* Card Footer */}
                                <div className="flex justify-between items-center pt-5 mt-auto">
                                    <div className="flex gap-2">
                                        <div className="h-6 w-16 rounded-full bg-paper-2 shimmer"></div>
                                        <div className="h-6 w-16 rounded-full bg-paper-2 shimmer"></div>
                                    </div>
                                    <div className="h-8 w-8 rounded-md bg-paper-2 shimmer"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
