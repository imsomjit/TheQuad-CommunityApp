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
                question: "What is PeerVerse?",
                answer: "PeerVerse is a community platform designed for students and developers to share resources, ask technical questions, write engineering blog posts, and discover coding opportunities all in one unified ecosystem."
            },
            {
                question: "Is PeerVerse completely free?",
                answer: "Yes, PeerVerse is 100% free for all users. Our goal is to democratize access to educational resources and foster a collaborative environment without any paywalls."
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
                answer: "Yes! PeerVerse fully supports GitHub-flavored markdown, including code blocks with syntax highlighting, tables, task lists, and inline math formatting for both questions and blog posts."
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
            }
        ],
        integrations: [
            {
                question: "How do I connect my GitHub or LeetCode?",
                answer: "In your profile settings under 'Integrations', you can add your GitHub and LeetCode usernames. PeerVerse will fetch and display your public stats automatically."
            },
            {
                question: "Why isn't my GitHub graph updating?",
                answer: "Our servers cache GitHub data for a few hours to respect API rate limits. Your most recent commits might take up to 12 hours to reflect on your PeerVerse profile."
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
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12 border-b-2 border-double border-rule pb-8 max-w-4xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-2">Support &middot; Help Center</p>
                <h1 className="font-display text-4xl sm:text-5xl font-medium leading-tight text-ink mb-4 flex items-center gap-4">
                    <HelpCircle className="w-10 h-10 text-syntax-violet" />
                    Frequently Asked Questions
                </h1>
                <p className="text-lg text-ink-2">
                    Everything you need to know about PeerVerse, how it works, and how to get the most out of the platform.
                </p>
            </header>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Sticky Sidebar */}
                <aside className="lg:w-64 shrink-0">
                    <div className="sticky top-24 rounded-2xl border border-rule bg-paper-2/40 p-5">
                        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3 mb-4">Categories</h3>
                        <nav className="flex flex-col gap-1">
                            {categories.map((c) => {
                                const Icon = c.icon;
                                const isActive = activeSection === c.id;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => scrollTo(c.id)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                                            isActive 
                                                ? "bg-accent/10 text-accent font-semibold" 
                                                : "text-ink-2 hover:bg-paper hover:text-ink"
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-ink-3"}`} />
                                        {c.title}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Content */}
                <div className="flex-1 max-w-3xl pb-24 space-y-16">
                    {categories.map((category) => (
                        <section key={category.id} id={category.id} className="scroll-mt-24">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-paper-2 border border-rule flex items-center justify-center text-ink">
                                    <category.icon className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-display font-semibold text-ink">
                                    {category.title}
                                </h2>
                            </div>
                            
                            <Accordion type="multiple" className="w-full bg-paper border border-rule rounded-xl px-4">
                                {faqs[category.id].map((faq, index) => (
                                    <AccordionItem value={`${category.id}-${index}`} key={index} className="last:border-0 border-rule py-1">
                                        <AccordionTrigger className="text-left font-display text-base text-ink hover:text-accent transition-colors">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-ink-2 text-sm leading-relaxed pt-1 pb-4">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>
                    ))}

                    <section className="border-t border-rule pt-12 mt-12">
                        <div className="bg-paper-2 rounded-2xl p-8 text-center flex flex-col items-center">
                            <h2 className="font-display text-2xl text-ink mb-2">Still have questions?</h2>
                            <p className="text-ink-2 mb-6">We're here to help you get the most out of PeerVerse.</p>
                            <a href="mailto:peerverse.community@gmail.com" className="inline-block px-8 py-3 rounded-full bg-ink text-paper font-semibold hover:bg-ink-2 transition-colors">
                                Contact Support Team
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
