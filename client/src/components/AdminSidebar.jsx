import React from "react";
import { NavLink } from "react-router-dom";
import { 
    ShieldAlert, 
    Users, 
    Settings, 
    LogOut, 
    PanelLeftClose, 
    ArrowLeft,
    BarChart3,
    Briefcase,
    Star
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function AdminSidebar({ isCollapsed, onToggle, scrolled }) {
    const { logout } = useAuth();
    const { currentUser } = useApp();

    const linkClass = ({ isActive }) => {
        const base = "group flex items-center rounded-xl py-2 text-sm transition-all duration-300";
        const state = isActive 
            ? "bg-paper text-accent font-medium hover:bg-paper-2 border border-accent-soft transition-color duration-300" 
            : "text-ink-2 hover:bg-paper-2 hover:text-ink";
        const layout = isCollapsed 
            ? "justify-center w-12 mx-auto px-0" 
            : "gap-3 px-4 w-full";
        return `${base} ${state} ${layout}`;
    };

    return (
        <aside className={`fixed left-0 bottom-0 z-30 hidden flex-col justify-between border-r border-rule bg-paper-2/90 backdrop-blur-md py-6 md:flex animate-in fade-in slide-in-from-left-8 duration-700 ease-out transition-all duration-700 ease-in-out ${scrolled ? 'top-[56px]' : 'top-[92px]'} ${isCollapsed ? 'w-[70px] px-2' : 'w-60 px-4'}`}>
            <nav className="flex flex-col gap-3">
                <div className={`flex items-center pb-1 ${isCollapsed ? 'justify-center' : 'justify-between px-3'}`}>
                    {!isCollapsed && <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{currentUser?.role === 'admin' ? 'Admin Console' : 'Moderator Console'}</p>}
                    <button onClick={onToggle} className="text-ink-3 hover:text-ink transition-colors" title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                        <PanelLeftClose className={`h-4 w-4 transition-transform duration-700 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                
                <NavLink to="/admin/reports" className={linkClass} title="Moderation Queue">
                    <ShieldAlert className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>Reports Queue</span>}
                </NavLink>
                
                {currentUser?.role === 'admin' && (
                    <>
                        <NavLink to="/admin/users" className={linkClass} title="User Management">
                            <Users className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>User Management</span>}
                        </NavLink>

                        <NavLink to="/admin/analytics" className={linkClass} title="System Statistics">
                            <BarChart3 className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>System Statistics</span>}
                        </NavLink>

                        <NavLink to="/admin/opportunities" className={linkClass} title="Opportunities">
                            <Briefcase className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>Opportunities</span>}
                        </NavLink>

                        <NavLink to="/admin/featured" className={linkClass} title="Featured Content">
                            <Star className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>Featured Content</span>}
                        </NavLink>
                        
                        <NavLink to="/admin/settings" className={linkClass} title="Platform Settings">
                            <Settings className="h-5 w-5 shrink-0" /> {!isCollapsed && <span>Site Settings</span>}
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="mt-auto flex flex-col gap-2 border-t border-rule pt-4">
                {!isCollapsed && <p className="px-4 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">Account: {currentUser?.username}</p>}
                
                <NavLink to="/" className={`group flex items-center ${isCollapsed ? 'justify-center w-12 mx-auto px-0' : 'w-full gap-3 px-4'} rounded-xl py-2 text-sm font-medium text-ink-2 hover:text-ink hover:bg-paper transition-all duration-300 mt-1 border border-transparent hover:border-rule`} title="Return to App">
                    <ArrowLeft className={`h-5 w-5 shrink-0 transition-transform ${isCollapsed ? '' : 'group-hover:-translate-x-0.5'}`} />
                    {!isCollapsed && <span>Return to App</span>}
                </NavLink>

                <button 
                    onClick={() => logout()}
                    title="Sign out"
                    className={`group flex items-center ${isCollapsed ? 'justify-center w-12 mx-auto px-0' : 'w-full gap-3 px-4'} rounded-xl py-2.5 text-sm font-medium text-ink-3 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500`}
                >
                    <LogOut className={`h-5 w-5 shrink-0 transition-transform ${isCollapsed ? '' : 'group-hover:-translate-x-0.5'}`} />
                    {!isCollapsed && <span>Sign out</span>}
                </button>
            </div>
        </aside>
    );
}
