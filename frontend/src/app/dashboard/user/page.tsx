'use client';

import { useState, useEffect, useRef } from 'react';
import { User, ShoppingBag, MapPin, CreditCard, ArrowRight, Bell, Clock, CheckCircle, Truck, XCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import { UserProfile, Order, Notification, OrderItem } from '@/types/user';
import { formatCurrency } from '@/lib/format';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    pending: { label: 'Order Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    processing: { label: 'Processing', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

export default function UserDashboardPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState({ orders: 0, addresses: 0, cards: 0 });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { notify } = useNotification();
    const lastNotificationId = useRef<number>(0);

    useEffect(() => {
        let isMounted = true;

        const fetchOverview = async (isBackground = false) => {
            const token = localStorage.getItem('access_token');
            const headers = { Authorization: `Bearer ${token}` };

            try {
                const [pRes, aRes, cRes, oRes, nRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/user/profile/`, { headers }),
                    fetch(`${API_BASE_URL}/addresses/`, { headers }),
                    fetch(`${API_BASE_URL}/saved-cards/`, { headers }),
                    fetch(`${API_BASE_URL}/orders/`, { headers }),
                    fetch(`${API_BASE_URL}/user/notifications/`, { headers }),
                ]);

                if (!isMounted) return;

                if (pRes.ok) setProfile(await pRes.json());

                if (aRes.ok) {
                    const d = await aRes.json();
                    setStats(s => ({ ...s, addresses: (Array.isArray(d) ? d : d.results ?? []).length }));
                }
                if (cRes.ok) {
                    const d = await cRes.json();
                    setStats(s => ({ ...s, cards: (Array.isArray(d) ? d : d.results ?? []).length }));
                }
                if (oRes.ok) {
                    const d = await oRes.json();
                    const list: Order[] = Array.isArray(d) ? d : d.results ?? [];
                    const sorted = list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setStats(s => ({ ...s, orders: sorted.length }));
                    setRecentOrders(sorted.slice(0, 3));
                }
                if (nRes.ok) {
                    const d = await nRes.json();
                    const list: Notification[] = Array.isArray(d) ? d : d.results ?? [];
                    setNotifications(list.slice(0, 4));
                    setUnreadCount(list.filter((n) => !n.is_read).length);

                    if (list.length > 0) {
                        const highestId = Math.max(...list.map(n => n.id));
                        if (isBackground && lastNotificationId.current > 0 && highestId > lastNotificationId.current) {
                            const newAlerts = list.filter(n => n.id > lastNotificationId.current && !n.is_read);
                            if (newAlerts.length > 0) {
                                notify('info', 'Comraid Update', `You have ${newAlerts.length} new notification${newAlerts.length > 1 ? 's' : ''}.`);
                            }
                        }
                        lastNotificationId.current = highestId;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch user dashboard data", err);
            }
        };

        fetchOverview(false);

        const pollInterval = setInterval(() => {
            fetchOverview(true);
        }, 30000); // Increased to 30s to reduce load

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, [notify]);


    const markAllRead = async () => {
        const token = localStorage.getItem('access_token');
        await fetch(`${API_BASE_URL}/user/notifications/mark_all_read/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(n => n.map(x => ({ ...x, is_read: true })));
        setUnreadCount(0);
    };

    const overviewCards = [
        { title: 'Account Details', val: profile?.username || '...', icon: User, href: '/dashboard/user/profile', label: 'Manage Profile' },
        { title: 'Address Book', val: stats.addresses, icon: MapPin, href: '/dashboard/user/addresses', label: 'Shipping Info' },
        { title: 'Payment Methods', val: stats.cards, icon: CreditCard, href: '/dashboard/user/billing', label: 'Saved Cards' },
        { title: 'Order History', val: stats.orders, icon: ShoppingBag, href: '/dashboard/user/orders', label: 'All Orders' },
    ];

    return (
        <div className="space-y-16 max-w-6xl">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-foreground text-background px-2 py-0.5">Comraid Member</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40">Since 2026</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none font-cormorant italic pr-4">
                        Archive Entry: #{profile?.id?.toString().padStart(3, '0') || '001'}
                    </h2>
                    <p className="text-secondary/60 text-xs font-bold uppercase tracking-[0.2em] max-w-md">
                        Welcome back, {profile?.first_name || profile?.username || 'Curator'}. Manage your account, preferences, and order history.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/30">Account Status</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#10b981]">Active</span>
                </div>
            </motion.div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewCards.map((card, i) => (
                    <Link href={card.href} key={i}>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-background border border-border p-8 hover:bg-foreground hover:text-background transition-all duration-500 group flex flex-col justify-between h-full min-h-[180px] relative overflow-hidden shadow-sm"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <card.icon className="w-24 h-24 rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/40 group-hover:text-background/40 transition-colors">
                                        {card.title}
                                    </span>
                                    <card.icon className="w-3.5 h-3.5 text-secondary/30 group-hover:text-background/60 transition-colors" />
                                </div>

                                <div className="pt-4">
                                    <p className="text-3xl font-black tracking-tighter uppercase mb-1">{card.val}</p>
                                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-40 mb-6">{card.label}</p>
                                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        Open Module <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Lower grid: Recent Orders + Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
                {/* Recent Orders */}
                <div className="lg:col-span-7 bg-background border border-border shadow-sm">
                    <div className="flex items-center justify-between p-8 border-b border-border">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-cormorant italic font-bold tracking-tight">Recent Orders</h3>
                        </div>
                        <Link href="/dashboard/user/orders" className="text-[9px] font-black uppercase tracking-widest text-foreground hover:underline flex items-center gap-2 border border-border px-3 py-1.5 transition-colors hover:bg-secondary/5">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="p-16 text-center space-y-6">
                            <ShoppingBag className="w-12 h-12 text-secondary/10 mx-auto" />
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40">No Order History Found</p>
                                <p className="text-[9px] text-secondary/30 uppercase tracking-widest italic">You have not placed any orders yet.</p>
                            </div>
                            <Link href="/shop" className="inline-block text-[9px] font-black uppercase tracking-widest bg-foreground text-background px-6 py-3 hover:translate-y-[-2px] transition-transform">
                                Start Shopping →
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {recentOrders.map((order) => {
                                const cfg = STATUS_CONFIG[order.order_status] ?? STATUS_CONFIG.pending;
                                const StatusIcon = cfg.icon;
                                const date = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                const totalQty = order.items?.reduce((acc: number, item: OrderItem) => acc + (item.quantity || 1), 0) || 0;
                                return (
                                    <Link key={order.id} href={`/dashboard/user/orders/${order.id}`} className="flex items-center justify-between p-6 hover:bg-secondary/5 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110 ${cfg.bg}`}>
                                                <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-[11px] font-black uppercase tracking-tight">Order: #{order.id.toString().padStart(5, '0')}</p>
                                                    <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 ${cfg.color} border border-current opacity-70`}>{order.order_status}</span>
                                                </div>
                                                <p className="text-[9px] text-secondary/50 uppercase tracking-widest font-bold">{date} // {totalQty} UNITS</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black tracking-tight mb-0.5">{formatCurrency(order.total_amount)}</p>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-secondary/40 group-hover:text-foreground transition-colors">Order Details →</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="lg:col-span-5 bg-background border border-border shadow-sm">
                    <div className="flex items-center justify-between p-8 border-b border-border">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-cormorant italic font-bold tracking-tight">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="w-5 h-5 bg-foreground text-background text-[9px] font-black flex items-center justify-center rounded-full shadow-lg">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[9px] font-black uppercase tracking-widest text-secondary hover:text-foreground transition-colors border border-border px-3 py-1.5 hover:bg-secondary/5">
                                Clear All
                            </button>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-16 text-center space-y-4">
                            <Bell className="w-12 h-12 text-secondary/10 mx-auto" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40">No New Notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((n) => (
                                <div key={n.id} className={`p-6 flex gap-5 items-start transition-colors relative ${!n.is_read ? 'bg-foreground/[0.02]' : ''}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${!n.is_read ? 'bg-foreground ring-4 ring-foreground/5' : 'bg-secondary/20'}`} />
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black uppercase tracking-tight mb-1">{n.title}</p>
                                        <p className="text-[10px] text-secondary/70 leading-relaxed font-medium">{n.body}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Clock className="w-2.5 h-2.5 text-secondary/40" />
                                            <p className="text-[8px] text-secondary/40 uppercase tracking-[0.2em] font-black">
                                                {new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-foreground" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
