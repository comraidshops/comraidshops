import { MetadataRoute } from 'next';
import { fetchBrands, fetchShopProducts, fetchMagazines } from '@/lib/server-api';
import { Brand, Product, Magazine } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://comraidshops.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Routes
  const staticRoutes = [
    '',
    '/shop',
    '/magazine',
    '/brands',
    '/about',
    '/privacy',
    '/terms',
    '/returns',
    '/shipping',
    '/contact',
    '/faq',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // 2. Fetch Dynamic Data
    const results = await Promise.all([
      fetchBrands(),
      fetchShopProducts(),
      fetchMagazines(),
    ]) as any[];

    const brandsData = results[0];
    const productsData = results[1];
    const magazinesData = results[2];

    const brands = (Array.isArray(brandsData) ? brandsData : (brandsData?.results || [])) as Brand[];
    const products = (Array.isArray(productsData) ? productsData : (productsData?.results || [])) as Product[];
    const magazines = (Array.isArray(magazinesData) ? magazinesData : (magazinesData?.results || [])) as Magazine[];

    // 3. Brand Routes
    const brandRoutes = brands.map((brand) => ({
      url: `${SITE_URL}/brands/${brand.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // 4. Product Routes
    const productRoutes = products.map((product: any) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // 5. Magazine Routes
    const magazineRoutes = magazines.map((magazine: any) => ({
      url: `${SITE_URL}/magazine/${magazine.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    return [...staticRoutes, ...brandRoutes, ...productRoutes, ...magazineRoutes];
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return staticRoutes;
  }
}
