'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Magazine } from '@/lib/types';
import { useFeaturedMagazine } from '@/lib/hooks';

interface EditorialEntryProps {
    initialArticle?: Magazine;
}

export default function EditorialEntry({ initialArticle }: EditorialEntryProps) {
    const { data: magazineData } = useFeaturedMagazine({
        fallbackData: initialArticle,
    });

    const magazine = magazineData || initialArticle;

    if (!magazine) return null;

    // Extract a substantial snippet (at least 150 words)
    const getLongPreview = () => {
        const primaryContent = magazine.articles?.[0]?.content || magazine.description || magazine.excerpt || "";
        const stripped = primaryContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = stripped.split(' ');

        if (words.length <= 150) return stripped;
        return words.slice(0, 160).join(' ') + '...';
    };

    const previewContent = getLongPreview();

    return (
        <section className="relative w-full py-24 md:py-44 overflow-hidden bg-background">
            {/* Grain Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            <div className="max-w-[1920px] mx-auto px-6 md:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 items-center">

                    {/* Left Side: Cinematic Cover Image */}
                    <div className="lg:col-span-7 relative group">
                        <div className="relative aspect-[3/4] md:aspect-[16/10] overflow-hidden rounded-sm ring-1 ring-white/5">
                            <Image
                                src={magazine.thumbnail || '/new_image/art_of_suffering.jpg'}
                                alt={magazine.title}
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-[2000ms] ease-out group-hover:scale-110"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-60"></div>
                        </div>

                        {/* Floating Publication Info */}
                        <div className="absolute -bottom-6 -left-6 md:-left-12 bg-background p-6 md:p-8 ring-1 ring-border shadow-2xl z-20 hidden md:block transition-transform duration-700 group-hover:-translate-y-2">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Volume 01</span>
                                <div className="h-px w-10 bg-primary/20"></div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-secondary">Editorial Archive</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Editorial Body */}
                    <div className="lg:col-span-5 relative z-10 flex flex-col justify-center">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary/60">
                                        The Vanguard
                                    </span>
                                    <div className="h-px w-12 bg-primary/10"></div>
                                </div>

                                <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-tighter leading-[0.85] text-balance font-cormorant italic transition-all duration-700">
                                    {magazine.articles?.[0]?.title?.trim() || magazine.linked_articles?.[0]?.title?.trim() || magazine.title}.
                                </h2>
                            </div>

                            <div className="max-w-xl text-md md:text-lg text-secondary leading-relaxed font-light italic opacity-80 border-l-2 border-primary/20 pl-6 py-2">
                                <p className="line-clamp-[12] md:line-clamp-none">
                                    {previewContent}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-10 pt-4">
                                <Link
                                    href={`/magazine/${magazine.slug}`}
                                    className="group/btn relative flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-white hover:text-primary transition-all pb-2"
                                >
                                    <span className="relative z-10">Read the Story</span>
                                    <span className="text-xl group-hover/btn:translate-x-2 transition-transform duration-500">→</span>
                                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover/btn:w-full transition-all duration-700"></div>
                                </Link>

                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40">
                                    {magazine.created_at ? new Date(magazine.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Est. 2024'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Narrative Decoration */}
            <div className="absolute top-1/2 -right-20 transform -translate-y-1/2 rotate-90 pointer-events-none hidden xl:block">
                <span className="text-[12rem] font-black uppercase tracking-tighter text-white/[0.02] whitespace-nowrap">
                    ARCHIVAL CURATION
                </span>
            </div>
        </section>
    );
}
