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
  try {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    const response = await fetch(fullUrl, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Server fetch error:', error);
    return null;
  }
}
