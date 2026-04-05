import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
}

export default function StatCard({ title, value, description, icon }: StatCardProps) {
    return (
        <div className="bg-background border border-border p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            {/* Left accent */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/20 group-hover:bg-primary transition-colors duration-300" />
            
            <div className="flex items-start justify-between mb-3 md:mb-4">
                <h3 className="text-secondary text-[10px] md:text-xs font-bold uppercase tracking-widest leading-tight">
                    {title}
                </h3>
                {icon && (
                    <div className="text-secondary/40 group-hover:text-primary/60 transition-colors duration-300">
                        {icon}
                    </div>
                )}
            </div>
            <p className="text-2xl md:text-3xl font-bold tracking-tighter break-all md:break-normal">
                {value}
            </p>
            {description && (
                <p className="text-[10px] md:text-xs text-secondary mt-1.5 md:mt-2 leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    );
}
