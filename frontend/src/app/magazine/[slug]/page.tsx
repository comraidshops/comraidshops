import { fetchMagazine, API_BASE_URL, MEDIA_BASE, Magazine, Product } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import ReadingProgressBar from '@/components/ui/ReadingProgressBar';
import SocialShare from '@/components/ui/SocialShare';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://comraidshops.com';

function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

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
    const readingTime = hasContent ? calculateReadingTime(magazine.article?.content || '') : 0;
    
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
        <div className="min-h-screen bg-background pt-24 md:pt-32 pb-24 px-4 md:px-12 overflow-x-hidden">
            <ReadingProgressBar />
            <SocialShare title={magazine.title} />
            
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            
            <header className="max-w-4xl mx-auto mb-16 md:mb-20 text-center">
                <div className="flex flex-col items-center gap-6 mb-8 md:mb-12">
                    <Link href="/magazine" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] text-secondary hover:text-foreground transition-all">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Magazine
                    </Link>
                    
                    <div className="h-[1px] w-8 md:w-12 bg-border/50"></div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.3em] text-secondary/60">
                        <span>Volume 01</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span>Philosophy</span>
                        {readingTime > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-border"></span>
                                <span>{readingTime} min read</span>
                            </>
                        )}
                    </div>
                </div>
                
                <h1 className="text-4xl md:text-8xl font-bold uppercase tracking-tighter leading-[0.95] md:leading-[0.9] mb-8 md:mb-12 text-balance font-playfair break-words px-2">
                    {magazine.title}.
                </h1>

                {magazine.excerpt && (
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-secondary font-light leading-relaxed mb-12 italic">
                        "{magazine.excerpt}"
                    </p>
                )}

                <div className="flex items-center justify-center gap-4 md:gap-8 border-t border-b border-border/50 py-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] uppercase tracking-widest text-secondary/50">Published</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest">
                            {magazine.created_at ? new Date(magazine.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'March 2024'}
                        </span>
                    </div>
                    <div className="w-[1px] h-8 bg-border/30"></div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] uppercase tracking-widest text-secondary/50">Curator</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest">Editorial Team</span>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto">
                <div className="aspect-[16/10] relative mb-24 bg-secondary/5 overflow-hidden group">
                    <Image
                        src={magazine.thumbnail ? (magazine.thumbnail.startsWith('http') ? magazine.thumbnail : `${MEDIA_BASE}${magazine.thumbnail}`) : "/new_image/art_of_suffering.jpg"}
                        alt={magazine.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>

                <div className="max-w-none mb-32">
                    {hasContent ? (
                        <div
                            className="editorial-content"
                            dangerouslySetInnerHTML={{ __html: magazine.article?.content || '' }}
                        />
                    ) : (
                        <div className="editorial-content">
                            <p>
                                The depth of editorial content for {magazine.title} is currently being curated. 
                                Our magazine focuses on the intersection of craft, discipline, and the architectural 
                                evolution of the human form.
                            </p>
                            <p>
                                In every volume, we explore how discipline creates the conditions for expression, 
                                and how meaningful resistance refines the intent of the creator.
                            </p>
                            <blockquote>
                                <p>The architecture of intent is built in the details.</p>
                            </blockquote>
                            <p>
                                Stay tuned as we finalize this feature. Comraid Magazine remains dedicated to 
                                documenting the vanguard of creative discipline.
                            </p>
                        </div>
                    )}
                </div>

                {/* Display Linked Products if any */}
                {magazine.article?.products && magazine.article.products.length > 0 && (
                    <div className="border-t border-border/20 pt-24">
                        <div className="flex flex-col items-center mb-16">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary mb-4">
                                Shop the Editorial
                            </h2>
                            <div className="h-[1px] w-8 bg-primary"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
                            {magazine.article.products.map((product) => (
                                <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                                    <div className="aspect-[3/4] bg-secondary/5 relative mb-6 overflow-hidden">
                                        {product.image ? (
                                            <Image 
                                                src={product.image.startsWith('http') ? product.image : `${API_BASE_URL}${product.image}`} 
                                                alt={product.name} 
                                                fill 
                                                className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-secondary uppercase tracking-widest">No Image</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest group-hover:opacity-70 transition-opacity">{product.name}</h3>
                                        <div className="text-[10px] text-secondary tracking-widest">₦{Number(product.price).toLocaleString()}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-32 pt-16 border-t border-border/20 flex flex-col items-center">
                    <Link href="/magazine" className="text-xs font-bold uppercase tracking-[0.3em] underline underline-offset-8 decoration-border hover:decoration-primary transition-all">
                        Discover More Stories
                    </Link>
                </div>
            </main>
        </div>
    );
}
