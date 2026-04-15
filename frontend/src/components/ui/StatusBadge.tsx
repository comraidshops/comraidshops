import React from 'react';
import { 
    Clock, 
    Package, 
    Truck, 
    CheckCircle, 
    XCircle, 
    RotateCcw,
    AlertCircle
} from 'lucide-react';

export type StatusType = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'paid' | 'confirmed' | 'failed' | 'refunded';

interface StatusBadgeProps {
    status: string;
    variant?: 'admin' | 'vanguard' | 'minimal';
    className?: string;
}

const STATUS_MAP: Record<string, { 
    label: string, 
    icon: React.ElementType, 
    color: string, 
    bg: string,
    border: string
}> = {
    pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    processing: { label: 'Processing', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    paid: { label: 'Paid', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    failed: { label: 'Failed', icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    refunded: { label: 'Refunded', icon: RotateCcw, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
    'awaiting confirmation': { label: 'Awaiting Confirmation', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/30' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'minimal', className = '' }) => {
    const s = status.toLowerCase();
    const config = STATUS_MAP[s] || { label: status, icon: AlertCircle, color: 'text-secondary', bg: 'bg-secondary/5', border: 'border-border' };
    const Icon = config.icon;

    if (variant === 'admin') {
        return (
            <span className={`inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${config.bg} ${config.color} ${className}`}>
                <Icon className="w-3 h-3" /> {config.label}
            </span>
        );
    }

    if (variant === 'vanguard') {
        return (
            <div className={`flex items-center gap-2 group cursor-help ${className}`}>
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 border ${config.border} ${config.bg}`}>
                    <Icon className={`w-3 h-3 ${config.color}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${config.color} italic`}>{config.label}</span>
                </div>
            </div>
        );
    }

    // Default Minimal (Terminal Style)
    return (
        <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 ${config.color} border border-current opacity-70 ${className}`}>
            {config.label}
        </span>
    );
};
