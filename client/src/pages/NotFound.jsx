import React from "react";
import { Link } from "react-router-dom";
import { MoveLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl sm:text-7xl font-bold font-mono text-ink-3 mb-4">404</h1>
      <h2 className="text-lg sm:text-xl font-semibold mb-6 text-ink-2 font-mono">Page Not Found <span className="text-accent">:(</span></h2>
      <p className="text-ink-3 mb-8 max-w-md font-mono text-sm">
        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>
        <Link 
          to="/"
          className="flex items-center justify-center font-mono gap-2 text-ink-2 hover:scale-105 transition-opacity text-sm transition-transform duration-300"
        >
          <MoveLeft className="w-4 h-4 text-accent" />
          Return Home
        </Link>
    </div>
    
  );
};

export default NotFound;
