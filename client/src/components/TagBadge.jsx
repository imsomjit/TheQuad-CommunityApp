import React from "react";

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

    const variantClass = active
        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-emerald-300";

    const Component = onClick
        ? "button"
        : "span";

    return (
        <Component
            onClick={onClick}
            data-testid={testId}
            className={`inline-flex items-center rounded-md border font-mono transition-colors ${sizes} ${variantClass}`}
        >
            {children}
        </Component>
    );
}