import { fetchCollection } from "@/lib/api"
import { Collection, Product } from "@/lib/types"
import ProductCard from "@/components/shop/ProductCard"
import Image from "next/image"
import Link from "next/link"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    try {
        const resolvedParams = await params;
        const collection: Collection = await fetchCollection(resolvedParams.slug);
        return {
            title: `${collection.name} | ComraidShops`,
            description: collection.description || `Explore the ${collection.name} collection at ComraidShops`,
        }
    } catch {
        return {
            title: 'Collection Not Found | ComraidShops',
            description: 'The requested collection could not be found.',
        }
    }
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    console.log("COLLECTION SLUG RECEIVED:", slug)

    let collection: Collection;

    try {
        collection = await fetchCollection(slug);
    } catch (error) {
        console.error("Failed to load collection:", error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-12 border border-border flex flex-col items-center">
                    <h1 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-4">Collection Not Found</h1>
                    <p className="text-secondary tracking-wide uppercase text-sm mb-8">The collection &quot;{slug}&quot; could not be located.</p>
                    <Link href="/" className="px-8 py-3 bg-foreground text-background text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    const products: Product[] = collection.products || [];

    return (
        <div className="min-h-screen bg-background text-foreground pb-12">

            <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
                {collection.hero_image ? (
                    <>
                        <div className="absolute inset-0 bg-black/40 z-10"></div>
                        <Image
                            src={collection.hero_image}
                            alt={collection.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-secondary/5"></div>
                )}

                <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
                    {collection.season && (
                        <span className="text-xs tracking-[0.4em] uppercase text-white/80 mb-6 block">
                            {collection.season}
                        </span>
                    )}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-wide mb-6 uppercase text-white">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl font-light leading-relaxed">
                            {collection.description}
                        </p>
                    )}
                </div>
            </section>

            <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
                <div className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
                    <h2 className="text-xs uppercase tracking-[0.3em] text-secondary">
                        Collection Pieces
                    </h2>
                    <span className="text-[10px] text-secondary tracking-[0.4em] uppercase">
                        {products.length} Objects
                    </span>
                </div>

                {products.length === 0 ? (
                    <div className="py-32 flex justify-center border-t border-border/20">
                        <p className="text-sm uppercase tracking-[0.3em] text-secondary/60">
                            No products available in this collection yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
                        {products.map((product) => (
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
            </section>

        </div>
    )
}
