'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, ArrowLeft, ShoppingBag, XCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const STEPS = [
    { key: 'pending',   label: 'Order Placed',   icon: Clock       },
    { key: 'paid',      label: 'Confirmed',       icon: CheckCircle },
    { key: 'shipped',   label: 'Dispatched',      icon: Truck       },
    { key: 'completed', label: 'Delivered',       icon: Package     },
];

const STATUS_ORDER = ['pending', 'paid', 'shipped', 'completed'];

export default function OrderDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchOrder = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/orders/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setOrder(await res.json());
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-secondary/10" />
                <div className="h-32 bg-secondary/10" />
                <div className="h-64 bg-secondary/10" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-24 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary/50">Order not found</p>
                <Link href="/dashboard/user/orders" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                    ← Back to Orders
                </Link>
            </div>
        );
    }

    const isCancelled = order.status === 'cancelled';
    const currentStepIndex = isCancelled ? -1 : STATUS_ORDER.indexOf(order.status);
    const date = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/user/orders" className="p-2 border border-border hover:border-primary hover:text-primary transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold uppercase tracking-tighter">Order #{order.id}</h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold mt-0.5">Placed {date}</p>
                </div>
            </div>

            {/* Status Tracker */}
            {!isCancelled ? (
                <div className="bg-background border border-border p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40 mb-8">Order Tracking</p>
                    <div className="relative">
                        {/* connector line */}
                        <div className="absolute top-5 left-5 right-5 h-px bg-border hidden sm:block" />
                        <div
                            className="absolute top-5 left-5 h-px bg-primary hidden sm:block transition-all duration-700"
                            style={{ width: currentStepIndex <= 0 ? '0%' : `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                        />

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative">
                            {STEPS.map((step, idx) => {
                                const isDone = idx <= currentStepIndex;
                                const StepIcon = step.icon;
                                return (
                                    <motion.div
                                        key={step.key}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex flex-col items-center text-center gap-3"
                                    >
                                        <div className={`w-10 h-10 flex items-center justify-center border-2 transition-all z-10 bg-background ${isDone ? 'border-primary' : 'border-border'}`}>
                                            <StepIcon className={`w-4 h-4 transition-colors ${isDone ? 'text-primary' : 'text-secondary/30'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${isDone ? 'text-foreground' : 'text-secondary/30'}`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-red-500/5 border border-red-500/20 p-6 flex items-center gap-4">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold uppercase tracking-tight text-red-500">Order Cancelled</p>
                        <p className="text-[10px] text-secondary/60 uppercase tracking-widest mt-1">This order was cancelled.</p>
                    </div>
                </div>
            )}

            {/* Items */}
            <div className="bg-background border border-border">
                <div className="p-6 border-b border-border">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40">
                        Items Acquired ({order.items?.length})
                    </p>
                </div>
                <div className="divide-y divide-border">
                    {order.items?.map((item: any) => (
                        <div key={item.id} className="p-6 flex gap-6 items-center">
                            {/* Image */}
                            <div className="relative w-16 h-20 bg-secondary/10 flex-shrink-0 border border-border overflow-hidden">
                                {item.product_image ? (
                                    <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingBag className="w-5 h-5 text-secondary/20" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                {item.product_slug ? (
                                    <Link href={`/products/${item.product_slug}`} className="font-bold uppercase tracking-tight text-sm hover:text-primary transition-colors line-clamp-2">
                                        {item.product_name}
                                    </Link>
                                ) : (
                                    <p className="font-bold uppercase tracking-tight text-sm line-clamp-2">{item.product_name}</p>
                                )}
                                {item.brand_name && (
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-secondary/50 font-bold mt-0.5">{item.brand_name}</p>
                                )}
                                <p className="text-[10px] text-secondary/50 uppercase tracking-widest font-bold mt-2">
                                    Qty {item.quantity} × ${Number(item.price).toFixed(2)}
                                </p>
                            </div>

                            {/* Line total */}
                            <p className="font-bold text-sm tracking-tight flex-shrink-0">
                                ${(Number(item.price) * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Order Total */}
                <div className="p-6 border-t border-border flex justify-between items-center">
                    <div className="space-y-1">
                        <p className="text-[10px] text-secondary/40 uppercase font-black tracking-[0.2em]">Shipping</p>
                        <p className="text-[10px] text-secondary/60 uppercase font-bold tracking-widest">Complimentary</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-secondary/40 uppercase font-black tracking-[0.2em]">Order Total</p>
                        <p className="text-2xl font-bold tracking-tighter">${Number(order.total_amount).toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Back CTA */}
            <Link
                href="/shop"
                className="block w-full text-center bg-secondary/5 border border-border hover:border-primary py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all"
            >
                Continue Shopping
            </Link>
        </div>
    );
}
