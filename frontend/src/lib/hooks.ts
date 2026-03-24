'use client';

import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';
import { API_BASE_URL } from './constants';
import { safeFetch } from './api-utils';
import { 
    fetchSlides, 
    fetchProfile, 
    fetchFeaturedBrands, 
    fetchFeaturedProducts,
    fetchFeaturedExhibition,
    fetchFeaturedMagazine,
} from './fetchers';

const swrFetcher = (url: string) => safeFetch(url);

export function useProducts(params?: Record<string, string | number>, config?: SWRConfiguration) {
  const query = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  const url = `${API_BASE_URL}/products/${query ? `?${query}` : ''}`;
  
  const { data, error, isLoading, mutate } = useSWR(url, swrFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    ...config
  });

  return {
    products: data?.results || data || [],
    count: data?.count || (data?.length || 0),
    next: data?.next,
    previous: data?.previous,
    isLoading,
    isError: error,
    mutate
  };
}

export function useProduct(slug: string, config?: SWRConfiguration) {
  const url = slug ? `${API_BASE_URL}/products/${slug}/` : null;
  const { data, error, isLoading, mutate } = useSWR(url, swrFetcher, {
    revalidateOnFocus: false,
    ...config
  });

  return {
    product: data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useBrands(featured?: boolean, config?: SWRConfiguration) {
  const url = `${API_BASE_URL}/brands/${featured ? '?featured=true' : ''}`;
  const { data, error, isLoading, mutate } = useSWR(url, swrFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
    ...config
  });

  return {
    brands: data || [],
    isLoading,
    isError: error,
    mutate
  };
}

export function useBrand(slug: string, config?: SWRConfiguration) {
  const url = slug ? `${API_BASE_URL}/brands/${slug}/` : null;
  const { data, error, isLoading, mutate } = useSWR(url, swrFetcher, {
    revalidateOnFocus: false,
    ...config
  });

  return {
    brand: data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useSlides(config?: SWRConfiguration) {
    return useSWR(`${API_BASE_URL}/home/slides/`, () => fetchSlides(), {
        revalidateOnFocus: false,
        ...config
    });
}

export function useProfile(config?: SWRConfiguration) {
    return useSWR(`${API_BASE_URL}/auth/user/`, () => fetchProfile(), {
        revalidateOnFocus: false,
        ...config
    });
}

export function useFeaturedBrands(config?: SWRConfiguration) {
    return useSWR(`${API_BASE_URL}/brands/?featured=true`, () => fetchFeaturedBrands(), {
        revalidateOnFocus: false,
        ...config
    });
}

export function useFeaturedProducts(config?: SWRConfiguration) {
    return useSWR(`${API_BASE_URL}/products/?featured=true`, () => fetchFeaturedProducts(), {
        revalidateOnFocus: false,
        ...config
    });
}

export function useFeaturedExhibition(config?: SWRConfiguration) {
    return useSWR(`${API_BASE_URL}/exhibitions/?featured=true`, () => fetchFeaturedExhibition(), {
        revalidateOnFocus: false,
        ...config
    });
}

export function useFeaturedMagazine(config?: SWRConfiguration) {
    return useSWR(`${API_BASE_URL}/magazines/?featured=true`, () => fetchFeaturedMagazine(), {
        revalidateOnFocus: false,
        ...config
    });
}

export function useFitFrames(config?: SWRConfiguration) {
    return useSWR(`${API_BASE_URL}/fitframes/`, () => safeFetch(`${API_BASE_URL}/fitframes/`), {
        revalidateOnFocus: false,
        ...config
    });
}

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
