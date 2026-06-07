import React from "react";

export default function PageLoadingSkeleton() {
    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="h-8 w-1/3 rounded bg-paper-2 mb-6"></div>
            <div className="h-4 w-1/4 rounded bg-paper-2 mb-10"></div>

            <div className="space-y-6">
                {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col gap-4 rounded-md bg-paper-2/30 border border-rule p-5 sm:p-6">
                        <div className="flex gap-4 items-center">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-paper-2 shrink-0"></div>
                            <div className="flex-1 space-y-2.5">
                                <div className="h-4 w-1/3 sm:w-1/4 rounded bg-paper-2"></div>
                                <div className="h-3 w-1/2 sm:w-1/3 rounded bg-paper-2"></div>
                            </div>
                        </div>
                        <div className="space-y-2.5 pt-2">
                            <div className="h-3.5 w-full rounded bg-paper-2"></div>
                            <div className="h-3.5 w-full rounded bg-paper-2"></div>
                            <div className="h-3.5 w-5/6 rounded bg-paper-2"></div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-rule/50 mt-2">
                            <div className="h-4 w-16 rounded bg-paper-2"></div>
                            <div className="h-4 w-16 rounded bg-paper-2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
