'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, Filter } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Brand {
    id: number;
    name: string;
    slug: string;
}

interface ShopFilterBarProps {
    categories: Category[];
    brands: Brand[];
}

export default function ShopFilterBar({ categories, brands }: ShopFilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentQ = searchParams?.get('q') || '';
    const currentCategory = searchParams?.get('category') || '';
    const currentBrand = searchParams?.get('brand') || '';
    const currentSort = searchParams?.get('sort') || '';

    const [q, setQ] = useState(currentQ);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/shop?${params.toString()}`);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters('q', q);
    };

    return (
        <div className="mb-12 space-y-4">
            {/* Desktop and Mobile Top Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border pb-4">
                
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="w-full bg-secondary/5 border border-border py-3 pl-10 pr-4 text-xs focus:border-primary focus:outline-none transition-colors"
                    />
                    <Search className="w-4 h-4 text-secondary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button type="submit" className="hidden">Search</button>
                </form>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Mobile Toggle */}
                    <button 
                        className="md:hidden flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-border px-4 py-3 bg-secondary/5 flex-1 justify-center"
                        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>

                    {/* Desktop Categories */}
                    <div className="hidden md:flex gap-6 overflow-x-auto text-[10px] uppercase font-bold tracking-widest">
                        <button 
                            onClick={() => updateFilters('category', '')}
                            className={`whitespace-nowrap pb-1 ${!currentCategory ? 'text-primary border-b-2 border-primary' : 'text-secondary/60 hover:text-primary transition-colors'}`}
                        >
                            All Categories
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => updateFilters('category', cat.slug)}
                                className={`whitespace-nowrap pb-1 ${currentCategory === cat.slug ? 'text-primary border-b-2 border-primary' : 'text-secondary/60 hover:text-primary transition-colors'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Brand Dropdown */}
                    <div className="relative flex-1 md:flex-none">
                        <select 
                            value={currentBrand}
                            onChange={(e) => updateFilters('brand', e.target.value)}
                            className="w-full md:w-auto appearance-none bg-secondary/5 border border-border text-[10px] uppercase font-bold tracking-widest px-4 py-3 pr-10 focus:border-primary focus:outline-none cursor-pointer"
                        >
                            <option value="">All Brands</option>
                            {brands.map((b) => (
                                <option key={b.id} value={b.slug}>{b.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative flex-1 md:flex-none">
                        <select 
                            value={currentSort}
                            onChange={(e) => updateFilters('sort', e.target.value)}
                            className="w-full md:w-auto appearance-none bg-secondary/5 border border-border text-[10px] uppercase font-bold tracking-widest px-4 py-3 pr-10 focus:border-primary focus:outline-none cursor-pointer"
                        >
                            <option value="">Recommended</option>
                            <option value="newest">Newest Arrivals</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Mobile Categories Dropdown */}
            {isMobileFiltersOpen && (
                <div className="md:hidden flex flex-col gap-2 bg-secondary/5 border border-border p-4 text-[10px] uppercase font-bold tracking-widest">
                    <button 
                        onClick={() => updateFilters('category', '')}
                        className={`text-left py-2 ${!currentCategory ? 'text-primary' : 'text-secondary/60'}`}
                    >
                        All Categories
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => updateFilters('category', cat.slug)}
                            className={`text-left py-2 ${currentCategory === cat.slug ? 'text-primary' : 'text-secondary/60'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
