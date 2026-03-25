import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ComraidShops | The Editorial Authority for Independent Brands & Cultural Curation',
    template: '%s | ComraidShops',
  },
  description:
    'Beyond commerce, ComraidShops is a global cultural ecosystem. Discover an editorial-led curation of independent labels and underground luxury that defines the next era of brand-first fashion.',
  keywords: ['fashion culture', 'independent brands', 'editorial curation', 'brand-first', 'underground luxury', 'creative director', 'cultural ecosystem', 'streetwear authority', 'luxury streetwear', 'independent labels'],
  authors: [{ name: 'ComraidShops', url: SITE_URL }],
  creator: 'ComraidShops',
  publisher: 'ComraidShops',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ComraidShops',
  },
  formatDetection: {
    telephone: false,
  },
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
    title: 'ComraidShops | The Editorial Authority for Independent Brands & Cultural Curation',
    description:
      'Beyond commerce, ComraidShops is a global cultural ecosystem. Discover an editorial-led curation of independent labels and underground luxury that defines the next era of brand-first fashion.',
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
    title: 'ComraidShops | The Editorial Authority for Independent Brands & Cultural Curation',
    description:
      'The premier destination for the intersection of independent labels and global fashion culture.',
    images: ['/og-default.jpg'],
  },
  icons: {
    icon: '/logo-white.png',
    shortcut: '/logo-white.png',
    apple: '/icon-192x192.png',
  },
};

import InstallPrompt from "@/components/pwa/InstallPrompt";

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
            <InstallPrompt />
          </CartProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
