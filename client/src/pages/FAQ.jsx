import React, { useState, useEffect } from "react";
import { HelpCircle, User, Star, PenTool, ShieldAlert, Code } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../components/ui/accordion";

export default function FAQ() {
    const [activeSection, setActiveSection] = useState("general");

    const categories = [
        { id: "general", title: "General Questions", icon: HelpCircle },
        { id: "account", title: "Account & Profile", icon: User },
        { id: "reputation", title: "Reputation & Points", icon: Star },
        { id: "content", title: "Posting Content", icon: PenTool },
        { id: "moderation", title: "Moderation & Safety", icon: ShieldAlert },
        { id: "integrations", title: "Platform Integrations", icon: Code },
    ];

    const faqs = {
        general: [
            {
                question: "What is The Quad?",
                answer: "The Quad is a community platform designed for students and developers to share resources, ask technical questions, write engineering blog posts, and discover coding opportunities all in one unified ecosystem."
            },
            {
                question: "Is The Quad completely free?",
                answer: "Yes, The Quad is 100% free for all users. Our goal is to democratize access to educational resources and foster a collaborative environment without any paywalls."
            },
            {
                question: "Can I bookmark resources for later?",
                answer: "Yes! You can click the bookmark icon on any resource, question, post, or opportunity to save it. You can view all your bookmarked items on your personal profile page under the 'Bookmarks' tab."
            }
        ],
        account: [
            {
                question: "How do I update my profile details?",
                answer: "You can update your profile by navigating to Settings > Profile. There you can change your display name, bio, social links, college, and branch. Note that your username cannot be changed after registration."
            },
            {
                question: "How do I delete my account?",
                answer: "You can request account deletion in the Account Settings tab. Once confirmed, all your personal data will be wiped. Your public posts and questions will remain but will be attributed to 'Anonymous'."
            }
        ],
        reputation: [
            {
                question: "How do I earn reputation points?",
                answer: "You earn points when the community finds your contributions valuable: receiving an upvote on a Question (+4), Answer (+15), Resource (+10), or Blog Post (+10). If you cast an upvote on someone else's content, you also earn +3 points for participating!"
            },
            {
                question: "Can I lose reputation points?",
                answer: "Yes. If your content receives downvotes, you will lose a small amount of reputation. Significant reputation penalties may apply if your content is flagged and removed by moderators for violating our terms of service."
            },
            {
                question: "What are the 'Monthly Top Contributors'?",
                answer: "The top contributors leaderboard on the home page resets every month. It highlights the users who have earned the most reputation points within the current calendar month."
            }
        ],
        content: [
            {
                question: "Can I use markdown in my posts and questions?",
                answer: "Yes! The Quad fully supports GitHub-flavored markdown, including code blocks with syntax highlighting, tables, task lists, and inline math formatting for both questions and blog posts."
            },
            {
                question: "What's the difference between a 'Resource' and a 'Blog Post'?",
                answer: "Resources are typically quick uploads like class notes, PDF papers, or cheat sheets. Blog Posts are full-fledged articles, tutorials, or editorial pieces written directly in our markdown editor."
            },
            {
                question: "Can I upload images?",
                answer: "Yes, you can upload cover images for your blog posts and embed images directly into the markdown body of your posts and questions using the image upload tool."
            }
        ],
        moderation: [
            {
                question: "How do I report inappropriate content?",
                answer: "You can report any post, question, or resource by clicking the flag icon (Report) on the content. Our moderation team reviews reports daily and takes appropriate action to keep the community safe."
            },
            {
                question: "What happens if I get suspended?",
                answer: "If you violate community guidelines, moderators may suspend your account temporarily or permanently. During a suspension, you can log in to view content but cannot post, comment, or vote."
            },
            {
                question: "How can I recover my content after accidental deletion?",
                answer: "When you or a moderator delete content, it is 'soft-deleted' and hidden from the platform for a 14-day Recovery Window. If you accidentally deleted something, you can email our support team at thequad.community@gmail.com within 14 days to request recovery. After 14 days, the content is permanently erased from our servers."
            }
        ],
        integrations: [
            {
                question: "How do I connect my GitHub or LeetCode?",
                answer: "In your profile settings under 'Integrations', you can add your GitHub and LeetCode usernames. The Quad will fetch and display your public stats automatically."
            },
            {
                question: "Why isn't my GitHub graph updating?",
                answer: "Our servers cache GitHub data for a few hours to respect API rate limits. Your most recent commits might take up to 12 hours to reflect on your The Quad profile."
            }
        ]
    };

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = categories.map(c => document.getElementById(c.id));
            const scrollPosition = window.scrollY + 120;
            
            for (let i = sectionElements.length - 1; i >= 0; i--) {
                const current = sectionElements[i];
                if (current && current.offsetTop <= scrollPosition) {
                    setActiveSection(categories[i].id);
                    break;
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [categories]);

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
            <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-syntax-violet/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute top-40 left-0 -z-10 w-[400px] h-[400px] bg-accent/10 blur-[80px] rounded-full pointer-events-none -translate-x-1/2" />

            <header className="mb-16 pb-10 border-b border-rule max-w-3xl relative">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-mono text-[11px] font-semibold uppercase tracking-[0.25em] mb-6 border border-accent/20">
                    <Star className="w-3.5 h-3.5" /> Support Center
                </div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink mb-6 flex flex-col gap-2">
                    Frequently Asked
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-syntax-violet to-accent">Questions</span>
                </h1>
                <p className="text-lg sm:text-xl text-ink-2 leading-relaxed">
                    Everything you need to know about The Quad, how it works, and how to get the most out of the platform.
                </p>
            </header>

            <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-16">
                {/* Content */}
                <div className="flex-1 max-w-3xl pb-14 space-y-20">
                    {categories.map((category) => (
                        <section key={category.id} id={category.id} className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-paper to-paper-2 border border-rule shadow-sm flex items-center justify-center">
                                    <category.icon className="w-6 h-6 text-accent" />
                                </div>
                                <h2 className="text-3xl font-display font-semibold text-ink tracking-tight">
                                    {category.title}
                                </h2>
                            </div>
                            
                            <Accordion type="multiple" className="w-full flex flex-col gap-4">
                                {faqs[category.id].map((faq, index) => (
                                    <AccordionItem 
                                        value={`${category.id}-${index}`} 
                                        key={index} 
                                        className="border-b-0 border border-rule bg-paper hover:bg-paper-2/50 transition-all duration-300 rounded-2xl overflow-hidden shadow-sm data-[state=open]:border-accent/30 data-[state=open]:shadow-md data-[state=open]:bg-paper"
                                    >
                                        <AccordionTrigger className="text-left font-display text-[16px] sm:text-[17px] font-semibold text-ink hover:no-underline transition-colors px-6 py-5 group data-[state=open]:text-accent">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-ink-2 text-[15px] sm:text-base leading-relaxed px-6 pb-6 pt-0 border-t border-transparent data-[state=open]:border-rule/50 mt-1">
                                            <div className="pt-4">{faq.answer}</div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>
                    ))}
                </div>

                {/* Sticky Sidebar */}
                <aside className="lg:w-72 shrink-0 pb-12">
                    <div className="sticky top-24 rounded-3xl border border-rule bg-paper/60 backdrop-blur-xl shadow-sm p-5">
                        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-3 mb-5 px-3">Categories</h3>
                        <nav className="flex flex-col gap-2">
                            {categories.map((c) => {
                                const Icon = c.icon;
                                const isActive = activeSection === c.id;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => scrollTo(c.id)}
                                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-medium text-left transition-all duration-300 ${
                                            isActive 
                                                ? "bg-ink text-paper shadow-md translate-x-1" 
                                                : "text-ink-2 hover:bg-paper-2 hover:text-ink hover:translate-x-1 border border-transparent hover:border-rule"
                                        }`}
                                    >
                                        <Icon className={`w-4.5 h-4.5 ${isActive ? "text-paper" : "text-ink-3"}`} />
                                        {c.title}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>
            </div>
            <section className="mt-8 border-t border-rule pt-16">
                        <div className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-12 text-center flex flex-col items-center border border-rule shadow-xl bg-gradient-to-br from-paper via-paper-2 to-accent/5">
                            {/* Decorative background blobs */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-syntax-violet/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                            
                            <div className="w-16 h-16 bg-paper rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-rule relative z-10 -rotate-3">
                                <HelpCircle className="w-8 h-8 text-accent" />
                            </div>
                            
                            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4 relative z-10 tracking-tight">Still have questions?</h2>
                            <p className="text-ink-2 text-lg mb-10 max-w-xl relative z-10">
                                We're here to help you get the most out of The Quad. Reach out to our dedicated support team directly.
                            </p>
                            
                            <a 
                                href="mailto:thequad.community@gmail.com" 
                                className="relative z-10 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-ink text-paper font-semibold hover:bg-ink-2 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-ink/20"
                            >
                                Contact Support Team
                            </a>
                        </div>
                    </section>
        </div>
    );
}
