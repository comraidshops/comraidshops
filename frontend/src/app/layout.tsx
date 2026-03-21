import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://comraidshops.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ComraidShops | Curated Streetwear & Independent Labels',
    template: '%s | ComraidShops',
  },
  description:
    'ComraidShops is the premier destination for independent streetwear and luxury labels. Discover curated collections, authentic brands, and editorial style.',
  keywords: ['streetwear', 'independent brands', 'comraidshops', 'luxury fashion', 'curated style', 'Nigerian fashion'],
  authors: [{ name: 'ComraidShops', url: SITE_URL }],
  creator: 'ComraidShops',
  publisher: 'ComraidShops',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    siteName: 'ComraidShops',
    locale: 'en_US',
    url: SITE_URL,
    title: 'ComraidShops | Curated Streetwear & Independent Labels',
    description:
      'The premier destination for independent streetwear and luxury labels. Discover curated collections, authentic brands, and editorial style.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'ComraidShops – Curated Streetwear',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@comraidshops',
    title: 'ComraidShops | Curated Streetwear & Independent Labels',
    description:
      'The premier destination for independent streetwear and luxury labels.',
    images: ['/og-default.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}
      >
        <NotificationProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow pt-16 pb-20 md:pb-0">
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
          </CartProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
