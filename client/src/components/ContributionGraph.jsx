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
    contributionData = {},
}) {
    const cols = 52;
    const rows = 7;
    const totalDays = cols * rows;

    const days = [];
    const today = new Date();
    // Generate dates ending on today
    for (let i = totalDays - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const date = String(d.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${date}`;
        const count = contributionData[dateStr] || 0;
        
        let level = 0;
        if (count === 1) level = 1;
        else if (count >= 2 && count <= 3) level = 2;
        else if (count >= 4 && count <= 5) level = 3;
        else if (count >= 6) level = 4;

        days.push({ date: dateStr, count, level });
    }

    const total = Object.values(contributionData).reduce((sum, count) => sum + count, 0);

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
                    {days.map((day, index) => (
                        <div
                            key={index}
                            title={`${day.count} contributions on ${day.date}`}
                            className="h-3 w-3 rounded-[3px] border border-rule/50 transition-all duration-200 hover:z-10 hover:scale-[1.6] hover:shadow-lg hover:border-accent-2 cursor-pointer"
                            style={{ backgroundColor: LEVEL_BG[day.level] }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
