'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, Users, ShoppingBag, 
    AlertCircle, Package, ArrowUpRight,
    LucideIcon
} from 'lucide-react';
import { safeFetch } from '@/lib/api';
import { formatCurrency } from '@/lib/format';

interface Stats {
    total_orders: number;
    total_revenue: number;
    active_vendors: number;
    pending_vendors: number;
    pending_products: number;
    total_products: number;
    low_stock_count: number;
}

const StatCard = ({ title, value, icon: Icon, color, delay }: { 
    title: string, value: string | number, icon: LucideIcon, color: string, delay: number 
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative group p-6 lg:p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/10 blur-[80px] -mr-16 -mt-16 group-hover:bg-${color}/20 transition-all duration-700`} />
        
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 lg:mb-8">
                <div className={`p-3 lg:p-4 rounded-2xl bg-${color}/10 text-${color}`}>
                    <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary px-2 py-1 rounded-full bg-primary/10">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12%</span>
                </div>
            </div>
            
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">{title}</h3>
            <p className="text-3xl lg:text-4xl font-playfair font-medium tracking-tight whitespace-nowrap">{value}</p>
        </div>
    </motion.div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        
        async function getStats(isBackgroundCall = false) {
            if (!isBackgroundCall) setLoading(true);
            try {
                const data = await safeFetch('/admin-api/stats/');
                if (isMounted) {
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch admin stats:", err);
            } finally {
                if (isMounted && !isBackgroundCall) setLoading(false);
            }
        }

        // Initial fetch
        getStats(false);

        // Background polling every 15 seconds
        const pollInterval = setInterval(() => {
            getStats(true);
        }, 30000); // Increased to 30s to reduce load

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin rounded-full" />
        </div>
    );

    const cards = [
        { title: 'Total Revenue', value: stats ? formatCurrency(stats.total_revenue) : '₦0.00', icon: TrendingUp, color: 'primary', delay: 0 },
        { title: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingBag, color: 'blue-400', delay: 0.1 },
        { title: 'Active Vendors', value: stats?.active_vendors || 0, icon: Users, color: 'purple-400', delay: 0.2 },
        { title: 'Total Products', value: stats?.total_products || 0, icon: Package, color: 'orange-400', delay: 0.3 },
    ];

    const alerts = [
        { label: 'Pending Vendors', value: stats?.pending_vendors || 0, color: 'text-orange-400', icon: Users },
        { label: 'Pending Approvals', value: stats?.pending_products || 0, color: 'text-primary', icon: AlertCircle },
        { label: 'Low Stock Alert', value: stats?.low_stock_count || 0, color: 'text-red-400', icon: Package },
    ];

    return (
        <div className="space-y-12 lg:space-y-16">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                    <motion.span 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 lg:mb-4 block"
                    >
                        Performance Overview
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl lg:text-6xl font-playfair font-medium tracking-tight"
                    >
                        Editorial <span className="italic opacity-80">Insights.</span>
                    </motion.h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:flex lg:gap-4">
                    {alerts.map((alert, idx) => (
                        <motion.div
                            key={alert.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className="bg-white/[0.02] border border-white/5 backdrop-blur-xl px-6 py-4 rounded-2xl flex items-center gap-4"
                        >
                            <div className={`${alert.color} bg-current/10 p-2 rounded-lg`}>
                                <alert.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="block text-[8px] font-bold uppercase tracking-widest text-white/40">{alert.label}</span>
                                <span className={`text-xl font-bold ${alert.color}`}>{alert.value}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {cards.map((card) => (
                    <StatCard key={card.title} {...card} />
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 p-8 lg:p-12 rounded-[40px] bg-white/[0.01] border border-white/5 min-h-[400px]"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 lg:mb-12">
                        <h2 className="text-xl font-playfair font-medium tracking-tight">Recent Sales Activity</h2>
                        <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors text-left sm:text-right">View All Orders</button>
                    </div>
                    {/* Placeholder for order list */}
                    <div className="flex flex-col items-center justify-center h-64 text-white/20">
                        <ShoppingBag className="w-12 h-12 mb-4 opacity-10" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Activity feed coming soon</span>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-8 lg:p-12 rounded-[40px] bg-gradient-to-br from-primary/10 to-transparent border border-white/5 relative overflow-hidden group"
                >
                    <div className="relative z-10">
                        <h2 className="text-xl font-playfair font-medium tracking-tight mb-8">Platform Health</h2>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-white/40">Server Load</span>
                                    <span className="text-primary">Normal (12%)</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[12%] bg-primary shadow-[0_0_10px_#ccf381]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-white/40">Uptime</span>
                                    <span className="text-primary">99.98%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[99%] bg-primary shadow-[0_0_10px_#ccf381]" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 lg:mt-16 pt-12 lg:pt-16 border-t border-white/5">
                            <button className="w-full py-4 lg:py-5 px-6 lg:px-8 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all duration-500 flex items-center justify-center gap-4 group/btn">
                                Open System Console
                                <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Background Detail */}
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/20 blur-[100px] group-hover:bg-primary/30 transition-all duration-700" />
                </motion.div>
            </div>
        </div>
    );
}
