import ProductCard from '@/components/shop/ProductCard';
import { fetchShopProducts, fetchCategories, fetchBrands, Product, Category, Brand } from '@/lib/api';
import ShopFilterBar from '@/components/shop/ShopFilterBar';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Shop | ComraidShops',
    description: 'Browse our curated collection of streetwear running gear.',
};

export default async function ShopPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    let products: Product[] = [];
    let categories: Category[] = [];
    let brands: Brand[] = [];
    
    // Convert search params
    const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;
    const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
    const brand = typeof resolvedSearchParams.brand === 'string' ? resolvedSearchParams.brand : undefined;
    const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;

    try {
        console.log(`[SHOP PAGE] Loading data with params:`, { q, category, brand, sort });
        const [productsData, categoriesData, brandsData] = await Promise.all([
            fetchShopProducts({ q, category, brand, sort }),
            fetchCategories(),
            fetchBrands()
        ]);
        
        console.log(`[SHOP PAGE] Data received. Products count: ${productsData?.results?.length || (Array.isArray(productsData) ? productsData.length : 'N/A')}`);
        
        products = productsData?.results ?? (Array.isArray(productsData) ? productsData : []);
        categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData as any)?.results ?? [];
        brands = Array.isArray(brandsData) ? brandsData : (brandsData as any)?.results ?? [];
    } catch (error) {
        console.error("CRITICAL ERROR: Failed to load products for shop page:", error);
    }

    return (
        <div className="min-h-screen pt-12 pb-24">
            <div className="max-w-[1920px] mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-baseline mb-8">
                    <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">
                        Shop All
                    </h1>
                    <div className="text-sm text-secondary uppercase tracking-wider mt-4 md:mt-0">
                        {products.length} Products
                    </div>
                </div>

                <ShopFilterBar categories={categories} brands={brands} />

                {products.length === 0 ? (
                    <div className="py-24 text-center">
                        <p className="text-secondary tracking-[0.2em] uppercase text-sm italic">
                            No products found in our records.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
                        {products.map((product: Product) => (
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
