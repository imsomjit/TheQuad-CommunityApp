import React from "react";

export default function TermsOfService() {
    return (
        <div className="max-w-5xl mx-auto bg-paper-2 rounded-xl py-12 px-4 sm:px-6">
            <header className="mb-10 pb-8 border-b border-rule">
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-ink tracking-tight mb-4">Our <span className="marker">Terms of Service.</span></h1>
                <p className="font-mono text-sm text-ink-3 uppercase tracking-wider">
                    Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </header>

            <div className="space-y-8 text-ink-2 leading-relaxed">
                <section>
                    <h2 className="font-display text-2xl font-bold text-ink mb-4">1. Agreement to Terms</h2>
                    <p className="mb-4">
                        By accessing or using PeerVerse, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you do not have permission to access the Service.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl font-bold text-ink mb-4">2. User Accounts</h2>
                    <p className="mb-4">
                        When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                    </p>
                    <p className="mb-4">
                        You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl font-bold text-ink mb-4">3. Content and Conduct</h2>
                    <p className="mb-4">
                        Our Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                    </p>
                    <p className="mb-4">
                        You agree not to use the Service to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 marker:text-accent">
                        <li>Upload or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or invasive of another's privacy.</li>
                        <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
                        <li>Upload or transmit any material that infringes any patent, trademark, trade secret, copyright, or other proprietary rights of any party.</li>
                        <li>Transmit any spam, unsolicited advertising, or promotional materials.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-display text-2xl font-bold text-ink mb-4">4. Intellectual Property</h2>
                    <p className="mb-4">
                        The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of PeerVerse and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl font-bold text-ink mb-4">5. Termination</h2>
                    <p className="mb-4">
                        We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl font-bold text-ink mb-4">6. Changes</h2>
                    <p className="mb-4">
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                    </p>
                </section>
            </div>
        </div>
    );
}
