import { Metadata } from 'next';
import ArticlesClient from './ArticlesClient';
import { fetchMagazines } from '@/lib/server-api';
import { Magazine } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://comraidshops.art';

export const metadata: Metadata = {
    title: 'Selected Editorials | ComraidShops Philosophy',
    description: 'Deep dives into craft, discipline, and the architectural evolution of independent brands. A curated archive of the ComraidShops philosophy.',
    alternates: { canonical: `${SITE_URL}/articles` },
    openGraph: {
        title: 'Selected Editorials | ComraidShops',
        description: 'Deep dives into craft and discipline.',
        url: `${SITE_URL}/articles`,
        images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'Comraid Articles' }],
    },
};

export default async function ArticlesPage() {
    let articles: Magazine[] = [];
    try {
        const data: any = await fetchMagazines();
        articles = Array.isArray(data) ? data : (data?.results || []);
    } catch (error) {
        console.error("Failed to fetch articles:", error);
    }

    return <ArticlesClient initialArticles={articles} />;
}
