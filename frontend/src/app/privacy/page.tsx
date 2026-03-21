import React from 'react';

export const metadata = {
    title: 'Privacy Policy | ComraidShops',
    description: 'Our privacy policy details how we handle and protect your personal information.',
};

export default function PrivacyPage() {
    return (
        <div className="max-w-[1920px] mx-auto px-4 py-12 md:py-24">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Privacy Policy</h1>
                    <p className="text-secondary text-sm md:text-base leading-relaxed">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">1. Information We Collect</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            We collect information that you provide directly to us, including your name, email address, postal address, phone number, and payment information when you make a purchase, create an account, or contact us for support.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">2. How We Use Your Information</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            We use the information we collect to process your orders, communicate with you about products, services, and promotions, protect against fraud, and personalize your experience on our platform.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">3. Information Sharing</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            We do not sell your personal information. We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">4. Data Security</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
                        </p>
                    </section>
                    
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">5. Your Rights</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            You have the right to access, correct, or delete your personal information. If you wish to exercise these rights, please contact our support team.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
