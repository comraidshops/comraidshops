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

                <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-border items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold uppercase tracking-tighter">Our Vision</h2>
                        <p className="text-secondary/80 leading-relaxed text-lg">
                            We believe that fashion is a powerful medium for subcultural expression. In an industry increasingly dominated by fast fashion and generic conglomerates, our mission is to provide an architecture where raw, independent talent can thrive and reach a global audience without diluting their ethos.
                        </p>
                        <p className="text-secondary/80 leading-relaxed text-lg">
                            We meticulously curate our roster of designers, ensuring every brand on our platform aligns with our uncompromising standards for quality, design innovation, and subcultural relevance.
                        </p>
                    </div>
                    <div className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-3xl group">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-700 z-10" />
                        <img 
                            src="/logo-white.png" 
                            alt="The Vision"
                            className="w-full h-full object-cover grayscale opacity-50 contrast-125"
                        />
                    </div>
                </div>

                {/* Founder Section - Editorial */}
                <div className="py-24 border-t border-border">
                    <div className="grid lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">The Visionary</span>
                                <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8]">
                                    KENNC<br/>OFFICIAL
                                </h2>
                            </div>
                            
                            <div className="space-y-6">
                                <p className="text-xl md:text-2xl font-playfair italic leading-relaxed text-foreground">
                                    "A living archive of thought and form — where code breathes, fabric speaks, and meaning becomes architecture."
                                </p>
                                <p className="text-secondary leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left">
                                    Founder Kenncofficial doesn't just build platforms; he builds worlds where code meets art. Rooted in the belief that every creation is a quiet conversation between vision and execution, he founded ComraidShops to be more than a marketplace—it is an architecture for the avant-garde.
                                </p>
                                <p className="text-secondary leading-relaxed">
                                    His approach is defined by what he calls the "Silent Logic"—the unseen structure that supports pure creativity. This philosophy permeates every curation on ComraidShops, ensuring we don't just sell fashion; we document a movement.
                                </p>
                            </div>

                            <Link 
                                href="https://kennc.art" 
                                target="_blank"
                                className="inline-block text-[10px] font-black uppercase tracking-[0.3em] border-b-2 border-primary pb-1 hover:text-primary transition-colors"
                            >
                                Visit the Archive
                            </Link>
                        </div>
                        
                        <div className="lg:col-span-7 relative order-1 lg:order-2">
                            <div className="aspect-[4/5] relative overflow-hidden rounded-[40px] shadow-2xl">
                                <img 
                                    src="/founder.png" 
                                    alt="Kenncofficial Editorial"
                                    className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                            </div>
                            
                            {/* Accent UI Element */}
                            <div className="absolute -bottom-8 -left-8 bg-primary text-background p-8 rounded-3xl hidden md:block">
                                <span className="text-4xl font-black uppercase tracking-tighter block mb-2">01/01</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest block opacity-60">The Architect of Meaning</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 pt-12 border-t border-border">
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
