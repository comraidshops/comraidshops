'use client';

import React from 'react';

interface ProductFitProps {
    fit?: string;
}

export default function ProductFit({ fit }: ProductFitProps) {
    if (!fit) return null;

    return (
        <section className="py-24 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="bg-secondary/5 p-8 md:p-12 aspect-[4/3] flex flex-col justify-center items-center text-center">
                    {/* Placeholder for size guide illustration if we had one */}
                    <span className="text-6xl font-bold text-secondary/20 uppercase tracking-tighter">
                        True to Size
                    </span>
                </div>

                <div className="md:pl-12">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-6">
                        Fit & Sizing
                    </h3>
                    <p className="text-base text-secondary/80 leading-relaxed max-w-md">
                        {fit}
                    </p>
                    <div className="mt-8">
                        <button className="text-xs font-bold uppercase tracking-widest border-b border-foreground pb-1 hover:text-secondary hover:border-secondary transition-all">
                            View Size Guide
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
