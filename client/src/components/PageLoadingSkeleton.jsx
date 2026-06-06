import React from "react";

export default function PageLoadingSkeleton() {
    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 shimmer">
            <div className="h-8 w-1/3 rounded bg-paper-2 mb-6"></div>
            <div className="h-4 w-1/4 rounded bg-paper-2 mb-10"></div>

            <div className="space-y-6">
                <div className="h-32 w-full rounded-sm bg-paper-2/50 border border-rule"></div>
                <div className="h-32 w-full rounded-sm bg-paper-2/50 border border-rule"></div>
                <div className="h-32 w-full rounded-sm bg-paper-2/50 border border-rule"></div>
            </div>
        </div>
    );
}
