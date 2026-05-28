import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Braces, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center fade-in-up">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-rule bg-paper-2 transition-colors group-hover:border-accent">
              <Braces className="h-5 w-5 text-accent" strokeWidth={2} />
            </span>
            <span className="font-display text-2xl font-bold text-ink">
              Peer<span className="font-display-italic text-accent">Verse</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-ink-2">
            Sign in to your account to continue learning.
          </p>
        </div>

        {/* Form */}
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
              placeholder="you@university.edu"
              autoComplete="email"
              className="h-11 bg-paper-2/60 border-rule focus-visible:border-accent/60 focus-visible:ring-accent/30"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
              Password
            </label>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit"
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-accent py-3 text-sm font-semibold text-paper glow-btn disabled:opacity-50 transition-all hover:scale-[1.01]"
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
      </div>
    </div>
  );
}
