'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchFeaturedBrands } from '@/lib/api';

export default function FeaturedLabels() {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFeatured() {
            try {
                const data = await fetchFeaturedBrands();
                setBrands(data);
            } catch (error) {
                console.error("Failed to load featured brands:", error);
            } finally {
                setLoading(false);
            }
        }
        loadFeatured();
    }, []);

    if (loading) {
        return (
            <section className="py-32 px-6 bg-secondary/5">
                <div className="max-w-[1920px] mx-auto">
                    <h2 className="text-2xl font-bold uppercase tracking-tight mb-16 border-b border-border pb-4">
                        Featured Collaborators
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-stone-200 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (brands.length === 0) return null;

    return (
        <section className="py-32 px-6 bg-secondary/5">
            <div className="max-w-[1920px] mx-auto">
                <h2 className="text-2xl font-bold uppercase tracking-tight mb-16 border-b border-border pb-4">
                    Featured Collaborators
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {brands.map((brand) => (
                        <Link key={brand.id} href={`/brands/${brand.slug}`} className="group block relative aspect-[3/4] md:aspect-[3/4] overflow-hidden bg-background">
                            <div className="absolute inset-0 z-0 opacity-80 group-hover:opacity-60 transition-opacity duration-500">
                                {brand.hero_image ? (
                                    <Image
                                        src={brand.hero_image}
                                        alt={brand.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-stone-200" />
                                )}
                            </div>

                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white p-8 text-center transition-transform duration-500 group-hover:scale-105">
                                <h3 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-4 drop-shadow-lg">
                                    {brand.name}
                                </h3>
                                {brand.tagline && (
                                    <p className="text-lg md:text-xl font-medium max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0 text-white drop-shadow-md">
                                        &quot;{brand.tagline}&quot;
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
