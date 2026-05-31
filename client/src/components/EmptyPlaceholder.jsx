import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function EmptyPlaceholder({ icon: Icon, title, description, linkTo, linkText, className = "" }) {
    return (
        <div className={`flex flex-col items-center justify-center p-16 sm:p-24 text-center rounded-xl border border-dashed border-rule bg-paper-2/20 ${className}`}>
            <div className="w-12 h-12 rounded-lg border border-rule bg-paper flex items-center justify-center mb-4 card-elevated">
                <Icon className="w-6 h-6 text-ink-3" />
            </div>
            <h3 className="font-sans text-lg font-medium text-ink mb-2 tracking-tight">{title}</h3>
            <p className="text-sm text-ink-2 max-w-sm mb-5 leading-relaxed">{description}</p>
            {linkTo && (
                <Link to={linkTo} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-rule bg-paper text-sm font-semibold text-ink-2 hover:text-ink hover:border-ink-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    {linkText} <ArrowRight className="w-4 h-4" />
                </Link>
            )}
        </div>
    );
}
