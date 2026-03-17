import { fetchBrand, fetchBrandProducts } from "@/lib/api"
import { Brand, Product } from "@/types/brand"
import ProductCard from "@/components/shop/ProductCard"

import HeroSection from "@/components/brand/HeroSection"
import PhilosophySection from "@/components/brand/PhilosophySection"
import FounderSection from "@/components/brand/FounderSection"
import CollectionsSection from "@/components/brand/CollectionsSection"
import EditorialSection from "@/components/brand/EditorialSection"
import MediaGallery from "@/components/brand/MediaGallery"
import SocialLinks from "@/components/brand/SocialLinks"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    try {
        const resolvedParams = await params;
        const brand: Brand = await fetchBrand(resolvedParams.slug);
        return {
            title: `${brand.name} | ComraidShops`,
            description: brand.description || `Explore ${brand.name} at ComraidShops`,
        }
    } catch (error) {
        return {
            title: 'Brand Not Found | ComraidShops',
            description: 'The requested brand could not be found.',
        }
    }
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    console.log("BRAND SLUG RECEIVED:", slug)

    let brand: Brand;
    let productsData: any;

    try {
        brand = await fetchBrand(slug);
    } catch (error) {
        console.error("Failed to load brand:", error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-12 border border-border">
                    <h1 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-4">Brand Not Found</h1>
                    <p className="text-secondary tracking-wide uppercase text-sm">The brand &quot;{slug}&quot; could not be located.</p>
                </div>
            </div>
        );
    }

    try {
        productsData = await fetchBrandProducts(slug);
    } catch (err) {
        console.error("Failed to load products for brand:", err);
        productsData = { results: [] };
    }

    const products: Product[] = productsData?.results ?? (Array.isArray(productsData) ? productsData : [])

    return (
        <div className="min-h-screen bg-background text-foreground pb-12">

            <HeroSection
                name={brand.name}
                description={brand.description}
                heroImage={brand.hero_image}
            />

            <PhilosophySection
                philosophy={brand.philosophy}
                awards={brand.awards}
                manifesto={brand.manifesto}
                featured_quote={brand.featured_quote}
            />

            {/* SECTION: FEATURED CURATIONS (Moved up) */}
            {brand.featured_products?.length > 0 && (
                <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto border-t border-foreground/5">
                    <div className="mb-16 md:mb-24 text-center md:text-left">
                        <h2 className="text-xs uppercase tracking-[0.3em] text-secondary font-semibold">
                            Featured Curations
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
                        {brand.featured_products.map((product) => (
                            <ProductCard
                                key={product.slug}
                                id={product.id.toString()}
                                name={product.name}
                                price={Number(product.price)}
                                image={product.image || '/placeholder.jpg'}
                                vendor={brand.name}
                                slug={product.slug}
                            />
                        ))}
                    </div>
                </section>
            )}

            <FounderSection
                name={brand.founder_name}
                bio={brand.founder_bio}
                image={brand.founder_image}
                establishedYear={brand.established_year}
                originCountry={brand.origin_country}
                story={brand.story}
            />

            <CollectionsSection collections={brand.collections} />

            {/* SECTION: ALL PRODUCTS */}
            <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto border-t border-foreground/5">
                <div className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
                    <h2 className="text-xs uppercase tracking-[0.3em] text-secondary font-semibold">
                        The Complete Collection
                    </h2>
                    <span className="text-[10px] text-secondary tracking-[0.4em] uppercase">
                        {brand.approved_product_count} Objects
                    </span>
                </div>

                {products.length === 0 ? (
                    <div className="py-32 flex justify-center">
                        <p className="text-sm uppercase tracking-[0.3em] text-secondary/60">
                            No objects available yet
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
                                vendor={brand.name}
                                slug={product.slug}
                            />
                        ))}
                    </div>
                )}
            </section>

            <EditorialSection refs={brand.editorial_refs} type="Editorial" />

            <EditorialSection refs={brand.exhibition_refs} type="Exhibition" />

            <MediaGallery gallery={brand.gallery} />

            <SocialLinks website={brand.website} socials={brand.social_links} />

        </div>
    )
}
