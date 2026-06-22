import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Braces, Terminal } from "lucide-react";

import api from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const schema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
});

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/forgot-password", data);
      setSuccess(true);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100vw] sm:min-h-screen bg-paper flex">
      {/* Backdrop textures */}
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

          <div className="rounded-sm mt-16 border border-rule bg-paper/80 p-5 backdrop-blur-sm">
            <p className="text-sm leading-relaxed text-ink italic">
              <span className="text-accent">❝</span> Live as if you were to die tomorrow. Learn as if you were to live forever. <span className="text-accent">❞</span>
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink-3">
              — Mahatma Gandhi
            </p>
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
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-3">
              // password reset
            </p>
            <h2 className="font-display text-5xl font-bold tracking-tight text-ink">
              Forgot <span className="text-accent">Password?</span>
            </h2>
            <p className="mt-2 text-sm text-ink-2">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {success ? (
            <div className="rounded-sm border border-rule bg-paper-2 p-6 text-center">
              <h3 className="font-mono text-sm font-semibold text-ink mb-2">Check your email</h3>
              <p className="text-sm text-ink-2 mb-6">
                If an account exists for this email, we have sent a password reset link.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Return to log in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                  Email
                </label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.email"
                  className="h-11 bg-paper-2/60 border-rule focus-visible:border-accent/60 focus-visible:ring-accent/30"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-ink text-paper hover:bg-ink/90 font-medium"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>
          )}

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
