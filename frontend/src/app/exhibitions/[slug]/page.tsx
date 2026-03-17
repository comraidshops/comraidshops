'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchExhibition } from '@/lib/api';

interface Exhibition {
    id: number;
    title: string;
    slug: string;
    thumbnail: string;
}

export default function ExhibitionDetailPage() {
    const { slug } = useParams();
    const [exhibition, setExhibition] = useState<Exhibition | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        async function loadExhibition() {
            try {
                const data = await fetchExhibition(slug as string);
                setExhibition(data);
            } catch (error) {
                console.error("Failed to fetch exhibition:", error);
            } finally {
                setLoading(false);
            }
        }
        loadExhibition();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-36 px-6 animate-pulse">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="h-8 bg-secondary/10 w-1/4 mx-auto mb-6"></div>
                    <div className="h-24 bg-secondary/10 w-3/4 mx-auto mb-12"></div>
                    <div className="h-12 bg-secondary/10 w-1/2 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!exhibition) {
        return (
            <div className="min-h-screen bg-background pt-36 px-6 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Exhibition Not Found</h1>
                <Link href="/exhibitions" className="text-primary underline">Back to Archive</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-36 pb-24 px-6 md:px-12">
            <header className="max-w-[1920px] mx-auto mb-24">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-[0.4em] text-primary mb-6">
                        Exhibition Archive
                    </span>
                    <h1 className="text-6xl md:text-9xl font-bold uppercase tracking-tighter leading-[0.8] mb-12">
                        {exhibition.title}
                    </h1>
                    <p className="text-xl md:text-2xl font-light leading-relaxed max-w-2xl mx-auto text-secondary/80">
                        Exploring the temporal intersection of architecture and human movement within the curated archive.
                    </p>
                </div>
            </header>

            <main className="max-w-[1920px] mx-auto space-y-32">
                <section className="aspect-[21/9] relative bg-secondary/5 overflow-hidden">
                    {exhibition.thumbnail ? (
                        <Image
                            src={exhibition.thumbnail}
                            alt={exhibition.title}
                            fill
                            unoptimized={true}
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-[2s]"
                            priority
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-widest text-secondary/20">
                            Void
                        </div>
                    )}
                </section>

                <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-start-4 md:col-span-6 border-l-2 border-primary/20 pl-8 md:pl-12 py-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">
                            Statement
                        </h3>
                        <p className="text-lg md:text-xl text-secondary/90 leading-relaxed font-light">
                            This exhibition brings together a curated collection of works that define the brand&apos;s 
                            relationship with the temporal. Each piece is a testament to the belief that discipline 
                            is invisible, but form remembers.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
