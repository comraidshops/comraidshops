'use client';

import React, { useEffect, useState } from 'react';
import OrdersTable, { Order } from '@/components/vendor/OrdersTable';

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/orders/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                const formatted: Order[] = data.map((o: {
                    id: number;
                    total_amount: string;
                    customer_name: string;
                    payment_status: Order['payment_status'];
                    order_status: Order['order_status'];
                    created_at: string;
                    items: { product_name: string; quantity: number }[];
                    financials?: { commission: string; net_earning: string };
                    shipping_full_name?: string;
                    shipping_phone_number?: string;
                    shipping_address_line1?: string;
                    shipping_address_line2?: string;
                    shipping_city?: string;
                    shipping_state?: string;
                    shipping_zip_code?: string;
                    shipping_country?: string;
                }) => ({
                    id: o.id.toString(),
                    product: o.items[0]?.product_name || 'Multiple items',
                    buyer: o.customer_name,
                    quantity: o.items.reduce((acc, item) => acc + item.quantity, 0),
                    total: parseFloat(o.total_amount),
                    commission: parseFloat(o.financials?.commission || '0'),
                    earnings: parseFloat(o.financials?.net_earning || (parseFloat(o.total_amount) * 0.9).toString()),
                    payment_status: o.payment_status,
                    order_status: o.order_status,
                    date: new Date(o.created_at).toLocaleDateString(),
                    shipping_full_name: o.shipping_full_name,
                    shipping_phone_number: o.shipping_phone_number,
                    shipping_address_line1: o.shipping_address_line1,
                    shipping_address_line2: o.shipping_address_line2,
                    shipping_city: o.shipping_city,
                    shipping_state: o.shipping_state,
                    shipping_zip_code: o.shipping_zip_code,
                    shipping_country: o.shipping_country,
                }));
                setOrders(formatted);
            }
        } catch (error) {
            console.error("Error fetching orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: Order['order_status']) => {
        if (newStatus === 'cancelled' && !confirm(`Are you sure you want to cancel Order #${orderId}?`)) {
            return;
        }

        setUpdatingId(orderId);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/orders/${orderId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order_status: newStatus })
            });

            if (res.ok) {
                await fetchOrders();
            } else {
                const error = await res.json();
                alert(`Error: ${error.error || "Failed to update status"}`);
            }
        } catch (error) {
            console.error("Update failed", error);
            alert("Network error updating status.");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-5 md:space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter">Order Management</h2>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <p className="text-secondary uppercase tracking-widest text-xs">Loading orders...</p>
                </div>
            ) : (
                <OrdersTable
                    orders={orders}
                    onStatusChange={handleStatusUpdate}
                    updatingId={updatingId}
                />
            )}
        </div>
    );
}
