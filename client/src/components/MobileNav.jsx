import React, { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Compass, Plus, Search, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MobileAddMenu from "./MobileAddMenu";

export default function MobileNav({ onChatToggle }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [hoveredAction, setHoveredAction] = useState(null);
    const startPos = useRef(null);

    const actionRoutes = {
        resource: '/upload',
        question: '/ask',
        post: '/posts/new'
    };

    const linkClass = ({ isActive }) =>
        `group relative flex flex-col items-center justify-center p-2 text-xs font-medium transition-all duration-300 ease-out active:scale-90 ${isActive
            ? "text-accent scale-110 drop-shadow-sm"
            : "text-ink-3 hover:text-ink hover:scale-105"
        }`;

    const buttonClass = `group relative flex flex-col items-center justify-center p-2 text-xs font-medium transition-all duration-300 ease-out active:scale-90 text-ink-3 hover:text-ink hover:scale-105`;

    const handlePointerDown = (e) => {
        // Only trigger on primary touch/mouse
        if (e.button !== 0 && e.button !== undefined) return; 
        
        e.currentTarget.setPointerCapture(e.pointerId);
        startPos.current = { x: e.clientX, y: e.clientY };
        setIsAddMenuOpen(true);
        setHoveredAction(null);
    };

    const handlePointerMove = (e) => {
        if (!isAddMenuOpen) return;
        
        // Find which action the pointer is currently over using native DOM testing
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const actionEl = el?.closest('[data-action-id]');
        if (actionEl) {
            setHoveredAction(actionEl.getAttribute('data-action-id'));
        } else {
            setHoveredAction(null);
        }
    };

    const handlePointerUp = (e) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        
        // If they released over an action, navigate!
        if (hoveredAction && actionRoutes[hoveredAction]) {
            navigate(actionRoutes[hoveredAction]);
        }

        // Always close the menu when the finger is released
        setIsAddMenuOpen(false);
        setHoveredAction(null);
        startPos.current = null;
    };

    return (
        <>
            <div className="fixed inset-x-0 bottom-5 z-40 md:hidden flex justify-center pointer-events-none">
                <nav className="pointer-events-auto w-[75%] max-w-sm flex items-center justify-between rounded-full border border-rule bg-paper/95 backdrop-blur-xl px-5 py-2.5 shadow-2xl relative transition-all duration-500 animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
                    <NavLink to="/" className={linkClass} end title="Home">
                        <Home className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.2} />
                        <span className="sr-only">Home</span>
                    </NavLink>
                    <NavLink to="/explore" className={linkClass} title="Explore">
                        <Compass className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.2} />
                        <span className="sr-only">Explore</span>
                    </NavLink>

                    {/* Add FAB (Inline) */}
                    <div className="px-2">
                        <button
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            className={`group flex items-center justify-center w-11 h-11 bg-accent text-paper rounded-full shadow-md transition-all duration-300 ease-out ${isAddMenuOpen ? 'scale-90 shadow-none' : 'hover:shadow-lg hover:scale-105 active:scale-90'}`}
                            style={{ touchAction: 'none' }} // Prevent scrolling while dragging!
                        >
                            <Plus className={`w-5 h-5 transition-transform duration-300 ${isAddMenuOpen ? 'rotate-45' : 'group-hover:rotate-90'}`} strokeWidth={2.5} />
                        </button>
                    </div>

                    <NavLink to="/search" className={linkClass} title="Search">
                        <Search className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.2} />
                        <span className="sr-only">Search</span>
                    </NavLink>
                    <button
                        onClick={user ? onChatToggle : () => navigate('/login')}
                        className={buttonClass}
                        title="Chat"
                    >
                        <MessageSquare className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.2} />
                        <span className="sr-only">Chat</span>
                    </button>
                </nav>
            </div>

            <MobileAddMenu
                isOpen={isAddMenuOpen}
                onClose={() => setIsAddMenuOpen(false)}
                hoveredAction={hoveredAction}
            />
        </>
    );
}
