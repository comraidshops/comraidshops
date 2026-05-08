'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Banknote, CreditCard, ArrowUpRight, TrendingUp } from 'lucide-react';
import StatCard from '@/components/vendor/StatCard';
import OrdersTable, { Order } from '@/components/vendor/OrdersTable';
import NotificationsPanel, { Notification } from '@/components/vendor/NotificationsPanel';
import { useNotification } from '@/context/NotificationContext';
import { formatCurrency } from '@/lib/format';
import { safeFetch } from '@/lib/api';

interface DashboardMetrics {
  total_products: number;
  pending_products: number;
  approved_products: number;
  total_variants: number;
  total_orders: number;
  orders_today: number;
  total_revenue: number;
  total_commission: number;
  vendor_balance: number;
  pending_payout: number;
  recent_orders: BackendOrder[];
  recent_notifications: BackendNotification[];
  commission_rate?: number;
}

interface BackendOrder {
  id: number;
  customer_name: string;
  total_amount: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
  }>;
  financials?: {
    commission: string;
    net_earning: string;
    status: string;
  };
  shipping_full_name?: string;
  shipping_phone_number?: string;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip_code?: string;
  shipping_country?: string;
}

interface BackendNotification {
  id: number;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export default function VendorDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();
  const lastNotificationId = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;

