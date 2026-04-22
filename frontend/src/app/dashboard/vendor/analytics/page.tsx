'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const RevenueChart = dynamic(() => import('@/components/vendor/RevenueChart'), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

interface AnalyticsData {
    daily_revenue: { date: string; revenue: number }[];
    top_products: { product__name: string; product__id: number; revenue: number; sales: number }[];
    category_distribution: { category__name: string; count: number }[];
    total_orders?: number;
    aov?: number;
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/analytics/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-[50vh] text-xs uppercase tracking-widest text-secondary">Analyzing data...</div>;

    const barData = (data?.top_products || []).map(p => ({
        name: p.product__name,
        sales: p.sales,
        revenue: Number(p.revenue)
    }));

    return (
        <div className="space-y-5 md:space-y-8 pb-8 md:pb-12">
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter">Analytics</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
                <div className="bg-background border border-border p-4 md:p-6 flex flex-col justify-center">
                    <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest text-secondary mb-2">Total Orders</h3>
                    <p className="text-3xl font-bold">{data?.total_orders || 0}</p>
                </div>
                <div className="bg-background border border-border p-4 md:p-6 flex flex-col justify-center">
                    <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest text-secondary mb-2">Avg Order Value</h3>
                    <p className="text-3xl font-bold">₦{Number(data?.aov || 0).toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8">
                <div className="bg-background border border-border p-4 md:p-6">
                    <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest mb-5 md:mb-8">Sales by Product</h3>
                    <div className="h-[220px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={80}
                                    tick={{fontSize: 9, fill: '#6B7280'}}
                                />
                                <Tooltip 
                                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '0px', fontSize: '12px' }}
                                />
                                <Bar dataKey="sales" fill="#000" barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-background border border-border p-4 md:p-6">
                    <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest mb-5 md:mb-8">Revenue by Product</h3>
                    <div className="h-[220px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={80}
                                    tick={{fontSize: 9, fill: '#6B7280'}}
                                />
                                <Tooltip 
                                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                                    formatter={(value: unknown) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
                                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '0px', fontSize: '12px' }}
                                />
                                <Bar dataKey="revenue" fill="#000" barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <RevenueChart data={data?.daily_revenue} />
        </div>
    );
}
