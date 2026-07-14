import useDocumentTitle from '../hooks/useDocumentTitle';
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Braces,
  ArrowRight,
  Loader2,
  Terminal,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export default function VerifyEmail() {
  useDocumentTitle("Verify Email");
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // If accessed directly without an email in state, redirect to login
      navigate("/login");
    }
  }, [location, navigate]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      toast.success("Email verified! Welcome to The Quad.");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    try {
      await authApi.resendOtp({ email });
      toast.success("A new code has been sent to your email.");
      setCooldown(60); // 60s cooldown
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend code";
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  if (!email) return null; // Avoid flicker before redirect

  return (
    <div className="min-h-screen bg-paper flex">
      <div className="dot-bg pointer-events-none fixed inset-0 opacity-40" />
      <div className="paper-grain pointer-events-none fixed inset-0" />

      {/* ──── LEFT PANEL — Branding ──────────────────────────────────── */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between border-r border-rule">
        <div className="aurora" />
        <div className="absolute inset-0 grid-bg opacity-40" />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-12 xl:p-16">
          <Link to="/" className="group flex items-baseline gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-rule bg-paper-2/80 transition-colors group-hover:border-accent">
              <Braces className="h-5 w-5 text-accent" strokeWidth={2} />
            </span>
            <span className="font-display text-2xl font-bold text-ink">
              Peer<span className="font-display-italic text-accent">Verse</span>
            </span>
          </Link>

          <div className="my-auto max-w-lg">
            <p className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-3">
              <Terminal className="h-3.5 w-3.5 text-accent" />
              verify your account
            </p>

            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink xl:text-6xl">
              Check your{" "}
              <span className="font-display-italic text-accent">inbox</span>
              <span className="caret" />
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-2">
              We've sent a 6-digit verification code to <strong>{email}</strong>. 
              Please enter it to verify your account and join the community.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm text-ink-2">
              Ready to <span className="font-semibold text-ink">build your profile</span>.
            </p>
          </div>
        </div>
      </div>

      {/* ──── RIGHT PANEL — Form ─────────────────────────────────────── */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-3">
              // email verification
            </p>
            <h2 className="font-display text-5xl font-bold tracking-tight text-ink">
              Enter the <span className="text-accent">Code</span>
            </h2>
            <p className="mt-2 text-sm text-ink-2">
              Sent to {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                6-Digit Code
              </label>
              <Input
                data-testid="verify-otp-input"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="000000"
                className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-paper-2/60 border-rule focus-visible:border-accent/60 focus-visible:ring-accent/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              data-testid="verify-submit"
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-accent py-3 text-sm font-semibold text-paper btn-primary disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Verify Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-ink-2 space-y-4">
            <p>
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="font-semibold text-accent hover:underline disabled:opacity-50 disabled:no-underline inline-flex items-center gap-1"
              >
                {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
              </button>
            </p>
            <p>
              Wrong email?{" "}
              <Link to="/register" className="font-semibold text-accent hover:underline">
                Sign up again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
