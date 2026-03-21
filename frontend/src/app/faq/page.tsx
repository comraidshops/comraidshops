import React from 'react';

export default function FAQPage() {
    return (
        <div className="max-w-[1920px] mx-auto px-4 py-12 md:py-24">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Frequently Asked Questions</h1>
                    <p className="text-secondary text-sm md:text-base leading-relaxed">
                        Everything you need to know about shopping on Comraid.
                    </p>
                </div>

                <div className="space-y-12">

                    {/* Orders & Purchases */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">Orders & Purchases</h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">How do I place an order?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Browse any product page, select your size or variant, and click &quot;Add to Cart.&quot; When ready, proceed to checkout and complete payment. You will receive a confirmation email once your order is placed.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">Can I modify or cancel my order?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Orders can only be modified or cancelled within 1 hour of placement. Please contact our support team immediately at support@comraidshops.art if you need to make changes.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">Will I receive an order confirmation?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Yes. A confirmation email is sent to your registered email address as soon as your order is successfully placed. Check your spam folder if you do not see it within a few minutes.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Payments */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">Payments</h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">What payment methods are accepted?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    We accept all major debit and credit cards via Paystack, including Visa, Mastercard, and Verve. Bank transfers are also supported where available.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">Is my payment information secure?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Absolutely. All payments are processed through Paystack, a PCI-DSS compliant payment gateway. We never store your card details on our servers.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">My payment failed — what should I do?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Ensure your card details are correct and that your bank has not blocked the transaction. Try a different card or contact your bank. If the issue persists, reach out to our support team.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Delivery */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">Delivery</h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">How long does delivery take?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Delivery timelines depend on the vendor and your location. Most orders within Nigeria are delivered within 3–7 business days. International orders may take longer.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">How do I track my order?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Once your order is shipped, you will receive a tracking number via email. You can use this to monitor your shipment through the courier&apos;s website.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">Do you ship internationally?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Some vendors on our platform offer international shipping. Availability and additional costs will be shown at checkout based on your delivery address.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Returns & Refunds */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">Returns & Refunds</h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">What is your return policy?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Items may be returned within 7 days of delivery, provided they are unused, unwashed, and in their original packaging with all tags attached. Sale items are non-refundable.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">How do I request a refund?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Contact our support team at support@comraidshops.art with your order number and reason for return. We will guide you through the process and confirm eligibility.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">When will I receive my refund?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Approved refunds are processed within 5–10 business days back to your original payment method. You will be notified by email once the refund has been initiated.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Vendor / Brand Questions */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">Vendor & Brand Questions</h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">How do I become a vendor on Comraid?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Visit our vendor registration page and complete the application form. Our team reviews all applications and will be in touch within 3–5 business days.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">How do vendor payouts work?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Vendor earnings are tracked in your dashboard in real time. Payouts are processed on a rolling basis. You can request a withdrawal from the Earnings section of your vendor dashboard.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold uppercase tracking-wide">Who handles disputes between buyers and vendors?</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Comraid acts as a neutral mediator for disputes. Contact our support team with full details and we will work with both parties to reach a fair resolution.
                                </p>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
