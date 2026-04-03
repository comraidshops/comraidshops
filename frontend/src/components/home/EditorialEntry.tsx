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
        const primaryContent = (magazine.articles?.[0]?.content || magazine.description || "").trim();

        // Narrative fallback (Art of Suffering)
        const narrative = `There is a quiet lie we’ve all agreed to. That suffering is an error. A miscalculation. A deviation from the intended path. Something to fix. Something to escape. Something that shouldn’t be there in the first place. But that assumption collapses under observation. Because nothing meaningful has ever been built without it. Suffering is not the interruption. It is the process. In art, the canvas is never the beginning. What you see is resolution — not origin. The origin is tension. Uncertainty. A mind trying to translate something it does not yet understand. Every stroke is a negotiation between intention and limitation. That friction — that discomfort — is where the work is actually made. Not when it becomes beautiful. But when it refuses to. In business, we rename suffering to make it more acceptable. We call it iteration, market resistance, failure, learning curves. But strip the language down, and it is still the same thing: Pressure applied over time without immediate reward. No company becomes resilient from ease. No system becomes efficient without breaking first. What scales is not the idea. It is the capacity to endure what the idea demands. Architecture understands this best. No structure stands without tension. Load-bearing systems are not designed to avoid stress — they are designed to distribute it. Remove pressure, and the structure becomes meaningless. Introduce it, and suddenly, form has purpose. Strength is not the absence of force. It is the intelligent accommodation of it. Finance speaks in numbers, but it tells the same story. Volatility is feared, but it is also where opportunity lives. No real return exists without exposure. No growth without fluctuation. Stability, when isolated, does not create wealth. Movement does. And movement is never comfortable. So why do we keep trying to remove suffering from the equation? Why do we treat it like a flaw in the system when every system that produces value is built on top of it? Because suffering is not just painful. It is disorienting. It strips you of control. Forces you into versions of yourself you did not plan for. Removes the illusion that you are always in charge. And most people are not afraid of pain. They are afraid of not recognizing who they become inside it. But that is the real function. Suffering is not there to destroy you. It is there to edit you. To remove what is unnecessary. To expose what is weak. To refine what is real. It is a compression process. Like pressure turning carbon into something harder, sharper, more defined. Not because pressure is kind. But because it is precise. Creativity does not come from abundance. It comes from constraint. From limitation. From trying to solve something that resists solution. The mind does not expand when everything is available. It expands when something is missing. This is why the most powerful ideas rarely come from comfort. Comfort maintains. Suffering transforms. And this is where most people get it wrong. They think the goal is to suffer. It is not. The goal is to use suffering. To recognize it as material, not punishment. To stop asking, “Why is this happening to me?” and start asking, “What is this shaping me into?” Because suffering, unmanaged, will break you. But suffering, understood, will build you. There is an art to it. Not in enduring blindly. Not in glorifying pain. But in interpreting it correctly. In seeing pressure not as resistance, but as direction. In realizing that the moments that feel like collapse are often construction — just from a perspective you don’t yet have. So no, suffering is not a glitch. It is not an anomaly. It is not something that accidentally found its way into your life. It is part of the design. And the people who become exceptional are not the ones who avoid it. They are the ones who learn how to work with it. Quietly. Intentionally. Without needing it to look beautiful while it’s happening. Because the truth is— It rarely does. But what comes out of it? That’s where the art is.`;

        const stripped = primaryContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

        // Only use narrative if the content is extremely thin or placeholder-like
        const isPlaceholder = stripped.toLowerCase().includes("discover the latest perspective") || stripped.length < 50;
        const finalContent = isPlaceholder ? narrative : stripped;

        const words = finalContent.split(/\s+/);
        if (words.length <= 170) return finalContent;
        return words.slice(0, 170).join(' ') + '...';
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
