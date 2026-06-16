import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Upload, MessageSquare, PenLine } from "lucide-react";
import { createPortal } from "react-dom";

export default function MobileAddMenu({ isOpen, onClose, hoveredAction }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // We don't unmount it so the closing animation can play!
    // We use CSS opacity and pointer-events-none instead.
    
    return createPortal(
        <div className={`fixed inset-0 z-[100] md:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            
            {/* Subtle Backdrop */}
            <div 
                className={`absolute inset-0 bg-ink/10 backdrop-blur-sm transition-all duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0 delay-100'}`}
                onClick={onClose}
            />

            {/* Arc Menu Wrapper anchored to center of + button */}
            <div className="absolute bottom-[46px] left-1/2 w-0 h-0">
                
                {/* Resource (Left Arc) */}
                <Link 
                    to="/upload"
                    onClick={onClose}
                    data-action-id="resource"
                    className={`absolute flex flex-col items-center gap-2 w-20 transition-all duration-400 cubic-bezier(0.34, 1.56, 0.64, 1) ${isOpen ? 'translate-x-[-90px] translate-y-[-80px] scale-100 opacity-100' : 'translate-x-[0px] translate-y-[0px] scale-50 opacity-0'}`}
                    style={{ left: '-40px', bottom: '-20px' }}
                >
                    <div className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-transform duration-200 ${hoveredAction === 'resource' ? 'bg-syntax-rose scale-110 text-paper' : 'bg-paper-2 text-accent border border-accent-soft'}`}>
                        <Upload className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <span className={`text-[11px] font-mono uppercase tracking-wider transition-all duration-200 ${hoveredAction === 'resource' ? 'text-syntax-rose scale-110' : 'text-ink-2'}`}>Upload</span>
                </Link>

                {/* Question (Top Arc) */}
                <Link 
                    to="/ask"
                    onClick={onClose}
                    data-action-id="question"
                    className={`absolute flex flex-col items-center gap-2 w-20 transition-all duration-400 cubic-bezier(0.34, 1.56, 0.64, 1) delay-75 ${isOpen ? 'translate-x-[0px] translate-y-[-115px] scale-100 opacity-100' : 'translate-x-[0px] translate-y-[0px] scale-50 opacity-0'}`}
                    style={{ left: '-40px', bottom: '-20px' }}
                >
                    <div className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-transform duration-200 ${hoveredAction === 'question' ? 'bg-syntax-cyan scale-110 text-paper' : 'bg-paper-2 text-accent border border-accent-soft'}`}>
                        <MessageSquare className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <span className={`text-[11px] font-mono uppercase tracking-wider transition-all duration-200 ${hoveredAction === 'question' ? 'text-syntax-cyan scale-110' : 'text-ink-2'}`}>Ask</span>
                </Link>

                {/* Post (Right Arc) */}
                <Link 
                    to="/posts/new"
                    onClick={onClose}
                    data-action-id="post"
                    className={`absolute flex flex-col items-center gap-2 w-20 transition-all duration-400 cubic-bezier(0.34, 1.56, 0.64, 1) delay-150 ${isOpen ? 'translate-x-[90px] translate-y-[-80px] scale-100 opacity-100' : 'translate-x-[0px] translate-y-[0px] scale-50 opacity-0'}`}
                    style={{ left: '-40px', bottom: '-20px' }}
                >
                    <div className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-transform duration-200 ${hoveredAction === 'post' ? 'bg-syntax-violet scale-110 text-paper' : 'bg-paper-2 text-accent border border-accent-soft'}`}>
                        <PenLine className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <span className={`text-[11px] font-mono uppercase tracking-wider transition-all duration-200 ${hoveredAction === 'post' ? 'text-syntax-violet scale-110' : 'text-ink-2'}`}>Post</span>
                </Link>

            </div>
        </div>,
        document.body
    );
}
