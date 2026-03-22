/**
 * Core API Utilities for ComraidShops
 * Handles token refresh and safe fetch with auth
 */

import { API_BASE_URL } from './constants';

export async function refreshToken() {
    const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    if (!refresh) throw new Error("No refresh token available");

    const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
    });

    if (!res.ok) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
        throw new Error("Session expired. Please login again.");
    }

    const data = await res.json();
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access);
    }
    return data.access;
}

export async function safeFetch(url: string, options: RequestInit = {}, retries = 1, isRetryAfterRefresh = false) {
    const finalUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : url;
    
    // Auto-inject common headers
    const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
    
    const isFormData = typeof window !== 'undefined' && options.body instanceof FormData;
    
    if (options.body && !isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(finalUrl, {
            ...options,
            headers,
            cache: "no-store",
        });

        // Handle 401 Unauthenticated - Attempt Token Refresh
        const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        if (res.status === 401 && !isRetryAfterRefresh && refresh) {
            try {
                const newToken = await refreshToken();
                const newHeaders = {
                    ...options.headers,
                    'Authorization': `Bearer ${newToken}`
                };
                return safeFetch(url, { ...options, headers: newHeaders }, retries, true);
            } catch (refreshErr) {
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
                    window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                }
                throw refreshErr;
            }
        }

        if (!res.ok) {
            const errorDetail = await res.text();
            throw new Error(`Request failed with status ${res.status}: ${errorDetail}`);
        }

        return await res.json();
    } catch (_err) {
        const error = _err as Error;
        if (retries > 0 && (error.name === 'TypeError' || error.name === 'AbortError')) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return safeFetch(url, options, retries - 1, isRetryAfterRefresh);
        }
        throw error;
    }
}
