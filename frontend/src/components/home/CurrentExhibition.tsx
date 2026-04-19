'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Exhibition } from '@/lib/types';
import { useFeaturedExhibition } from '@/lib/hooks';

interface CurrentExhibitionProps {
    initialExhibition?: Exhibition;
}

export default function CurrentExhibition({ initialExhibition }: CurrentExhibitionProps) {
    const { data: exhibition, isLoading } = useFeaturedExhibition({
        fallbackData: initialExhibition,
    });

    if (isLoading && !exhibition) {
        return (
            <div className="py-24 px-6 border-b border-border/50 animate-pulse">
                <div className="max-w-[1920px] mx-auto h-64 bg-secondary/10"></div>
            </div>
        );
    }

    if (!exhibition) return null;

    return (
        <section className="py-24 px-6 border-b border-border/50 overflow-hidden group">
            <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* Left: Metadata & Content */}
                <div className="lg:col-span-12 xl:col-span-5 z-10">
                    <div className="flex flex-col gap-6">
                        <span className="block text-xs font-bold uppercase tracking-[0.4em] text-primary">
                            Featured Exhibition
                        </span>
                        <h2 className="font-bebas text-4xl sm:text-5xl md:text-8xl uppercase tracking-wide leading-[0.9] mb-4">
                            {exhibition.title}
                        </h2>
                        <p className="font-source-serif text-lg md:text-xl text-secondary/80 max-w-xl leading-relaxed mb-8 italic">
                            {exhibition.description || "Experience the temporal intersection of architecture and human movement in our latest curated showcase."}
                        </p>

                        <div className="flex flex-wrap gap-6 pt-4">
                            <Link
                                href={`/exhibitions/${exhibition.slug}`}
                                className="whitespace-nowrap inline-block text-xs font-bold uppercase tracking-widest bg-foreground text-background px-10 py-5 hover:opacity-90 transition-all"
                            >
                                Enter Archive
                            </Link>
                            <Link
                                href="/exhibitions"
                                className="whitespace-nowrap inline-block text-xs font-bold uppercase tracking-widest border border-border px-10 py-5 hover:bg-secondary/10 transition-all"
                            >
                                View All
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right: Immersive Image */}
                <div className="lg:col-span-12 xl:col-span-7 relative aspect-[4/3] md:aspect-video xl:h-[70vh] w-full bg-secondary/5 overflow-hidden">
                    {exhibition.thumbnail ? (
                        <Image
                            src={exhibition.thumbnail}
                            alt={exhibition.title}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-widest text-secondary/20">
                            No Visual Representation
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden xl:block"></div>
                </div>

            </div>
        </section>
    );
}
