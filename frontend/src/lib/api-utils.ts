/**
 * Core API Utilities for ComraidShops
 * Handles token refresh and safe fetch with auth
 */

import { API_BASE_URL } from './constants';

let refreshPromise: Promise<string> | null = null;

export async function refreshToken() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
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
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

function formatErrorMessage(status: number, detail: string): string {
    try {
        const parsed = JSON.parse(detail);
        // Handle DRF style errors: { "detail": "..." } or { "email": ["..."] }
        if (parsed.detail) {
            if (status === 401 && parsed.detail.includes("No active account found")) {
                return "Invalid email or password. Please check your credentials.";
            }
            return parsed.detail;
        }
        
        // Handle field-specific errors: { "field": ["message"] }
        const firstField = Object.keys(parsed)[0];
        if (firstField && Array.isArray(parsed[firstField])) {
            return `${firstField}: ${parsed[firstField][0]}`;
        }
    } catch {
        // Not JSON, return truncated original or generic message
    }

    if (status === 401) return "Session expired or unauthorized access.";
    if (status === 403) return "You do not have permission to perform this action.";
    if (status >= 500) return "A server error occurred. Please try again later.";
    
    return detail.length > 100 ? `Request failed with status ${status}` : detail || `Request failed (${status})`;
}

export async function safeFetch(url: string, options: RequestInit = {}, retries = 1, isRetryAfterRefresh = false) {
    const finalUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : url;
    
    // Auto-inject common headers
    const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
    
    const isFormData = typeof window !== 'undefined' && options.body && typeof (options.body as any).append === 'function';
    
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
            const formattedMessage = formatErrorMessage(res.status, errorDetail);
            throw new Error(formattedMessage);
        }

        if (res.status === 204) {
            return null;
        }

        return await res.json();
    } catch (_err) {
        const error = _err as Error;
        
        // Handle network-level errors (CORS, DNS, connection dropped)
        // Safari often reports "Load failed", Chrome "Failed to fetch"
        if (error.name === 'TypeError' || error.message.includes('Load failed') || error.message.includes('Failed to fetch')) {
            console.error(`[API] Critical network error calling ${finalUrl}:`, error);
            
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return safeFetch(url, options, retries - 1, isRetryAfterRefresh);
            }
            
            // Re-throw with more context
            throw new Error(`Connection Error: ${error.message}. Please check your internet or server status.`);
        }
        
        throw error;
    }

}
