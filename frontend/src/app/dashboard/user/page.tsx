'use client';

import { useState, useEffect, useRef } from 'react';
import { User, ShoppingBag, MapPin, CreditCard, ArrowRight, Bell, Clock, CheckCircle, Truck, XCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import { UserProfile, Order, Notification, OrderItem } from '@/types/user';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    pending:    { label: 'Order Pending', icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-500/10'  },
    processing: { label: 'Processing',    icon: Package,      color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
    shipped:    { label: 'Shipped',       icon: Truck,        color: 'text-purple-500', bg: 'bg-purple-500/10' },
    delivered:  { label: 'Delivered',     icon: CheckCircle,  color: 'text-green-500',  bg: 'bg-green-500/10'  },
    cancelled:  { label: 'Cancelled',     icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-500/10'    },
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
        }, 15000);

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
        { title: 'Identity',       val: profile?.username || '...',  icon: User,        href: '/dashboard/user/profile'   },
        { title: 'Addresses',      val: stats.addresses,             icon: MapPin,      href: '/dashboard/user/addresses' },
        { title: 'Secure Vault',   val: stats.cards,                 icon: CreditCard,  href: '/dashboard/user/billing'   },
        { title: 'Market Activity',val: stats.orders,                icon: ShoppingBag, href: '/dashboard/user/orders'    },
    ];

    return (
        <div className="space-y-12">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">Account Overview</h2>
                <p className="text-secondary text-xs font-bold uppercase tracking-widest">
                    Welcome back, {profile?.first_name || profile?.username || 'Curator'}.
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewCards.map((card, i) => (
                    <Link href={card.href} key={i}>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-background border border-border p-8 hover:border-primary transition-all group flex flex-col justify-between h-full min-h-[160px]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40 group-hover:text-primary transition-colors">
                                    {card.title}
                                </span>
                                <card.icon className="w-4 h-4 text-secondary/30 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="space-y-4">
                                <p className="text-2xl font-bold tracking-tighter uppercase line-clamp-1">{card.val}</p>
                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                    Access Sector <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Lower grid: Recent Orders + Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                {/* Recent Orders */}
                <div className="bg-background border border-border">
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40">Recent Acquisitions</p>
                        <Link href="/dashboard/user/orders" className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="p-10 text-center space-y-3">
                            <ShoppingBag className="w-8 h-8 text-secondary/20 mx-auto" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">No orders yet</p>
                            <Link href="/shop" className="block text-[9px] font-black uppercase tracking-widest text-primary hover:underline">
                                Explore the Shop →
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {recentOrders.map((order) => {
                                const cfg = STATUS_CONFIG[order.order_status] ?? STATUS_CONFIG.pending;
                                const StatusIcon = cfg.icon;
                                const date = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                                const totalQty = order.items?.reduce((acc: number, item: OrderItem) => acc + (item.quantity || 1), 0) || 0;
                                return (
                                    <Link key={order.id} href={`/dashboard/user/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-secondary/5 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 flex items-center justify-center ${cfg.bg}`}>
                                                <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-tight">Order #{order.id}</p>
                                                <p className="text-[9px] text-secondary/50 uppercase tracking-widest font-bold">{date} · {totalQty} item{totalQty !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold">₦{Number(order.total_amount).toLocaleString()}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="bg-background border border-border">
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div className="flex items-center gap-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40">Notifications</p>
                            {unreadCount > 0 && (
                                <span className="w-5 h-5 bg-primary text-background text-[9px] font-black flex items-center justify-center rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">
                                Mark all read
                            </button>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-10 text-center space-y-3">
                            <Bell className="w-8 h-8 text-secondary/20 mx-auto" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((n) => (
                                <div key={n.id} className={`p-4 flex gap-4 items-start transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}>
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${!n.is_read ? 'bg-primary' : 'bg-secondary/20'}`} />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-tight">{n.title}</p>
                                        <p className="text-[10px] text-secondary/60 leading-relaxed mt-0.5">{n.body}</p>
                                        <p className="text-[9px] text-secondary/30 uppercase tracking-widest font-bold mt-1">
                                            {new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
