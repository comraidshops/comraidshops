/**
 * Legacy wrapper for ComraidShops API
 * Re-exports everything for backward compatibility while we migrate.
 * THIS FILE SHOULD NOT IMPORT SWR.
 */

export * from './types';
export * from './constants';
export * from './api-utils';
export * from './fetchers';

// Special case for getInitialData (kept here for now)
import { API_BASE_URL } from './constants';

export async function getInitialData<T>(url: string): Promise<T | null> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  try {
    const response = await fetch(fullUrl, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      console.warn(`[API] Fetch failed for ${fullUrl}: Status ${response.status}`);
      return null;
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      console.warn(`[API] Empty response for ${fullUrl}`);
      return null;
    }

    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      console.error(`[API] JSON parse error for ${fullUrl}:`, parseError);
      console.error(`[API] Response snippet: ${text.substring(0, 100)}`);
      return null;
    }
  } catch (error) {
    console.error(`[API] Network error for ${fullUrl}:`, error);
    return null;
  }
}
