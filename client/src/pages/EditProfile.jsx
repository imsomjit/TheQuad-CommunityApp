import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft, Camera, Loader2, Github, Linkedin, Twitter, Instagram,
    Globe, Building2, MapPin, BookOpen, Plus, Code2, Save,
} from "lucide-react";
import { usersApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { getAvatarFallback, getBannerFallback } from "../utils/fallbacks";
import Loader from "../components/Loader";
import NetworkBanner from "../components/NetworkBanner";
import { toast } from "sonner";

export default function EditProfile() {
    const navigate = useNavigate();
    const { currentUser } = useApp();
    const { isAuthenticated, updateUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    // Form state
    const [form, setForm] = useState({
        name: "", bio: "", location: "", organization: "", website: "",
        college: "", branch: "", graduationYear: "",
        githubUsername: "", linkedinUrl: "", twitterHandle: "", instagramHandle: "", leetcodeUsername: "",
    });
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState("");

    // Upload previews
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    const [saving, setSaving] = useState(false);
    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated || !currentUser?.username) {
            navigate("/login");
            return;
        }

        usersApi.getProfile(currentUser.username)
            .then(p => {
                setProfile(p);
                setForm({
                    name: p.name || "",
                    bio: p.bio || "",
                    location: p.location || "",
                    organization: p.organization || "",
                    website: p.website || "",
                    college: p.college || "",
                    branch: p.branch || "",
                    graduationYear: p.graduationYear || "",
                    githubUsername: p.githubUsername || "",
                    linkedinUrl: p.linkedinUrl || "",
                    twitterHandle: p.twitterHandle || "",
                    instagramHandle: p.instagramHandle || "",
                    leetcodeUsername: p.leetcodeUsername || "",
                });
                setSkills(p.skills || []);
                setAvatarPreview(p.avatarUrl || null);
                setBannerPreview(p.bannerUrl || null);
            })
            .catch(() => {
                toast.error("Failed to load profile");
                navigate(`/u/${currentUser.username}`);
            })
            .finally(() => setLoading(false));
    }, [isAuthenticated, currentUser, navigate]);

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const onAvatarPick = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const onBannerPick = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const addSkill = (e) => {
        e?.preventDefault();
        const s = skillInput.trim().replace(/^#/, "").toLowerCase();
        if (s && !skills.includes(s) && skills.length < 20) {
            setSkills(prev => [...prev, s]);
        }
        setSkillInput("");
    };

    const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s));

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Upload avatar if changed
            if (avatarFile) {
                const fd = new FormData();
                fd.append("avatar", avatarFile);
                await usersApi.uploadAvatar(fd);
            }

            // 2. Upload banner if changed
            if (bannerFile) {
                const fd = new FormData();
                fd.append("banner", bannerFile);
                await usersApi.uploadBanner(fd);
            }

            // 3. Update profile fields
            const patch = {
                ...form,
                skills,
                graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
            };
            
            if (!patch.website) delete patch.website;
            if (!patch.linkedinUrl) delete patch.linkedinUrl;

            const updatedProfile = await usersApi.updateProfile(patch);
            
            // Refresh global user state to update navbar avatar etc.
            if (updateUser) {
                updateUser(updatedProfile);
            }

            toast.success("Profile updated!");
            navigate(`/u/${currentUser.username}`);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to save";
            toast.error(msg);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="py-60 flex justify-center">
                <Loader text="Loading profile editor..." />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-6">
                <Link to={`/u/${currentUser.username}`} className="p-2 rounded-sm text-ink-3 hover:text-ink hover:bg-paper-2 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-display text-2xl font-bold text-ink">Edit Profile</h1>
            </div>

            <div className="bg-paper border border-rule rounded-sm shadow-sm overflow-hidden">
                {/* ── Banner + Avatar ─────────────────────────────────────── */}
                <div className="relative h-48 sm:h-56 bg-paper-2 group cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
                    {(bannerPreview || currentUser.bannerUrl).startsWith("data:image/svg+xml") ? (
                        <NetworkBanner username={currentUser.username} className="absolute inset-0 z-0" />
                    ) : (
                        <img 
                            src={bannerPreview || currentUser.bannerUrl} 
                            alt="" 
                            className="w-full h-full object-cover relative z-0" 
                        />
                    )}
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="flex items-center gap-1.5 text-white text-sm font-mono">
                            <Camera className="w-4 h-4" /> Change banner image
                        </span>
                    </div>
                </div>
                <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={onBannerPick} />

                <div className="px-6 sm:px-10 pb-10">
                    <div className="-mt-12 sm:-mt-16 mb-8 relative w-24 h-24 sm:w-32 sm:h-32 cursor-pointer group" onClick={() => avatarInputRef.current?.click()}>
                        <img 
                            src={avatarPreview || getAvatarFallback(profile?.name, currentUser.username)} 
                            alt=""
                            className="w-full h-full rounded-full border-4 border-paper object-cover bg-paper shadow-md" 
                        />
                        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarPick} />

                    <div className="space-y-10">
                        {/* ── Basic info ──────────────────────────────────────────── */}
                        <section className="space-y-4">
                            <label className="section-label">Basic Info</label>
                            <Field label="Display name" required>
                                <input value={form.name} onChange={set("name")} maxLength={120} className="field-input" placeholder="Your full name" />
                            </Field>
                            <Field label="Bio">
                                <textarea value={form.bio} onChange={set("bio")} maxLength={500} rows={3} className="field-input resize-none" placeholder="Tell the community a bit about yourself…" />
                                <p className="text-right text-[10px] font-mono text-ink-3 mt-1">{form.bio.length}/500</p>
                            </Field>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Location">
                                    <div className="field-icon-wrap">
                                        <MapPin className="field-icon" />
                                        <input value={form.location} onChange={set("location")} maxLength={100} className="field-input pl-8" placeholder="City, Country" />
                                    </div>
                                </Field>
                                <Field label="Organization">
                                    <div className="field-icon-wrap">
                                        <Building2 className="field-icon" />
                                        <input value={form.organization} onChange={set("organization")} maxLength={200} className="field-input pl-8" placeholder="Company / Startup" />
                                    </div>
                                </Field>
                            </div>
                            <Field label="Website">
                                <div className="field-icon-wrap">
                                    <Globe className="field-icon" />
                                    <input value={form.website} onChange={set("website")} type="url" className="field-input pl-8" placeholder="https://yoursite.com" />
                                </div>
                            </Field>
                        </section>

                        {/* ── Academic ────────────────────────────────────────────── */}
                        <section className="space-y-4">
                            <label className="section-label">Academic</label>
                            <Field label="College / University">
                                <div className="field-icon-wrap">
                                    <BookOpen className="field-icon" />
                                    <input value={form.college} onChange={set("college")} maxLength={200} className="field-input pl-8" placeholder="in short e.g. MCET or IIT Bombay" />
                                </div>
                            </Field>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Branch / Major">
                                    <input value={form.branch} onChange={set("branch")} maxLength={200} className="field-input" placeholder="Computer Science" />
                                </Field>
                                <Field label="Graduation Year">
                                    <input value={form.graduationYear} onChange={set("graduationYear")} type="number" min={2000} max={2050} className="field-input" placeholder="2026" />
                                </Field>
                            </div>
                        </section>

                        {/* ── Skills ──────────────────────────────────────────────── */}
                        <section className="space-y-3">
                            <label className="section-label">Skills <span className="text-ink-3 font-normal">({skills.length}/20)</span></label>
                            <div className="flex flex-wrap gap-2 min-h-[32px]">
                                {skills.map(s => (
                                    <span key={s} className="inline-flex items-center gap-1.5 rounded-sm border border-rule bg-paper-2 px-3 py-1.5 text-xs font-mono text-ink">
                                        {s}
                                        <button type="button" onClick={() => removeSkill(s)} className="text-ink-3 hover:text-red-400 transition-colors">×</button>
                                    </span>
                                ))}
                            </div>
                            <form onSubmit={addSkill} className="flex gap-2">
                                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} className="field-input flex-1" placeholder="e.g. React, DSA, Python…" maxLength={50} />
                                <button type="submit" disabled={!skillInput.trim() || skills.length >= 20} className="inline-flex items-center gap-1 rounded-sm border border-rule bg-paper-2 px-4 py-2 text-sm font-mono text-ink hover:border-ink-3 transition-colors disabled:opacity-40">
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </form>
                        </section>

                        {/* ── Social & developer links ─────────────────────────────── */}
                        <section className="space-y-4">
                            <label className="section-label">Social & Developer Links</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="GitHub username">
                                    <div className="field-icon-wrap">
                                        <Github className="field-icon" />
                                        <input value={form.githubUsername} onChange={set("githubUsername")} maxLength={100} className="field-input pl-8" placeholder="your-github-handle" />
                                    </div>
                                </Field>
                                <Field label="LeetCode username">
                                    <div className="field-icon-wrap">
                                        <Code2 className="field-icon" />
                                        <input value={form.leetcodeUsername} onChange={set("leetcodeUsername")} maxLength={50} className="field-input pl-8" placeholder="your-leetcode-handle" />
                                    </div>
                                </Field>
                            </div>
                            <Field label="LinkedIn URL">
                                <div className="field-icon-wrap">
                                    <Linkedin className="field-icon" />
                                    <input value={form.linkedinUrl} onChange={set("linkedinUrl")} type="url" className="field-input pl-8" placeholder="https://linkedin.com/in/you" />
                                </div>
                            </Field>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="X / Twitter handle">
                                    <div className="field-icon-wrap">
                                        <Twitter className="field-icon" />
                                        <input value={form.twitterHandle} onChange={set("twitterHandle")} maxLength={50} className="field-input pl-8" placeholder="handle (no @)" />
                                    </div>
                                </Field>
                                <Field label="Instagram handle">
                                    <div className="field-icon-wrap">
                                        <Instagram className="field-icon" />
                                        <input value={form.instagramHandle} onChange={set("instagramHandle")} maxLength={50} className="field-input pl-8" placeholder="handle (no @)" />
                                    </div>
                                </Field>
                            </div>
                        </section>

                        {/* Footer Actions */}
                        <div className="pt-8 border-t border-rule flex items-center justify-end gap-4">
                            <Link to={`/u/${currentUser.username}`} className="text-sm font-medium text-ink-3 hover:text-ink transition-colors">
                                Cancel
                            </Link>
                            <button onClick={handleSave} disabled={saving || !form.name.trim()} className="inline-flex items-center gap-2 rounded-sm bg-accent px-6 py-2.5 text-sm font-semibold text-paper hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? "Saving…" : "Save changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children, required }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-mono text-ink-2 uppercase tracking-wider">
                {label}{required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}