    const fetchMetrics = async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      try {
        const data = await safeFetch('/vendor/dashboard/');

        if (data) {
          if (isMounted) {
            setMetrics(data);
            setError(null);

            if (data.recent_notifications && data.recent_notifications.length > 0) {
              const highestId = Math.max(...data.recent_notifications.map((n: BackendNotification) => n.id));
              if (isBackground && lastNotificationId.current > 0 && highestId > lastNotificationId.current) {
                const newAlerts = data.recent_notifications.filter((n: BackendNotification) => n.id > lastNotificationId.current && !n.read);
                if (newAlerts.length > 0) {
                  notify('info', 'New Alert', `You have ${newAlerts.length} new notification${newAlerts.length > 1 ? 's' : ''}.`);
                }
              }
              lastNotificationId.current = highestId;
            }
          }
        }
      } catch (err: unknown) {
        console.error("Error fetching metrics", err);
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        if (isMounted) setError(message);
      } finally {
        if (isMounted && !isBackground) setLoading(false);
      }
    };

    fetchMetrics(false);

    const intervalId = setInterval(() => {
      fetchMetrics(true);
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [notify]);


  const handleMarkRead = async (id: string) => {
    if (metrics) {
      setMetrics({
        ...metrics,
        recent_notifications: metrics.recent_notifications.map(n =>
          n.id.toString() === id ? { ...n, read: true } : n
        )
      });
    }

    try {
      await safeFetch(`/vendor/notifications/${id}/mark_read/`, {
        method: 'POST'
      });
      window.dispatchEvent(new Event('notifications_updated'));
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'The Morning Edition';
    if (hour < 17) return 'The Afternoon Update';
    return 'The Evening Summary';
  };

  if (loading) {
    return <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-secondary uppercase tracking-[0.3em] text-[10px] font-black animate-pulse">Initializing Dashboard Vector...</p>
    </div>;
  }

  if (error) {
    return (
      <div className="p-8 md:p-12 bg-red-500/5 border border-red-500/20 max-w-2xl mx-auto mt-12">
        <h2 className="text-red-500 text-xs font-black tracking-[0.3em] uppercase mb-4">Critical System Error</h2>
        <p className="text-red-500/70 text-sm font-medium leading-relaxed italic font-source-serif">"{error}"</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-6 py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors">
            Attempt Re-authentication
        </button>
      </div>
    );
  }


  const formattedOrders: Order[] = (metrics?.recent_orders || []).map((o: BackendOrder) => ({
    id: o.id.toString(),
    product: o.items[0]?.product_name || 'Multiple items',
    buyer: o.customer_name,
    quantity: o.items.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0),
    total: parseFloat(o.total_amount),
    commission: o.financials?.commission ? Number(o.financials.commission) : 0,
    earnings: o.financials?.net_earning ? Number(o.financials.net_earning) : 0,
    payment_status: o.payment_status as Order['payment_status'],
    order_status: o.order_status as Order['order_status'],
    date: new Date(o.created_at).toLocaleDateString(),
    shipping_full_name: o.shipping_full_name,
    shipping_phone_number: o.shipping_phone_number,
    shipping_address_line1: o.shipping_address_line1,
    shipping_address_line2: o.shipping_address_line2,
    shipping_city: o.shipping_city,
    shipping_state: o.shipping_state,
    shipping_zip_code: o.shipping_zip_code,
    shipping_country: o.shipping_country,
    items: o.items.map(i => ({ name: i.product_name, quantity: i.quantity, status: o.order_status }))
  }));

  const formattedNotifications: Notification[] = (metrics?.recent_notifications || []).map((n: BackendNotification) => ({
    id: n.id.toString(),
    message: n.message,
    type: n.type,
    read: n.read,
    created_at: n.created_at
  }));

  return (
    <div className="space-y-12 md:space-y-20 pb-20">
      {/* Editorial Hero Section */}
      <section className="relative pt-8 md:pt-12 border-b border-white/5 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/[0.02] to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/40">Comraid Editorial</span>
            <div className="h-[1px] w-12 bg-white/10" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{getGreeting()}</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-primary font-source-serif italic leading-[0.9]">
               Performance <br />
               <span className="text-secondary/40 not-italic font-sans uppercase text-[0.4em] tracking-[0.5em] block mt-4">Overview Portfolio</span>
            </h1>
            
            <div className="flex items-center gap-6">
               <div className="text-right hidden md:block">
                  <p className="text-[9px] font-black uppercase tracking-widest text-secondary/30 mb-1">Global Orders Today</p>
                  <p className="text-2xl font-black text-primary font-source-serif italic">{metrics?.orders_today || 0}</p>
               </div>
               <Link
                href="/dashboard/vendor/withdrawals"
                className="group flex items-center gap-3 bg-primary text-background px-8 py-5 text-[11px] font-black uppercase tracking-[0.25em] hover:bg-white transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
              >
                Execute Withdrawal <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Financial Vector */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-primary/40" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-secondary/40">Financial Distribution</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <StatCard
            title="Revenue Vector"
            value={formatCurrency(metrics?.total_revenue)}
            icon={<Banknote className="w-5 h-5" />}
            description="Gross portfolio value"
          />
          <StatCard
            title="Order Volume"
            value={metrics?.total_orders || 0}
            icon={<ShoppingCart className="w-5 h-5" />}
            description={`Velocity: ${metrics?.orders_today} / day`}
          />
          <StatCard
            title="Liquid Balance"
            value={formatCurrency(metrics?.vendor_balance)}
            icon={<CreditCard className="w-5 h-5" />}
            description="Available for execution"
          />
          <StatCard
            title="Escrow Payout"
            value={formatCurrency(metrics?.pending_payout)}
            icon={<ClockIcon />}
            description="In processing cycle"
          />
        </div>
      </div>

      {/* Secondary Product Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <StatCard
          title="Live Assets"
          value={metrics?.approved_products || 0}
          icon={<Package className="w-5 h-5" />}
          description="Active in marketplace"
        />
        <StatCard
          title="Review Queue"
          value={metrics?.pending_products || 0}
          description="Awaiting verification"
        />
        <StatCard
          title="Taxation (Fee)"
          value={formatCurrency(metrics?.total_commission)}
          description={`Rate: ${metrics?.commission_rate || 0}%`}
        />
      </div>

      {/* Complex Data Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16 items-start">
        <div className="lg:col-span-2 space-y-8 md:space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-primary">Recent Acquisitions</h2>
            <Link href="/dashboard/vendor/orders" className="text-[9px] font-black uppercase tracking-widest text-secondary/40 hover:text-primary transition-colors flex items-center gap-2">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <OrdersTable orders={formattedOrders} />
        </div>

        <div className="lg:col-span-1">
          <NotificationsPanel
            notifications={formattedNotifications}
            onMarkRead={handleMarkRead}
          />
        </div>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
