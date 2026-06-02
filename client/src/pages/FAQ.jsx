import React from "react";
import { HelpCircle, BookOpen, MessageSquare, Shield, Zap, Code2, Users } from "lucide-react";

export default function FAQ() {
    const faqs = [
        {
            q: "What is PeerVerse?",
            a: "PeerVerse is a collaborative community platform designed for developers, students, and lifelong learners. It allows you to share resources, ask technical questions, debate ideas, and find opportunities to build and ship projects together.",
            icon: <BookOpen className="w-5 h-5 text-accent" />
        },
        {
            q: "Is PeerVerse completely free?",
            a: "Yes! PeerVerse is completely free to use. We believe in open access to education and collaboration, so all core features—including asking questions, sharing resources, and accessing the community—are available to everyone without a paywall.",
            icon: <Zap className="w-5 h-5 text-accent" />
        },
        {
            q: "How do I sync my GitHub and LeetCode?",
            a: "You can link your external accounts by navigating to your Profile, clicking 'Edit Profile', and entering your GitHub and LeetCode usernames. Your stats will automatically sync and display on your profile page.",
            icon: <Code2 className="w-5 h-5 text-accent" />
        },
        {
            q: "Can anyone upload a resource?",
            a: "Yes, any registered user can upload study materials, code snippets, or tutorials. However, all resources are subject to community moderation through upvotes, downvotes, and reporting to ensure high quality.",
            icon: <Users className="w-5 h-5 text-accent" />
        },
        {
            q: "How are questions different from forum posts?",
            a: "Questions on PeerVerse follow a Q&A format similar to Stack Overflow. Users can submit answers, and the community votes on the best solutions. The original author can also mark an answer as 'Accepted'. Posts, on the other hand, are designed for general discussions, announcements, and sharing ideas.",
            icon: <MessageSquare className="w-5 h-5 text-accent" />
        },
        {
            q: "How do you protect user data?",
            a: "We take your privacy seriously. We only collect the minimal amount of data required to run the platform. Passwords are cryptographically hashed, and we do not sell your personal information to third parties. For more details, check out our Privacy Policy.",
            icon: <Shield className="w-5 h-5 text-accent" />
        }
    ];

    return (
        <div className="max-w-5xl mx-auto border border-accent-soft rounded-xl py-12 px-4 sm:px-6">
            <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4">
                    <HelpCircle className="w-8 h-8 text-accent" />
                </div>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-ink tracking-tight mb-4">
                    Frequently <span className="marker">Asked Questions.</span>
                </h1>
                <p className="text-ink-2 text-lg max-w-2xl mx-auto">
                    Everything you need to know about the product, community guidelines, and how PeerVerse works.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {faqs.map((faq, index) => (
                    <div key={index} className="p-6 border border-rule rounded-xl bg-paper-2 hover:border-ink-3 transition-colors group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-paper border border-rule group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors">
                                {faq.icon}
                            </div>
                            <h3 className="font-display text-xl font-bold text-ink">{faq.q}</h3>
                        </div>
                        <p className="text-ink-2 leading-relaxed text-sm">
                            {faq.a}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-16 p-8 border border-rule rounded-xl bg-paper-2 text-center">
                <h3 className="font-display text-2xl font-bold text-ink mb-3">Still have questions?</h3>
                <p className="text-ink-2 mb-6 max-w-md mx-auto">
                    Can't find the answer you're looking for? Reach out to our community moderators or drop a question in the general discussion forum.
                </p>
                <a href="mailto:peerverse.community@gmil.com" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-accent text-paper font-semibold hover:brightness-110 transition-all shadow-sm">
                    Contact Support
                </a>
            </div>
        </div>
    );
}
