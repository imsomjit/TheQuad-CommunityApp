import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Braces,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
  Target,
  Users,
  Terminal,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { resourcesApi, booksApi, opportunitiesApi, usersApi } from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleAuthRequired, setGoogleAuthRequired] = useState(false);

  const [stats, setStats] = useState({
    contents: "2.4k",
    opportunities: "860",
    students: "1.2k"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resRes, booksRes, oppsRes, upcomingOpps, usersCount] = await Promise.all([
          resourcesApi.list({ limit: 1 }).catch(() => null),
          booksApi.list({ limit: 1 }).catch(() => null),
          opportunitiesApi.list({ status: "ONGOING", limit: 1 }).catch(() => null),
          opportunitiesApi.list({ status: "UPCOMING", limit: 1 }).catch(() => null),
          usersApi.getTotalUsers().catch(() => 0)
        ]);

        const getCount = (res) => {
          if (!res) return 0;
          if (res.pagination?.total) return Number(res.pagination.total);
          if (res.data?.pagination?.total) return Number(res.data.pagination.total);
          return 0;
        };

        const resCount = getCount(resRes);
        const booksCount = getCount(booksRes);
        const contentsCount = resCount + booksCount;

        const oppsCount = getCount(oppsRes) + getCount(upcomingOpps);

        const formatNumber = (num) => {
          if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
          return num.toString();
        };

        setStats(prev => ({
          contents: contentsCount > 0 ? formatNumber(contentsCount) : prev.contents,
          opportunities: oppsCount > 0 ? formatNumber(oppsCount) : prev.opportunities,
          students: usersCount > 0 ? formatNumber(usersCount) : prev.students
        }));
      } catch (error) {
        console.error("Failed to fetch login stats", error);
      }
    };
    fetchStats();
  }, []);

  // Show error toasts from OAuth redirects
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      const messages = {
        google_denied: "Google sign-in was cancelled",
        google_token_failed: "Failed to verify with Google. Please try again.",
        google_no_email: "No email received from Google. Please allow email access.",
        google_failed: "Google sign-in failed. Please try again.",
        account_banned: "Your account has been banned.",
        account_suspended: "Your account is suspended.",
      };
      toast.error(messages[err] || "Authentication failed");
      setSearchParams({}, { replace: true }); // clean URL
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login({ email, password });
      toast.success("Welcome back!");
      
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from);
      } else if (loggedInUser.role === "admin") {
        navigate("/admin/reports");
      } else {
        navigate("/");
      }
    } catch (err) {
      if (err.response?.data?.code === "UNVERIFIED_EMAIL") {
        toast.error("Please verify your email to log in.");
        navigate("/verify-email", { state: { email } });
        return;
      }
      if (err.response?.data?.code === "GOOGLE_AUTH_REQUIRED") {
        setGoogleAuthRequired(true);
        return;
      }
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to server-side Google OAuth flow
    window.location.href = `${import.meta.env.VITE_API_URL || "/api"}/auth/google`;
  };

  return (
    <div className="min-h-[100vw] sm:min-h-screen bg-paper flex">
      {/* Backdrop textures */}
      <div className="dot-bg pointer-events-none fixed inset-0 opacity-40" />
      <div className="paper-grain pointer-events-none fixed inset-0" />

      {/* ──── LEFT PANEL — Branding ──────────────────────────────────── */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between border-r border-rule">
        {/* Aurora background */}
        <div className="aurora" />
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-center p-12 xl:p-16">

          {/* Center — Hero text */}
          <div className="mt-14 mb-16 max-w-lg">
            <p className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-3">
              <Terminal className="h-3.5 w-3.5 text-accent" />
              for people who code
            </p>

            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink xl:text-6xl">
              Your{" "}
              <span className="font-display-italic text-accent">learning</span>{" "}
              notebook awaits
              <span className="caret" />
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-2">
              Share annotated notes, debate past-year papers, and grow a public
              technical profile — all in one place.
            </p>

            {/* Stats strip */}
            <div className="mt-10 flex gap-8">
              <StatPill icon={BookOpen} value={stats.contents} label="contents" />
              <StatPill icon={Target} value={stats.opportunities} label="opportunities" />
              <StatPill icon={Users} value={stats.students} label="learners" />
            </div>
          </div>

          {/* Bottom — Quote */}
          <div className="rounded-md mt-16 border border-rule bg-paper p-5 backdrop-blur-sm">
            <p className="text-sm leading-relaxed text-ink italic">
              <span className="text-accent">❝</span> Live as if you were to die tomorrow. Learn as if you were to live forever. <span className="text-accent">❞</span>
            </p>
            <div className="w-full text-right">
              <div>
                <p className="text-sm font-medium text-accent font-mono">Mahatma Gandhi</p>
                <p className="font-mono text-[10px] text-ink-2">
                  Indian Leader
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──── RIGHT PANEL — Form ─────────────────────────────────────── */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-paper-2/60 text-ink-2 hover:text-ink hover:border-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Header */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-3">
              // sign in
            </p>
            <h2 className="font-display text-5xl font-bold tracking-tight text-ink">
              Welcome <span className="text-accent">Back.</span>
            </h2>
            <p className="mt-2 text-sm text-ink-2">
              Pick up right where you left off.
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-rule bg-paper-2/60 py-3 text-sm font-medium text-ink transition-all hover:border-ink-3 hover:bg-paper-2 hover:shadow-lg"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-rule" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
              or sign in with email
            </span>
            <span className="h-px flex-1 bg-rule" />
          </div>

          {/* Email Form */}
          {googleAuthRequired ? (
            <div className="rounded-md border border-accent/30 bg-accent-soft/30 p-6 text-center shadow-sm">
              <p className="text-ink font-medium mb-6">This account uses Google Sign-In.</p>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-md border border-rule bg-paper py-3 text-sm font-medium text-ink transition-all hover:border-ink-3 hover:shadow-md"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                  Email
                </label>
                <Input
                  data-testid="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.email"
                  autoComplete="email"
                  className="h-11 bg-paper-2/60 border-rule focus-visible:border-accent/60 focus-visible:ring-accent/30"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-mono text-[10px] text-accent hover:underline"
                  >
                    forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    data-testid="login-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 bg-paper-2/60 border-rule pr-10 focus-visible:border-accent/60 focus-visible:ring-accent/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit"
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-accent py-3 text-sm font-semibold text-paper btn-primary disabled:opacity-50 transition-all hover:scale-[1.01]"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign in <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-sm text-ink-2">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-accent hover:underline"
            >
              Create one
            </Link>
          </p>

          {/* Legal */}
          <p className="text-center font-mono text-[10px] text-ink-3 leading-relaxed">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="text-ink-2 hover:text-accent cursor-pointer">
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-ink-2 hover:text-accent cursor-pointer">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-rule bg-paper-2/60">
        <Icon className="h-3.5 w-3.5 text-accent" />
      </div>
      <div>
        <div className="font-mono text-sm font-bold tabular-nums text-ink">
          {value}
        </div>
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3">
          {label}
        </div>
      </div>
    </div>
  );
}
