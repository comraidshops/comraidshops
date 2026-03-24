import { fetchMagazine, API_BASE_URL, MEDIA_BASE, Magazine, Product } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://comraidshops.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
    try {
        const resolvedParams = await params;
        const magazine = await fetchMagazine(resolvedParams.slug);
        const title = magazine.meta_title || `${magazine.title} | Comraid Magazine`;
        const description = magazine.meta_description || magazine.excerpt || `Read ${magazine.title} on Comraid Magazine`;
        const canonicalUrl = `${SITE_URL}/magazine/${magazine.slug}`;
        const ogImage = magazine.thumbnail ? (magazine.thumbnail.startsWith('http') ? magazine.thumbnail : `${API_BASE_URL}${magazine.thumbnail}`) : `${SITE_URL}/og-magazine.jpg`;

        return {
            title,
            description,
            alternates: { canonical: canonicalUrl },
            openGraph: {
                type: 'article',
                url: canonicalUrl,
                title,
                description,
                images: [{ url: ogImage, width: 1200, height: 630, alt: magazine.title }],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [ogImage],
            },
        };
    } catch {
        return {
            title: 'Article Not Found | Comraid Magazine',
        };
    }
}

export default async function MagazineDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    let magazine: Magazine | null = null;
    try {
        magazine = await fetchMagazine(slug);
    } catch (error) {
        console.error("Failed to fetch magazine:", error);
    }

    if (!magazine) {
        return (
            <div className="min-h-screen bg-background pt-32 px-6 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4 uppercase tracking-tighter">Article Not Found</h1>
                <Link href="/magazine" className="text-xs uppercase tracking-widest underline underline-offset-4">Back to Magazine</Link>
            </div>
        );
    }

    const hasContent = !!magazine.article?.content;
    
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: magazine.title,
        description: magazine.excerpt || magazine.title,
        image: magazine.thumbnail ? (magazine.thumbnail.startsWith('http') ? magazine.thumbnail : `${API_BASE_URL}${magazine.thumbnail}`) : undefined,
        datePublished: magazine.created_at,
        publisher: {
            '@type': 'Organization',
            name: 'ComraidShops',
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/logo.png`,
            },
        },
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-24 px-6 md:px-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            
            <header className="max-w-3xl mx-auto mb-12">
                <div className="flex justify-between items-end mb-8 border-b border-border/50 pb-4">
                    <Link href="/magazine" className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary hover:text-foreground transition-colors">
                        ← Back to Magazine
                    </Link>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary/60">
                        Volume 01 • Philosophy
                    </span>
                </div>
                <h1 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter leading-none mb-8">
                    {magazine.title}.
                </h1>
            </header>

            <main className="max-w-3xl mx-auto">
                <div className="aspect-[16/9] relative mb-16 bg-secondary/5 overflow-hidden">
                    <Image
                        src={magazine.thumbnail ? (magazine.thumbnail.startsWith('http') ? magazine.thumbnail : `${MEDIA_BASE}${magazine.thumbnail}`) : "/new_image/art_of_suffering.jpg"}
                        alt={magazine.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="max-w-none mb-24">
                    {hasContent ? (
                        <div
                            className="space-y-8 text-lg md:text-xl text-foreground/80 leading-relaxed font-light editorial-content"
                            dangerouslySetInnerHTML={{ __html: magazine.article?.content || '' }}
                        />
                    ) : (
                        <div className="space-y-8 text-lg md:text-xl text-foreground/70 leading-relaxed font-light">
                            <p>
                                The depth of editorial content for {magazine.title} is currently being curated. 
                                Our magazine focuses on the intersection of craft, discipline, and the architectural 
                                evolution of the human form.
                            </p>
                            <p>
                                In every volume, we explore how discipline creates the conditions for expression, 
                                and how meaningful resistance refines the intent of the creator.
                            </p>
                            <p className="font-bold text-foreground">
                                The architecture of intent is built in the details.
                            </p>
                        </div>
                    )}
                </div>

                {/* Display Linked Products if any */}
                {magazine.article?.products && magazine.article.products.length > 0 && (
                    <div className="border-t border-border/20 pt-16">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary mb-12 text-center">
                            Featured in this Editorial
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
                            {magazine.article.products.map((product) => (
                                <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                                    <div className="aspect-[3/4] bg-secondary/5 relative mb-6 overflow-hidden">
                                        {product.image ? (
                                            <Image 
                                                src={product.image.startsWith('http') ? product.image : `${API_BASE_URL}${product.image}`} 
                                                alt={product.name} 
                                                fill 
                                                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-secondary uppercase tracking-widest">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-xs font-bold uppercase tracking-widest group-hover:opacity-70 transition-opacity">{product.name}</h3>
                                        <div className="text-xs text-secondary tracking-wider">₦{Number(product.price).toLocaleString()}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
