'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Banknote, CreditCard, BellRing } from 'lucide-react';
import StatCard from '@/components/vendor/StatCard';
import OrdersTable, { Order } from '@/components/vendor/OrdersTable';
import NotificationsPanel, { Notification } from '@/components/vendor/NotificationsPanel';
import { useNotification } from '@/context/NotificationContext';

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
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/dashboard/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setMetrics(data);
            setError(null);
            
            // Notification toast logic
            if (data.recent_notifications && data.recent_notifications.length > 0) {
                const highestId = Math.max(...data.recent_notifications.map((n: BackendNotification) => n.id));
                if (isBackground && lastNotificationId.current > 0 && highestId > lastNotificationId.current) {
                    // Find the new unseen notifications
                    const newAlerts = data.recent_notifications.filter((n: BackendNotification) => n.id > lastNotificationId.current && !n.read);
                    if (newAlerts.length > 0) {
                        notify('info', 'New Alert', `You have ${newAlerts.length} new notification${newAlerts.length > 1 ? 's' : ''}.`);
                    }
                }
                lastNotificationId.current = highestId;
            }
          }
        } else {
          try {
            const errData = await res.json();
            if (isMounted) setError(errData.error || errData.detail || "Failed to load dashboard metrics.");
          } catch {
            if (isMounted) setError(`Failed to load: Error ${res.status}`);
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

    // Polling every 15 seconds
    const intervalId = setInterval(() => {
        fetchMetrics(true);
    }, 15000);

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
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/notifications/${id}/mark_read/`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
        console.error("Failed to mark read", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><p className="text-secondary uppercase tracking-widest text-xs">Loading dashboard...</p></div>;
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200">
        <p className="text-red-800 text-sm font-bold tracking-widest uppercase">Dashboard Error: {error}</p>
      </div>
    );
  }


  // Map backend order structure to frontend table structure
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
    date: new Date(o.created_at).toLocaleDateString()
  }));

  const formattedNotifications: Notification[] = (metrics?.recent_notifications || []).map((n: BackendNotification) => ({
    id: n.id.toString(),
    message: n.message,
    type: n.type,
    read: n.read,
    created_at: n.created_at
  }));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-end">
        <Link 
          href="/dashboard/vendor/withdrawals" 
          className="bg-primary text-background font-bold uppercase tracking-widest text-xs px-6 py-4 rounded-none hover:bg-primary/90 transition-colors shadow-sm w-full md:w-auto text-center"
        >
          Request Withdrawal
        </Link>
      </div>

      {/* Top row: Core sales stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₦${(metrics?.total_revenue ?? 0).toLocaleString()}`} 
          icon={<Banknote className="w-4 h-4" />}
          description="Gross sales across all time"
        />
        <StatCard 
          title="Total Orders" 
          value={metrics?.total_orders || 0} 
          icon={<ShoppingCart className="w-4 h-4" />}
          description={`${metrics?.orders_today} orders today`}
        />
        <StatCard 
          title="Vendor Balance" 
          value={`₦${(metrics?.vendor_balance ?? 0).toLocaleString()}`} 
          icon={<CreditCard className="w-4 h-4" />}
          description="Available for withdrawal"
        />
        <StatCard 
          title="Pending Payout" 
          value={`₦${(metrics?.pending_payout ?? 0).toLocaleString()}`} 
          icon={<ClockIcon />}
          description="Currently processing"
        />
      </div>

      {/* Second row: Product stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Active Products" 
          value={metrics?.approved_products || 0} 
          icon={<Package className="w-4 h-4" />}
        />
        <StatCard 
          title="Pending Review" 
          value={metrics?.pending_products || 0} 
          description="Awaiting admin approval"
        />
        <StatCard 
          title="Total Commission Paid" 
          value={`₦${(metrics?.total_commission ?? 0).toLocaleString()}`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-tighter">Recent Orders</h2>
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
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-4 h-4">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
