import Link from 'next/link';
import Image from 'next/image';
import { fetchMagazines } from '@/lib/server-api';
import { Magazine } from '@/lib/types';
import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://comraidshops.art';

export const metadata: Metadata = {
    title: 'Comraid Magazine | Culture, Philosophy & Process',
    description: 'Beyond commerce, we explore the intersection of craft, discipline, and the architectural evolution of the human form. Comraid Magazine documents the defining movements of our era.',
    alternates: { canonical: `${SITE_URL}/magazine` },
    openGraph: {
        title: 'Comraid Magazine | Culture, Philosophy & Process',
        description: 'Deep dives into craft, discipline, and the architectural evolution of the human form.',
        url: `${SITE_URL}/magazine`,
        images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'Comraid Magazine' }],
    },
};

export default async function MagazineIndex() {
    let magazines: Magazine[] = [];
    try {
        const data: any = await fetchMagazines();
        magazines = Array.isArray(data) ? data : (data?.results || []);
    } catch (error) {
        console.error("Failed to fetch magazines:", error);
    }

    const featuredMag = magazines.length > 0 ? magazines[0] : null;
    const remainingMags = magazines.slice(1);

    return (
        <div className="min-h-screen bg-background pt-32 pb-24 px-6 md:px-12">
            <header className="max-w-[1920px] mx-auto mb-24 border-b border-border pb-8">
                <h1 className="text-6xl md:text-9xl font-bold tracking-tighter uppercase mb-4">
                    Magazine
                </h1>
                <div className="flex justify-between items-end">
                    <span className="text-sm font-bold uppercase tracking-widest text-secondary">
                        Culture / Philosophy / Process
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                        Volume 01
                    </span>
                </div>
            </header>

            <main className="max-w-[1920px] mx-auto">
                {/* Featured Article */}
                {featuredMag && (
                    <section className="mb-32 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                        <div className="md:col-span-8 bg-secondary/10 aspect-[3/4] relative">
                            <Image
                                src={featuredMag.thumbnail || "/new_image/art_of_suffering.jpg"}
                                alt={featuredMag.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, 66vw"
                            />
                        </div>
                        <div className="md:col-span-4 space-y-6 pt-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                Featured
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none">
                                {featuredMag.title}.
                            </h2>
                            <p className="text-lg text-secondary leading-relaxed">
                                {featuredMag.excerpt}
                            </p>
                            <Link
                                href={`/magazine/${featuredMag.slug}`}
                                className="inline-block text-sm font-bold uppercase tracking-widest underline decoration-1 underline-offset-4 hover:text-primary transition-colors"
                            >
                                Read Article
                            </Link>
                        </div>
                    </section>
                )}

                {/* Article Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24 border-t border-border pt-24">
                    {remainingMags.map((mag) => (
                        <Link key={mag.id} href={`/magazine/${mag.slug}`}>
                            <article className="space-y-4 group cursor-pointer">
                                <div className="aspect-[3/4] bg-secondary/10 relative overflow-hidden">
                                    <Image
                                        src={mag.thumbnail || "/new_image/IMG_4336.jpg"}
                                        alt={mag.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
                                        Philosophy
                                    </span>
                                    <h3 className="text-2xl font-bold uppercase tracking-tight group-hover:text-primary transition-colors">
                                        {mag.title}.
                                    </h3>
                                    <p className="text-sm text-secondary/80 mt-2 leading-relaxed">
                                        {mag.excerpt}
                                    </p>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
