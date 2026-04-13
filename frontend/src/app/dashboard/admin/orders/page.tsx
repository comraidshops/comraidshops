'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Check, X, Eye, Package, Truck, CheckCircle, RotateCcw, XCircle, Clock } from 'lucide-react';
import { safeFetch } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import { AdminModal } from '@/components/admin/AdminForms';
import Image from 'next/image';

interface OrderItem {
    id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    price: string;
    status: string;
    vendor_brand_name: string;
}

interface Order {
    id: number;
    customer_email: string;
    total_amount: string;
    payment_status: string;
    order_status: string;
    items: OrderItem[];
    created_at: string;
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const { notify } = useNotification();

    const renderPaymentBadge = (status: string) => {
        switch(status) {
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary">
                        <CheckCircle className="w-3 h-3" /> {status}
                    </span>
                );
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-orange-400/10 text-orange-400 border border-orange-400/20">
                        <CheckCircle className="w-3 h-3 text-green-500" /> {status} (Action Required)
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-500/10 text-red-500">
                        <XCircle className="w-3 h-3 text-red-500" /> {status}
                    </span>
                );
            case 'refunded':
                return (
                    <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/10 text-purple-500">
                        <RotateCcw className="w-3 h-3" /> {status}
                    </span>
                );
            default: // pending
                return (
                    <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-white/40">
                        <Clock className="w-3 h-3" /> {status}
                    </span>
                );
        }
    };

    useEffect(() => {
        async function fetchOrders() {
            try {
                const data = await safeFetch('/admin-api/orders/');
                setOrders(data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    async function handleConfirmPayment(orderId: number) {
        setActionLoading(true);
        try {
            await safeFetch(`/admin-api/orders/${orderId}/confirm_payment/`, { method: 'POST' });
            setOrders(orders.map(o => o.id === orderId ? { ...o, payment_status: 'confirmed' } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, payment_status: 'confirmed' });
            }
            notify('success', 'Payment Confirmed', 'Order payment has been confirmed and vendor earnings created.');
        } catch (error: unknown) {
            notify('error', 'Confirmation Failed', (error as Error)?.message || "Failed to confirm payment");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleCancelOrder(orderId: number) {
        setActionLoading(true);
        try {
            await safeFetch(`/admin-api/orders/${orderId}/cancel_order/`, {
                method: 'POST',
                body: JSON.stringify({ reason: 'Cancelled by admin.' })
            });
            setOrders(orders.map(o => o.id === orderId ? { ...o, payment_status: 'failed', order_status: 'cancelled' } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, payment_status: 'failed', order_status: 'cancelled' });
            }
            notify('success', 'Order Cancelled', 'Order has been cancelled and stock returned.');
        } catch (error: unknown) {
            notify('error', 'Cancellation Failed', (error as Error)?.message || "Failed to cancel order");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateOrderStatus(orderId: number, status: 'processing' | 'shipped' | 'delivered') {
        const actionMap = {
            'processing': 'mark_processing',
            'shipped': 'mark_shipped',
            'delivered': 'mark_delivered'
        };
        const endpoint = `/admin-api/orders/${orderId}/${actionMap[status]}/`;

        setActionLoading(true);
        try {
            await safeFetch(endpoint, { method: 'POST' });
            setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: status } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, order_status: status });
            }
            notify('success', 'Status Updated', `Order status has been updated to ${status}.`);
        } catch (error: unknown) {
            notify('error', 'Update Failed', (error as Error)?.message || `Failed to update status to ${status}`);
        } finally {
            setActionLoading(false);
        }
    }

    async function handleRefundPayment(orderId: number) {
        setActionLoading(true);
        try {
            await safeFetch(`/admin-api/orders/${orderId}/refund_payment/`, { method: 'POST' });
            setOrders(orders.map(o => o.id === orderId ? { ...o, payment_status: 'refunded' } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, payment_status: 'refunded' });
            }
            notify('success', 'Order Refunded', 'Order payment has been marked as refunded.');
        } catch (error: unknown) {
            notify('error', 'Refund Failed', (error as Error)?.message || "Failed to refund payment");
        } finally {
            setActionLoading(false);
        }
    }

    return (
        <div className="space-y-8 lg:space-y-12">
            <header className="flex flex-col justify-between gap-4">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 lg:mb-4 block">Order Management</span>
                    <h1 className="text-4xl lg:text-5xl font-playfair font-medium tracking-tight">Platform <span className="italic opacity-80">Orders.</span></h1>
                </div>
            </header>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Order / Customer</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Amount</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Payment Status</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Order Status</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Date</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {orders.map((order, idx) => (
                                <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                                >
                                    <td className="px-8 py-6">
                                        <div>
                                            <div className="text-sm font-bold tracking-tight mb-1">Order #{order.id}</div>
                                            <div className="text-[10px] font-bold text-white/20">{order.customer_email || 'Guest'}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-lg">₦{parseFloat(order.total_amount).toLocaleString()}</td>
                                    <td className="px-8 py-6">
                                        {renderPaymentBadge(order.payment_status)}
                                    </td>
                                    <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">
                                        {order.order_status}
                                    </td>
                                    <td className="px-8 py-6 text-[10px] font-bold text-white/40">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end items-center gap-2 transition-opacity">
                                            <button
                                                onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }}
                                                className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            {(order.payment_status === 'paid' || order.payment_status === 'pending') && (
                                                <button
                                                    onClick={() => handleConfirmPayment(order.id)}
                                                    className="p-3 rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-black transition-all"
                                                    title="Confirm Payment"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}

                                            {order.payment_status === 'confirmed' && order.order_status === 'pending' && (
                                                <button
                                                    onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                                                    className="p-3 rounded-xl bg-white/10 text-white hover:bg-white hover:text-black transition-all"
                                                    title="Mark Processing"
                                                >
                                                    <Package className="w-4 h-4" />
                                                </button>
                                            )}

                                            {order.order_status === 'processing' && (
                                                <button
                                                    onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                                    className="p-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                                                    title="Mark Shipped"
                                                >
                                                    <Truck className="w-4 h-4" />
                                                </button>
                                            )}

                                            {order.order_status === 'shipped' && (
                                                <button
                                                    onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                                    className="p-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all"
                                                    title="Mark Delivered"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}

                                            {order.payment_status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleRefundPayment(order.id)}
                                                    className="p-3 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all"
                                                    title="Refund Order"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                            )}

                                            {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="p-3 rounded-xl bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white transition-all"
                                                    title="Cancel Order"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Mobile View Placeholder */}
            <div className="lg:hidden space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold tracking-tight">Order #{order.id}</h4>
                            {renderPaymentBadge(order.payment_status)}
                        </div>
                        <div className="text-xl font-bold">₦{parseFloat(order.total_amount).toLocaleString()}</div>
                        <div className="text-[10px] text-white/40">{order.customer_email || 'Guest'}</div>
                        <div className="flex gap-2 pt-4 border-t border-white/5">
                            <button onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }} className="flex-1 py-3 rounded-xl bg-white/5 text-white text-[10px] font-bold uppercase tracking-widest">
                                View
                            </button>
                            {(order.payment_status === 'paid' || order.payment_status === 'pending') && (
                                <button onClick={() => handleConfirmPayment(order.id)} className="flex-1 py-3 rounded-xl bg-primary text-black text-[10px] font-bold uppercase tracking-widest">
                                    Confirm
                                </button>
                            )}
                            {order.payment_status === 'confirmed' && order.order_status === 'pending' && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'processing')} className="flex-1 py-3 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest">
                                    Process
                                </button>
                            )}
                            {order.order_status === 'processing' && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'shipped')} className="flex-1 py-3 rounded-xl bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest">
                                    Ship
                                </button>
                            )}
                            {order.order_status === 'shipped' && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'delivered')} className="flex-1 py-3 rounded-xl bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest">
                                    Deliver
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {!loading && orders.length === 0 && (
                <div className="p-24 text-center">
                    <FileText className="w-12 h-12 text-white/5 mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">No orders found</p>
                </div>
            )}

            {/* View Order Modal */}
            <AdminModal
                isOpen={isViewModalOpen && selectedOrder !== null}
                onClose={() => setIsViewModalOpen(false)}
                title={`Order #${selectedOrder?.id}`}
                loading={actionLoading}
            >
                {selectedOrder && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-6 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                            <div>
                                <label className="text-[8px] font-black uppercase tracking-widest text-white/20 block mb-1">Customer</label>
                                <div className="text-sm font-bold">{selectedOrder.customer_email || 'Guest'}</div>
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase tracking-widest text-white/20 block mb-1">Date</label>
                                <div className="text-sm font-bold">{new Date(selectedOrder.created_at).toLocaleString()}</div>
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase tracking-widest text-white/20 block mb-1">Payment Status</label>
                                {renderPaymentBadge(selectedOrder.payment_status)}
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase tracking-widest text-white/20 block mb-1">Order Status</label>
                                <div className="text-[10px] font-black uppercase tracking-widest">{selectedOrder.order_status}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 border-b border-white/10 pb-2">Order Items</h3>
                            <div className="space-y-4">
                                {selectedOrder.items.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center bg-white/[0.01] p-4 rounded-xl border border-white/5">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white/5">
                                            {item.product_image ? (
                                                <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-white/20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="text-sm font-bold mb-1">{item.product_name}</div>
                                            <div className="text-[8px] font-black uppercase tracking-widest text-white/40">{item.vendor_brand_name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold">₦{parseFloat(item.price).toLocaleString()}</div>
                                            <div className="text-[10px] text-white/40">Qty: {item.quantity}</div>
                                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-1">{item.status}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Amount</span>
                                <span className="text-xl font-bold text-primary">₦{parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10">
                            {(selectedOrder.payment_status === 'paid' || selectedOrder.payment_status === 'pending') && (
                                <button
                                    onClick={() => handleConfirmPayment(selectedOrder.id)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all"
                                >
                                    <Check className="w-4 h-4" /> Confirm Payment
                                </button>
                            )}

                            {selectedOrder.payment_status === 'confirmed' && selectedOrder.order_status === 'pending' && (
                                <button
                                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'processing')}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all"
                                >
                                    <Package className="w-4 h-4" /> Start Processing
                                </button>
                            )}

                            {selectedOrder.order_status === 'processing' && (
                                <button
                                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'shipped')}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all"
                                >
                                    <Truck className="w-4 h-4" /> Mark Shipped
                                </button>
                            )}

                            {selectedOrder.order_status === 'shipped' && (
                                <button
                                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered')}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-green-600 transition-all"
                                >
                                    <CheckCircle className="w-4 h-4" /> Mark Delivered
                                </button>
                            )}

                            {selectedOrder.payment_status === 'confirmed' && (
                                <button
                                    onClick={() => handleRefundPayment(selectedOrder.id)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-purple-600 transition-all"
                                >
                                    <RotateCcw className="w-4 h-4" /> Refund Payment
                                </button>
                            )}

                            {selectedOrder.order_status !== 'cancelled' && selectedOrder.order_status !== 'delivered' && (
                                <button
                                    onClick={() => handleCancelOrder(selectedOrder.id)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <X className="w-4 h-4" /> Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </AdminModal>
        </div>
    );
}
