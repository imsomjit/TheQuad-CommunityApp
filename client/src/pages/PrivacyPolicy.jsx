import React from "react";

export default function PrivacyPolicy() {
    return (
        <div className="max-w-5xl mx-auto bg-paper-2 rounded-xl py-12 px-4 sm:px-6">
            <header className="mb-10 pb-8 border-b border-rule">
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-ink tracking-tight mb-4">Our <span className="marker">Privacy Policy.</span></h1>
                <p className="font-mono text-sm text-ink-3 uppercase tracking-wider">
                    Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </header>

            <div className="space-y-8 text-ink-2 leading-relaxed">
                <section>
                    <h2 className="font-display text-2xl font-bold text-ink mb-4">1. Introduction</h2>
                    <p className="mb-4">
                        Welcome to PeerVerse. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our services.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl font-bold text-ink mb-4">2. Information We Collect</h2>
                    <p className="mb-4">We collect information that you provide directly to us, including:</p>
                    <ul className="list-disc pl-6 space-y-2 marker:text-accent">
                        <li><strong>Account Information:</strong> Name, username, email address, and profile picture.</li>
                        <li><strong>Profile Data:</strong> Social media links (GitHub, LeetCode, LinkedIn), biography, and location if you choose to provide them.</li>
                        <li><strong>User Content:</strong> Questions, answers, comments, posts, and resources you upload.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-display text-2xl font-bold text-ink mb-4">3. How We Use Your Information</h2>
                    <p className="mb-4">We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2 marker:text-accent">
                        <li>Provide, maintain, and improve the PeerVerse platform.</li>
                        <li>Personalize your experience and display relevant content.</li>
                        <li>Communicate with you regarding account updates, security alerts, and support messages.</li>
                        <li>Monitor and analyze usage trends and activities.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-display text-2xl font-bold text-ink mb-4">4. Third-Party Integrations</h2>
                    <p className="mb-4">
                        If you link third-party accounts (like GitHub or LeetCode), we fetch and display your public activity from those platforms. We do not store your external platform passwords, nor do we perform write actions on those platforms on your behalf.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl font-bold text-ink mb-4">5. Data Security</h2>
                    <p className="mb-4">
                        We implement strict security measures to protect your personal data, including cryptographic hashing of passwords. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl font-bold text-ink mb-4">6. Contact Us</h2>
                    <p className="mb-4">
                        If you have questions or comments about this Privacy Policy, please contact us at <a href="mailto:peerverse.community@gmil.com" className="text-accent hover:underline">peerverse.community@gmil.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
