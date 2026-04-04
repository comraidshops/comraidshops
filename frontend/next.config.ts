import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching: [
      {
        // 1. Cache images (30 days)
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "images-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        // 3. NEVER cache sensitive endpoints
        urlPattern: /\/(?:auth|user|orders|cart|payments)\/?/i,
        handler: "NetworkOnly",
        options: {
          cacheName: "sensitive-endpoints",
        },
      },
      {
        // 2. Cache public API (5 minutes)
        urlPattern: /\/(?:products|categories|collections)\/?/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "public-api-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Production backend (Cloudinary serves media, but keep API domain for any direct images)
      {
        protocol: "https",
        hostname: "api.comraidshops.art",
        pathname: "/**",
      },
      // Cloudinary — all subdomains
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Allow all HTTPS sources (covers CDNs, Cloudinary variants, etc.)
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      // Keep localhost for local development only
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA(nextConfig);
