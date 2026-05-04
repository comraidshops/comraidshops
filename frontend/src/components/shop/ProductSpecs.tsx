'use client';

import React from 'react';

interface ProductSpecsProps {
    usage?: string;
    features?: { id?: number; title: string; description: string }[];
    materials?: string;
    careInstructions?: string;
}

export default function ProductSpecs({ usage, features, materials, careInstructions }: ProductSpecsProps) {
    if (!usage && !features && !materials) return null;

    return (
        <section className="py-24 border-t border-border">
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-16">Specifications</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">

                {/* Usage Context */}
                {usage && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-8">
                            Intended Usage
                        </h3>
                        <p className="text-base text-foreground/90 leading-relaxed font-medium">
                            {usage}
                        </p>
                    </div>
                )}

                {/* Technical Features */}
                {features && features.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-8">
                            Technical Features
                        </h3>
                        <ul className="space-y-8">
                            {features.map((feature, idx) => (
                                <li key={feature.id || idx}>
                                    <span className="block text-xs font-bold uppercase tracking-wide text-primary mb-1">
                                        {feature.title}
                                    </span>
                                    <span className="text-sm text-secondary/80 leading-relaxed">
                                        {feature.description}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Materials & Care */}
                {materials && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-8">
                            Materials & Care
                        </h3>
                        <p className="text-base font-medium mb-6">
                            {materials}
                        </p>
                        {careInstructions && (
                            <p className="text-xs text-secondary/60 uppercase tracking-wide">
                                Care: {careInstructions}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
