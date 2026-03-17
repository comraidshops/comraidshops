'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';

interface Brand {
    id: number | string;
    name: string;
    slug: string;
    hero_image?: string | null;
}

export default function BrandGrid() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchBrands() {
            try {
                const res = await fetch(`${API_BASE_URL}/brands/`);
                if (!res.ok) throw new Error('Failed to fetch');

                const data = await res.json();

                if (isMounted) {
                    setBrands(data.results || data);
                }
            } catch (err) {
                console.error("Failed to load brands:", err);
                if (isMounted) setError(true);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchBrands();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <section className="py-24 bg-background">
            <div className="max-w-[1920px] mx-auto px-4">
                <h2 className="text-3xl font-bold uppercase tracking-tight mb-12 text-center md:text-left">
                    Featured Brands
                </h2>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-square bg-secondary/10 animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">
                        <p>Error loading brands. Please try again later.</p>
                    </div>
                ) : brands.length === 0 ? (
                    <div className="text-center py-12 text-secondary">
                        <p>No brands currently available.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {brands.map((brand, index) => (
                            <motion.div
                                key={brand.slug}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                            >
                                <Link href={`/brands/${brand.slug}`} className="group block relative aspect-square overflow-hidden bg-secondary/10">
                                    {brand.hero_image ? (
                                        <Image
                                            src={brand.hero_image}
                                            alt={brand.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-stone-200" />
                                    )}

                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-white font-bold uppercase tracking-widest text-lg border-b border-white pb-1">
                                            {brand.name}
                                        </span>
                                    </div>

                                    {!brand.hero_image && (
                                        <div className="absolute bottom-4 left-4 z-10 group-hover:opacity-0 transition-opacity duration-300">
                                            <h3 className="font-bold uppercase text-xl text-black">{brand.name}</h3>
                                        </div>
                                    )}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
