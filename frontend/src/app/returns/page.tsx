import React from 'react';

export const metadata = {
    title: 'Returns Policy | ComraidShops',
    description: 'Information regarding our returns and exchange policy for purchases made on ComraidShops.',
};

export default function ReturnsPage() {
    return (
        <div className="max-w-[1920px] mx-auto px-4 py-12 md:py-24">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Refund Policy</h1>
                    <p className="text-secondary text-sm md:text-base leading-relaxed">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">1. Returns Overview</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            We accept returns within 14 days of the original purchase date. Items must be in their original, unworn condition with all original tags and packaging intact.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">2. Final Sale Items</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            Please note that certain items, such as limited edition releases, intimate apparel, accessories, and items marked as &quot;Final Sale,&quot; are not eligible for returns or exchanges.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">3. Process</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            To initiate a return, navigate to your order history in the user dashboard or contact our support team. Once approved, you will receive instructions on where to send the package. The customer is responsible for return shipping costs.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">4. Refunds</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, the refund will be processed and automatically applied to your original method of payment within 5-7 business days.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
