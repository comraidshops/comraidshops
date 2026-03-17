'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    pending:   { label: 'Pending',   icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-500/10'  },
    paid:      { label: 'Confirmed', icon: CheckCircle,  color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
    shipped:   { label: 'Shipped',   icon: Truck,        color: 'text-purple-500', bg: 'bg-purple-500/10' },
    completed: { label: 'Delivered', icon: CheckCircle,  color: 'text-green-500',  bg: 'bg-green-500/10'  },
    cancelled: { label: 'Cancelled', icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-500/10'    },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
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
                    setOrders(list.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
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
            <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
                <div className="w-16 h-16 bg-secondary/10 border border-border flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-secondary/40" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-bold uppercase tracking-tighter text-lg">No Acquisitions Yet</h3>
                    <p className="text-xs text-secondary/60 uppercase tracking-widest font-bold">Your luxury archive is empty.</p>
                </div>
                <Link
                    href="/shop"
                    className="bg-primary text-background px-10 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-secondary transition-colors"
                >
                    Explore Collections
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold uppercase tracking-tighter">Acquisition History</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} on record</p>
            </div>

            <div className="space-y-4">
                {orders.map((order, i) => {
                    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                    const StatusIcon = cfg.icon;
                    const date = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    const firstItem = order.items?.[0];

                    return (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <Link href={`/dashboard/user/orders/${order.id}`}>
                                <div className="bg-background border border-border hover:border-primary transition-all group p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                        {/* Product thumbnails */}
                                        <div className="flex -space-x-3 flex-shrink-0">
                                            {order.items?.slice(0, 3).map((item: any, idx: number) => (
                                                <div
                                                    key={item.id}
                                                    className="relative w-14 h-16 bg-secondary/10 border-2 border-background overflow-hidden flex-shrink-0"
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
                                                            <Package className="w-4 h-4 text-secondary/30" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {order.items?.length > 3 && (
                                                <div className="w-14 h-16 bg-secondary/10 border-2 border-background flex items-center justify-center text-[9px] font-black text-secondary/40 uppercase">
                                                    +{order.items.length - 3}
                                                </div>
                                            )}
                                        </div>

                                        {/* Order details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-bold uppercase tracking-tight text-sm">Order #{order.id}</p>
                                                    <p className="text-[10px] text-secondary/50 uppercase tracking-widest font-bold mt-0.5">{date}</p>
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 ${cfg.bg} flex-shrink-0`}>
                                                    <StatusIcon className={`w-3 h-3 ${cfg.color}`} />
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${cfg.color}`}>{cfg.label}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                                                <span className="text-[10px] text-secondary/60 uppercase tracking-widest font-bold">
                                                    {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                                                </span>
                                                <span className="text-[10px] text-secondary/30 uppercase font-bold">·</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    ${Number(order.total_amount).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <ArrowRight className="w-4 h-4 text-secondary/20 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 hidden sm:block" />
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
