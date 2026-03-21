'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

interface RevenueChartProps {
    data?: { date: string; revenue: number }[];
}

export default function RevenueChart({ data = [] }: RevenueChartProps) {
    // Map backend 'date' to 'name' for the chart if needed, or use date directly
    const chartData = data.map(d => ({
        name: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue: Number(d.revenue)
    }));

    return (
        <div className="bg-background border border-border p-6 h-[400px]">
            <h3 className="text-secondary text-xs font-bold uppercase tracking-widest mb-6">Revenue Trend (Last 30 Days)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#6B7280'}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#6B7280'}}
                            tickFormatter={(value) => `₦${Number(value).toLocaleString()}`}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '0px' }}
                            itemStyle={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}
                            labelStyle={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px', textTransform: 'uppercase' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#000" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
