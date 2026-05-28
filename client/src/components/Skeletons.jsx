import React from "react";

export function Skeleton({ className }) {
    return (
        <div className={`animate-pulse rounded-md bg-rule/60 ${className}`} />
    );
}

export function ResourceCardSkeleton() {
    return (
        <div className="group relative flex flex-col gap-3 rounded-xl border border-rule bg-paper p-4 sm:flex-row sm:items-start sm:p-5">
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded-sm" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-5 w-16 rounded-sm" />
                    <Skeleton className="h-5 w-16 rounded-sm" />
                </div>
            </div>
            <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:items-end sm:gap-2">
                <Skeleton className="h-10 w-24 rounded-sm" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>
    );
}

export function QuestionCardSkeleton() {
    return (
        <div className="group relative flex flex-col gap-4 rounded-xl border border-rule bg-paper p-4 sm:flex-row sm:items-start sm:p-5">
            <div className="hidden flex-col items-center gap-1 sm:flex">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-14 rounded-sm" />
                        <Skeleton className="h-5 w-14 rounded-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
