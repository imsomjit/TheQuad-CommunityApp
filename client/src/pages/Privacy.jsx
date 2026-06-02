import React from "react";

export default function Privacy() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12 border-b-2 border-double border-rule pb-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-2">Legal &middot; Updated Jun 2026</p>
                <h1 className="font-display text-4xl sm:text-5xl font-medium leading-tight text-ink mb-4">
                    Privacy Policy
                </h1>
                <p className="text-lg text-ink-2">
                    How we collect, use, and protect your data.
                </p>
            </header>

            <div className="prose prose-invert max-w-none text-ink-2">
                <h2 className="text-2xl font-display font-semibold text-ink mt-8 mb-4">1. Information We Collect</h2>
                <p className="mb-4">
                    We collect information you provide directly to us, such as when you create or modify your account,
                    request on-demand services, contact customer support, or otherwise communicate with us. This information
                    may include: name, email, avatar, and other information you choose to provide.
                </p>
                <p className="mb-4">
                    We also collect information from third-party services you connect (e.g., GitHub, Google, LeetCode) to
                    enhance your profile and provide a richer community experience.
                </p>

                <h2 className="text-2xl font-display font-semibold text-ink mt-8 mb-4">2. How We Use Information</h2>
                <p className="mb-4">
                    We may use the information we collect about you to:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Provide, maintain, and improve our platform</li>
                    <li>Provide and deliver the products and services you request</li>
                    <li>Send you technical notices, updates, security alerts and support and administrative messages</li>
                    <li>Respond to your comments, questions and requests</li>
                    <li>Personalize and improve the Services</li>
                </ul>

                <h2 className="text-2xl font-display font-semibold text-ink mt-8 mb-4">3. Sharing of Information</h2>
                <p className="mb-4">
                    We may share the information we collect about you as described in this Statement or as described at the
                    time of collection or sharing, including as follows:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>With the public, if you submit content in a public forum, such as blog comments, social media posts, or other features of our services that are viewable by the general public</li>
                    <li>With third parties with whom you choose to let us share information (e.g., other apps or websites that integrate with our API or Services)</li>
                    <li>In response to a request for information by a competent authority if we believe disclosure is in accordance with, or is otherwise required by, any applicable law, regulation, or legal process</li>
                </ul>

                <h2 className="text-2xl font-display font-semibold text-ink mt-8 mb-4">4. Security</h2>
                <p className="mb-4">
                    We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized
                    access, disclosure, alteration and destruction. Passwords are cryptographically hashed and we use TLS/SSL encryption for data transmission.
                </p>

                <h2 className="text-2xl font-display font-semibold text-ink mt-8 mb-4">5. Contact Us</h2>
                <p className="mb-8">
                    If you have any questions about this Privacy Statement, please contact us at <a href="mailto:privacy@peerverse.com" className="text-accent hover:underline">privacy@peerverse.com</a>.
                </p>
            </div>
        </div>
    );
}
