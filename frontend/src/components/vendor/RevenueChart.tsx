'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
  { name: 'Jul', revenue: 3490 },
];

export default function RevenueChart() {
    return (
        <div className="bg-background border border-border p-6 h-[400px]">
            <h3 className="text-secondary text-xs font-bold uppercase tracking-widest mb-6">Revenue Trend</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                            tick={{fontSize: 12, fill: '#6B7280'}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#6B7280'}}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '0px' }}
                            itemStyle={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#000" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
