import React from "react";
import { GITHUB_MOCK } from "../data/mockData";

const LEVEL_COLORS = [
    "border-zinc-800/40 bg-zinc-900",
    "border-emerald-800/30 bg-emerald-900/40",
    "border-emerald-600/30 bg-emerald-700/60",
    "border-emerald-400/30 bg-emerald-500/80",
    "border-emerald-300/40 bg-emerald-400",
];

export default function ContributionGraph({
    contributions = GITHUB_MOCK.contributions,
}) {
    // 52 columns × 7 rows
    const cols = 52;
    const rows = 7;

    const total = contributions.reduce(
        (acc, value) =>
            acc +
            (value > 0
                ? Math.round(value * 1.7)
                : 0),
        0
    );

    return (
        <div
            className="w-full"
            data-testid="contribution-graph"
        >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                    <span className="font-semibold text-zinc-200">
                        {total}
                    </span>{" "}
                    contributions · last year
                </p>

                <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-zinc-500">
                        less
                    </span>

                    {LEVEL_COLORS.map(
                        (color, index) => (
                            <span
                                key={index}
                                className={`h-2.5 w-2.5 rounded-sm border ${color}`}
                            />
                        )
                    )}

                    <span className="font-mono text-[10px] text-zinc-500">
                        more
                    </span>
                </div>
            </div>

            {/* Contribution grid */}
            <div className="overflow-x-auto">
                <div
                    className="grid grid-flow-col grid-rows-7 gap-[3px]"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        minWidth: cols * 13,
                    }}
                >
                    {Array.from({
                        length: cols * rows,
                    }).map((_, index) => {
                        const level =
                            contributions[index] || 0;

                        return (
                            <div
                                key={index}
                                title={`Level ${level}`}
                                className={`h-2.5 w-2.5 rounded-[2px] border transition-transform hover:z-10 hover:scale-150 ${LEVEL_COLORS[level]}`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}