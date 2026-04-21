import { fetchProduct, Product, ProductImage, ProductFeature, ProductSpecification, MEDIA_BASE } from "@/lib/api"

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import ProductCard from "@/components/shop/ProductCard"
import Image from "next/image"
import Link from "next/link"
import ProductActions from "@/components/shop/ProductActions"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://comraidshops.art';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    try {
        const resolvedParams = await params;
        if (!resolvedParams.slug || resolvedParams.slug === 'undefined') {
            throw new Error("Invalid or missing slug");
        }
        const product: Product = await fetchProduct(resolvedParams.slug);
        const brandName = (typeof product.brand === 'object' ? product.brand?.name : product.brand) || product.vendor_name || 'ComraidShops';
        const title = product.meta_title || `${product.name} by ${brandName} | ComraidShops`;
        const description = product.meta_description || product.short_description || product.description?.slice(0, 160) || `Buy ${product.name} on ComraidShops`;
        const canonicalUrl = `${SITE_URL}/products/${product.slug}`;
        const ogImage = product.image ? (product.image.startsWith('http') ? product.image : `${MEDIA_BASE}${product.image}`) : `${SITE_URL}/og-default.jpg`;

        return {
            title,
            description,
            alternates: { canonical: canonicalUrl },
            openGraph: {
                type: 'website',
                url: canonicalUrl,
                title,
                description,
                siteName: 'ComraidShops',
                images: [{ url: ogImage, width: 1200, height: 630, alt: product.name }],
            },
            twitter: {
                card: 'summary_large_image',
                site: '@comraidshops',
                title,
                description,
                images: [ogImage],
            },
        }
    } catch {
        return {
            title: 'Product Not Found | ComraidShops',
            description: 'The requested product could not be found.',
        }
    }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    console.log("PRODUCT SLUG RECEIVED:", slug)

    if (!slug || slug === 'undefined') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-12 border border-border flex flex-col items-center">
                    <h1 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-4">Object Not Found</h1>
                    <p className="text-secondary tracking-wide uppercase text-sm mb-8">The object slug is missing or undefined.</p>
                    <Link href="/" className="px-8 py-3 bg-foreground text-background text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    let product: Product;

    try {
        product = await fetchProduct(slug);
    } catch (error) {
        console.error("Failed to load product:", error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-12 border border-border flex flex-col items-center">
                    <h1 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-4">Object Not Found</h1>
                    <p className="text-secondary tracking-wide uppercase text-sm mb-8">The object &quot;{slug}&quot; could not be located.</p>
                    <Link href="/" className="px-8 py-3 bg-foreground text-background text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    const {
        brand,
        vendor_name,
        name,
        price,
        description,
        short_description,
        story,
        materials,
        care_instructions,
        origin_country,
        fit,
        weight,
        image,
        images = [],
        video_360,
        hero_video,
        editorial_quote,
        collections = [],
        features = [],
        specifications = [],
        related_products = []
    } = product;

    const brandName = (typeof brand === 'object' ? brand?.name : brand) || vendor_name || "Unknown Brand";
    const brandSlug = typeof brand === 'object' ? brand?.slug : undefined;
    const brandPhilosophy = typeof brand === 'object' ? brand?.philosophy : undefined;
    const brandDescription = typeof brand === 'object' ? brand?.description : undefined;
    
    // Typecast arrays safely for rendering
    const typedImages = (images as ProductImage[]) || [];
    
    // Asymmetric Gallery Grid Rendering
    const galleryItems: React.ReactNode[] = typedImages.filter(img => !img.is_primary).map((img, idx) => {
        let colSpan = "md:col-span-6";
        let aspect = "aspect-[4/5]";
        
        if (idx % 3 === 0) {
            colSpan = "md:col-span-8 md:col-start-3"; // Centered large image
            aspect = "aspect-square md:aspect-[16/9]";
        }
        
        return (
            <div key={img.id || `gallery-${idx}`} className={`${colSpan} relative ${aspect} bg-secondary/5 group overflow-hidden`}>
                <Image
                    src={img.image}
                    alt={`${brandName} gallery view ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
            </div>
        );
    });

    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image,
        description: product.short_description || product.description,
        brand: {
            '@type': 'Brand',
            name: brandName,
        },
        offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/products/${product.slug}`,
            priceCurrency: 'NGN',
            price: product.price,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
    };

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />

            {/* HERO SECTION */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 mb-32">

                {/* Primary Media (Cinematic Hero) */}
                <div className="flex flex-col gap-6">
                    <div className="relative aspect-[4/5] md:aspect-[3/4] w-full bg-secondary/5 overflow-hidden">
                        {hero_video ? (
                            <video 
                                src={hero_video} 
                                autoPlay 
                                muted 
                                loop 
                                playsInline
                                className="object-cover w-full h-full"
                            />
                        ) : image ? (
                            <Image
                                src={image}
                                alt={name}
                                fill
                                className="object-cover md:object-top"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.3em] text-secondary">
                                No Image Available
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col border-l border-border/20 pl-0 lg:pl-16 pt-8 lg:pt-0">
                    <div className="sticky top-24">
                        {/* Brand Banner */}
                        <div className="mb-12">
                            {brandSlug ? (
                                <Link href={`/brands/${brandSlug}`} className="text-xs uppercase tracking-[0.4em] text-secondary hover:text-foreground transition-colors">
                                    {brandName}
                                </Link>
                            ) : (
                                <span className="text-xs uppercase tracking-[0.4em] text-secondary">{brandName}</span>
                            )}
                        </div>

                        {/* Title & Price */}
                        <h1 className="text-4xl md:text-5xl font-light tracking-wide md:leading-[1.1] mb-6 uppercase">
                            {name}
                        </h1>
                        <p className="text-2xl font-light tracking-wider text-secondary mb-12">
                            ₦{Number(price).toLocaleString()}
                        </p>

                        {/* Short Description */}
                        {short_description && (
                            <div className="text-sm text-foreground/80 leading-relaxed font-light mb-12 max-w-md">
                                {short_description}
                            </div>
                        )}

                        {/* Interactive Actions & Variants */}
                        <div className="mb-16">
                            <ProductActions product={product} />
                        </div>

                        {/* Collections References */}
                        {collections && collections.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-secondary mb-6 line-after relative max-w-max pr-8">
                                    Featured In
                                    <span className="absolute top-1/2 right-0 w-4 h-[1px] bg-border/50"></span>
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    {collections.map((col, idx) => (
                                        <Link key={col.id || `col-${idx}`} href={`/collections/${col.slug}`} className="text-xs text-foreground/80 hover:text-foreground underline decoration-border underline-offset-4 tracking-widest uppercase">
                                            {col.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* EDITORIAL QUOTE */}
            {editorial_quote && (
                <section className="py-24 px-6 md:px-10 max-w-5xl mx-auto text-center border-t border-border/10">
                    <h2 className="text-2xl md:text-4xl font-serif italic text-foreground leading-relaxed tracking-wide">
                        &quot;{editorial_quote}&quot;
                    </h2>
                </section>
            )}

            {/* FEATURE STORY BLOCKS */}
            {features && features.length > 0 && (
                <section className="border-t border-border/10">
                    {features.map((feature: ProductFeature, idx: number) => (
                        <div key={feature.id || `feature-${idx}`} className="max-w-[1400px] mx-auto min-h-[70vh] flex flex-col lg:flex-row items-center justify-center py-24 px-6 md:px-10 lg:px-16 gap-16 lg:gap-32">
                            {/* Alternate left/right based on index */}
                            <div className={`w-full lg:w-1/2 relative aspect-[4/5] bg-secondary/5 ${idx % 2 !== 0 ? 'lg:order-2' : ''}`}>
                                {feature.image && (
                                    <Image
                                        src={feature.image}
                                        alt={feature.title}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            <div className={`w-full lg:w-1/2 flex flex-col justify-center max-w-xl ${idx % 2 !== 0 ? 'lg:order-1 lg:items-end lg:text-right' : ''}`}>
                                <h2 className="text-3xl md:text-5xl font-light tracking-wide uppercase leading-tight mb-8 text-foreground">
                                    {feature.title}
                                </h2>
                                <p className="text-base text-foreground/70 leading-loose font-light">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>
            )}
            {/* PRODUCT STORY SECTION */}
            {story && (
                <section className="py-32 px-6 md:px-10 max-w-3xl mx-auto text-center border-t border-border/10">
                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-secondary mb-16 relative inline-block">
                        Story
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-secondary/50"></div>
                    </h2>
                    <p className="text-sm md:text-2xl text-foreground font-light leading-loose tracking-wide whitespace-pre-line">
                        {story}
                    </p>
                </section>
            )}

            {/* CINEMATIC GALLERY */}
            {typedImages.length > 0 && (
                <section className="py-24 max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 border-t border-border/10">
                    <div className="mb-24 flex flex-col items-center">
                        <h2 className="text-xs uppercase tracking-[0.4em] text-secondary mb-4">
                            Details
                        </h2>
                        <div className="w-[1px] h-12 bg-secondary/30 mt-4"></div>
                    </div>
                    
                    {/* Asymmetric Grid Example */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 lg:gap-16">
                        {galleryItems.length > 0 ? galleryItems : null}
                    </div>

                    {/* 360 Video placeholder if available */}
                    {!!video_360 && (
                        <div className="mt-16 md:mt-24 relative aspect-video w-full md:w-3/4 mx-auto bg-black flex items-center justify-center group cursor-pointer h-[60vh] max-h-[800px]">
                            <div className="text-center">
                                <span className="block text-white text-xs tracking-[0.3em] uppercase mb-4">360 View Available</span>
                                <div className="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center mx-auto group-hover:bg-white transition-colors">
                                    <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white group-hover:border-l-black border-b-4 border-b-transparent ml-1" />
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* TECHNICAL SPECIFICATIONS & MATERIALS */}
            <section className="py-32 border-t border-border/10 bg-secondary/5">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-24">

                    {/* Left Column: Description & Materials */}
                    <div className="flex flex-col gap-16">
                        {description && (
                            <div>
                                <h3 className="text-xs uppercase tracking-[0.4em] text-secondary mb-8">Object Description</h3>
                                <div 
                                    className="text-sm text-foreground/80 leading-relaxed font-light max-w-xl prose prose-invert prose-sm"
                                    dangerouslySetInnerHTML={{ __html: description }}
                                />
                            </div>
                        )}

                        {(materials || care_instructions) && (
                            <div className="pt-12 border-t border-border/20">
                                {materials && (
                                    <div className="mb-12">
                                        <h3 className="text-xs uppercase tracking-[0.4em] text-secondary mb-6">Composition</h3>
                                        <p className="text-sm font-light leading-relaxed">{materials}</p>
                                    </div>
                                )}
                                {care_instructions && (
                                    <div>
                                        <h3 className="text-xs uppercase tracking-[0.4em] text-secondary mb-6">Care Instructions</h3>
                                        <p className="text-sm font-light leading-relaxed whitespace-pre-line text-foreground/80">{care_instructions}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Specifications Grid */}
                    <div className="flex flex-col">
                        <h3 className="text-xs uppercase tracking-[0.4em] text-secondary mb-12">Specifications</h3>
                        <div className="flex flex-col border-t border-border/20">
                            {origin_country && (
                                <div className="grid grid-cols-2 py-6 border-b border-border/20">
                                    <span className="text-xs uppercase tracking-[0.2em] text-secondary/70">Origin</span>
                                    <span className="text-sm font-light text-right">{origin_country}</span>
                                </div>
                            )}
                            {fit && (
                                <div className="grid grid-cols-2 py-6 border-b border-border/20">
                                    <span className="text-xs uppercase tracking-[0.2em] text-secondary/70">Fit</span>
                                    <span className="text-sm font-light text-right">{fit}</span>
                                </div>
                            )}
                            {weight && (
                                <div className="grid grid-cols-2 py-6 border-b border-border/20">
                                    <span className="text-xs uppercase tracking-[0.2em] text-secondary/70">Weight</span>
                                    <span className="text-sm font-light text-right">{weight}</span>
                                </div>
                            )}
                            {specifications.map((spec: ProductSpecification, idx: number) => (
                                <div key={spec.id || `spec-${idx}`} className="grid grid-cols-2 py-6 border-b border-border/20">
                                    <span className="text-xs uppercase tracking-[0.2em] text-secondary/70">{spec.name}</span>
                                    <span className="text-sm font-light text-right">{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>



            {/* COLLECTION & BRAND CONTEXT */}
            {(collections.length > 0 || brand) && (
                <section className="py-32 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto border-t border-border/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-32">
                        {/* Collection Context */}
                        {collections.length > 0 && (
                            <div className="flex flex-col gap-12">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-secondary">Collection Context</span>
                                <div>
                                    <h2 className="text-3xl font-light uppercase tracking-tight mb-6">{collections[0].name}</h2>
                                    <p className="text-sm font-light text-foreground/70 leading-relaxed mb-8 max-w-md">
                                        {collections[0].description || `Exploring the boundaries of form and function in our ${collections[0].season || 'latest'} series.`}
                                    </p>
                                    <Link 
                                        href={`/collections/${collections[0].slug}`}
                                        className="text-[10px] uppercase tracking-[0.3em] font-medium border-b border-foreground pb-1 inline-block hover:border-transparent transition-colors"
                                    >
                                        Explore Collection
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Brand Context */}
                        {brand && (
                            <div className="flex flex-col gap-12">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-secondary">Brand Ethos</span>
                                <div>
                                    <h2 className="text-3xl font-light uppercase tracking-tight mb-6">{brandName}</h2>
                                    <p className="text-sm font-light text-foreground/70 leading-relaxed mb-8 max-w-md">
                                        {brandPhilosophy || brandDescription || "Craftsmanship and heritage redefined for the contemporary era."}
                                    </p>
                                    <Link 
                                        href={`/brands/${brandSlug || ''}`}
                                        className="text-[10px] uppercase tracking-[0.3em] font-medium border-b border-foreground pb-1 inline-block hover:border-transparent transition-colors"
                                    >
                                        Visit Studio
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* RELATED PRODUCTS */}
            {related_products.length > 0 && (
                <section className="py-24 mt-0 border-t border-border/10 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
                    <div className="mb-16 flex flex-col items-center">
                        <h2 className="text-xs uppercase tracking-[0.4em] text-secondary mb-4">
                            More from {brandName}
                        </h2>
                        <div className="w-[1px] h-12 bg-secondary/30 mt-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
                        {related_products.map((rp, idx) => (
                            <ProductCard
                                key={rp.id || rp.slug || `rp-${idx}`}
                                id={rp.id.toString()}
                                name={rp.name}
                                price={Number(rp.price)}
                                image={rp.image || '/placeholder.jpg'}
                                vendor={brandName}
                                slug={rp.slug}
                            />
                        ))}
                    </div>
                </section>
            )}

        </div>
    )
}
