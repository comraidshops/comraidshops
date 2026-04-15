'use client';

import { useState, useEffect } from 'react';
import { User, ShoppingBag, MapPin, CreditCard, ArrowRight, Bell, Clock, CheckCircle, Truck, XCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { API_BASE_URL, safeFetch } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import { UserProfile, Order, Notification, OrderItem } from '@/types/user';
import { formatCurrency } from '@/lib/format';
import { useDashboardNotifications } from './layout';
import { StatusBadge } from '@/components/ui/StatusBadge';

// STATUS_CONFIG removed in favor of unified StatusBadge component

export default function UserDashboardPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState({ orders: 0, addresses: 0, cards: 0 });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const { notify } = useNotification();
    const { notifications, unreadCount, markAllRead, openNotificationDetail } = useDashboardNotifications();

    useEffect(() => {
        let isMounted = true;

        const fetchOverview = async () => {
            try {
                const [profileData, addressesData, cardsData, ordersData] = await Promise.all([
                    safeFetch('/user/profile/'),
                    safeFetch('/addresses/'),
                    safeFetch('/saved-cards/'),
                    safeFetch('/orders/'),
                ]);

                if (!isMounted) return;

                if (profileData) setProfile(profileData);

                if (addressesData) {
                    setStats(s => ({ ...s, addresses: (Array.isArray(addressesData) ? addressesData : addressesData.results ?? []).length }));
                }
                if (cardsData) {
                    setStats(s => ({ ...s, cards: (Array.isArray(cardsData) ? cardsData : cardsData.results ?? []).length }));
                }
                if (ordersData) {
                    const list: Order[] = Array.isArray(ordersData) ? ordersData : ordersData.results ?? [];
                    const sorted = list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setStats(s => ({ ...s, orders: sorted.length }));
                    setRecentOrders(sorted.slice(0, 3));
                }
            } catch (err) {
                console.error("Failed to fetch user dashboard data", err);
            }
        };

        fetchOverview();

        return () => {
            isMounted = false;
        };
    }, [notify]);




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
                                const date = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                const totalQty = order.items?.reduce((acc: number, item: OrderItem) => acc + (item.quantity || 1), 0) || 0;
                                return (
                                    <Link key={order.id} href={`/dashboard/user/orders/${order.id}`} className="flex items-center justify-between p-6 hover:bg-secondary/5 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                                                <StatusBadge status={order.order_status} variant="minimal" className="!p-0 border-none opacity-100" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-[11px] font-black uppercase tracking-tight">Order: #{order.id.toString().padStart(5, '0')}</p>
                                                    <StatusBadge status={order.order_status} variant="minimal" />
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

                {/* Notifications — Editorial Teaser Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-5 bg-background border border-border shadow-sm relative overflow-hidden group"
                >
                    {/* Decorative gradient strip */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

                    <div className="p-8 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-foreground/5 border border-border flex items-center justify-center">
                                    <Bell className="w-3.5 h-3.5 text-secondary/60" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-cormorant italic font-bold tracking-tight">Notifications</h3>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground bg-foreground/5 border border-border px-2.5 py-1">
                                    {unreadCount} Unread
                                </span>
                            )}
                        </div>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-16 text-center space-y-4">
                            <Bell className="w-12 h-12 text-secondary/10 mx-auto" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40">No New Notifications</p>
                            <p className="text-[9px] text-secondary/30 uppercase tracking-widest italic">You&apos;re all caught up.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.slice(0, 3).map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => openNotificationDetail(n)}
                                    className={`px-8 py-5 flex gap-4 items-start transition-all relative cursor-pointer group/notif hover:bg-foreground/[0.04] ${!n.is_read ? 'bg-foreground/[0.02]' : ''}`}
                                >
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 transition-transform group-hover/notif:scale-125 ${!n.is_read ? 'bg-foreground shadow-[0_0_6px_rgba(0,0,0,0.2)]' : 'bg-secondary/20'}`} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-black uppercase tracking-tight mb-0.5 truncate group-hover/notif:underline">{n.title}</p>
                                        <p className="text-[10px] text-secondary/50 leading-relaxed font-medium line-clamp-1">{n.body}</p>
                                    </div>
                                    <span className="text-[8px] font-bold text-secondary/30 uppercase tracking-wider flex-shrink-0 pt-0.5">
                                        {new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                    </span>
                                    {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-foreground" />}
                                    <span className="text-[8px] font-black uppercase tracking-widest text-secondary/20 opacity-0 group-hover/notif:opacity-100 transition-opacity flex-shrink-0 pt-0.5">Read →</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer — Open Modal Prompt */}
                    {notifications.length > 0 && (
                        <div className="px-8 py-5 border-t border-border bg-foreground/[0.01]">
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-secondary/40 text-center">
                                Click any notification to read in full
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
