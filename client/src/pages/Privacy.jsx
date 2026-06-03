import React, { useEffect, useState } from "react";
import { Shield, Eye, Database, Share2, Lock, HelpCircle, Mail } from "lucide-react";

export default function Privacy() {
    const [activeSection, setActiveSection] = useState("collect");

    const sections = [
        { id: "collect", title: "1. Information We Collect", icon: Database },
        { id: "use", title: "2. How We Use Information", icon: Eye },
        { id: "share", title: "3. Sharing of Information", icon: Share2 },
        { id: "security", title: "4. Data Security", icon: Lock },
        { id: "rights", title: "5. Your Privacy Rights", icon: Shield },
        { id: "contact", title: "6. Contact Us", icon: Mail },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections.map(s => document.getElementById(s.id));
            const scrollPosition = window.scrollY + 100;
            
            for (let i = sectionElements.length - 1; i >= 0; i--) {
                const current = sectionElements[i];
                if (current && current.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i].id);
                    break;
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [sections]);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({
                top: el.offsetTop - 80,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12 border-b-2 border-double border-rule pb-8 max-w-4xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-2">Legal &middot; Effective Date: June 2026</p>
                <h1 className="font-display text-4xl sm:text-5xl font-medium leading-tight text-ink mb-4 flex items-center gap-4">
                    <Shield className="w-10 h-10 text-syntax-cyan" />
                    Privacy Policy
                </h1>
                <p className="text-lg text-ink-2">
                    We care about your privacy. This policy explains how we collect, use, and protect your personal information when you use PeerVerse.
                </p>
            </header>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Sticky Sidebar */}
                <aside className="lg:w-64 shrink-0">
                    <div className="sticky top-24 rounded-2xl border border-rule bg-paper-2/40 p-5">
                        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3 mb-4">Table of Contents</h3>
                        <nav className="flex flex-col gap-1">
                            {sections.map((s) => {
                                const Icon = s.icon;
                                const isActive = activeSection === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => scrollTo(s.id)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                                            isActive 
                                                ? "bg-accent/10 text-accent font-semibold" 
                                                : "text-ink-2 hover:bg-paper hover:text-ink"
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-ink-3"}`} />
                                        {s.title}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Content */}
                <div className="flex-1 max-w-3xl prose prose-invert text-ink-2 space-y-12 pb-24">
                    <section id="collect" className="scroll-mt-24">
                        <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center gap-2">
                            1. Information We Collect
                        </h2>
                        <p className="leading-relaxed">
                            We collect information you provide directly to us, such as when you create or modify your account,
                            request on-demand services, contact customer support, or otherwise communicate with us.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4 mt-6">
                            <div className="bg-paper border border-rule rounded-xl p-5">
                                <h4 className="font-semibold text-ink mb-2">Direct Information</h4>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    <li>Name and email address</li>
                                    <li>Username and avatar</li>
                                    <li>Bio and profile details</li>
                                    <li>Questions, posts, and comments</li>
                                </ul>
                            </div>
                            <div className="bg-paper border border-rule rounded-xl p-5">
                                <h4 className="font-semibold text-ink mb-2">Third-Party Data</h4>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    <li>GitHub repositories & stats</li>
                                    <li>LeetCode contest history</li>
                                    <li>Google OAuth profile data</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section id="use" className="scroll-mt-24">
                        <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center gap-2">
                            2. How We Use Information
                        </h2>
                        <p className="leading-relaxed mb-4">
                            We use the information we collect to provide, maintain, and improve our services. Specifically, we use it to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-syntax-cyan">
                            <li>Provide and deliver the products and services you request.</li>
                            <li>Send you technical notices, updates, security alerts, and administrative messages.</li>
                            <li>Respond to your comments, questions, and support requests.</li>
                            <li>Personalize your experience by displaying content, resources, and opportunities tailored to your interests (like your branch or college).</li>
                            <li>Monitor and analyze trends, usage, and activities in connection with our Platform.</li>
                            <li>Calculate reputation scores based on your community interactions.</li>
                        </ul>
                    </section>

                    <section id="share" className="scroll-mt-24">
                        <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center gap-2">
                            3. Sharing of Information
                        </h2>
                        <p className="leading-relaxed mb-4">
                            Your privacy is important to us. We do not sell your personal information. We may share the information we collect only in the following circumstances:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Publicly:</strong> If you submit content in a public forum (like questions, blog posts, comments, or your public profile), it is viewable by the general public.</li>
                            <li><strong>With Third Parties:</strong> Only when you explicitly authorize us to do so (e.g., authenticating via OAuth or linking your GitHub).</li>
                            <li><strong>For Legal Reasons:</strong> In response to a request for information by a competent authority if we believe disclosure is required by any applicable law, regulation, or legal process.</li>
                        </ul>
                    </section>

                    <section id="security" className="scroll-mt-24">
                        <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center gap-2">
                            4. Data Security
                        </h2>
                        <p className="leading-relaxed mb-4">
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        </p>
                        <div className="bg-paper-2 border border-rule rounded-xl p-6">
                            <p className="mb-0 text-sm">
                                All sensitive data, including passwords, are cryptographically hashed using industry-standard algorithms (e.g., bcrypt) before being stored in our database. We enforce TLS/SSL encryption for all data transmission between your browser and our servers.
                            </p>
                        </div>
                    </section>

                    <section id="rights" className="scroll-mt-24">
                        <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center gap-2">
                            5. Your Privacy Rights
                        </h2>
                        <p className="leading-relaxed">
                            Depending on your location, you may have certain rights regarding your personal information, including the right to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-syntax-cyan">
                            <li>Access the personal information we hold about you.</li>
                            <li>Request the correction of inaccurate personal information.</li>
                            <li>Request the deletion of your personal information (right to be forgotten).</li>
                            <li>Opt-out of certain data processing activities.</li>
                        </ul>
                        <p className="leading-relaxed mt-4 text-sm text-ink-3">
                            You can exercise these rights directly within your account settings or by contacting our support team.
                        </p>
                    </section>

                    <section id="contact" className="scroll-mt-24 border-t border-rule pt-12 mt-12">
                        <div className="bg-paper-2 rounded-2xl p-8 text-center flex flex-col items-center">
                            <div className="w-12 h-12 bg-syntax-cyan/10 rounded-full flex items-center justify-center text-syntax-cyan mb-4">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-display font-semibold text-ink mb-2">
                                Privacy Concerns?
                            </h2>
                            <p className="text-ink-2 mb-6 max-w-md">
                                If you have any questions or concerns about this Privacy Policy or our data practices, please get in touch with our Data Protection Officer.
                            </p>
                            <a href="mailto:peerverse.community@gmail.com" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-ink text-paper font-semibold hover:bg-ink-2 transition-colors">
                                Email Privacy Team
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
