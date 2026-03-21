import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'About | ComraidShops',
    description: 'Learn about ComraidShops, the curated marketplace for independent streetwear and editorial culture.',
};

export default function AboutPage() {
    return (
        <div className="max-w-[1920px] mx-auto px-4 py-12 md:py-24">
            <div className="max-w-4xl mx-auto space-y-16">
                <div className="space-y-6 text-center max-w-2xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">About Us</h1>
                    <p className="text-secondary text-lg leading-relaxed">
                        ComraidShops is a curated marketplace designed to bridge the gap between independent, avant-garde streetwear brands and the individuals who seek authenticity.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-border">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold uppercase tracking-tighter">Our Vision</h2>
                        <p className="text-secondary/80 leading-relaxed text-lg">
                            We believe that fashion is a powerful medium for subcultural expression. In an industry increasingly dominated by fast fashion and generic conglomerates, our mission is to provide an architecture where raw, independent talent can thrive and reach a global audience without diluting their ethos.
                        </p>
                        <p className="text-secondary/80 leading-relaxed text-lg">
                            We meticulously curate our roster of designers, ensuring every brand on our platform aligns with our uncompromising standards for quality, design innovation, and subcultural relevance.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold uppercase tracking-tighter">The Marketplace</h2>
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-wide mb-2">For Buyers</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    Discover emerging designers and exclusive archives from around the globe in a single, seamless destination. We guarantee authenticity directly from the subcultural core.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-wide mb-2">For Brands</h3>
                                <p className="text-secondary/80 leading-relaxed">
                                    A platform built by creatives, for creatives. We offer robust tools for brand management, ensuring your collections are presented with the reverence they deserve while you maintain creative autonomy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 border-t border-border text-center">
                    <div className="space-y-6 max-w-xl mx-auto">
                        <h2 className="text-2xl font-bold uppercase tracking-wide">Join the Movement</h2>
                        <p className="text-secondary/80 leading-relaxed">
                            Whether you are looking to discover the next movement in avant-garde design or present your collection to a discerning audience.
                        </p>
                        <div className="flex justify-center gap-4 pt-4">
                            <Link href="/shop" className="px-8 py-3 bg-primary text-background font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">
                                Explore Shop
                            </Link>
                            <Link href="/brands" className="px-8 py-3 border border-border font-bold uppercase tracking-widest text-sm hover:bg-foreground/5 transition-colors">
                                View Brands
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
