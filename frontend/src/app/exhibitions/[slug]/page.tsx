import { Metadata } from 'next';
import { fetchExhibition, fetchExhibitions } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import ExhibitionClient from './ExhibitionClient';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://comraidshops.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const resolvedParams = await params;
        const exhibition = await fetchExhibition(resolvedParams.slug);
        
        const title = exhibition.meta_title || `${exhibition.title} | ComraidShops Exhibition`;
        const description = exhibition.meta_description || exhibition.description?.slice(0, 160) || `Explore the ${exhibition.title} exhibition on ComraidShops.`;
        const canonicalUrl = `${SITE_URL}/exhibitions/${exhibition.slug}`;
        const ogImage = exhibition.cover_image || exhibition.thumbnail || `${SITE_URL}/og-exhibition.jpg`;

        return {
            title,
            description,
            alternates: { canonical: canonicalUrl },
            openGraph: {
                type: 'website',
                url: canonicalUrl,
                title,
                description,
                images: [{ url: ogImage, width: 1200, height: 630, alt: exhibition.title }],
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
            title: 'Exhibition Not Found | ComraidShops',
        };
    }
}

export default async function ExhibitionPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    let exhibition = null;
    try {
        exhibition = await fetchExhibition(slug);
    } catch (error) {
        console.error("Failed to fetch exhibition:", error);
    }

    if (!exhibition) {
        return (
            <div className="min-h-screen bg-background pt-36 px-6 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4 tracking-tighter">Void Room</h1>
                <p className="text-secondary/60 mb-8 font-light max-w-md text-center">
                    The exhibition you are looking for has concluded or does not exist in this archive.
                </p>
                <Link href="/exhibitions" className="text-sm uppercase tracking-widest text-primary border-b border-primary/30 pb-1 hover:border-primary transition-colors">
                    Return to Archive
                </Link>
            </div>
        );
    }

    return <ExhibitionClient exhibition={exhibition} />;
}
