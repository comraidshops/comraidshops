'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, ArrowLeft, ShoppingBag, XCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL, safeFetch } from '@/lib/api';
import { formatCustomerPaymentStatus } from '@/lib/format';
import { Order, OrderItem } from '@/types/user';

const STEPS = [
    { key: 'pending',    label: 'Order Placed',   icon: Clock       },
    { key: 'processing', label: 'Processing',     icon: Package     },
    { key: 'shipped',    label: 'Dispatched',      icon: Truck       },
    { key: 'delivered',  label: 'Delivered',       icon: CheckCircle },
];

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        
        // Ensure ID is a string if it's an array
        const rawId = params?.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;
        
        if (!id) return;

        const fetchOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await safeFetch(`/orders/${id}/`);
                if (data) setOrder(data);
                else setError("Order data returned empty");
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err instanceof Error ? err.message : "Failed to load order");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [params?.id, isMounted]);

    if (!isMounted || loading) {
        return (
            <div className="space-y-6 animate-pulse p-4 md:p-0">
                <div className="h-8 w-48 bg-secondary/10" />
                <div className="h-32 bg-secondary/10 border border-border" />
                <div className="h-64 bg-secondary/10 border border-border" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="text-center py-24 px-6 space-y-6 bg-secondary/5 border border-dashed border-border rounded-lg">
                <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-secondary/30" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                        {error || "Order not found"}
                    </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <button 
                        onClick={() => window.location.reload()}
                        className="text-[10px] font-black uppercase tracking-widest bg-primary text-background px-8 py-3 hover:bg-secondary transition-colors"
                    >
                        Try Refreshing
                    </button>
                    <Link href="/dashboard/user/orders" className="text-[10px] font-black uppercase tracking-widest text-secondary/60 hover:text-primary transition-all">
                        ← Back to Acquisition History
                    </Link>
                </div>
            </div>
        );
    }

    const isCancelled = order.order_status === 'cancelled';
    const currentStepIndex = isCancelled ? -1 : STATUS_ORDER.indexOf(order.order_status);
    
    // Stable date formatting for hydration
    const date = order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    }) : 'N/A';

    const getPaymentColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'border-red-500/20 text-red-500 bg-red-500/5';
            case 'paid': return 'border-amber-500/20 text-amber-500 bg-amber-500/5';
            case 'confirmed': return 'border-primary/20 text-primary bg-primary/5';
            default: return 'border-secondary/20 text-secondary bg-secondary/5';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/user/orders" className="p-2.5 border border-border hover:border-primary hover:text-primary transition-all bg-background">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter">Order #{order.id}</h2>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-secondary/50 font-black mt-1">Acquired on {date}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className={`px-4 py-2 border ${getPaymentColor(order.payment_status)}`}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Payment: {formatCustomerPaymentStatus(order.payment_status)}</p>
                    </div>
                    <div className={`px-4 py-2 border ${isCancelled ? 'border-red-500/20 text-red-500 bg-red-500/5' : 'border-primary/20 text-primary bg-primary/5'}`}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">{order.order_status === 'pending' ? 'Order Pending' : order.order_status}</p>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* Status Tracker */}
                {!isCancelled ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-background border border-border p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary/40 mb-10">Real-time Logistics Monitoring</p>
                        
                        <div className="relative">
                            {/* Tracking Line Background */}
                            <div className="absolute top-5 left-5 right-5 h-[2px] bg-border hidden sm:block" />
                            
                            {/* Active Progress Line */}
                            <motion.div
                                className="absolute top-5 left-5 h-[2px] bg-primary hidden sm:block z-0"
                                initial={{ width: 0 }}
                                animate={{ width: currentStepIndex <= 0 ? '0%' : `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                                transition={{ duration: 1, ease: "circOut" }}
                            />

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 relative">
                                {STEPS.map((step, idx) => {
                                    const isDone = idx <= currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;
                                    const StepIcon = step.icon;
                                    
                                    return (
                                        <div
                                            key={step.key}
                                            className="flex flex-col items-center text-center gap-4 group"
                                        >
                                            <div className={`w-11 h-11 flex items-center justify-center border-2 transition-all duration-500 z-10 bg-background ${
                                                isDone ? 'border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' : 'border-border'
                                            } ${isCurrent ? 'ring-4 ring-primary/5' : ''}`}>
                                                <StepIcon className={`w-4 h-4 transition-all duration-500 ${isDone ? 'text-primary' : 'text-secondary/20'}`} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isDone ? 'text-foreground' : 'text-secondary/30'}`}>
                                                    {step.label}
                                                </p>
                                                {isCurrent && (
                                                    <motion.p 
                                                        layoutId="currentStepLabel"
                                                        className="text-[8px] font-bold text-primary uppercase tracking-widest"
                                                    >
                                                        Current Status
                                                    </motion.p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/[0.03] border border-red-500/10 p-8 flex items-center gap-6"
                    >
                        <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Transaction Terminated</p>
                            <p className="text-[10px] text-secondary/60 uppercase tracking-widest mt-1 font-medium">This order was cancelled and will not be processed further.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Items Card */}
            <div className="bg-background border border-border shadow-sm">
                <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/[0.01]">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-4 h-4 text-secondary/40" />
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary/40">
                            Manifest Details
                        </p>
                    </div>
                    <span className="text-[10px] py-1 px-3 bg-secondary/5 font-black uppercase tracking-[0.1em]">
                        {order.items?.reduce((acc: number, item: OrderItem) => acc + (item.quantity || 1), 0) || 0} Units
                    </span>
                </div>
                
                <div className="divide-y divide-border/60">
                    {order.items?.map((item: OrderItem) => (
                        <div key={item.id} className="p-8 flex flex-col sm:flex-row gap-8 sm:items-center group hover:bg-secondary/[0.01] transition-colors">
                            {/* Product Image Container */}
                            <div className="relative w-20 h-28 bg-secondary/[0.03] flex-shrink-0 border border-border/50 overflow-hidden group-hover:border-primary/20 transition-colors">
                                {item.product_image ? (
                                    <Image 
                                        src={item.product_image} 
                                        alt={item.product_name} 
                                        fill 
                                        sizes="80px"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-6 h-6 text-secondary/10" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="space-y-1">
                                    {item.brand_name && (
                                        <p className="text-[9px] uppercase tracking-[0.3em] text-primary font-black mb-1">{item.brand_name}</p>
                                    )}
                                    {item.product_slug ? (
                                        <Link href={`/products/${item.product_slug}`} className="font-bold uppercase tracking-tighter text-lg hover:text-primary transition-colors inline-block leading-tight">
                                            {item.product_name}
                                        </Link>
                                    ) : (
                                        <p className="font-bold uppercase tracking-tighter text-lg leading-tight">{item.product_name}</p>
                                    )}
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-[10px] text-secondary/50 uppercase tracking-widest font-black">
                                    <span>Quantity: {item.quantity}</span>
                                    <span className="w-1 h-1 bg-border rounded-full" />
                                    <span>Unit Price: ₦{Number(item.price).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Line Total */}
                            <div className="sm:text-right border-t sm:border-0 border-border/40 pt-4 sm:pt-0">
                                <p className="text-[10px] text-secondary/40 uppercase font-black tracking-widest mb-1">Subtotal</p>
                                <p className="font-black text-xl tracking-tighter">
                                    ₦{(Number(item.price) * item.quantity).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Financial Summary */}
                <div className="p-8 border-t border-border bg-secondary/[0.02] flex flex-col gap-6">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/60">
                        <span>Standard Shipping</span>
                        <span className="text-secondary/30">Complimentary</span>
                    </div>
                    <div className="h-px bg-border/40 w-full" />
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] text-primary uppercase font-black tracking-[0.3em]">Total Value</p>
                            <p className="text-[9px] text-secondary/40 uppercase font-bold tracking-widest">Inclusive of taxes & duties</p>
                        </div>
                        <p className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
                            ₦{Number(order.total_amount).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Post-Purchase Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/shop"
                    className="flex items-center justify-center bg-background border border-border hover:border-primary py-5 text-[10px] font-black uppercase tracking-[0.25em] hover:text-primary transition-all group"
                >
                    <ShoppingBag className="w-4 h-4 mr-3 group-hover:-translate-y-0.5 transition-transform" />
                    Continue Acquisition
                </Link>
                <Link
                    href="/contact"
                    className="flex items-center justify-center bg-secondary/5 border border-border hover:bg-secondary/10 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-secondary transition-all"
                >
                    Concierge Support
                </Link>
            </div>
        </motion.div>
    );
}
