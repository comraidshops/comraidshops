import Link from 'next/link';
import Image from 'next/image';
import { fetchExhibitions } from '@/lib/server-api';
import { Exhibition } from '@/lib/types';
import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://comraidshops.art';

export const metadata: Metadata = {
    title: 'Archive Exhibitions | Curated Temporal Collections',
    description: 'Explore the temporal intersection of architecture and human movement within the ComraidShops curated archive. Temporal exhibits redefined.',
    alternates: { canonical: `${SITE_URL}/exhibitions` },
    openGraph: {
        title: 'Archive Exhibitions | Curated Temporal Collections',
        description: 'Exploring the intersection of architecture and human movement.',
        url: `${SITE_URL}/exhibitions`,
        images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'Comraid Exhibitions' }],
    },
};

export default async function ExhibitionsIndex() {
    let exhibitions: Exhibition[] = [];
    try {
        const data: any = await fetchExhibitions();
        exhibitions = Array.isArray(data) ? data : (data?.results || []);
    } catch (error) {
        console.error("Failed to fetch exhibitions:", error);
    }

    return (
        <div className="min-h-screen bg-background pt-36 pb-24 px-6 md:px-12">
            <header className="max-w-[1920px] mx-auto mb-24 border-b border-border pb-8">
                <h1 className="text-6xl md:text-9xl font-bold uppercase tracking-tighter mb-4">
                    Archive
                </h1>
                <div className="flex justify-between items-end">
                    <span className="text-sm font-bold uppercase tracking-widest text-secondary">
                        Exhibitions / Curated / Temporal
                    </span>
                </div>
            </header>

            <main className="max-w-[1920px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                    {exhibitions.map((exhibition) => (
                        <Link
                            key={exhibition.id}
                            href={`/exhibitions/${exhibition.slug}`}
                            className="group block"
                        >
                            <div className="relative aspect-[16/9] w-full bg-secondary/5 overflow-hidden mb-8">
                                {exhibition.thumbnail ? (
                                    <Image
                                        src={exhibition.thumbnail}
                                        alt={exhibition.title}
                                        fill
                                        unoptimized={true}
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-widest text-secondary/30">
                                        Void
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter group-hover:text-primary transition-colors">
                                    {exhibition.title}
                                </h2>
                                <p className="text-sm text-secondary/60 max-w-xl line-clamp-2">
                                    Exploring the temporal intersection of architecture and human movement within the curated archive.
                                </p>
                            </div>
                        </Link>
                    ))}
                    {exhibitions.length === 0 && (
                        <p className="text-secondary opacity-50">No exhibitions found in the archive.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
