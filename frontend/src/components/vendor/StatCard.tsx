import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
}

export default function StatCard({ title, value, description, icon }: StatCardProps) {
    return (
        <div className="bg-background/40 backdrop-blur-sm border border-white/5 p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[130px] sm:min-h-[160px] rounded-xl sm:rounded-none">
            {/* Top right accent icon */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-secondary/20 group-hover:text-primary/40 transition-all duration-500 sm:group-hover:scale-110 sm:group-hover:rotate-6">
                {icon}
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="text-secondary/50 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] leading-tight flex items-center gap-1.5 sm:gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors duration-500" />
                    <span className="line-clamp-1">{title}</span>
                </h3>
            </div>
            
            <div className="mt-auto relative z-10">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-primary font-source-serif italic group-hover:translate-x-1 transition-transform duration-500 mt-2 sm:mt-0">
                    {value}
                </p>
                {description && (
                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-secondary/60 sm:text-secondary/40 mt-1.5 sm:mt-3 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 line-clamp-1">
                        <span className="hidden sm:block w-4 h-[1px] bg-secondary/20" />
                        {description}
                    </p>
                )}
            </div>

            {/* Corner accent */}
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-700" />
        </div>
    );
}
