import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Braces, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !username || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register({ name, username, email, password });
      toast.success("Account created! Welcome to PeerVerse.");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
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
            Join the community
          </h1>
          <p className="mt-2 text-sm text-ink-2">
            Create your PeerVerse profile and start sharing.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                Full Name
              </label>
              <Input
                data-testid="register-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Mehta"
                autoComplete="name"
                className="h-11 bg-paper-2/60 border-rule focus-visible:border-accent/60 focus-visible:ring-accent/30"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                Username
              </label>
              <Input
                data-testid="register-username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                placeholder="aarav.dev"
                autoComplete="username"
                className="h-11 bg-paper-2/60 border-rule focus-visible:border-accent/60 focus-visible:ring-accent/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
              Email
            </label>
            <Input
              data-testid="register-email"
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
                data-testid="register-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 8 characters"
                autoComplete="new-password"
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
            <p className="font-mono text-[10px] text-ink-3">
              min 8 chars · will be hashed with bcrypt
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="register-submit"
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-accent py-3 text-sm font-semibold text-paper glow-btn disabled:opacity-50 transition-all hover:scale-[1.01]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Create account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-ink-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-accent hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
