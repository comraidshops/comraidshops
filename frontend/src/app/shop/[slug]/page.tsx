import { PRODUCTS } from '@/lib/mockData';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ProductActions from '@/components/shop/ProductActions';
import ProductNarrative from '@/components/shop/ProductNarrative';
import ProductSpecs from '@/components/shop/ProductSpecs';
import ProductFit from '@/components/shop/ProductFit';

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    return PRODUCTS.map((product) => ({
        slug: product.slug,
    }));
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = PRODUCTS.find((p) => p.slug === slug);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-12">
            <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Left: Image Gallery (Sticky) */}
                <div className="relative h-[60vh] md:h-screen md:sticky md:top-0 bg-secondary/10">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Right: Product Info */}
                <div className="px-4 md:px-12 py-12 md:py-24 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-2">
                            {product.vendor}
                        </h2>
                        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
                            {product.name}
                        </h1>
                        <p className="text-xl font-medium">${Number(product.price).toFixed(2)}</p>
                    </div>

                    <div className="prose prose-sm md:prose-base text-secondary mb-12 max-w-md">
                        <p>{product.description}</p>
                    </div>

                    {/* Client Component for Interactive Elements */}
                    <ProductActions product={product} />

                    <div className="mt-12 pt-12 border-t border-border">
                        <div className="grid grid-cols-2 gap-8 text-xs uppercase tracking-wide text-secondary">
                            <div>
                                <h3 className="font-bold text-foreground mb-2">Composition</h3>
                                <p>80% Polyamide, 20% Elastane. Made in Portugal.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground mb-2">Care</h3>
                                <p>Wash cold. Do not tumble dry.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Editorial Layer - Additive */}
            <div className="max-w-[1920px] mx-auto px-4 md:px-12 pb-24">
                <ProductNarrative
                    narrative={product.narrative}
                    philosophy={product.philosophy}
                    editorialReference={product.editorialReference}
                />
                <ProductSpecs
                    usage={product.usage}
                    features={product.features}
                    materials={product.materials}
                />
                <ProductFit fit={product.fit} />
            </div>
        </div>
    );
}
