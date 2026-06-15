import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
  MessageSquare,
  Terminal,
  Target,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { usersApi } from "../services/api";

export default function Register() {
  const { register } = useAuth();
  const { siteSettings } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountExistsError, setAccountExistsError] = useState(false);

  const [topContributors, setTopContributors] = useState([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersCount, contributors] = await Promise.all([
          usersApi.getTotalUsers().catch(() => 0),
          usersApi.getTopContributors().catch(() => [])
        ]);
        setTotalUsersCount(usersCount || 0);
        setTopContributors(contributors || []);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !username || !email || !password || !gender || !dateOfBirth) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const regEmail = await register({ name, username, email, password, gender, dateOfBirth });
      toast.success("Verification code sent to your email.");
      navigate("/verify-email", { state: { email: regEmail } });
    } catch (err) {
      if (err.response?.data?.code === "ACCOUNT_EXISTS") {
        setAccountExistsError(true);
        return;
      }
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "/api"}/auth/google`;
  };

  // Password strength indicator
  const pwStrength = (() => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: "weak", color: "bg-syntax-rose" };
    if (score <= 3) return { level: 2, label: "fair", color: "bg-syntax-amber" };
    return { level: 3, label: "strong", color: "bg-accent-2" };
  })();

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

          {/* Center — Hero */}
          <div className="mt-14 mb-16 max-w-lg">
            <p className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-ink-3">
              <Terminal className="h-3.5 w-3.5 text-accent" />
              build your academic profile
            </p>

            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink xl:text-6xl">
              Start{" "}
              <span className="font-display-italic text-accent">sharing</span>,
              <br />
              start{" "}
              <span className="marker">growing</span>
              <span className="caret" />
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-2">
              Join thousands of students sharing notes, solving problems, and
              building public technical profiles that stand out.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-4">
              <FeatureItem
                icon={BookOpen}
                title="Share resources"
                desc="Upload notes, PYQs, cheat sheets — help someone ace their exam."
              />
              <FeatureItem
                icon={MessageSquare}
                title="Ask & answer"
                desc="Get help from peers who've been where you are."
              />
              <FeatureItem
                icon={Target}
                title="Discover opportunities"
                desc="Find hackathons, internships, and entry-level roles."
              />
            </div>
          </div>

          {/* Bottom — Social proof */}
          <div className="flex items-center gap-3 mt-16">
            {/* Stacked avatars */}
            <div className="flex -space-x-2">
              {topContributors && topContributors.length > 0 ? (
                topContributors.slice(0, 4).map((user, i) => (
                  <div
                    key={user.id || i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-paper bg-paper-2 font-mono text-[10px] font-bold text-ink-2 overflow-hidden"
                    style={{ zIndex: 4 - i }}
                    title={user.name}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      user.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                ))
              ) : (
                ["SK", "DP", "PI", "MC"].map((initials, i) => (
                  <div
                    key={initials}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-paper bg-paper-2 font-mono text-[10px] font-bold text-ink-2"
                    style={{ zIndex: 4 - i }}
                  >
                    {initials}
                  </div>
                ))
              )}
            </div>
            <p className="text-sm text-ink-2">
              <span className="font-semibold text-ink">
                {totalUsersCount > 0 ? totalUsersCount.toLocaleString() : "1,200+"}
              </span> students already joined
            </p>
          </div>
        </div>
      </div>

      {/* ──── RIGHT PANEL — Form ─────────────────────────────────────── */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-10 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-paper-2/60 text-ink-2 hover:text-ink hover:border-accent transition-colors z-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Header */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-3">
              // create account
            </p>
            <h2 className="font-display text-5xl font-bold tracking-tight text-ink">
              Join the <span className="text-accent">Community.</span>
            </h2>
            <p className="mt-2 text-sm text-ink-2">
              Create your PeerVerse profile and start contributing.
            </p>
          </div>

          {siteSettings && siteSettings.registrationEnabled === false ? (
            <div className="rounded-md border border-orange-500/30 bg-orange-500/10 p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20">
                <ShieldAlert className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-ink">Registration Disabled</h3>
              <p className="text-sm text-ink-2 mb-6">
                New user registrations are currently disabled by the administrator. Please check back later.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-paper btn-primary hover:scale-[1.01] transition-all"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Google OAuth */}
              <button
                type="button"
            onClick={handleGoogleRegister}
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
              or use email
            </span>
            <span className="h-px flex-1 bg-rule" />
          </div>

          {/* Form */}
          {accountExistsError ? (
            <div className="rounded-md border border-syntax-rose/30 bg-syntax-rose/10 p-6 text-center shadow-sm">
              <p className="text-ink font-medium mb-6">This email is already registered. Please log in.</p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-accent py-3 text-sm font-semibold text-paper btn-primary hover:scale-[1.01] transition-all"
                >
                  Go to Sign In
                </Link>
                <button
                  type="button"
                  onClick={handleGoogleRegister}
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
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                    Full Name
                  </label>
                  <Input
                    data-testid="register-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
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
                    onChange={(e) =>
                      setUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                      )
                    }
                    placeholder="user_1234"
                    autoComplete="username"
                    className="h-11 bg-paper-2/60 border-rule focus-visible:border-accent/60 focus-visible:ring-accent/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                    Gender
                  </label>
                  <Select value={gender || undefined} onValueChange={setGender}>
                    <SelectTrigger className={`h-11 bg-paper-2 border-rule focus:border-accent/60 focus:ring-accent/30 ${!gender ? "text-ink-3" : "text-ink"}`}>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={`h-11 bg-paper-2 border-rule focus-visible:border-accent/60 focus-visible:ring-accent/30 [color-scheme:light] ${dateOfBirth ? "text-ink" : "text-ink-3"}`}
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
                  placeholder="you@example.email"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {/* Password strength bar */}
                {password && (
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= pwStrength.level ? pwStrength.color : "bg-rule"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[10px] text-ink-3">
                      {pwStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="register-submit"
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-accent py-3 text-sm font-semibold text-paper btn-primary disabled:opacity-50 transition-all hover:scale-[1.01]"
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
          )}
            </>
          )}

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

          {/* Legal */}
          <p className="text-center font-mono text-[10px] text-ink-3 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-ink-2 hover:text-accent cursor-pointer">
              Terms
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

function FeatureItem({ icon: Icon, title, desc }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-rule bg-paper-2/60">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-xs text-ink-2 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
