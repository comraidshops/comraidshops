import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
}

export default function StatCard({ title, value, description, icon }: StatCardProps) {
    return (
        <div className="bg-background border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-secondary text-xs font-bold uppercase tracking-widest">{title}</h3>
                {icon && <div className="text-secondary/50">{icon}</div>}
            </div>
            <p className="text-3xl font-bold tracking-tighter">{value}</p>
            {description && (
                <p className="text-xs text-secondary mt-2">{description}</p>
            )}
        </div>
    );
}
