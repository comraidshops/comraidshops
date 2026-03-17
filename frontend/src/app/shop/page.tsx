import ProductCard from '@/components/shop/ProductCard';
import { fetchProducts } from '@/lib/api';

export const metadata = {
    title: 'Shop | ComraidShops',
    description: 'Browse our curated collection of streetwear running gear.',
};

export default async function ShopPage() {
    let products = [];
    try {
        const data = await fetchProducts();
        // Handle both paginated ({results: []}) and unpaginated ([]) responses
        products = data.results ?? (Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Failed to load products for shop page:", error);
    }

    return (
        <div className="min-h-screen pt-12 pb-24">
            <div className="max-w-[1920px] mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">
                        Shop All
                    </h1>
                    <div className="text-sm text-secondary uppercase tracking-wider mt-4 md:mt-0">
                        {products.length} Products
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="py-24 text-center">
                        <p className="text-secondary tracking-[0.2em] uppercase text-sm italic">
                            No products found in our records.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
                        {products.map((product: any) => (
                            <ProductCard
                                key={product.slug}
                                id={product.id.toString()}
                                name={product.name}
                                price={Number(product.price)}
                                image={product.image || '/placeholder.jpg'}
                                vendor={product.vendor_name || 'ComraidShops'}
                                slug={product.slug}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
