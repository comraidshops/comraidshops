import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
}

export default function StatCard({ title, value, description, icon }: StatCardProps) {
    return (
        <div className="bg-background/40 backdrop-blur-sm border border-white/5 p-6 md:p-8 shadow-sm hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            {/* Top right accent icon */}
            <div className="absolute top-6 right-6 text-secondary/20 group-hover:text-primary/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                {icon}
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="text-secondary/50 text-[10px] font-black uppercase tracking-[0.25em] leading-tight flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors duration-500" />
                    {title}
                </h3>
            </div>
            
            <div className="mt-auto relative z-10">
                <p className="text-3xl md:text-4xl font-black tracking-tight text-primary font-source-serif italic group-hover:translate-x-1 transition-transform duration-500">
                    {value}
                </p>
                {description && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/40 mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <span className="w-4 h-[1px] bg-secondary/20" />
                        {description}
                    </p>
                )}
            </div>

            {/* Corner accent */}
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
    );
}
