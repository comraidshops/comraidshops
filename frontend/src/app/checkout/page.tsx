import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://comraidshops.art';

export const metadata: Metadata = {
    title: 'Secure Checkout | ComraidShops Acquisition',
    description: 'Finalize your acquisition within the ComraidShops luxury archive. Secure, encrypted, and curated for the modern architect of style.',
    alternates: { canonical: `${SITE_URL}/checkout` },
    openGraph: {
        title: 'Secure Checkout | ComraidShops',
        description: 'Complete your curated acquisition.',
        url: `${SITE_URL}/checkout`,
        images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'Comraid Checkout' }],
    },
};

export default function CheckoutPage() {
    return <CheckoutClient />;
}
