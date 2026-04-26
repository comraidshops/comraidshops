/**
 * Global Constants for ComraidShops API
 */

const getRawApiUrl = () => {
    const raw = process.env.NEXT_PUBLIC_API_URL || '';
    // Remove hidden characters and trim
    return raw.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
};

export const API_BASE_URL = getRawApiUrl() || 'https://ap.comraidshops.art/api';
export const MEDIA_BASE = API_BASE_URL.replace('/api', '');

if (!API_BASE_URL || !API_BASE_URL.startsWith('http')) {
    if (typeof window !== 'undefined') {
        console.error("CRITICAL: NEXT_PUBLIC_API_URL is invalid or missing:", API_BASE_URL);
    }
}
