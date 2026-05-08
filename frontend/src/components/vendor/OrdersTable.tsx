import React from 'react';
import { formatVendorPaymentStatus } from '@/lib/format';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AlertCircle, ChevronDown, ChevronUp, MapPin, Phone, User, Package, ExternalLink } from 'lucide-react';

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
    items?: {
        name: string;
        quantity: number;
        status: string;
    }[];
}

interface OrdersTableProps {
    orders: Order[];
    onStatusChange?: (orderId: string, newStatus: Order['order_status']) => Promise<void>;
    updatingId?: string | null;
}

export default function OrdersTable({ orders, onStatusChange, updatingId }: OrdersTableProps) {
    const [expandedOrder, setExpandedOrder] = React.useState<string | null>(null);
    const ALLOWED_STATUSES: Order['order_status'][] = ['processing', 'shipped', 'delivered'];

    const renderQuickActions = (order: Order) => {
        if (updatingId === order.id) {
            return (
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-secondary/30">Updating</span>
                </div>
            );
        }

        if (order.payment_status !== 'confirmed') {
            return (
                <StatusBadge status="awaiting confirmation" variant="vanguard" className="opacity-80" />
            );
        }

        return (
            <div className="flex items-center gap-3 flex-wrap">
                {order.order_status === 'pending' && (
                    <button 
                        onClick={() => onStatusChange?.(order.id, 'processing')}
                        className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-amber-600/90 text-white hover:bg-amber-600 transition-all active:scale-95 shadow-sm"
                    >
                        Process
                    </button>
                )}
                {order.order_status === 'processing' && (
                    <button 
                        onClick={() => onStatusChange?.(order.id, 'shipped')}
                        className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-primary text-background hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
                    >
                        Ship
                    </button>
                )}
                {order.order_status === 'shipped' && (
                    <button 
                        onClick={() => onStatusChange?.(order.id, 'delivered')}
                        className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-all active:scale-95 shadow-sm"
                    >
                        Deliver
                    </button>
                )}
                
                <div className="relative group/select">
                    <select 
                        value={ALLOWED_STATUSES.includes(order.order_status) ? order.order_status : ""}
                        onChange={(e) => onStatusChange?.(order.id, e.target.value as Order['order_status'])}
                        className="text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 pl-3 pr-8 py-2 focus:ring-0 cursor-pointer text-secondary/60 hover:text-primary transition-all appearance-none"
                    >
                        <option value="" disabled>{order.order_status === 'pending' ? 'Update' : order.order_status}</option>
                        {ALLOWED_STATUSES.map(s => (
                            <option key={s} value={s} className="bg-[#0a0a0a] text-primary uppercase font-black">
                                {s}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary/30 group-hover/select:text-primary transition-colors" />
                </div>
            </div>
        );
    };

    // ── MOBILE CARD VIEW ──
    const MobileCardView = () => (
        <div className="md:hidden space-y-4">
            {orders.map((order) => (
                <div key={order.id} className="bg-background/40 backdrop-blur-sm border border-white/5 overflow-hidden group transition-all duration-500 hover:border-white/10">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <span className="text-[11px] font-black text-primary tracking-widest uppercase">ID: {order.id}</span>
                            <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">{order.date}</span>
                        </div>
                        <button 
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="text-secondary/40 hover:text-primary transition-colors p-1"
                        >
                            {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    </div>

                    <div className="px-5 py-5 space-y-5">
                        <div>
                            <p className="font-black text-[15px] leading-tight text-primary tracking-tight">{order.product}</p>
                            <p className="text-[10px] font-bold text-secondary/50 mt-1.5 uppercase tracking-widest">Buyer: <span className="text-secondary">{order.buyer}</span></p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-4">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-1">Total</p>
                                <p className="text-sm font-black text-primary">₦{order.total.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-1">Earned</p>
                                <p className="text-sm font-black text-green-500">₦{order.earnings.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-1">Qty</p>
                                <p className="text-sm font-black text-primary">{order.quantity}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                                <StatusBadge status={order.payment_status} variant="minimal" className="!text-[8px] border-white/10" />
                                <StatusBadge status={order.order_status} variant="minimal" className="!text-[8px] border-white/10" />
                            </div>
                        </div>

                        <div className="pt-2">
                            {renderQuickActions(order)}
                        </div>
                    </div>

                    {expandedOrder === order.id && (
                        <div className="px-5 py-6 bg-white/[0.03] border-t border-white/5 space-y-6 animate-in slide-in-from-top-2 duration-500">
                             <div className="space-y-4">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/30 border-b border-white/5 pb-2">Logistics Profile</h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-primary">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-secondary/40">Recipient</p>
                                            <p className="text-[11px] font-black uppercase mt-1 text-primary">{order.shipping_full_name || order.buyer || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-primary">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-secondary/40">Contact</p>
                                            <p className="text-[11px] font-black uppercase mt-1 text-primary">{order.shipping_phone_number || 'Signal Lost'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-primary">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-secondary/40">Destination</p>
                                            <div className="text-[11px] font-bold mt-1 leading-relaxed text-secondary/80">
                                                {order.shipping_address_line1 || 'N/A'}<br />
                                                {order.shipping_address_line2 && <>{order.shipping_address_line2}<br /></>}
                                                {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}<br />
                                                {order.shipping_country}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            {orders.length === 0 && (
                <div className="bg-background/40 backdrop-blur-sm border border-white/5 px-6 py-16 text-center text-secondary/40 text-[10px] font-black uppercase tracking-[0.3em]">
                    Null results found.
                </div>
            )}
        </div>
    );

    // ── DESKTOP TABLE VIEW ──
    const DesktopTableView = () => (
        <div className="hidden md:block bg-background/20 backdrop-blur-sm border border-white/5 overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse">
                <thead className="text-[9px] text-secondary/40 uppercase tracking-[0.25em] border-b border-white/5 bg-white/[0.02]">
                    <tr>
                        <th className="px-6 py-5 font-black w-14"></th>
                        <th className="px-6 py-5 font-black">Ref</th>
                        <th className="px-6 py-5 font-black">Manifest</th>
                        <th className="px-6 py-5 font-black">Acquirer</th>
                        <th className="px-6 py-5 font-black text-right">Vol</th>
                        <th className="px-6 py-5 font-black text-right">Gross</th>
                        <th className="px-6 py-5 font-black text-right">Net</th>
                        <th className="px-6 py-5 font-black text-center">Protocol</th>
                        <th className="px-6 py-5 font-black">Status</th>
                        <th className="px-6 py-5 font-black">Action</th>
                        <th className="px-6 py-5 font-black">Timestamp</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                        <React.Fragment key={order.id}>
                            <tr className="hover:bg-white/[0.03] transition-all duration-300 group">
                                <td className="px-6 py-5">
                                    <button 
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                        className="text-secondary/20 hover:text-primary transition-all duration-300 transform hover:scale-110"
                                        title="Inspect Order"
                                    >
                                        {expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                </td>
                                <td className="px-6 py-5 font-black text-primary tracking-widest uppercase">{order.id}</td>
                                <td className="px-6 py-5 font-bold text-secondary max-w-[180px] truncate">{order.product}</td>
                                <td className="px-6 py-5 font-bold uppercase tracking-widest text-[10px] text-secondary/80">{order.buyer}</td>
                                <td className="px-6 py-5 text-right font-black text-primary">{order.quantity}</td>
                                <td className="px-6 py-5 text-right font-black text-primary">₦{order.total.toLocaleString()}</td>
                                <td className="px-6 py-5 text-right font-black text-green-500">₦{order.earnings.toLocaleString()}</td>
                                <td className="px-6 py-5 text-center">
                                    <StatusBadge status={order.payment_status} variant="minimal" className="!text-[8px] opacity-60 border-white/10" />
                                </td>
                                <td className="px-6 py-5">
                                    <StatusBadge status={order.order_status} variant="minimal" className="!text-[8px] border-white/10" />
                                </td>
                                <td className="px-6 py-5">
                                    {renderQuickActions(order)}
                                </td>
                                <td className="px-6 py-5 text-[9px] font-bold text-secondary/40 uppercase tracking-widest">{order.date}</td>
                            </tr>
                            
                            {/* Expanded Details Row */}
                            {expandedOrder === order.id && (
                                <tr className="bg-white/[0.04] border-t border-white/5 animate-in fade-in duration-500">
                                    <td colSpan={11} className="px-16 py-12">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/30 border-b border-white/10 pb-2">Acquisition Profile</h4>
                                                <div className="space-y-5">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 flex items-center justify-center bg-background border border-white/5 text-primary/40 group-hover:text-primary transition-colors">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-secondary/30">Recipient</p>
                                                            <p className="text-[13px] font-black uppercase mt-1 text-primary">{order.shipping_full_name || order.buyer || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 flex items-center justify-center bg-background border border-white/5 text-primary/40 group-hover:text-primary transition-colors">
                                                            <Phone className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-secondary/30">Communication</p>
                                                            <p className="text-[13px] font-black uppercase mt-1 text-primary">{order.shipping_phone_number || 'NO SIGNAL'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 flex items-center justify-center bg-background border border-white/5 text-primary/40 group-hover:text-primary transition-colors">
                                                            <MapPin className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-secondary/30">Destination</p>
                                                            <div className="text-[12px] font-medium mt-1 leading-relaxed text-secondary/80">
                                                                {order.shipping_address_line1 || 'N/A'}<br />
                                                                {order.shipping_address_line2 && <>{order.shipping_address_line2}<br /></>}
                                                                {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}<br />
                                                                {order.shipping_country}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="md:col-span-2 space-y-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/30 border-b border-white/10 pb-2">Fulfillment Components</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-5 border border-white/5 bg-background hover:border-primary/20 hover:bg-white/[0.02] transition-all duration-300 group/item">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 text-secondary/40 group-hover/item:text-primary transition-all">
                                                                    <Package className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[12px] font-black uppercase tracking-tight text-primary">{item.name}</p>
                                                                    <p className="text-[9px] text-secondary/40 font-bold uppercase tracking-widest mt-0.5">Quantity: <span className="text-secondary">{item.quantity}</span></p>
                                                                </div>
                                                            </div>
                                                            <StatusBadge status={item.status} variant="minimal" className="!text-[8px] opacity-70 border-white/10" />
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                                    <div className="flex items-center gap-2 text-secondary/30">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Ensure proof of delivery is retained for all shipments.</span>
                                                    </div>
                                                    <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-primary hover:opacity-70 transition-opacity">
                                                        Print Manifest <ExternalLink className="w-3.5 h-3.5" />
                                                    </button>
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
                            <td colSpan={11} className="px-6 py-20 text-center text-secondary/30 font-black uppercase tracking-[0.4em]">
                                Null Order Vector
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-6">
            <MobileCardView />
            <DesktopTableView />
        </div>
    );
}
