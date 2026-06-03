import React, { useEffect, useState } from "react";
import { Scale, UserCheck, ShieldAlert, FileText, AlertTriangle, Copyright, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
    const [activeSection, setActiveSection] = useState("acceptance");

    const sections = [
        { id: "acceptance", title: "1. Acceptance of Terms", icon: UserCheck },
        { id: "conduct", title: "2. User Conduct", icon: Scale },
        { id: "content", title: "3. Content Ownership", icon: Copyright },
        { id: "termination", title: "4. Termination", icon: AlertTriangle },
        { id: "liability", title: "5. Limitation of Liability", icon: ShieldAlert },
        { id: "changes", title: "6. Changes to Terms", icon: FileText },
        { id: "contact", title: "7. Contact Us", icon: HelpCircle },
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
                    <Scale className="w-10 h-10 text-syntax-rose" />
                    Terms of Service
                </h1>
                <p className="text-lg text-ink-2">
                    Please read these terms carefully before using the PeerVerse platform. By accessing or using our services, you agree to be bound by these terms and all terms incorporated by reference.
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
                    <section id="acceptance" className="scroll-mt-24">
                        <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center gap-2">
                            1. Acceptance of Terms
                        </h2>
                        <p className="leading-relaxed">
                            By accessing or using PeerVerse ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services. PeerVerse provides a community-driven platform for developers, students, and professionals to share resources, code, and collaborate.
                        </p>
                        <p className="leading-relaxed mt-4">
                            You must be at least 13 years old to use the Platform. By agreeing to these Terms, you represent and warrant that you are legally capable of entering into a binding contract.
                        </p>
                    </section>

                    <section id="conduct" className="scroll-mt-24">
                        <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center gap-2">
                            2. User Conduct & Acceptable Use
                        </h2>
                        <p className="leading-relaxed mb-4">
                            PeerVerse is built on mutual respect. You agree to use the Platform only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Platform.
                        </p>
                        <div className="bg-paper border border-rule rounded-xl p-6">
                            <h4 className="font-semibold text-ink mb-3">You agree not to:</h4>
                            <ul className="list-disc pl-5 space-y-2 marker:text-accent">
                                <li>Upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, or obscene.</li>
                                <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
                                <li>Upload, post, or transmit any content that infringes any patent, trademark, trade secret, copyright or other proprietary rights of any party.</li>
                                <li>Distribute unsolicited promotional materials, spam, pyramid schemes, or any other form of solicitation.</li>
                                <li>Attempt to gain unauthorized access to any portion of the Platform, or any other systems or networks connected to the Platform.</li>
                            </ul>
                        </div>
                    </section>

                    <section id="content" className="scroll-mt-24">
                        <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center gap-2">
                            3. Content Ownership and Licensing
                        </h2>
                        <p className="leading-relaxed">
                            <strong>Your Content:</strong> You retain all ownership rights to any content you submit, post, or display on or through the Platform (including code, articles, questions, and resources).
                        </p>
                        <p className="leading-relaxed mt-4">
                            <strong>License to PeerVerse:</strong> By submitting content, you grant us a worldwide, non-exclusive, royalty-free, transferable license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content to operate and improve the Platform. 
                        </p>
                        <p className="leading-relaxed mt-4">
                            <strong>Responsibility:</strong> You are solely responsible for your content and the consequences of posting it. PeerVerse takes no responsibility and assumes no liability for any content posted by you or any third party.
                        </p>
                    </section>

                    <section id="termination" className="scroll-mt-24">
                        <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center gap-2">
                            4. Termination
                        </h2>
                        <p className="leading-relaxed">
                            We may terminate or suspend your account and bar access to the Platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                        </p>
                        <p className="leading-relaxed mt-4">
                            If you wish to terminate your account, you may simply discontinue using the Platform or request account deletion via your settings panel. All provisions of the Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                        </p>
                    </section>

                    <section id="liability" className="scroll-mt-24">
                        <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center gap-2">
                            5. Limitation of Liability
                        </h2>
                        <div className="border-l-4 border-syntax-amber pl-5 italic text-ink-2">
                            <p className="leading-relaxed mb-4">
                                The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. PeerVerse makes no representations or warranties of any kind, express or implied, as to the operation of their services, or the information, content, or materials included therein.
                            </p>
                            <p className="leading-relaxed">
                                In no event shall PeerVerse, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Platform.
                            </p>
                        </div>
                    </section>

                    <section id="changes" className="scroll-mt-24">
                        <h2 className="text-2xl font-display font-semibold text-ink mb-4 flex items-center gap-2">
                            6. Changes to Terms
                        </h2>
                        <p className="leading-relaxed">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Platform after any revisions become effective, you agree to be bound by the revised terms.
                        </p>
                    </section>

                    <section id="contact" className="scroll-mt-24 border-t border-rule pt-12 mt-12">
                        <div className="bg-paper-2 rounded-2xl p-8 text-center flex flex-col items-center">
                            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-display font-semibold text-ink mb-2">
                                Questions about these Terms?
                            </h2>
                            <p className="text-ink-2 mb-6 max-w-md">
                                If you have any questions, concerns, or feedback regarding our Terms of Service, our legal team is here to help.
                            </p>
                            <a href="mailto:peerverse.community@gmail.com" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-ink text-paper font-semibold hover:bg-ink-2 transition-colors">
                                Contact Legal Team
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
