import useDocumentTitle from '../hooks/useDocumentTitle';
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Terminal } from "lucide-react";

import api from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const schema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  useDocumentTitle("Reset Password");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", { token, password: data.password });
      toast.success("Password has been successfully reset. Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="font-display text-2xl font-bold text-ink">Invalid Link</h2>
          <p className="text-ink-2">This password reset link is invalid or missing the token parameter.</p>
          <Button onClick={() => navigate("/forgot-password")}>Request a new link</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100vw] sm:min-h-screen bg-paper flex">
      <div className="dot-bg pointer-events-none fixed inset-0 opacity-40" />
      <div className="paper-grain pointer-events-none fixed inset-0" />

      {/* ──── LEFT PANEL — Branding ──────────────────────────────────── */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between border-r border-rule">
        <div className="aurora" />
        <div className="absolute inset-0 grid-bg opacity-40" />

        <div className="relative z-10 flex flex-1 flex-col justify-center p-12 xl:p-16">
          <div className="mt-14 mb-16 max-w-lg">
            <p className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-3">
              <Terminal className="h-3.5 w-3.5 text-accent" />
              for people who code
            </p>
            <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-ink lg:text-6xl xl:text-7xl">
              An annotated
              <br />
              <span className="font-display-italic text-accent">lab notebook</span>
              <br />
              for tech peers.
            </h1>
          </div>
        </div>
      </div>

      {/* ──── RIGHT PANEL — Form ─────────────────────────────────────── */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-3">
              // secure account
            </p>
            <h2 className="font-display text-5xl font-bold tracking-tight text-ink">
              Reset <span className="text-accent">Password.</span>
            </h2>
            <p className="mt-2 text-sm text-ink-2">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                New Password
              </label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 bg-paper-2/60 border-rule pr-10 focus-visible:border-accent/60 focus-visible:ring-accent/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  {...register("confirmPassword")}
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 bg-paper-2/60 border-rule pr-10 focus-visible:border-accent/60 focus-visible:ring-accent/30"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors"
                >
                  {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-ink text-paper hover:bg-ink/90 font-medium"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <Link to="/login" className="font-mono text-[10px] text-ink-2 hover:text-ink transition-colors">
              &larr; Back to log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
