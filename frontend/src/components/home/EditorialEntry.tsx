'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchFeaturedMagazine } from '@/lib/api';

export default function EditorialEntry() {
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFeatured() {
            try {
                const data = await fetchFeaturedMagazine();
                setArticle(data);
            } catch (error) {
                console.error("Failed to fetch featured article:", error);
            } finally {
                setLoading(false);
            }
        }
        loadFeatured();
    }, []);

    if (loading) {
        return (
            <section className="py-32 px-6 bg-background">
                <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center animate-pulse">
                    <div className="md:col-span-7 aspect-[3/4] bg-secondary/10"></div>
                    <div className="md:col-span-5 space-y-4">
                        <div className="h-4 w-32 bg-secondary/10"></div>
                        <div className="h-12 w-full bg-secondary/10"></div>
                        <div className="h-32 w-full bg-secondary/10"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (!article) return null;

    return (
        <section className="py-32 px-6 bg-background">
            <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

                {/* Image - Asymmetrical Placement */}
                <div className="md:col-span-7 relative aspect-[3/4] md:aspect-[3/4] overflow-hidden bg-secondary/10">
                    <Image
                        src={article.thumbnail || "/new_image/art_of_suffering.jpg"}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-[2s] hover:scale-105"
                    />
                </div>

                {/* Content - Offset */}
                <div className="md:col-span-5 md:-ml-12 z-10 bg-background p-8 md:p-12 relative border-l border-border/50">
                    <span className="block text-xs font-bold uppercase tracking-widest text-secondary mb-4">
                        Latest Issue • {new Date(article.created_at).getFullYear()}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-6 leading-none">
                        {article.title}
                    </h2>
                    <p className="text-lg text-secondary mb-8 leading-relaxed max-w-md">
                        {article.description || "Discover the latest perspective in our featured editorial."}
                    </p>
                    <Link
                        href={`/magazine/${article.slug}`}
                        className="inline-block text-sm font-bold uppercase tracking-widest border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-all"
                    >
                        Read The Article
                    </Link>
                </div>

            </div>
        </section>
    );
}
