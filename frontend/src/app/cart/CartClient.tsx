'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartClient() {
    const { items, updateQuantity, removeItem, cartTotal, isMounted } = useCart();
    
    // Safety check for hydration
    if (!isMounted) {
        return (
            <div className="min-h-screen bg-background pt-32 px-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background pt-48 px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-8">
                    Archive Empty.
                </h1>
                <p className="text-secondary uppercase tracking-[0.2em] text-sm mb-12">
                    Your collection has no active acquisitions.
                </p>
                <Link 
                    href="/shop" 
                    className="inline-block bg-primary text-background px-12 py-4 font-bold uppercase tracking-widest text-sm hover:bg-secondary transition-colors"
                >
                    Explore Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-[1920px] mx-auto">
                <header className="mb-16 border-b border-border pb-8">
                    <h1 className="text-5xl md:text-8xl font-bold uppercase tracking-tighter">
                        Your Archive
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Items List */}
                    <div className="lg:col-span-8 space-y-12">
                        {items.map((item) => (
                            <div 
                                key={`${item.id}-${item.variant}`} 
                                className="flex flex-col md:flex-row gap-8 pb-12 border-b border-border/50 group"
                            >
                                <div className="relative w-full md:w-48 aspect-[3/4] bg-secondary/5 overflow-hidden">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="flex-grow flex flex-col justify-between py-2">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-bold uppercase tracking-tight">{item.name}</h3>
                                                <p className="text-secondary text-sm uppercase tracking-widest mt-1">
                                                    {item.variant || 'Standard Edition'}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => removeItem(item.id, item.variant || '')}
                                                className="text-secondary hover:text-primary transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                        <p className="text-xl font-bold">₦{item.price.toLocaleString()}</p>
                                    </div>

                                    <div className="flex items-center gap-6 mt-8 md:mt-0">
                                        <div className="flex items-center border border-border">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.variant || '', Math.max(1, item.quantity - 1))}
                                                className="p-3 hover:bg-secondary/5 transition-colors"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-12 text-center font-bold">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.variant || '', item.quantity + 1)}
                                                className="p-3 hover:bg-secondary/5 transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <div className="text-sm font-bold uppercase tracking-widest text-secondary">
                                            Subtotal: ₦{(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-4 h-fit">
                        <div className="bg-secondary/5 p-8 md:p-12 space-y-12">
                            <h2 className="text-2xl font-bold uppercase tracking-widest border-b border-border pb-6">
                                Summary
                            </h2>
                            <div className="space-y-6">
                                <div className="flex justify-between text-secondary uppercase tracking-widest text-xs font-bold">
                                    <span>Subtotal</span>
                                    <span>₦{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-secondary uppercase tracking-widest text-xs font-bold">
                                    <span>Shipping</span>
                                    <span>Calculated at Acquisition</span>
                                </div>
                                <div className="pt-8 border-t border-border flex justify-between items-end">
                                    <span className="text-sm font-bold uppercase tracking-widest">Total</span>
                                    <span className="text-4xl font-bold tracking-tighter">₦{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <Link 
                                href="/checkout"
                                className="w-full bg-primary text-background flex items-center justify-center gap-3 py-6 font-bold uppercase tracking-[0.2em] text-sm hover:bg-secondary transition-all group"
                            >
                                Begin Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <div className="space-y-4 pt-4">
                                <p className="text-[10px] text-secondary/60 uppercase font-bold tracking-widest leading-relaxed">
                                    Complementary shipping on all high-impact acquisitions. 
                                    Secure TLS encrypted transaction guaranteed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
