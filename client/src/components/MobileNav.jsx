import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, Compass, Plus, Library, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MobileAddMenu from "./MobileAddMenu";

export default function MobileNav() {
    const { user } = useAuth();
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

    const linkClass = ({ isActive }) =>
        `group relative flex flex-col items-center justify-center p-2 text-xs font-medium transition-all duration-300 ease-out active:scale-90 ${isActive
            ? "text-accent scale-110 drop-shadow-sm"
            : "text-ink-3 hover:text-ink hover:scale-105"
        }`;

    return (
        <>
            <div className="fixed inset-x-0 bottom-5 z-50 md:hidden flex justify-center pointer-events-none">
                <nav className="pointer-events-auto w-[92%] max-w-sm flex items-center justify-between rounded-full border border-rule bg-paper/95 backdrop-blur-xl px-5 py-2.5 shadow-2xl relative transition-all duration-500 animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
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
                            onClick={() => setIsAddMenuOpen(true)}
                            className="group flex items-center justify-center w-11 h-11 bg-accent text-paper rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-90 transition-all duration-300 ease-out"
                        >
                            <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" strokeWidth={2.5} />
                        </button>
                    </div>

                    <NavLink to="/library" className={linkClass} title="Library">
                        <Library className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.2} />
                        <span className="sr-only">Library</span>
                    </NavLink>
                    <NavLink
                        to={user ? `/u/${user.username}` : "/login"}
                        className={linkClass}
                        title="Profile"
                    >
                        <User className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.2} />
                        <span className="sr-only">Profile</span>
                    </NavLink>
                </nav>
            </div>

            <MobileAddMenu
                isOpen={isAddMenuOpen}
                onClose={() => setIsAddMenuOpen(false)}
            />
        </>
    );
}
