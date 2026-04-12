'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { Order } from '@/types/user';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    pending: { label: 'Order Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    processing: { label: 'Processing', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/orders/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    // Sort newest first (API may return paginated or plain list)
                    const list = Array.isArray(data) ? data : data.results ?? [];
                    setOrders(list.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-secondary/10 border border-border" />
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 text-center bg-background border border-border shadow-sm">
                <div className="w-20 h-20 bg-foreground/5 border border-foreground/10 flex items-center justify-center rotate-45 group hover:rotate-0 transition-transform duration-700">
                    <ShoppingBag className="w-8 h-8 text-foreground/20 -rotate-45 group-hover:rotate-0 transition-transform duration-700" />
                </div>
                <div className="space-y-3">
                    <h3 className="font-black uppercase tracking-tighter text-2xl font-cormorant italic">Awaiting Genesis</h3>
                    <p className="text-[10px] text-secondary/40 uppercase tracking-[0.3em] font-black italic">No acquisitions have been executed yet. The grid is currently quiet.</p>
                </div>
                <Link
                    href="/shop"
                    className="bg-foreground text-background px-12 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:translate-y-[-2px] transition-transform shadow-xl"
                >
                    Initiate First Sequence
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="border-b border-border pb-10">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-cormorant italic">Acquisition History</h2>
                <div className="flex items-center gap-4 mt-4">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-foreground font-black px-2 py-1 bg-foreground/5 border-[0.5px] border-foreground/10">{orders.length} Acquisitions</p>
                    <div className="h-[1px] flex-1 bg-foreground/5" />
                </div>
            </div>

            <div className="space-y-4">
                {orders.map((order, i) => {
                    const cfg = STATUS_CONFIG[order.order_status] ?? STATUS_CONFIG.pending;
                    const StatusIcon = cfg.icon;
                    const date = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    const totalQty = order.items?.reduce((acc: number, item) => acc + (item.quantity || 1), 0) || 0;

                    return (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Link href={`/dashboard/user/orders/${order.id}`}>
                                <div className="bg-background border-t-[0.5px] border-b-[0.5px] border-border hover:border-foreground/20 transition-all duration-500 group py-10 px-8 relative overflow-hidden shadow-sm hover:shadow-xl">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                        <StatusIcon className="w-32 h-32 rotate-12" />
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                                        {/* Product thumbnails */}
                                        <div className="flex -space-x-4 flex-shrink-0">
                                            {order.items?.slice(0, 3).map((item, idx: number) => (
                                                <div
                                                    key={item.id}
                                                    className="relative w-16 h-20 bg-secondary/5 border-2 border-background overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform"
                                                    style={{ zIndex: 3 - idx }}
                                                >
                                                    {item.product_image ? (
                                                        <Image
                                                            src={item.product_image}
                                                            alt={item.product_name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-5 h-5 text-secondary/20" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {order.items && order.items.length > 3 && (
                                                <div className="w-16 h-20 bg-foreground text-background border-2 border-background flex items-center justify-center text-[10px] font-black uppercase shadow-lg">
                                                    +{order.items.length - 3}
                                                </div>
                                            )}
                                        </div>

                                        {/* Order details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <p className="font-black uppercase tracking-tight text-lg leading-none">ACQUISITION #{order.id.toString().padStart(5, '0')}</p>
                                                        <span className={`text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border-[0.5px] border-current leading-none ${cfg.color}`}>{order.order_status}</span>
                                                    </div>
                                                    <p className="text-[9px] text-secondary/40 uppercase tracking-[0.3em] font-black">{date}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black tracking-tighter mb-1">₦{Number(order.total_amount).toLocaleString()}</p>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-secondary/30">{totalQty} ITEMS</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-foreground/5">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2">
                                                        <StatusIcon className={`w-3 h-3 ${cfg.color}`} />
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-secondary/60">Status: {cfg.label}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    View Acquisition Details <ArrowRight className="inline w-3 h-3 ml-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
