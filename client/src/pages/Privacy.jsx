import useDocumentTitle from '../hooks/useDocumentTitle';
import React, { useEffect, useState } from "react";
import { Shield, Eye, Database, Share2, Lock, Mail } from "lucide-react";

export default function Privacy() {
  useDocumentTitle("Privacy Policy");
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
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-syntax-cyan/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute top-40 left-0 -z-10 w-[400px] h-[400px] bg-accent/10 blur-[80px] rounded-full pointer-events-none -translate-x-1/2" />

            <header className="mb-16 pb-10 border-b border-rule max-w-3xl relative">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-syntax-cyan/10 text-syntax-cyan font-mono text-[11px] font-semibold uppercase tracking-[0.25em] mb-6 border border-syntax-cyan/20">
                    <Shield className="w-3.5 h-3.5" /> Legal &middot; Effective June 2026
                </div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink mb-6 flex flex-col gap-2">
                    Our Privacy
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-syntax-cyan to-accent">& Policy</span>
                </h1>
                <p className="text-lg sm:text-xl text-ink-2 leading-relaxed">
                    We care about your privacy. This policy explains how we collect, use, and protect your personal information when you use The Quad.
                </p>
            </header>

            <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-16">
                {/* Content */}
                <div className="flex-1 max-w-3xl prose prose-invert text-ink-2 space-y-16 pb-16">
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
                </div>

                {/* Sticky Sidebar */}
                <aside className="lg:w-72 shrink-0 pb-12">
                    <div className="sticky top-24 rounded-3xl border border-rule bg-paper/60 backdrop-blur-xl shadow-sm p-5">
                        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-3 mb-5 px-3">Table of Contents</h3>
                        <nav className="flex flex-col gap-2">
                            {sections.map((s) => {
                                const Icon = s.icon;
                                const isActive = activeSection === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => scrollTo(s.id)}
                                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-medium text-left transition-all duration-300 ${
                                            isActive 
                                                ? "bg-ink text-paper shadow-md translate-x-1" 
                                                : "text-ink-2 hover:bg-paper-2 hover:text-ink hover:translate-x-1 border border-transparent hover:border-rule"
                                        }`}
                                    >
                                        <Icon className={`w-4.5 h-4.5 ${isActive ? "text-paper" : "text-ink-3"}`} />
                                        {s.title}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>
            </div>

            <section className="mt-8 border-t border-rule pt-16">
                <div className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-12 text-center flex flex-col items-center border border-rule shadow-xl bg-gradient-to-br from-paper via-paper-2 to-syntax-cyan/5">
                    {/* Decorative background blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-syntax-cyan/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                    
                    <div className="w-16 h-16 bg-paper rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-rule relative z-10 -rotate-3">
                        <Mail className="w-8 h-8 text-syntax-cyan" />
                    </div>
                    
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4 relative z-10 tracking-tight">Privacy Concerns?</h2>
                    <p className="text-ink-2 text-lg mb-10 max-w-xl relative z-10">
                        If you have any questions or concerns about this Privacy Policy or our data practices, please get in touch with our Data Protection Officer.
                    </p>
                    
                    <a 
                        href="mailto:thequad.community@gmail.com" 
                        className="relative z-10 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-ink text-paper font-semibold hover:bg-ink-2 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-ink/20"
                    >
                        Email Privacy Team
                    </a>
                </div>
            </section>
        </div>
    );
}
