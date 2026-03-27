'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Bookmark } from 'lucide-react';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';
import { API_BASE_URL } from '@/lib/constants';
import { safeFetch } from '@/lib/api-utils';

// --- Types ---

interface FitProduct {
    id: number;
    name: string;
    price: string;
    slug: string;
    brand: string | { name: string; slug?: string };
    image: string | null;
    stock: number;
}

interface FitItem {
    id: number;
    label: string;
    order: number;
    product: FitProduct;
}

interface FitFrame {
    id: number;
    title: string;
    slug: string;
    cover_image: string;
    brand: { name: string; slug?: string } | null;
    is_mixed: boolean;
    items?: FitItem[];
}

interface SavedFit {
    id: number;
    fitframe: FitFrame;
}

// --- Components ---

import { useFitFrames } from '@/lib/hooks';
import { Product, Brand } from '@/lib/types';

interface FitsAndFramesProps {
    initialFits?: FitFrame[];
}

export default function FitsAndFrames({ initialFits }: FitsAndFramesProps) {
    const { data: fitsData, isLoading } = useFitFrames({
        fallbackData: initialFits,
    });
    
    const fits = Array.isArray(fitsData) ? fitsData : (fitsData?.results || []);
    const [selectedFit, setSelectedFit] = useState<FitFrame | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const { addItem } = useCart();
    const { notify } = useNotification();
    const [savedFits, setSavedFits] = useState<Set<number>>(new Set());

    // Fetch saved fits on mount if authenticated
    useEffect(() => {
        const fetchSavedFits = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const data = await safeFetch(`${API_BASE_URL}/saved-fits/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const list = data.results || data || [];
                setSavedFits(new Set(list.map((sf: SavedFit) => sf.fitframe.id)));
            } catch (err) {
                console.error("Error fetching saved fits", err);
            }
        };
        fetchSavedFits();
    }, []);

    // Handle clicking a fit
    const handleFitClick = async (slug: string) => {
        try {
            const data = await safeFetch(`${API_BASE_URL}/fitframes/${slug}/`);
            setSelectedFit(data);
        } catch (err) {
            console.error(err);
        }
    };

    // Handle save fit
    const handleSaveFit = async (fitId: number) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            notify('error', 'Authentication Required', 'Please log in to save fits to your archive.');
            return;
        }
        try {
            if (savedFits.has(fitId)) {
                // Determine saved_fit ID to delete
                const data = await safeFetch(`${API_BASE_URL}/saved-fits/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const list = data.results || data || [];
                const savedFit = list.find((sf: SavedFit) => sf.fitframe.id === fitId);
                if (savedFit) {
                    await fetch(`${API_BASE_URL}/saved-fits/${savedFit.id}/`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setSavedFits(prev => {
                        const next = new Set(prev);
                        next.delete(fitId);
                        return next;
                    });
                    notify('success', 'Removed from Archive', 'This fit has been removed from your saved fits.');
                }
            } else {
                const res = await fetch(`${API_BASE_URL}/saved-fits/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ fitframe_id: fitId })
                });
                if (res.ok) {
                    setSavedFits(prev => new Set(prev).add(fitId));
                    notify('success', 'Saved to Archive', 'Look has been saved to your personal archive.');
                } else {
                    notify('error', 'Error', 'Failed to save the fit.');
                }
            }
        } catch (err) {
            console.error(err);
            notify('error', 'Error', 'An unexpected error occurred.');
        }
    };

    // Handle resize to determine mobile state
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Lock body scroll when sidebar/modal is open
    useEffect(() => {
        if (selectedFit) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [selectedFit]);

    if (isLoading && fits.length === 0) {
        return (
            <section className="bg-black text-white py-32 px-4 md:px-8 relative overflow-hidden">
                <div className="max-w-[1920px] mx-auto mb-16 flex flex-col md:flex-row items-baseline justify-between border-b border-white/20 pb-6">
                    <div className="h-12 w-64 bg-white/10 animate-pulse rounded" />
                    <div className="h-4 w-48 bg-white/5 animate-pulse rounded mt-4 md:mt-0" />
                </div>
                <div className="max-w-[1920px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {[1, 2, 3, 4].map((i: number) => (
                        <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-sm" />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="bg-black text-white py-32 px-4 md:px-8 relative overflow-hidden">
            {/* Header */}
            <div className="max-w-[1920px] mx-auto mb-16 flex flex-col md:flex-row items-baseline justify-between border-b border-white/20 pb-6">
                <h2 className="font-bebas text-5xl md:text-6xl uppercase tracking-wide">
                    Fits <span className="text-white/40">&</span> Frames
                </h2>
                <div className="mt-4 md:mt-0 flex gap-8 text-sm font-bold uppercase tracking-widest text-white/60">
                    <span>Curated Looks</span>
                    <span>Vol. 004</span>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-[1920px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {fits.map((fit: FitFrame) => (
                    <motion.div
                        key={fit.id}
                        className="group cursor-pointer relative aspect-[2/3] overflow-hidden bg-black shadow-lg hover:shadow-2xl transition-shadow duration-500"
                        onClick={() => handleFitClick(fit.slug)}
                        whileHover={{ scale: 0.99 }} // Subtle shrink on container, zoom on image
                    >
                        {/* Image */}
                        <motion.div
                            className="absolute inset-0 w-full h-full"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {fit.cover_image ? (
                                <Image
                                    src={fit.cover_image}
                                    alt={fit.title}
                                    fill
                                    className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                                    sizes="(max-width: 768px) 100vw, 25vw"
                                />
                            ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                    <span className="text-white/30 uppercase tracking-widest text-xs font-bold">No Image</span>
                                </div>
                            )}
                        </motion.div>

                        {/* Edge Blending Vignette (Permanent) */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_20px_#000000] z-10" />

                        {/* Overlay Gradient (Bottom) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500 z-10" />

                        {/* Text Overlay */}
                        <div className="absolute bottom-6 left-6 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                            <span className="block text-xs font-bold uppercase tracking-widest text-white/70 mb-1">
                                {fit.brand ? `By ${fit.brand.name}` : fit.is_mixed ? 'Curated Fit' : 'Featured Look'}
                            </span>
                            <span className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                                {fit.title} <ChevronRight size={16} />
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Overlay / Sidebar / Modal */}
            <AnimatePresence>
                {selectedFit && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFit(null)}
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
                            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-4">
                                    {selectedFit.cover_image && (
                                        <div className="relative w-16 h-20 bg-white/5 border border-white/10 overflow-hidden hidden md:block">
                                            <Image 
                                                src={selectedFit.cover_image} 
                                                alt={selectedFit.title} 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-2xl font-bold uppercase tracking-tight">{selectedFit.title}</h3>
                                        <p className="text-xs text-white/50 uppercase tracking-widest mt-1">
                                            {selectedFit.brand ? `Full Look by ${selectedFit.brand.name}` : selectedFit.is_mixed ? "Curated Fit" : "Featured Look"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleSaveFit(selectedFit.id)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                                        title={savedFits.has(selectedFit.id) ? "Remove from Archive" : "Save to Archive"}
                                    >
                                        <Bookmark size={20} className={savedFits.has(selectedFit.id) ? "fill-white text-white" : "text-white/60"} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedFit(null)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Panel Content (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                <div className="border-b border-white/10 pb-4 mb-6">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-white/70">Recreate This Fit</h4>
                                </div>
                                {!selectedFit.items || selectedFit.items.length === 0 ? (
                                    <div className="text-center py-12 border border-white/10 bg-white/5">
                                        <span className="text-white/40 font-bold uppercase tracking-widest text-xs">No items linked to this look</span>
                                    </div>
                                ) : (
                                    selectedFit.items.map((item: FitItem, idx: number) => (
                                        <motion.div
                                            key={`${item.id}-${idx}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + (idx * 0.05) }}
                                            className="group flex gap-5 items-start"
                                        >
                                            {/* Product Image */}
                                            <div className="relative w-24 h-32 flex-shrink-0 bg-white/5 border border-white/10 overflow-hidden">
                                                {item.product.image ? (
                                                    <Image
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="text-xs text-white/20 uppercase tracking-widest">No Img</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* info */}
                                            <div className="flex-1 pt-1 flex flex-col h-32 justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                                            {item.label} <span className="text-white/30">|</span> {typeof item.product.brand === 'string' ? item.product.brand : item.product.brand?.name}
                                                        </span>
                                                        <span className="text-sm font-medium text-white/60 flex flex-col items-end">
                                                            ₦{parseFloat(item.product.price).toLocaleString()}
                                                            {item.product.stock > 0 ? (
                                                                <span className="text-[9px] uppercase tracking-widest text-green-500 mt-1">{item.product.stock <= 3 ? 'Low Stock' : 'Available'}</span>
                                                            ) : (
                                                                <span className="text-[9px] uppercase tracking-widest text-red-500 mt-1">Archived</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <Link href={`/products/${item.product.slug}`}>
                                                        <h4 className="text-lg font-bold uppercase leading-tight mb-4 group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                                                            {item.product.name}
                                                        </h4>
                                                    </Link>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (item.product.stock <= 0) return;
                                                        addItem({
                                                            id: String(item.product.id),
                                                            name: item.product.name,
                                                            price: parseFloat(item.product.price) || 0,
                                                            image: item.product.image || '/placeholder.jpg',
                                                            vendor: (typeof item.product.brand === 'object' ? item.product.brand?.name : item.product.brand),
                                                            slug: item.product.slug,
                                                            variant: 'Default' // Adding minimal variant for standard cart item
                                                        });
                                                    }}
                                                    disabled={item.product.stock <= 0}
                                                    className={`self-start flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b pb-1 transition-all ${item.product.stock > 0 ? 'border-white/30 hover:border-white text-white hover:text-white' : 'border-white/10 text-white/30 cursor-not-allowed'}`}
                                                >
                                                    <ShoppingCart size={14} />
                                                    {item.product.stock > 0 ? 'Add to Cart' : 'Unavailable'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}

                                {/* CTA at bottom of list */}
                                <div className="pt-8 mt-8 border-t border-white/10 text-center flex flex-col md:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => {
                                            selectedFit.items?.forEach(item => {
                                                addItem({
                                                    id: String(item.product.id),
                                                    name: item.product.name,
                                                    price: parseFloat(item.product.price) || 0,
                                                    image: item.product.image || '/placeholder.jpg',
                                                    vendor: typeof item.product.brand === 'string' ? item.product.brand : item.product.brand?.name || '',
                                                    slug: item.product.slug,
                                                    variant: 'Default'
                                                });
                                            });
                                            // Optionally close modal or show feedback
                                            setSelectedFit(null);
                                        }}
                                        className="inline-block bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors w-full md:w-auto"
                                    >
                                        Add Entire Look to Cart
                                    </button>
                                    <Link
                                        href="/shop"
                                        className="inline-block border border-white/20 text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors w-full md:w-auto"
                                    >
                                        Browse Shop
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
