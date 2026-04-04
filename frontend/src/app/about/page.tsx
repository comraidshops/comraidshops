import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Founder of ComraidShops | Kenncofficial | About Us',
    description: 'Learn about Kenncofficial, the visionary founder of ComraidShops, and our mission to provide the architecture for independent luxury labels to thrive.',
    openGraph: {
        title: 'Kenncofficial | Founder of ComraidShops',
        description: 'Discover the vision behind ComraidShops—a meticulously engineered environment for independent talent.',
        images: ['/founder.png'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Kenncofficial | Founder of ComraidShops',
        description: 'Vision without execution is hallucination.',
        images: ['/founder.png'],
    },
};

export default function AboutPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Kenncofficial",
        "alternateName": "KENNC OFFICIAL",
        "jobTitle": "Founder",
        "description": "Founder of ComraidShops, a meticulously engineered environment for independent talent.",
        "url": "https://kennc.art",
        "image": "https://comraidshops.com/founder.png",
        "worksFor": {
            "@type": "Organization",
            "name": "ComraidShops",
            "url": "https://comraidshops.com",
            "logo": "https://comraidshops.com/logo-white.png"
        },
        "knowsAbout": ["Streetwear", "Fashion Design", "Entrepreneurship", "Subculture"]
    };

    return (
        <div className="max-w-[1920px] mx-auto px-4 py-12 md:py-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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
                            alt="ComraidShops Vision - Architecture of Impact"
                            className="w-full h-full object-cover grayscale opacity-50 contrast-125"
                        />
                    </div>
                </div>

                {/* Founder Section - Editorial - Black Background */}
                <div className="py-32 -mx-4 md:-mx-24 px-4 md:px-24 bg-black text-white rounded-[40px] md:rounded-[80px]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-12 gap-16 items-center">
                            <div className="lg:col-span-6 space-y-12 order-2 lg:order-1">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">The Visionary</span>
                                    <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.75]">
                                        KENNC<br/>OFFICIAL
                                    </h2>
                                </div>
                                
                                <div className="space-y-8 max-w-xl">
                                    <blockquote className="text-2xl md:text-3xl font-playfair italic leading-relaxed text-white/90">
                                        "Vision without execution is hallucination."
                                    </blockquote>
                                    <div className="space-y-12 text-white/60 text-lg leading-relaxed">
                                        <div className="space-y-6">
                                            <p className="text-white font-medium">Kenncofficial is not interested in things that exist without meaning.</p>
                                            <div className="space-y-2 border-l border-primary/30 pl-6 italic">
                                                <p>If it cannot tell a story, it is useless.</p>
                                                <p>If it cannot hold depth, it is empty.</p>
                                                <p>If it cannot explain a feeling—then it does not deserve to exist.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p>He does not create for aesthetics. He creates because there are things he feels that refuse to stay unexpressed.</p>
                                            <p>And the world, as it is, does a poor job of holding that kind of expression.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <p>In a society where talent is everywhere—but understanding is rare—where people create, but are never truly seen, where vision is often killed before it even takes form—</p>
                                            <p className="text-white font-medium">He chose not to just create. He chose to build something that protects creation itself.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <p>Kenncofficial comes from that tension.</p>
                                            <div className="space-y-1 border-l border-white/10 pl-4 italic">
                                                <p>Not outside of it.</p>
                                                <p>Not above it.</p>
                                                <p className="font-bold text-white uppercase tracking-widest text-[10px] not-italic pt-1">From inside it.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p>He understands the weight of having something real to say—and having no structure around you that knows what to do with it.</p>
                                            <p>He understands what it means to create in an environment that celebrates noise but ignores meaning.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <p>So he builds differently. Not to remove the struggle—because struggle refines the artist. But to give that struggle direction. To give it visibility. To give it language.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-2 border-y border-white/5 py-6">
                                                <p className="text-white">As an artist, he <span className="italic">feels</span>.</p>
                                                <p className="text-white">As a writer, he <span className="italic">translates</span>.</p>
                                                <p className="text-white">As an engineer, he <span className="italic">structures</span>.</p>
                                            </div>
                                            <p>But none of these exist separately. They are all part of the same instinct: <span className="text-white font-medium">to take what is invisible—and make it undeniable.</span></p>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-white font-medium uppercase tracking-wider text-sm">ComraidShops is not just a marketplace. It is a response.</p>
                                            <ul className="space-y-1 plain-list">
                                                <li>To a culture that consumes without understanding.</li>
                                                <li>To an industry that rewards imitation over identity.</li>
                                                <li>To a system that sees creators—but does not value them.</li>
                                            </ul>
                                        </div>

                                        <div className="py-2">
                                            <p className="text-primary font-black uppercase tracking-[0.2em] text-xl italic underline decoration-2 underline-offset-8 decoration-primary">This is where things change.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <p>Here, fashion is not decoration. It is definition. Every piece must say something. Every brand must stand for something. Every collection must come from somewhere real. Or it does not belong here.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <p>Kenncofficial is not building for hype. He is building for people who feel too much to wear things that mean nothing.</p>
                                            <p>For creators who refuse to dilute their voice just to be accepted. For individuals who want to wear context, not just clothing.</p>
                                        </div>

                                        <div className="space-y-2 border-l-2 border-primary pl-6">
                                            <p className="text-white/40 italic">This is not about making things easier.</p>
                                            <p className="text-2xl text-white font-bold uppercase tracking-tighter">It is about making things matter.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <p>ComraidShops is his medium. And through it, he is doing one thing: <span className="text-white font-medium">forcing meaning back into a culture that forgot how to feel.</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Link 
                                        href="https://kennc.art" 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block text-[10px] font-black uppercase tracking-[0.3em] border-b-2 border-primary pb-2 hover:translate-x-2 transition-all"
                                    >
                                        Visit the Archive
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-6 relative order-1 lg:order-2">
                                <div className="relative group">
                                    {/* Abstract Decorative Element */}
                                    <div className="absolute -inset-4 bg-primary/10 rounded-[60px] blur-3xl group-hover:bg-primary/20 transition-all duration-1000" />
                                    
                                    <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-[40px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                                        <img 
                                            src="/founder.png" 
                                            alt="Kenncofficial - Founder of ComraidShops - Master Architect"
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                                    </div>

                                    {/* Accent UI Element - Floating */}
                                    <div className="absolute -bottom-6 -right-6 md:-bottom-12 md:-right-12 bg-primary text-black p-6 md:p-10 rounded-full w-32 h-32 md:w-48 md:h-48 flex flex-col justify-center items-center shadow-2xl rotate-12 hover:rotate-0 transition-transform duration-500">
                                        <span className="text-3xl md:text-5xl font-black uppercase tracking-tighter">01</span>
                                        <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-widest text-center leading-tight">Master Architect</span>
                                    </div>
                                </div>
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
