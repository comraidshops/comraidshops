import React from 'react';
import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="max-w-[1920px] mx-auto px-4 py-12 md:py-24">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="space-y-4 border-b border-border pb-8">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Contact Us</h1>
                    <p className="text-secondary text-sm md:text-base max-w-xl leading-relaxed">
                        Have a question about an order, our brands, or just want to say hello? Our team is here to help and will get back to you as soon as possible.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-wide mb-4">Customer Support</h2>
                            <p className="text-secondary/80 leading-relaxed mb-4">
                                For inquiries regarding your order, sizing, or general questions, please reach out to us via email.
                            </p>
                            <Link href="mailto:support@comraidshops.art" className="inline-flex items-center gap-2 font-bold hover:text-secondary transition-colors group">
                                <Mail className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                                <span>support@comraidshops.art</span>
                            </Link>
                        </div>
                        
                        <div className="pt-8 border-t border-border">
                            <h2 className="text-xl font-bold uppercase tracking-wide mb-4">Partnerships & Brands</h2>
                            <p className="text-secondary/80 leading-relaxed mb-4">
                                Are you an independent brand interested in joining the marketplace? We&apos;d love to hear from you.
                            </p>
                            <Link href="mailto:partners@comraidshops.art" className="inline-flex items-center gap-2 font-bold hover:text-secondary transition-colors group">
                                <Mail className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                                <span>partners@comraidshops.art</span>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-foreground/5 p-8 rounded-lg flex flex-col justify-center space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-background rounded-full">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold uppercase tracking-wide">Headquarters</h3>
                                <p className="text-secondary text-sm">Paris, France</p>
                            </div>
                        </div>
                        <p className="text-secondary/80 text-sm leading-relaxed">
                            While we operate globally and ship worldwide, our curatorial and administrative team is primarily based in Paris. Please note we do not have a physical retail location at this time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
