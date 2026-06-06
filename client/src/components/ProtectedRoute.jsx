import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoadingSkeleton from "./PageLoadingSkeleton";

/**
 * Wrapper for routes that require authentication.
 * Shows a loading spinner while auth state is being determined,
 * then redirects to /login if not authenticated.
 */
export default function ProtectedRoute({ children, requireRole }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    // Preserve the intended destination so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && user && !requireRole.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
