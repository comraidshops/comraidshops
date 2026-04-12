import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Inter, Cormorant_Garamond, Bebas_Neue, Libre_Baskerville, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import RouteChangeIndicator from "@/components/layout/RouteChangeIndicator";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { PWAProvider } from "@/context/PWAContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const baskerville = Libre_Baskerville({
  variable: "--font-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://comraidshops.art';

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
import HeaderVisibilityWrapper from "@/components/layout/HeaderVisibilityWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${inter.variable} ${cormorant.variable} ${bebas.variable} ${baskerville.variable} ${sourceSerif.variable} antialiased min-h-screen flex flex-col overflow-x-hidden`}
      >

        <NotificationProvider>
          <PWAProvider>
            <CartProvider>
              <Suspense fallback={null}>
                <RouteChangeIndicator />
              </Suspense>
              
              <HeaderVisibilityWrapper>
                <Header />
              </HeaderVisibilityWrapper>

              <GlobalHeaderPadding>
                <main className="flex-grow pb-20 md:pb-0 w-full overflow-x-hidden">
                  {children}
                </main>
              </GlobalHeaderPadding>

              <HeaderVisibilityWrapper>
                <Footer />
                <MobileBottomNav />
              </HeaderVisibilityWrapper>
              
              <InstallPrompt />
            </CartProvider>
          </PWAProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
