'use client';

import React from 'react';

interface ProductNarrativeProps {
    narrative?: string;
    philosophy?: string;
    editorialReference?: string;
}

export default function ProductNarrative({ narrative, philosophy, editorialReference }: ProductNarrativeProps) {
    if (!narrative && !philosophy) return null;

    return (
        <section className="py-24 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">

                {/* Narrative Overview */}
                <div className="md:pr-12">
                    {editorialReference && (
                        <span className="block text-xs font-bold uppercase tracking-widest text-primary mb-6">
                            {editorialReference}
                        </span>
                    )}
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">
                        Narrative
                    </h3>
                    <p className="text-lg md:text-2xl font-normal leading-relaxed text-foreground">
                        {narrative}
                    </p>
                </div>

                {/* Philosophy */}
                {philosophy && (
                    <div className="flex flex-col justify-end">
                        <div className="md:pl-12 border-l border-border/50 py-2">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">
                                Philosophy
                            </h3>
                            <p className="text-foreground/80 md:text-lg italic font-serif leading-relaxed">
                                &quot;{philosophy}&quot;
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
