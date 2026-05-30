import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, MessageSquare, FileText, Target } from "lucide-react";

export default function MobileNav() {

    const linkClass = ({ isActive }) =>
        `relative flex flex-col items-center justify-center p-2 text-xs font-medium transition-all duration-200 ${
            isActive 
                ? "text-accent scale-110" 
                : "text-ink-3 hover:text-ink hover:scale-105"
        }`;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[75%] max-w-sm">
            <nav className="flex items-center justify-between rounded-full border border-accent-soft bg-paper/90 backdrop-blur-xl px-4 py-2 shadow-lg ring-1 ring-accent-soft">
                <NavLink to="/" className={linkClass} end title="Feed">
                    <Home className="h-5 w-5 mb-1" strokeWidth={2.2} />
                    <span className="sr-only">Feed</span>
                </NavLink>
                <NavLink to="/resources" className={linkClass} title="Library">
                    <BookOpen className="h-5 w-5 mb-1" strokeWidth={2.2} />
                    <span className="sr-only">Library</span>
                </NavLink>
                <NavLink to="/questions" className={linkClass} title="Q&A">
                    <MessageSquare className="h-5 w-5 mb-1" strokeWidth={2.2} />
                    <span className="sr-only">Q&A</span>
                </NavLink>
                <NavLink to="/posts" className={linkClass} title="Posts">
                    <FileText className="h-5 w-5 mb-1" strokeWidth={2.2} />
                    <span className="sr-only">Posts</span>
                </NavLink>
                <NavLink to="/opportunities" className={linkClass} title="Opportunities">
                    <Target className="h-5 w-5 mb-1" strokeWidth={2.2} />
                    <span className="sr-only">Opportunities</span>
                </NavLink>
            </nav>
        </div>
    );
}
