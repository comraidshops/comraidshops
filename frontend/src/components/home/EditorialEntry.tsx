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

    return (
        <section className="py-24 px-6 bg-background overflow-hidden">
            <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-12">
                {/* Visual - Left */}
                <div className="md:col-span-7 relative aspect-[16/10] bg-secondary/5 overflow-hidden group">
                    <Image
                        src={magazine.thumbnail || '/images/placeholder.jpg'}
                        alt={magazine.title}
                        fill
                        className="object-contain transition-transform duration-1000 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-transparent transition-colors duration-500"></div>
                </div>

                {/* Content - Offset */}
                <div className="md:col-span-5 md:-ml-12 z-10 bg-background p-8 md:p-12 relative border-l border-border/50">
                    <span className="block text-xs font-bold uppercase tracking-widest text-secondary mb-4">
                        {magazine.created_at ? new Date(magazine.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        }) : 'Recent Edition'}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-6 leading-none">
                        {magazine.article?.title || magazine.title}
                    </h2>
                    <div 
                        className="text-lg text-secondary mb-8 leading-relaxed max-w-md editorial-content-preview line-clamp-6"
                        dangerouslySetInnerHTML={{ 
                            __html: magazine.article?.content || magazine.excerpt || magazine.description || "Discover the latest perspective in our featured editorial." 
                        }}
                    />
                    
                    <div className="flex flex-wrap gap-4">
                        <Link 
                            href={`/magazine/${magazine.slug}`}
                            className="text-sm font-bold uppercase tracking-widest border-b-2 border-primary pb-1 hover:text-primary transition-colors"
                        >
                            Read Full Edition
                        </Link>
                        {magazine.article?.slug && (
                            <Link 
                                href={`/articles/${magazine.article.slug}`}
                                className="text-sm font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors"
                            >
                                View Article
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
