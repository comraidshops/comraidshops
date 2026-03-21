import React from 'react';

export const metadata = {
    title: 'Terms & Conditions | ComraidShops',
    description: 'The standard terms and conditions for using the ComraidShops platform and services.',
};

export default function TermsPage() {
    return (
        <div className="max-w-[1920px] mx-auto px-4 py-12 md:py-24">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Terms of Service</h1>
                    <p className="text-secondary text-sm md:text-base leading-relaxed">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">1. Acceptance of Terms</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            By accessing or using ComraidShops, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the website or use any services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">2. User Accounts</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            You are responsible for safeguarding your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">3. Products and Pricing</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            All products are subject to availability, and we reserve the right to impose quantity limits on any order, to reject all or part of an order, and to discontinue products without notice. Pricing is subject to change at any time.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">4. Vendor Obligations</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            Brands and independent designers selling on our platform must adhere to our seller guidelines. Items must be authentic, accurately described, and shipped promptly. We hold the right to terminate accounts that violate these policies.
                        </p>
                    </section>
                    
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">5. Limitation of Liability</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            ComraidShops shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
