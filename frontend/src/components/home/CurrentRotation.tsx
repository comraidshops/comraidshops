'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useFeaturedProducts } from '@/lib/hooks';

interface CurrentRotationProps {
    initialProducts?: Product[];
}

export default function CurrentRotation({ initialProducts }: CurrentRotationProps) {
    const { data: rotationData, isLoading } = useFeaturedProducts({
        fallbackData: initialProducts,
    });
    
    // Ensure we handle pagination if data.results exists
    const products = (rotationData as any)?.results || (Array.isArray(rotationData) ? rotationData : []).slice(0, 3);

    if (isLoading && products.length === 0) {
        return (
            <section className="py-32 px-6 bg-background">
                <div className="max-w-[1920px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-baseline mb-24 border-b border-border pb-4">
                        <div className="h-8 w-64 bg-secondary/10 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-16">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-secondary/5 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-32 px-6 bg-background">
            <div className="max-w-[1920px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-baseline mb-24 border-b border-border pb-4">
                    <h2 className="text-2xl font-bold uppercase tracking-tight">Current Rotation</h2>
                    <span className="text-xs uppercase tracking-widest text-secondary hidden md:block">
                        Issue 01 • Fall/Winter 2026
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-16">
                    {products.map((product: Product, index: number) => (
                        <div key={product.slug} className={`group ${index === 1 ? 'md:mt-24' : ''}`}>
                            <Link href={`/products/${product.slug}`} className="block relative aspect-[2/3] overflow-hidden bg-secondary/5 mb-6">
                                <Image
                                    src={product.image || '/images/placeholder.jpg'}
                                    alt={product.name}
                                    fill
                                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                />
                            </Link>

                            <div className="flex flex-col items-center text-center opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-xs font-bold uppercase tracking-widest mb-1">{product.brand_name || product.vendor_name}</span>
                                <h3 className="text-lg font-medium uppercase tracking-tight mb-2">{product.name}</h3>
                                <span className="text-sm border-b border-transparent group-hover:border-primary transition-colors">
                                    View Object
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
