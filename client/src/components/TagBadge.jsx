import React from "react";

// Cycle of syntax colors keyed by tag string for visual variety.
const PALETTE = [
    "syntax-cyan",
    "syntax-magenta",
    "syntax-lime",
    "syntax-amber",
    "syntax-violet",
    "syntax-rose",
    "syntax-mint",
];

function hashIndex(str) {
    let h = 0;

    for (let i = 0; i < str.length; i++) {
        h = (h * 31 + str.charCodeAt(i)) | 0;
    }

    return Math.abs(h) % PALETTE.length;
}

export default function TagBadge({
    children,
    onClick,
    active = false,
    size = "sm",
    "data-testid": testId,
}) {
    const sizes = {
        xs: "px-1.5 py-0.5 text-[10px]",
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
    }[size];

    // derive a color from the tag's literal string when possible
    const label = typeof children === "string" ? children : "";
    const colorVar = `rgb(var(--${PALETTE[hashIndex(label)]}))`;

    const baseClass = active
        ? "border-current text-current"
        : "border-rule text-ink-2 hover:text-ink";

    const Component = onClick ? "button" : "span";

    return (
        <Component
            onClick={onClick}
            data-testid={testId}
            className={`inline-flex items-center rounded-sm border bg-paper-2 font-mono transition-colors ${sizes} ${baseClass}`}
            style={active ? { color: colorVar, borderColor: colorVar } : undefined}
        >
            <span
                aria-hidden
                className="mr-1.5 inline-block h-1 w-1 rounded-full"
                style={{ backgroundColor: colorVar }}
            />
            {children}
        </Component>
    );
}
