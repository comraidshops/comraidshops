import React from 'react';

export interface Order {
    id: string;
    product: string;
    buyer: string;
    quantity: number;
    total: number;
    commission: number;
    earnings: number;
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'confirmed';
    order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    date: string;
    shipping_full_name?: string;
    shipping_phone_number?: string;
    shipping_address_line1?: string;
    shipping_address_line2?: string;
    shipping_city?: string;
    shipping_state?: string;
    shipping_zip_code?: string;
    shipping_country?: string;
}

interface OrdersTableProps {
    orders: Order[];
    onStatusChange?: (orderId: string, newStatus: Order['order_status']) => Promise<void>;
    updatingId?: string | null;
}

import { ChevronDown, ChevronUp, MapPin, Phone, User } from 'lucide-react';

export default function OrdersTable({ orders, onStatusChange, updatingId }: OrdersTableProps) {
    const [expandedOrder, setExpandedOrder] = React.useState<string | null>(null);
    const ALLOWED_STATUSES: Order['order_status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const PAYMENT_STATUS_COLORS = {
        paid: 'text-green-700 bg-green-50 border-green-100',
        confirmed: 'text-green-700 bg-green-50 border-green-100',
        pending: 'text-amber-700 bg-amber-50 border-amber-100',
        failed: 'text-red-700 bg-red-50 border-red-100',
        refunded: 'text-gray-700 bg-gray-50 border-gray-100',
    };

    const getStatusColor = (status: Order['order_status']) => {
        switch (status) {
            case 'delivered': return 'text-green-700 bg-green-50 border-green-100';
            case 'shipped': return 'text-blue-700 bg-blue-50 border-blue-100';
            case 'processing': return 'text-amber-700 bg-amber-50 border-amber-100';
            case 'cancelled': return 'text-red-700 bg-red-50 border-red-100';
            default: return 'text-secondary bg-secondary/5 border-border';
        }
    };

    const renderQuickActions = (order: Order) => {
        if (updatingId === order.id) {
            return (
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-secondary/40">Updating...</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2 flex-wrap">
                {order.order_status === 'pending' && (order.payment_status === 'paid' || order.payment_status === 'confirmed') && (
                    <button 
                        onClick={() => onStatusChange?.(order.id, 'processing')}
                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-amber-600 text-white hover:bg-amber-700 transition-colors active:scale-95"
                    >
                        Process
                    </button>
                )}
                {order.order_status === 'processing' && (
                    <button 
                        onClick={() => onStatusChange?.(order.id, 'shipped')}
                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-primary text-background hover:bg-primary/90 transition-colors active:scale-95"
                    >
                        Ship
                    </button>
                )}
                {order.order_status === 'shipped' && (
                    <button 
                        onClick={() => onStatusChange?.(order.id, 'delivered')}
                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 transition-colors active:scale-95"
                    >
                        Deliver
                    </button>
                )}
                <select 
                    value={order.order_status}
                    onChange={(e) => onStatusChange?.(order.id, e.target.value as Order['order_status'])}
                    className="text-[10px] font-bold uppercase tracking-widest bg-secondary/5 border border-border px-2 py-1.5 focus:ring-0 cursor-pointer text-secondary/60 hover:text-primary transition-colors"
                >
                    <option value="" disabled>Change</option>
                    {ALLOWED_STATUSES.map(s => (
                        <option key={s} value={s} className="bg-background text-primary uppercase">
                            {s}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    // ── MOBILE CARD VIEW ──
    const MobileCardView = () => (
        <div className="md:hidden space-y-3">
            {orders.map((order) => (
                <div key={order.id} className="bg-background border border-border overflow-hidden">
                    {/* Card header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/5">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-primary">#{order.id}</span>
                            <span className="text-[10px] text-secondary">{order.date}</span>
                        </div>
                        <button 
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="text-secondary hover:text-primary transition-colors p-1"
                        >
                            {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>

                    {/* Card body */}
                    <div className="px-4 py-3 space-y-3">
                        {/* Product & buyer */}
                        <div>
                            <p className="font-medium text-sm leading-snug">{order.product}</p>
                            <p className="text-[11px] text-secondary mt-0.5">Buyer: {order.buyer}</p>
                        </div>

                        {/* Key metrics row */}
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/50">Total</p>
                                <p className="text-sm font-bold">₦{order.total.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/50">Earnings</p>
                                <p className="text-sm font-bold text-green-600">₦{order.earnings.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/50">Qty</p>
                                <p className="text-sm font-bold">{order.quantity}</p>
                            </div>
                        </div>

                        {/* Status badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${PAYMENT_STATUS_COLORS[order.payment_status] || 'border-border text-secondary'}`}>
                                {order.payment_status}
                            </span>
                            <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(order.order_status)}`}>
                                {order.order_status === 'pending' ? 'Order Pending' : order.order_status}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-border/50">
                            {renderQuickActions(order)}
                        </div>
                    </div>

                    {/* Expanded shipping details */}
                    {expandedOrder === order.id && (
                        <div className="px-4 py-4 bg-secondary/5 border-t border-border space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40">Shipping Details</h4>
                            <div className="space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <User className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-secondary">Recipient</p>
                                        <p className="text-sm font-bold mt-0.5">{order.shipping_full_name || order.buyer || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Phone className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-secondary">Phone</p>
                                        <p className="text-sm font-bold mt-0.5">{order.shipping_phone_number || 'Pending'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-secondary">Address</p>
                                        <div className="text-sm font-medium mt-0.5 leading-relaxed">
                                            {order.shipping_address_line1 || 'N/A'}<br />
                                            {order.shipping_address_line2 && <>{order.shipping_address_line2}<br /></>}
                                            {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}<br />
                                            {order.shipping_country}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            {orders.length === 0 && (
                <div className="bg-background border border-border px-6 py-12 text-center text-secondary text-sm">
                    No orders found.
                </div>
            )}
        </div>
    );

    // ── DESKTOP TABLE VIEW ──
    const DesktopTableView = () => (
        <div className="hidden md:block bg-background border border-border overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-secondary uppercase tracking-widest border-b border-border bg-secondary/5">
                    <tr>
                        <th className="px-6 py-4 font-medium w-10"></th>
                        <th className="px-6 py-4 font-medium">Order ID</th>
                        <th className="px-6 py-4 font-medium">Product</th>
                        <th className="px-6 py-4 font-medium">Buyer</th>
                        <th className="px-6 py-4 font-medium text-right">Qty</th>
                        <th className="px-6 py-4 font-medium text-right">Total</th>
                        <th className="px-6 py-4 font-medium text-right">Earnings</th>
                        <th className="px-6 py-4 font-medium">Payment</th>
                        <th className="px-6 py-4 font-medium">Order Status</th>
                        <th className="px-6 py-4 font-medium">Actions</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                        <React.Fragment key={order.id}>
                            <tr className="hover:bg-secondary/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                        className="text-secondary hover:text-primary transition-colors"
                                        title="View Shipping Details"
                                    >
                                        {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </td>
                                <td className="px-6 py-4 font-medium text-primary">#{order.id}</td>
                                <td className="px-6 py-4">{order.product}</td>
                                <td className="px-6 py-4">{order.buyer}</td>
                                <td className="px-6 py-4 text-right">{order.quantity}</td>
                                <td className="px-6 py-4 text-right">₦{order.total.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-medium text-green-600">₦{order.earnings.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${PAYMENT_STATUS_COLORS[order.payment_status] || 'border-border text-secondary'}`}>
                                        {order.payment_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(order.order_status)}`}>
                                        {order.order_status === 'pending' ? 'Order Pending' : order.order_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {renderQuickActions(order)}
                                </td>
                                <td className="px-6 py-4 text-secondary">{order.date}</td>
                            </tr>
                            {/* Expanded Details Row */}
                            {expandedOrder === order.id && (
                                <tr className="bg-secondary/5 border-t border-border animate-in slide-in-from-top-2 duration-300">
                                    <td colSpan={11} className="px-12 py-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40 border-b border-border pb-2">Full Acquisition Profile</h4>
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-3">
                                                        <User className="w-4 h-4 text-primary mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Recipient Name</p>
                                                            <p className="text-sm font-bold uppercase mt-1">{order.shipping_full_name || order.buyer || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <Phone className="w-4 h-4 text-primary mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Contact Signal</p>
                                                            <p className="text-sm font-bold uppercase mt-1">{order.shipping_phone_number || 'STILL PENDING'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40 border-b border-border pb-2">Destination Dossier</h4>
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Global Logistics Address</p>
                                                        <div className="text-sm font-bold uppercase mt-1 leading-relaxed">
                                                            {order.shipping_address_line1 || 'OFF-GRID'}<br />
                                                            {order.shipping_address_line2 && <>{order.shipping_address_line2}<br /></>}
                                                            {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}<br />
                                                            {order.shipping_country}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan={11} className="px-6 py-12 text-center text-secondary">
                                No orders found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <>
            <MobileCardView />
            <DesktopTableView />
        </>
    );
}
