'use client';

import React from 'react';
import RevenueChart from '@/components/vendor/RevenueChart';
import { CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, YAxis, XAxis } from 'recharts';

const productData = [
  { name: 'Ceramic Vase', sales: 45, revenue: 2700 },
  { name: 'Minimalist Chair', sales: 32, revenue: 8000 },
  { name: 'Linen Pillow', sales: 28, revenue: 1680 },
  { name: 'Maple Bowl', sales: 24, revenue: 1920 },
  { name: 'Wool Throw', sales: 18, revenue: 3240 },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-8 pb-12">
            <h2 className="text-2xl font-bold uppercase tracking-tighter">Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-background border border-border p-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Sales by Product</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={120}
                                    tick={{fontSize: 12, fill: '#6B7280'}}
                                />
                                <Tooltip 
                                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '0px' }}
                                />
                                <Bar dataKey="sales" fill="#000" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-background border border-border p-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Revenue by Product</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={120}
                                    tick={{fontSize: 12, fill: '#6B7280'}}
                                />
                                <Tooltip 
                                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                                    formatter={(value: any) => `$${value}`}
                                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '0px' }}
                                />
                                <Bar dataKey="revenue" fill="#000" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <RevenueChart />
        </div>
    );
}
