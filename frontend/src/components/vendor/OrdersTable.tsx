import React from 'react';

// Using a basic mock interface for now
export interface Order {
    id: string;
    product: string;
    buyer: string;
    quantity: number;
    total: number;
    commission: number;
    earnings: number;
    status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
    date: string;
}

interface OrdersTableProps {
    orders: Order[];
    onStatusChange?: (orderId: string, newStatus: Order['status']) => Promise<void>;
    updatingId?: string | null;
}

export default function OrdersTable({ orders, onStatusChange, updatingId }: OrdersTableProps) {
    const ALLOWED_STATUSES: Order['status'][] = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];

    return (
        <div className="bg-background border border-border overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-secondary uppercase tracking-widest border-b border-border bg-secondary/5">
                    <tr>
                        <th className="px-6 py-4 font-medium">Order ID</th>
                        <th className="px-6 py-4 font-medium">Product</th>
                        <th className="px-6 py-4 font-medium">Buyer</th>
                        <th className="px-6 py-4 font-medium text-right">Qty</th>
                        <th className="px-6 py-4 font-medium text-right">Total</th>
                        <th className="px-6 py-4 font-medium text-right">Earnings</th>
                        <th className="px-6 py-4 font-medium">Status / Action</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-secondary/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-primary">#{order.id}</td>
                            <td className="px-6 py-4">{order.product}</td>
                            <td className="px-6 py-4">{order.buyer}</td>
                            <td className="px-6 py-4 text-right">{order.quantity}</td>
                            <td className="px-6 py-4 text-right">${order.total.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right font-medium text-green-600">${order.earnings.toFixed(2)}</td>
                            <td className="px-6 py-4">
                                {updatingId === order.id ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-secondary/40">Updating...</span>
                                    </div>
                                ) : (
                                    <select 
                                        value={order.status}
                                        onChange={(e) => onStatusChange?.(order.id, e.target.value as Order['status'])}
                                        className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-transparent border-none focus:ring-0 cursor-pointer appearance-none ${
                                            order.status === 'completed' ? 'text-green-700' :
                                            order.status === 'shipped' ? 'text-blue-700' :
                                            order.status === 'paid' ? 'text-yellow-700' :
                                            'text-secondary'
                                        }`}
                                    >
                                        {ALLOWED_STATUSES.map(s => (
                                            <option key={s} value={s} className="bg-background text-primary uppercase">
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </td>
                            <td className="px-6 py-4 text-secondary">{order.date}</td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-secondary">
                                No orders found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
