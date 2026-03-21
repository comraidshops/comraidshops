'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Product, ProductVariant } from '@/lib/api';

interface ProductActionsProps {
    product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const variants = product.variants || [];

    const handleAddToCart = () => {
        if (variants.length > 0 && !selectedVariant) return;

        addItem({
            id: product.id.toString(),
            name: product.name,
            price: Number(product.price),
            image: product.image,
            vendor: (typeof product.brand === 'string' ? product.brand : product.brand?.name) || product.vendor_name || 'ComraidShops',
            slug: product.slug,
            variant: selectedVariant?.name || 'Standard',
            stock: selectedVariant ? selectedVariant.stock : product.stock
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="flex flex-col gap-12">
            {/* Variants Selector */}
            {variants.length > 0 && (
                <div>
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-secondary mb-6 line-after relative max-w-max pr-8">
                        Available Variants
                        <span className="absolute top-1/2 right-0 w-4 h-[1px] bg-border/50"></span>
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {variants.map((variant: ProductVariant, idx: number) => (
                            <button
                                key={variant.id || `variant-${idx}`}
                                onClick={() => setSelectedVariant(variant)}
                                disabled={variant.stock === 0}
                                className={`border px-6 py-3 text-xs uppercase tracking-widest transition-colors ${
                                    variant.stock === 0
                                    ? 'border-border/50 text-secondary/30 bg-secondary/5 cursor-not-allowed line-through'
                                    : selectedVariant?.id === variant.id
                                    ? 'border-foreground text-foreground bg-foreground/5 cursor-pointer'
                                    : 'border-border text-secondary hover:text-foreground hover:border-foreground cursor-pointer'
                                }`}
                            >
                                {variant.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={handleAddToCart}
                    disabled={(variants.length > 0 && !selectedVariant) || product.stock === 0}
                    className={`w-full py-5 text-xs uppercase tracking-[0.3em] transition-all duration-300 ${
                        (variants.length > 0 && !selectedVariant) || product.stock === 0
                        ? 'bg-secondary/10 text-secondary/50 cursor-not-allowed'
                        : 'bg-foreground text-background hover:opacity-90 cursor-pointer'
                    }`}
                >
                    {added 
                        ? 'Added To Bag' 
                        : product.stock === 0 
                        ? 'Sold Out'
                        : (variants.length > 0 && !selectedVariant) 
                        ? 'Select A Variant' 
                        : 'Add To Bag'}
                </button>
            </div>
        </div>
    );
}
