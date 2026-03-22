import Link from 'next/link';
import Image from 'next/image';
import { API_BASE_URL, MEDIA_BASE } from '@/lib/api';

export const metadata = {
    title: 'Partner Labels | ComraidShops Brand Ecosystem',
    description: 'Discover the architects of modern culture. ComraidShops curates a global roster of independent talent, providing the platform for their stories to be told.',
};

interface Brand {
    id: number | string;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string | null;
    logo?: string | null;
}

async function getBrands(): Promise<Brand[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/brands/`, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || data;
    } catch (error) {
        console.error("Failed to fetch brands", error);
        return [];
    }
}

export default async function BrandsPage() {
    const brands = await getBrands();

    return (
        <div className="min-h-screen pt-24 pb-32">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
                <div className="mb-24 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary mb-4 block">Curated Partners</span>
                    <h1 className="text-5xl md:text-8xl font-playfair font-medium tracking-tighter">
                        Our <span className="italic opacity-80">Brands.</span>
                    </h1>
                </div>

                {brands.length === 0 ? (
                    <div className="text-center py-32 border-t border-foreground/5">
                        <p className="text-sm uppercase tracking-[0.3em] text-secondary/40">No brands available yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                        {brands.map((brand: Brand) => (
                            <Link 
                                key={brand.id} 
                                href={`/brands/${brand.slug}`} 
                                className="group block space-y-8"
                            >
                                <div className="aspect-[16/10] relative overflow-hidden bg-foreground/5">
                                    <Image 
                                        src={brand.hero_image ? (brand.hero_image.startsWith('http') ? brand.hero_image : `${MEDIA_BASE}${brand.hero_image}`) : '/images/placeholder-editorial.jpg'}
                                        alt={brand.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                        priority={brands.indexOf(brand) < 2}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                                    
                                    {brand.logo && (
                                        <div className="absolute bottom-8 left-8 bg-white p-4 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                            <div className="relative w-12 h-12">
                                                <Image 
                                                    src={brand.logo.startsWith('http') ? brand.logo : `${MEDIA_BASE}${brand.logo}`}
                                                    alt={`${brand.name} logo`}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-3xl font-bold uppercase tracking-tight">{brand.name}</h2>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-black transition-colors">Explore Object</span>
                                    </div>
                                    {brand.description && (
                                        <p className="text-secondary text-lg leading-relaxed line-clamp-2 max-w-xl">
                                            {brand.description}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
