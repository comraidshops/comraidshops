import { Metadata } from 'next';
import CartClient from './CartClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://comraidshops.art';

export const metadata: Metadata = {
    title: 'Your Archive | ComraidShops Cart',
    description: 'Review and refine your curated acquisitions. Your selection of independent luxury and avant-garde streetwear is ready for final commitment.',
    alternates: { canonical: `${SITE_URL}/cart` },
    openGraph: {
        title: 'Your Archive | ComraidShops Shopping Cart',
        description: 'Review your curated selection of independent luxury.',
        url: `${SITE_URL}/cart`,
        images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'Comraid Cart' }],
    },
};

export default function CartPage() {
    return <CartClient />;
}
