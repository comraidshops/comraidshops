/**
 * Server-only API utilities for ComraidShops
 * For use in Server Components, sitemap.ts, and generateStaticParams
 */
import { API_BASE_URL } from './api';

export async function serverFetch<T>(url: string, options: RequestInit = {}): Promise<T | null> {
    const finalUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    try {
        const res = await fetch(finalUrl, {
            ...options,
            next: { revalidate: 3600 }, // Default 1 hour cache
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error(`Server fetch failed: ${finalUrl}`, error);
        return null;
    }
}

export async function fetchBrands() { return serverFetch('/brands/'); }
export async function fetchShopProducts() { return serverFetch('/products/'); }
export async function fetchMagazines() { return serverFetch('/magazines/'); }
export async function fetchExhibitions() { return serverFetch('/exhibitions/'); }
export async function fetchFeaturedBrands() { return serverFetch('/brands/?featured=true'); }
export async function fetchFeaturedMagazine() { 
    const data: any = await serverFetch('/magazines/?featured=true');
    return Array.isArray(data) ? data[0] : (data?.results ? data.results[0] : null);
}
export async function fetchFeaturedExhibition() { 
    const data: any = await serverFetch('/exhibitions/?featured=true');
    return Array.isArray(data) ? data[0] : (data?.results ? data.results[0] : null);
}
export async function fetchSlides() { return serverFetch('/slides/'); }
