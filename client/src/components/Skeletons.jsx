import React from "react";

export function Skeleton({ className }) {
    return (
        <div className={`shimmer rounded-md bg-rule/60 ${className}`} />
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

export function OpportunityCardSkeleton() {
    return (
        <div className="flex flex-col p-6 rounded-2xl border border-rule bg-paper">
            <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-8 w-3/4 mb-3" />
            <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2 mb-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="mt-auto pt-4 border-t border-rule space-y-2.5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </div>
        </div>
    );
}

export function OpportunityDetailSkeleton() {
    return (
        <div className="max-w-4xl mx-auto pb-24 animate-in fade-in pt-8">
            <div className="mb-8 space-y-4 border border-rule rounded-2xl bg-paper p-6 md:p-8">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-24 rounded-lg" />
                        <Skeleton className="h-9 w-24 rounded-lg" />
                    </div>
                </div>
                <Skeleton className="h-10 w-3/4 rounded-md" />
                <div className="flex gap-4">
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                </div>
                <div className="space-y-3 pt-6 border-t border-rule mt-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[95%]" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </div>
    );
}

export function DetailSkeleton() {
    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in">
            <div className="mb-6 flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
            </div>
            
            <Skeleton className="h-12 w-[85%] mb-8" />
            
            <div className="flex items-center gap-4 mb-10 pb-8 border-b border-rule">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            
            <div className="space-y-5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[85%]" />
                
                <div className="py-6">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                </div>
                
                <Skeleton className="h-4 w-[92%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
            </div>
        </div>
    );
}

export function NotificationSkeleton() {
    return (
        <div className="group flex gap-4 rounded-sm border px-5 py-4 border-rule/60 bg-transparent">
            <div className="relative shrink-0">
                <Skeleton className="h-10 w-10 rounded-sm" />
            </div>
            <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-2 w-16" />
            </div>
        </div>
    );
}

export function UserCardSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-rule bg-paper">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
        </div>
    );
}

export function SettingsSkeleton() {
    return (
        <div className="space-y-8 max-w-2xl animate-in fade-in">
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-2/4" />
            </div>
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-1/5" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TableSkeleton() {
    return (
        <div className="w-full border border-rule rounded-md overflow-hidden bg-paper animate-in fade-in">
            <div className="bg-paper-2/50 border-b border-rule p-4 flex gap-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="divide-y divide-rule">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="p-4 flex gap-4">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function GithubStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 animate-in fade-in">
            <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-rule space-y-6 bg-paper-2/10">
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
                </div>
                <div className="space-y-3 mt-6">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-2.5 w-full rounded-full" />
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-8 p-6 space-y-8">
                <div>
                    <Skeleton className="h-4 w-1/4 mb-4" />
                    <Skeleton className="h-32 w-full rounded-md" />
                </div>
                <div>
                    <Skeleton className="h-4 w-1/4 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LeetcodeStatsSkeleton() {
    return (
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 animate-in fade-in">
            <div className="flex flex-col justify-center gap-4">
                <Skeleton className="h-20 w-full rounded-lg" />
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
                </div>
            </div>
            <div className="flex flex-col items-center justify-center">
                <Skeleton className="h-40 w-40 sm:h-48 sm:w-48 rounded-full" />
            </div>
        </div>
    );
}

export function PostCardSkeleton() {
    return (
        <div className="flex flex-col gap-3 rounded-md border border-rule bg-paper p-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-2 flex gap-2">
                {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-4 w-16" />
                ))}
            </div>
        </div>
    );
}

export function BookCardSkeleton() {
    return (
        <div className="group relative flex h-60 overflow-hidden rounded-md border border-rule bg-paper">
            <div className="flex flex-1 flex-col justify-between p-5 z-10">
                <div className="space-y-3">
                    <Skeleton className="h-7 w-full" />
                    <Skeleton className="h-7 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="mt-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-rule/50 pt-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
            <div className="relative w-32 shrink-0 border-l border-rule bg-paper-2 sm:w-40 z-10 shimmer">
            </div>
        </div>
    );
}
