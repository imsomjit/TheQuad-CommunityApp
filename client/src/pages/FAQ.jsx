import React from "react";
import { HelpCircle } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../components/ui/accordion";

export default function FAQ() {
    const faqs = [
        {
            question: "What is PeerVerse?",
            answer: "PeerVerse is a community platform for students and developers to share resources, ask questions, write blog posts, and discover coding opportunities."
        },
        {
            question: "How do I earn reputation points?",
            answer: "You can earn points by receiving upvotes on your questions (4 points), answers (15 points), resources (10 points), and blog posts (10 points). Receiving an upvote on your content gives you 3 points. Points are calculated on a monthly calendar basis."
        },
        {
            question: "Can I use markdown in my posts and questions?",
            answer: "Yes! PeerVerse fully supports GitHub-flavored markdown, including code blocks, tables, and inline math formatting for both questions and blog posts."
        },
        {
            question: "Is there a way to connect my GitHub or LeetCode?",
            answer: "Absolutely. In your profile settings, you can add your GitHub and LeetCode usernames. PeerVerse will fetch and display your stats automatically, including a live contribution graph for GitHub."
        },
        {
            question: "How do I report inappropriate content?",
            answer: "You can report any post, question, or resource by clicking the flag icon on the content. Our moderation team reviews reports regularly to keep the community safe."
        },
        {
            question: "Can I bookmark resources for later?",
            answer: "Yes, you can click the bookmark icon on any resource or opportunity to save it. You can view all your bookmarked items on your profile page."
        }
    ];

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12 border-b-2 border-double border-rule pb-8">
                <div className="flex items-center gap-3 text-accent mb-4">
                    <HelpCircle className="w-8 h-8" />
                </div>
                <h1 className="font-display text-4xl sm:text-5xl font-medium leading-tight text-ink mb-4">
                    Frequently Asked Questions
                </h1>
                <p className="text-lg text-ink-2">
                    Everything you need to know about PeerVerse and how it works.
                </p>
            </header>

            <div className="max-w-3xl">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index} className="border-b border-rule py-2">
                            <AccordionTrigger className="text-left font-display text-lg text-ink hover:text-accent transition-colors">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-ink-2 text-base leading-relaxed pt-2 pb-4">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
            
            <div className="mt-16 p-6 rounded-2xl border border-rule bg-paper-2/40 text-center">
                <h3 className="font-display text-xl text-ink mb-2">Still have questions?</h3>
                <p className="text-ink-2 mb-4">We're here to help you get the most out of PeerVerse.</p>
                <a href="mailto:support@peerverse.com" className="inline-block px-6 py-2.5 rounded-full bg-ink text-paper font-semibold hover:bg-ink-2 transition-colors">
                    Contact Support
                </a>
            </div>
        </div>
    );
}
