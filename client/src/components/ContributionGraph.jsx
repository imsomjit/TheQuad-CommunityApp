import React from "react";
// 5 contribution levels
const LEVEL_BG = [
    "var(--paper-2)",
    "color-mix(in srgb, var(--accent-2) 30%, var(--paper-2))",
    "color-mix(in srgb, var(--accent-2) 55%, var(--paper-2))",
    "color-mix(in srgb, var(--accent-2) 80%, var(--paper-2))",
    "var(--accent-2)",
];

export default function ContributionGraph({
    contributions = [],
}) {
    const cols = 52;
    const rows = 7;

    const total = contributions.reduce(
        (acc, value) => acc + (value > 0 ? Math.round(value * 1.7) : 0),
        0
    );

    return (
        <div className="w-full" data-testid="contribution-graph">
            <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-3">
                    <span className="font-semibold text-ink">{total}</span>{" "}
                    contributions · last year
                </p>

                <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-ink-3">less</span>

                    {LEVEL_BG.map((bg, index) => (
                        <span
                            key={index}
                            className="h-3 w-3 rounded-[3px] border border-rule/50"
                            style={{ backgroundColor: bg }}
                        />
                    ))}

                    <span className="font-mono text-[10px] text-ink-3">more</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div
                    className="grid grid-flow-col grid-rows-7 gap-[3px]"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        minWidth: cols * 13,
                    }}
                >
                    {Array.from({ length: cols * rows }).map((_, index) => {
                        const level = contributions[index] || 0;

                        return (
                            <div
                                key={index}
                                title={`Level ${level}`}
                                className="h-3 w-3 rounded-[3px] border border-rule/50 transition-all duration-200 hover:z-10 hover:scale-[1.6] hover:shadow-lg hover:border-accent-2 cursor-pointer"
                                style={{ backgroundColor: LEVEL_BG[level] }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
