/**
 * Pure fetching functions for ComraidShops
 * No SWR here. Strictly server-safe if called correctly.
 */

import { API_BASE_URL } from './constants';
import { safeFetch } from './api-utils';

import { PaginatedResponse, Product, Brand, UserProfile, Slide, Exhibition, Magazine } from './types';

export async function fetchProfile(): Promise<UserProfile> { return safeFetch(`${API_BASE_URL}/user/profile/`); }
export async function fetchBrand(slug: string): Promise<Brand> { return safeFetch(`${API_BASE_URL}/brands/${slug}/`); }
export async function fetchProducts(params: Record<string, string | number | undefined> = {}): Promise<PaginatedResponse<Product>> { 
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([k, v]) => v !== undefined)
    );
    const query = new URLSearchParams(cleanParams as Record<string, string>).toString();
    return safeFetch(`${API_BASE_URL}/products/${query ? `?${query}` : ''}`); 
}
export async function fetchProduct(slug: string): Promise<Product> { return safeFetch(`${API_BASE_URL}/products/${slug}/`); }
export async function fetchShopProducts(params: Record<string, string | number | undefined> = {}): Promise<PaginatedResponse<Product>> { return fetchProducts(params); }
export async function fetchBrands(params: Record<string, string | number | undefined> = {}): Promise<Brand[]> { 
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([k, v]) => v !== undefined)
    );
    const query = new URLSearchParams(cleanParams as Record<string, string>).toString();
    return safeFetch(`${API_BASE_URL}/brands/${query ? `?${query}` : ''}`); 
}
export async function fetchFeaturedBrands(): Promise<Brand[]> { return fetchBrands({ featured: 'true' }); }
export async function fetchFeaturedProducts(): Promise<PaginatedResponse<Product>> { return fetchProducts({ featured: 'true' }); }
export async function fetchSlides(): Promise<Slide[]> { return safeFetch(`${API_BASE_URL}/slides/`); }
export async function fetchFeaturedMagazine(): Promise<Magazine | null> { 
    const data = await safeFetch(`${API_BASE_URL}/magazines/?featured=true`);
    return Array.isArray(data) ? data[0] : (data.results ? data.results[0] : null);
}
export async function fetchFeaturedExhibition(): Promise<Exhibition | null> { 
    const data = await safeFetch(`${API_BASE_URL}/exhibitions/?featured=true`);
    return Array.isArray(data) ? data[0] : (data.results ? data.results[0] : null);
}

export async function login(credentials: any): Promise<any> {
    return safeFetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
}

export async function fetchMagazine(slug: string): Promise<Magazine> { return safeFetch(`${API_BASE_URL}/magazines/${slug}/`); }
export async function fetchMagazines(): Promise<Magazine[]> { return safeFetch(`${API_BASE_URL}/magazines/`); }
export async function fetchExhibition(slug: string): Promise<Exhibition> { return safeFetch(`${API_BASE_URL}/exhibitions/${slug}/`); }
export async function fetchExhibitions(): Promise<Exhibition[]> { return safeFetch(`${API_BASE_URL}/exhibitions/`); }

// Payment/Checkout
export async function initializePayment(data: any): Promise<any> {
    return safeFetch(`${API_BASE_URL}/paystack/initialize/`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export async function joinBrandCommunity(slug: string): Promise<any> {
    return safeFetch(`${API_BASE_URL}/brands/${slug}/join/`, { method: 'POST' });
}

export async function leaveBrandCommunity(slug: string): Promise<any> {
    return safeFetch(`${API_BASE_URL}/brands/${slug}/leave/`, { method: 'POST' });
}

export async function toggleArticleLike(slug: string): Promise<{ is_liked: boolean; likes_count: number }> {
    return safeFetch(`${API_BASE_URL}/articles/${slug}/like/`, { method: 'POST' });
}

export async function fetchCategories(): Promise<any[]> { return safeFetch(`${API_BASE_URL}/categories/`); }
export async function fetchVendorCommunity(): Promise<any> { return safeFetch(`${API_BASE_URL}/vendor/community/`); }
export async function fetchCollection(slug: string): Promise<any> { return safeFetch(`${API_BASE_URL}/collections/${slug}/`); }
export async function fetchBrandProducts(slug: string): Promise<PaginatedResponse<Product>> { return fetchProducts({ brand: slug }); }
