'use client';

import { useState, useEffect } from 'react';
import { Bookmark, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { API_BASE_URL, safeFetch, Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

interface FitItem {
    id: number;
    product: Product;
    label: string;
}

interface FitFrame {
    id: number;
    title: string;
    cover_image: string | null;
    items: FitItem[];
    brand?: { name: string } | null;
    is_mixed?: boolean;
}

interface SavedFit {
    id: number;
    fitframe: FitFrame;
}

interface SelectedFit extends FitFrame {
    savedFitId: number;
}

export default function SavedFitsPage() {
    const [savedFits, setSavedFits] = useState<SavedFit[]>([]);
    const [selectedFit, setSelectedFit] = useState<SelectedFit | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const { addItem } = useCart();
    const { notify } = useNotification();

    const fetchSavedFits = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            const data = await safeFetch(`${API_BASE_URL}/saved-fits/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const list = data.results || (Array.isArray(data) ? data : []);
            setSavedFits(list);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSavedFits();
            const checkMobile = () => setIsMobile(window.innerWidth < 768);
            checkMobile();
            window.addEventListener('resize', checkMobile);
        }, 0);
        return () => {
            clearTimeout(timer);
            // window.removeEventListener('resize', checkMobile); // Need to define checkMobile outside if we want to remove it properly
        };
    }, []);

    // Better way to handle resize to avoid closure issues
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (selectedFit) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [selectedFit]);

    const handleUnsaveFit = async (savedFitId: number) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/saved-fits/${savedFitId}/`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setSavedFits(prev => prev.filter(sf => sf.id !== savedFitId));
                if (selectedFit && selectedFit.savedFitId === savedFitId) {
                    setSelectedFit(null);
                }
                notify('success', 'Removed from Archive', 'Fit has been removed from your saved list.');
            }
        } catch (err) {
            console.error(err);
            notify('error', 'Error', 'Failed to remove fit.');
        }
    };

    const openFit = (sf: SavedFit) => {
        setSelectedFit({
            ...sf.fitframe,
            savedFitId: sf.id
        });
    };

    return (
        <div className="space-y-12">
            <div className="border-b border-foreground/5 pb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/30 mb-2 block">Archive Sector 05</span>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Visual Archive</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/50 mt-4 leading-relaxed">
                    Curated aesthetic trajectories for future orchestration. Saved fits and conceptual frameworks.
                </p>
            </div>

            {savedFits.length === 0 ? (
                <div className="bg-background border border-border py-40 flex flex-col items-center justify-center text-center space-y-8 shadow-sm">
                    <div className="w-20 h-20 bg-foreground/5 border border-foreground/10 flex items-center justify-center rotate-45">
                        <Bookmark className="w-8 h-8 text-foreground/20 -rotate-45" />
                    </div>
                    <div className="space-y-3">
                        <p className="text-xl font-black uppercase tracking-tighter">Null Visuals</p>
                        <p className="text-[10px] text-secondary/40 font-black uppercase tracking-[0.3em] italic">The conceptual archive is currently empty.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {savedFits.map((sf) => (
                        <div key={sf.id} className="group relative aspect-[2/3] overflow-hidden bg-background shadow-lg cursor-pointer border border-foreground/5" onClick={() => openFit(sf)}>
                            {/* Image */}
                            <div className="absolute inset-0 w-full h-full">
                                {sf.fitframe.cover_image ? (
                                    <Image
                                        src={sf.fitframe.cover_image}
                                        alt={sf.fitframe.title}
                                        fill
                                        className="object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-secondary/5 flex items-center justify-center">
                                        <span className="text-secondary/20 uppercase tracking-[0.3em] text-[10px] font-black">Null Data</span>
                                    </div>
                                )}
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 z-10" />

                            <button
                                onClick={(e) => { e.stopPropagation(); handleUnsaveFit(sf.id); }}
                                className="absolute top-3 right-3 z-20 p-2 hover:bg-white/20 rounded-full transition-colors"
                                title="Remove from Archive"
                            >
                                <Bookmark size={18} className="fill-white text-white" />
                            </button>

                            <div className="absolute bottom-6 left-6 right-6 z-20">
                                <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-white/60 mb-2">
                                    Enclosed: {sf.fitframe.items?.length || 0} Assets
                                </span>
                                <span className="text-lg font-black uppercase tracking-tighter text-white line-clamp-2 leading-none">
                                    {sf.fitframe.title}
                                </span>
                                {sf.fitframe.brand && (
                                    <span className="block text-[8px] text-white/40 uppercase tracking-[0.2em] mt-2 font-black">
                                        Source: {sf.fitframe.brand.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {selectedFit && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFit(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer"
                        />

                        <motion.div
                            initial={isMobile ? { y: '100%' } : { x: '100%' }}
                            animate={isMobile ? { y: 0 } : { x: 0 }}
                            exit={isMobile ? { y: '100%' } : { x: '100%' }}
                            transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
                            className={`fixed z-[51] bg-[#121212] text-white flex flex-col
                                ${isMobile
                                    ? 'bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl border-t border-white/10'
                                    : 'top-0 right-0 h-full w-[40%] max-w-[600px] border-l border-white/10 shadow-2xl'
                                }`}
                        >
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
                                        onClick={() => handleUnsaveFit(selectedFit.savedFitId)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                                        title="Remove from Archive"
                                    >
                                        <Bookmark size={20} className="fill-white text-white" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedFit(null)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

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

                                            <div className="flex-1 pt-1 flex flex-col h-32 justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                                            {item.label} <span className="text-white/30">|</span> {typeof item.product.brand === 'string' ? item.product.brand : item.product.brand?.name}
                                                        </span>
                                                        <span className="text-sm font-medium text-white/60 flex flex-col items-end">
                                                            ₦{(typeof item.product.price === 'string' ? parseFloat(item.product.price) : Number(item.product.price)).toLocaleString()}
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
                                                            price: Number(item.product.price) || 0,
                                                            image: item.product.image || '/placeholder.jpg',
                                                            vendor: (typeof item.product.brand === 'object' ? item.product.brand?.name : item.product.brand) || 'ComraidShops',
                                                            slug: item.product.slug,
                                                            variant: 'Default'
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
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
