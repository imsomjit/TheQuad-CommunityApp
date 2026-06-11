import React from "react";
import { Link } from "react-router-dom";
import { MoveLeft, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-9xl font-extrabold font-mono text-[var(--syntax-comment)]/20 mb-4">4<span className="text-accent">0</span>4</h1>
      <h2 className="text-3xl font-bold mb-6 text-[var(--foreground)] font-mono marker">Page Not Found</h2>
      <p className="text-[var(--muted-foreground)] mb-8 max-w-md font-mono">
        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>
      
      <div className="flex flex-col font-mono sm:flex-row gap-4">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 px-6 py-2 hover:scale-105 rounded-md border border-accent transition-transform duration-300"
        >
          <MoveLeft className="w-4 h-4 text-accent" />
          Go Back
        </button>
        <Link 
          to="/"
          className="flex items-center justify-center gap-2 px-6 py-2 rounded-md text-accent hover:scale-105 transition-opacity transition-transform duration-300"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
