'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
    id: number | string;
    name: string;
    price: number | string;
    image: string;
    vendor: string;
    slug: string;
}

import { memo } from 'react';

function ProductCardComponent({ name, price, image, vendor, slug }: ProductCardProps) {
    return (
        <Link href={`/products/${slug}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary/5 mb-6">
                <Image
                    src={image}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03]"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left px-2">
                <p className="text-[10px] text-secondary uppercase tracking-[0.3em] mb-3">{vendor}</p>
                <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-start gap-2">
                    <h3 className="text-sm md:text-base font-light tracking-wide group-hover:opacity-70 transition-opacity">
                        {name}
                    </h3>
                    <span className="text-sm font-light tracking-wider text-secondary/80">₦{Number(price).toLocaleString()}</span>
                </div>
            </div>
        </Link>
    );
}

export default memo(ProductCardComponent);
