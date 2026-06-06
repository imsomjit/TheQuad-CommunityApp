import React from "react";
import { Link } from "react-router-dom";
import { Eye, BookText } from "lucide-react";
import BookmarkButton from "./BookmarkButton";
import { generateSlug } from "../utils/slugify";
import { timeAgo } from "../utils/timeAgo";

export default function BookCard({ book }) {
    return (
        <Link
            to={`/library/${generateSlug(book.title, book.publicId)}`}
            className="group relative flex h-60 overflow-hidden rounded-md border border-rule bg-paper transition-all duration-300 hover:border-accent hover:shadow-xl hover:shadow-accent/5"
        >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/5 blur-3xl transition-opacity group-hover:bg-accent/10" />

            {/* Left Content */}
            <div className="flex flex-1 flex-col justify-between p-5 z-10">
                <div>
                    <h3 className="line-clamp-2 font-display text-2xl font-bold leading-tight text-ink group-hover:text-accent">
                        {book.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-2">
                        <span className="line-clamp-1">by {book.author}</span>
                    </div>
                </div>

                <p className="mt-3 mb-2 line-clamp-2 text-sm text-ink-2 leading-relaxed flex-1">
                    {book.description || "No description available for this book."}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-rule/50 pt-3 text-xs font-medium text-ink-3">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5" title={`${book.views} views`}>
                            <Eye className="h-4 w-4" />
                            {book.views}
                        </span>
                        <div onClick={e => e.preventDefault()}>
                            <BookmarkButton 
                                targetType="BOOK" 
                                targetId={book.id} 
                                initialCount={book.bookmarks || 0} 
                            />
                        </div>
                    </div>
                    <span className="truncate text-ink-3">{timeAgo(book.createdAt)}</span>
                </div>
            </div>

            {/* Right Cover */}
            <div className="relative w-32 shrink-0 border-l border-rule bg-paper-2 sm:w-40 z-10">
                {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-paper-3/30 text-ink-3/50 group-hover:bg-accent/5 transition-colors">
                        <BookText className="h-12 w-12" strokeWidth={1} />
                    </div>
                )}
            </div>
        </Link>
    );
}
