'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '@/components/vendor/StatCard';
import RevenueChart from '@/components/vendor/RevenueChart';
import { Banknote, TrendingUp, Wallet } from 'lucide-react';

interface Earning {
    id: number;
    order_id: number;
    gross_amount: string;
    commission_amount: string;
    net_amount: string;
    status: string;
    created_at: string;
}

interface EarningsMetrics {
    total_revenue: number;
    total_commission: number;
    vendor_balance: number;
    pending_payout: number;
}

export default function EarningsPage() {
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [metrics, setMetrics] = useState<EarningsMetrics | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const headers = { 'Authorization': `Bearer ${token}` };
                
                // Fetch metrics for the top cards
                const metricsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/dashboard/`, { headers });
                if (metricsRes.ok) setMetrics(await metricsRes.json());

                const earningsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/earnings/`, { headers });
                if (earningsRes.ok) setEarnings(await earningsRes.json());
            } catch {
                console.error("Failed to fetch earnings data");
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8 pb-12">
            <h2 className="text-2xl font-bold uppercase tracking-tighter">Earnings & Commissions</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={`₦${(metrics?.total_revenue || 0).toLocaleString()}`} 
                    icon={<Banknote className="w-4 h-4" />} 
                />
                <StatCard 
                    title="Net Earnings" 
                    value={`₦${((metrics?.total_revenue || 0) - (metrics?.total_commission || 0)).toLocaleString()}`} 
                    icon={<TrendingUp className="w-4 h-4" />} 
                />
                <StatCard 
                    title="Withdrawable Balance" 
                    value={`₦${(metrics?.vendor_balance || 0).toLocaleString()}`} 
                    icon={<Wallet className="w-4 h-4" />} 
                />
            </div>

            <RevenueChart />

            <div className="bg-background border border-border">
                <div className="px-6 py-4 border-b border-border">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Transaction History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-secondary uppercase tracking-widest border-b border-border bg-secondary/5">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4 text-right">Gross Amount</th>
                                <th className="px-6 py-4 text-right">Commission</th>
                                <th className="px-6 py-4 text-right">Net Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {earnings.map((e) => (
                                <tr key={e.id} className="hover:bg-secondary/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(e.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-primary">#{e.order_id}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">₦{parseFloat(e.gross_amount).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-red-500 whitespace-nowrap">-₦{parseFloat(e.commission_amount).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-medium text-green-600 whitespace-nowrap">₦{parseFloat(e.net_amount).toLocaleString()}</td>
                                    <td className="px-6 py-4 capitalize">{e.status}</td>
                                </tr>
                            ))}
                            {earnings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-secondary">No transaction history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
