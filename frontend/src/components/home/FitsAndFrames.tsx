'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

// --- Types ---

interface Product {
    id: string;
    name: string;
    vendor: string;
    price?: string;
    image: string;
    slug: string;
}

interface Outfit {
    id: string;
    modelName: string;
    image: string; // Main full-body shot
    items: Product[];
}

// --- Mock Data ---

const OUTFITS: Outfit[] = [
    {
        id: '1',
        modelName: 'Marcus',
        image: '/outfits/model-01-v2.png',
        items: [
            { id: 'p1', name: 'Distressed Denim Jacket', vendor: 'Satisfy', price: '$280', image: '/products/placeholder.svg', slug: 'satisfy-denim' },
            { id: 'p2', name: 'Flannel Layer', vendor: 'Norda', price: '$120', image: '/products/placeholder.svg', slug: 'norda-flannel' },
            { id: 'p3', name: 'Cargo Trousers', vendor: 'Ciele', price: '$185', image: '/products/placeholder.svg', slug: 'ciele-cargo' },
            { id: 'p4', name: 'Vulcanized Sneaker', vendor: 'Hoka', price: '$145', image: '/products/placeholder.svg', slug: 'hoka-vulcan' },
        ]
    },
    {
        id: '2',
        modelName: 'Zara',
        image: '/outfits/model-02-v2.png',
        items: [
            { id: 'p5', name: 'Oversized Hoodie', vendor: 'District Vision', price: '$155', image: '/products/placeholder.svg', slug: 'district-vision-hoodie' },
            { id: 'p6', name: 'Wide Leg Denim', vendor: 'Soar', price: '$190', image: '/products/placeholder.svg', slug: 'soar-denim' },
            { id: 'p7', name: 'Beanie', vendor: 'Bandit', price: '$45', image: '/products/placeholder.svg', slug: 'bandit-beanie' },
            { id: 'p8', name: 'Skate Low', vendor: 'Nike', price: '$110', image: '/products/placeholder.svg', slug: 'nike-skate' },
        ]
    },
    {
        id: '3',
        modelName: 'Leo',
        image: '/outfits/model-03.png',
        items: [
            { id: 'p9', name: 'GOCap', vendor: 'Ciele', price: '$45', image: '/products/placeholder.svg', slug: 'ciele-gocap' },
            { id: 'p10', name: 'Grid Tee', vendor: 'Norda', price: '$80', image: '/products/placeholder.svg', slug: 'norda-grid-tee' },
            { id: 'p11', name: 'Trail Shorts', vendor: 'Satisfy', price: '$160', image: '/products/placeholder.svg', slug: 'satisfy-trail-shorts' },
            { id: 'p12', name: '001', vendor: 'Norda', price: '$285', image: '/products/placeholder.svg', slug: 'norda-001' },
        ]
    },
    {
        id: '4',
        modelName: 'Alex',
        image: '/outfits/model-04.png',
        items: [
            { id: 'p13', name: 'Windbreaker', vendor: 'Soar', price: '$220', image: '/products/placeholder.svg', slug: 'soar-windbreaker' },
            { id: 'p14', name: 'Tights', vendor: 'District Vision', price: '$140', image: '/products/placeholder.svg', slug: 'dv-tights' },
            { id: 'p15', name: 'Headband', vendor: 'Satisfy', price: '$40', image: '/products/placeholder.svg', slug: 'satisfy-headband' },
            { id: 'p16', name: 'Cloudmonster', vendor: 'On', price: '$170', image: '/products/placeholder.svg', slug: 'on-cloudmonster' },
        ]
    }
];

// --- Components ---

export default function FitsAndFrames() {
    const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Handle resize to determine mobile state
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Lock body scroll when sidebar/modal is open
    useEffect(() => {
        if (selectedOutfit) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [selectedOutfit]);

    return (
        <section className="bg-black text-white py-32 px-4 md:px-8 relative overflow-hidden">
            {/* Header */}
            <div className="max-w-[1920px] mx-auto mb-16 flex flex-col md:flex-row items-baseline justify-between border-b border-white/20 pb-6">
                <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">
                    Fits <span className="text-white/40">&</span> Frames
                </h2>
                <div className="mt-4 md:mt-0 flex gap-8 text-sm font-bold uppercase tracking-widest text-white/60">
                    <span>Curated Looks</span>
                    <span>Vol. 004</span>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
                {OUTFITS.map((outfit) => (
                    <motion.div
                        key={outfit.id}
                        className="group cursor-pointer relative aspect-[2/3] overflow-hidden bg-black shadow-lg hover:shadow-2xl transition-shadow duration-500"
                        onClick={() => setSelectedOutfit(outfit)}
                        whileHover={{ scale: 0.99 }} // Subtle shrink on container, zoom on image
                    >
                        {/* Image */}
                        <motion.div
                            className="absolute inset-0 w-full h-full"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Image
                                src={outfit.image}
                                alt={`Outfit by ${outfit.modelName}`}
                                fill
                                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                                sizes="(max-width: 768px) 100vw, 25vw"
                            />
                        </motion.div>

                        {/* Edge Blending Vignette (Permanent) */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_20px_#000000] z-10" />

                        {/* Overlay Gradient (Bottom) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500 z-10" />

                        {/* Text Overlay */}
                        <div className="absolute bottom-6 left-6 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                            <span className="block text-xs font-bold uppercase tracking-widest text-white/70 mb-1">
                                Featured Fit
                            </span>
                            <span className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                                View Breakdown <ChevronRight size={16} />
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Overlay / Sidebar / Modal */}
            <AnimatePresence>
                {selectedOutfit && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOutfit(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer"
                        />

                        {/* Panel Container */}
                        <motion.div
                            initial={isMobile ? { y: '100%' } : { x: '100%' }}
                            animate={isMobile ? { y: 0 } : { x: 0 }}
                            exit={isMobile ? { y: '100%' } : { x: '100%' }}
                            transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
                            className={`fixed z-[51] bg-[#121212] flex flex-col
                                ${isMobile
                                    ? 'bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl border-t border-white/10'
                                    : 'top-0 right-0 h-full w-[40%] max-w-[600px] border-l border-white/10 shadow-2xl'
                                }`}
                        >
                            {/* Panel Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <div>
                                    <h3 className="text-xl font-bold uppercase tracking-tight">The Breakdown</h3>
                                    <p className="text-xs text-white/50 uppercase tracking-widest mt-1">
                                        Model: {selectedOutfit.modelName}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedOutfit(null)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Panel Content (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {selectedOutfit.items.map((item, idx) => (
                                    <motion.div
                                        key={item.slug}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + (idx * 0.05) }}
                                        className="group flex gap-5 items-start"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-24 h-32 flex-shrink-0 bg-white/5 border border-white/10 overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>

                                        {/* info */}
                                        <div className="flex-1 pt-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                                    {item.vendor}
                                                </span>
                                                {item.price && (
                                                    <span className="text-sm font-medium text-white/60">
                                                        {item.price}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-lg font-bold uppercase leading-none mb-4 group-hover:text-primary transition-colors">
                                                {item.name}
                                            </h4>
                                            <Link
                                                href={`/shop/${item.slug}`}
                                                className="inline-block text-xs font-bold uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-all"
                                            >
                                                Shop Item
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* CTA at bottom of list */}
                                <div className="pt-8 mt-8 border-t border-white/10 text-center">
                                    <Link
                                        href="/shop"
                                        className="inline-block bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors w-full md:w-auto"
                                    >
                                        Shop Full Look
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
}
