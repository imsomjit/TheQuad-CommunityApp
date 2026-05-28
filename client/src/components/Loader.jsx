import React, { useEffect, useState } from 'react';

export default function Loader({ text = "Loading", inline = false, className = "", size = "md" }) {
    const [cursor, setCursor] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => setCursor(c => !c), 500);
        return () => clearInterval(interval);
    }, []);

    const sizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
    };

    const iconSizes = {
        sm: "text-sm",
        md: "text-xl",
        lg: "text-3xl"
    };

    const cursorSizes = {
        sm: "w-1.5 h-3",
        md: "w-2.5 h-5",
        lg: "w-4 h-7"
    };

    if (inline) {
        return (
            <span className={`inline-flex items-center text-inherit font-mono font-bold ${iconSizes[size]} ${className}`}>
                <span>{">"}</span>
                <span className={`${cursorSizes[size]} ml-0.5 bg-current ${cursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}></span>
            </span>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div className={`flex items-center text-accent font-mono font-bold ${iconSizes[size]}`}>
                <span>{">"}</span>
                <span className={`${cursorSizes[size]} ml-1 bg-accent ${cursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}></span>
            </div>
            {text && (
                <span className={`font-mono uppercase tracking-[0.2em] text-ink-3 ${sizeClasses[size]}`}>
                    {text}
                </span>
            )}
        </div>
    );
}
