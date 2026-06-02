import React from "react";

export default function Terms() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12 border-b-2 border-double border-rule pb-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-2">Legal &middot; Updated Jun 2026</p>
                <h1 className="font-display text-4xl sm:text-5xl font-medium leading-tight text-ink mb-4">
                    Terms of Service
                </h1>
                <p className="text-lg text-ink-2">
                    Please read these terms carefully before using our platform.
                </p>
            </header>

            <div className="prose prose-invert max-w-none text-ink-2">
                <h2 className="text-2xl font-display font-semibold text-ink mt-8 mb-4">1. Acceptance of Terms</h2>
                <p className="mb-4">
                    By accessing or using PeerVerse ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
                </p>

                <h2 className="text-2xl font-display font-semibold text-ink mt-8 mb-4">2. User Conduct</h2>
                <p className="mb-4">
                    You agree not to use the Platform to:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, or harassing.</li>
                    <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
                    <li>Upload, post, or transmit any content that infringes any patent, trademark, trade secret, copyright or other proprietary rights of any party.</li>
                    <li>Upload, post, or transmit any unsolicited or unauthorized advertising, promotional materials, or "spam".</li>
                </ul>

                <h2 className="text-2xl font-display font-semibold text-ink mt-8 mb-4">3. Content Ownership and Licensing</h2>
                <p className="mb-4">
                    You retain ownership of any content you submit, post, or display on or through the Platform. By submitting, posting, or displaying content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content in any and all media or distribution methods.
                </p>

                <h2 className="text-2xl font-display font-semibold text-ink mt-8 mb-4">4. Termination</h2>
                <p className="mb-4">
                    We may terminate or suspend your account and bar access to the Platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>

                <h2 className="text-2xl font-display font-semibold text-ink mt-8 mb-4">5. Limitation of Liability</h2>
                <p className="mb-4">
                    In no event shall PeerVerse, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Platform.
                </p>

                <h2 className="text-2xl font-display font-semibold text-ink mt-8 mb-4">6. Changes</h2>
                <p className="mb-8">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                </p>
            </div>
        </div>
    );
}
