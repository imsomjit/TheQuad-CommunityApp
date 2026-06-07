import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Upload, MessageSquare, FileText } from "lucide-react";
import { createPortal } from "react-dom";

export default function MobileAddMenu({ isOpen, onClose }) {
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

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-paper border-t border-rule rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-display font-semibold text-ink">Create New</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 -mr-2 text-ink-3 hover:text-ink rounded-full bg-paper-2"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3 pb-8">
                    <Link 
                        to="/upload" 
                        onClick={onClose}
                        className="flex items-center gap-4 p-4 rounded-xl border border-rule bg-paper-2 hover:border-accent hover:bg-accent-soft/30 transition-all"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-syntax-mint/10 text-syntax-mint">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink">Upload Resource</h3>
                            <p className="text-xs text-ink-3 mt-0.5">Share notes, PYQs, and assignments</p>
                        </div>
                    </Link>

                    <Link 
                        to="/ask" 
                        onClick={onClose}
                        className="flex items-center gap-4 p-4 rounded-xl border border-rule bg-paper-2 hover:border-accent hover:bg-accent-soft/30 transition-all"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-syntax-cyan/10 text-syntax-cyan">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink">Ask a Question</h3>
                            <p className="text-xs text-ink-3 mt-0.5">Get help from the community</p>
                        </div>
                    </Link>

                    <Link 
                        to="/posts/new" 
                        onClick={onClose}
                        className="flex items-center gap-4 p-4 rounded-xl border border-rule bg-paper-2 hover:border-accent hover:bg-accent-soft/30 transition-all"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-syntax-amber/10 text-syntax-amber">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink">Write a Post</h3>
                            <p className="text-xs text-ink-3 mt-0.5">Share knowledge or experiences</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>,
        document.body
    );
}
