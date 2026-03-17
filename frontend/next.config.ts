import type { NextConfig } from "next";

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

export default nextConfig;
