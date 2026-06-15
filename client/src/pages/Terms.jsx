import React, { useEffect, useState } from "react";
import { Scale, UserCheck, ShieldAlert, FileText, AlertTriangle, Copyright, HelpCircle } from "lucide-react";

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
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-syntax-rose/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute top-40 left-0 -z-10 w-[400px] h-[400px] bg-accent/10 blur-[80px] rounded-full pointer-events-none -translate-x-1/2" />

            <header className="mb-16 pb-10 border-b border-rule max-w-3xl relative">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-syntax-rose/10 text-syntax-rose font-mono text-[11px] font-semibold uppercase tracking-[0.25em] mb-6 border border-syntax-rose/20">
                    <Scale className="w-3.5 h-3.5" /> Legal &middot; Effective June 2026
                </div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink mb-6 flex flex-col gap-2">
                    Terms of
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-syntax-rose to-accent">Service</span>
                </h1>
                <p className="text-lg sm:text-xl text-ink-2 leading-relaxed">
                    Please read these terms carefully before using the PeerVerse platform. By accessing or using our services, you agree to be bound by these terms and all terms incorporated by reference.
                </p>
            </header>

            <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-16">
                {/* Content */}
                <div className="flex-1 max-w-3xl prose prose-invert text-ink-2 space-y-16 pb-16">
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
                <div className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-12 text-center flex flex-col items-center border border-rule shadow-xl bg-gradient-to-br from-paper via-paper-2 to-syntax-rose/5">
                    {/* Decorative background blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-syntax-rose/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                    
                    <div className="w-16 h-16 bg-paper rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-rule relative z-10 -rotate-3">
                        <HelpCircle className="w-8 h-8 text-syntax-rose" />
                    </div>
                    
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4 relative z-10 tracking-tight">Questions about these Terms?</h2>
                    <p className="text-ink-2 text-lg mb-10 max-w-xl relative z-10">
                        If you have any questions, concerns, or feedback regarding our Terms of Service, our legal team is here to help.
                    </p>
                    
                    <a 
                        href="mailto:peerverse.community@gmail.com" 
                        className="relative z-10 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-ink text-paper font-semibold hover:bg-ink-2 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-ink/20"
                    >
                        Contact Legal Team
                    </a>
                </div>
            </section>
        </div>
    );
}
