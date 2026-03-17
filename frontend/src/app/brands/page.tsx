import Link from 'next/link';

export const metadata = {
    title: 'Brands | ComraidShops',
    description: 'Our curated list of vendor partners.',
};

interface Brand {
    id: number | string;
    name: string;
    slug: string;
    description?: string;
    hero_image?: string | null;
}

async function getBrands(): Promise<Brand[]> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) return [];

    try {
        const res = await fetch(`${API_URL}/brands/`, { next: { revalidate: 60 } });
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
        <div className="min-h-screen pt-12 pb-24">
            <div className="max-w-[1920px] mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-16 text-center">
                    Our Brands
                </h1>

                {brands.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-secondary">No brands available.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                        {brands.map((brand: Brand) => (
                            <Link key={brand.id} href={`/brands/${brand.slug}`} className="group block border-t border-border pt-8 hover:border-black transition-colors duration-300">
                                <h2 className="text-3xl font-bold uppercase tracking-tight mb-2 group-hover:pl-4 transition-all duration-300">
                                    {brand.name}
                                </h2>
                                {brand.description && (
                                    <p className="text-secondary text-lg group-hover:pl-4 transition-all duration-300">
                                        {brand.description}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
