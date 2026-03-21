import React from 'react';

export const metadata = {
    title: 'Shipping & Delivery | ComraidShops',
    description: 'Detailed information about shipping methods, times, and delivery regions for ComraidShops.',
};

export default function ShippingPage() {
    return (
        <div className="max-w-[1920px] mx-auto px-4 py-12 md:py-24">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Shipping Policy</h1>
                    <p className="text-secondary text-sm md:text-base leading-relaxed">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">1. Processing Times</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            All orders are processed within 1 to 3 business days, excluding weekends and holidays. You will receive another notification when your order has shipped containing tracking information.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">2. Domestic Shipping Rates</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            We offer flat rate shipping across the contiguous United States. Shipping charges for your order will be calculated and displayed at checkout. Standard shipping typically takes 3-5 business days.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">3. International Shipping</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            We offer international shipping to most countries. Shipping charges and delivery estimates vary by destination and will be calculated at checkout. Please note that your order may be subject to import duties and taxes (including VAT), which are incurred once a shipment reaches your destination country.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">4. How to Check Your Order Status</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
