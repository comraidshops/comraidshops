/**
 * Centralized API utility for ComraidShops
 */

const getRawApiUrl = () => {
    const raw = process.env.NEXT_PUBLIC_API_URL || '';
    // Remove hidden characters and trim
    return raw.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
};

export const API_BASE_URL = getRawApiUrl().endsWith('/') 
    ? getRawApiUrl().slice(0, -1) 
    : getRawApiUrl();

if (!API_BASE_URL || !API_BASE_URL.startsWith('http')) {
    console.error("CRITICAL: NEXT_PUBLIC_API_URL is invalid or missing:", API_BASE_URL);
}

export async function refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error("No refresh token available");

    const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
    });

    if (!res.ok) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        throw new Error("Session expired. Please login again.");
    }

    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
}

export async function safeFetch(url: string, options: RequestInit = {}, retries = 1, isRetryAfterRefresh = false) {
    console.log(`[FETCH ATTEMPT] ${url}`, {
        method: options.method || 'GET',
        headers: options.headers,
        retriesRemaining: retries
    });
    
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(url, {
            ...options,
            cache: "no-store",
            signal: controller.signal,
        });

        clearTimeout(timeout);
        console.log(`[FETCH RESPONSE] ${url} → ${res.status}`);

        // Handle 401 Unauthenticated - Attempt Token Refresh
        if (res.status === 401 && !isRetryAfterRefresh && localStorage.getItem('refresh_token')) {
            console.warn(`[401 UNAUTHORIZED] ${url}. Attempting token refresh...`);
            try {
                const newToken = await refreshToken();
                const newHeaders = {
                    ...options.headers,
                    'Authorization': `Bearer ${newToken}`
                };
                return safeFetch(url, { ...options, headers: newHeaders }, retries, true);
            } catch (refreshErr) {
                console.error("Token refresh failed:", refreshErr);
                // Redirect to login if in a browser environment
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
                    window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                }
                throw refreshErr;
            }
        }

        if (!res.ok) {
            let errorDetail = '';
            try {
                errorDetail = await res.text();
            } catch (_) {
                errorDetail = 'Could not read error response';
            }
            console.error(`[API ERROR] ${url} → ${res.status}:`, errorDetail);
            throw new Error(`Request failed with status ${res.status}: ${errorDetail}`);
        }

        return await res.json();
    } catch (_err) {
        const error = _err as Error;
        
        // Retry logic for transient network issues
        if (retries > 0 && (error.name === 'TypeError' || error.name === 'AbortError')) {
            console.warn(`[RETRYING] ${url} due to ${error.name}. Retries left: ${retries - 1}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return safeFetch(url, options, retries - 1, isRetryAfterRefresh);
        }

        console.error(`[FETCH FAILED] ${url}`, {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        throw error;
    }
}

export interface PaymentInitData {
    items: { id: number | string; quantity: number }[];
    redirect_url: string;
    save_card?: boolean;
    address_id?: number | null;
}

export async function initializePayment(data: PaymentInitData) {
    const token = localStorage.getItem('access_token');
    return safeFetch(`${API_BASE_URL}/paystack/initialize/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
}

export async function login(credentials: any) {
    return safeFetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
}

// Data fetching helpers
export async function fetchBrand(slug: string) {
    return safeFetch(`${API_BASE_URL}/brands/${slug}/`);
}

export async function fetchBrandProducts(slug: string) {
    return safeFetch(`${API_BASE_URL}/brands/${slug}/products/`);
}

export async function fetchCollection(slug: string) {
    return safeFetch(`${API_BASE_URL}/collections/${slug}/`);
}

export async function fetchProduct(slug: string) {
    return safeFetch(`${API_BASE_URL}/products/${slug}/`);
}

export async function fetchMagazines() {
    return safeFetch(`${API_BASE_URL}/magazines/`);
}

export async function fetchMagazine(slug: string) {
    return safeFetch(`${API_BASE_URL}/magazines/${slug}/`);
}

export async function fetchExhibitions() {
    return safeFetch(`${API_BASE_URL}/exhibitions/`);
}

export async function fetchExhibition(slug: string) {
    return safeFetch(`${API_BASE_URL}/exhibitions/${slug}/`);
}

export async function fetchProducts() {
    return safeFetch(`${API_BASE_URL}/products/`);
}

export async function fetchFeaturedProducts() {
    return safeFetch(`${API_BASE_URL}/products/?featured=true`);
}

export async function fetchFeaturedMagazine() {
    const data = await safeFetch(`${API_BASE_URL}/magazines/?featured=true`);
    return Array.isArray(data) ? data[0] : (data.results ? data.results[0] : null);
}

export async function fetchFeaturedExhibition() {
    const data = await safeFetch(`${API_BASE_URL}/exhibitions/?featured=true`);
    return Array.isArray(data) ? data[0] : (data.results ? data.results[0] : null);
}

export async function fetchFeaturedBrands() {
    const data = await safeFetch(`${API_BASE_URL}/brands/?featured=true`);
    return Array.isArray(data) ? data.slice(0, 2) : (data.results ? data.results.slice(0, 2) : []);
}
