import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { setAccessToken } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

/**
 * OAuth Callback Page
 *
 * After Google OAuth, the server redirects to:
 *   /auth/callback#token=<accessToken>
 *
 * This page:
 *  1. Extracts the access token from the URL hash
 *  2. Stores it in memory via setAccessToken()
 *  3. Triggers the AuthContext to pick up the user
 *  4. Redirects to the home page
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const { fetchMe } = useAuth();

  useEffect(() => {
    // Check for error query params (from failed OAuth)
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const messages = {
        google_denied: "Google sign-in was cancelled",
        google_token_failed: "Failed to verify with Google. Please try again.",
        google_no_email: "No email received from Google. Please allow email access.",
        google_failed: "Google sign-in failed. Please try again.",
        account_banned: "Your account has been banned.",
        account_suspended: "Your account is suspended.",
      };
      setError(messages[errorParam] || "Authentication failed. Please try again.");
      return;
    }

    // Extract token from URL hash fragment
    const hash = window.location.hash;
    const tokenMatch = hash.match(/token=([^&]+)/);

    if (tokenMatch && tokenMatch[1]) {
      const token = tokenMatch[1];
      setAccessToken(token);

      // Clean the URL
      window.history.replaceState(null, "", "/auth/callback");

      fetchMe().then((user) => {
        toast.success("Signed in with Google!");
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else if (user?.role === "admin" || user?.role === "moderator") {
          navigate("/admin/reports", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      });
    } else {
      setError("No authentication token received. Please try signing in again.");
    }
  }, [navigate, searchParams, fetchMe]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="max-w-md text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-rule bg-paper-2">
              <AlertCircle className="h-7 w-7 text-syntax-rose" />
            </div>
          </div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Sign-in failed
          </h2>
          <p className="text-sm text-ink-2">{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-paper btn-primary"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" />
        <p className="font-mono text-sm text-ink-2">Signing you in...</p>
      </div>
    </div>
  );
}
