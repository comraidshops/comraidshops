import dynamic from 'next/dynamic';

const HeroStatement = dynamic(() => import('@/components/home/HeroStatement'));
const EditorialEntry = dynamic(() => import('@/components/home/EditorialEntry'));
const CurrentExhibition = dynamic(() => import('@/components/home/CurrentExhibition'));
const FitsAndFrames = dynamic(() => import('@/components/home/FitsAndFrames'));
const CurrentRotation = dynamic(() => import('@/components/home/CurrentRotation'));
const FeaturedLabels = dynamic(() => import('@/components/home/FeaturedLabels'));
const ManifestoFragment = dynamic(() => import('@/components/home/ManifestoFragment'));

export const metadata = {
    title: 'ComraidShops | A Brand-First Editorial Ecosystem',
    description: 'Discover the intersection of culture and commerce. ComraidShops curates the world\'s most compelling independent labels through an editorial lens.',
};

import { getInitialData, API_BASE_URL } from '@/lib/api';

export default async function HomePage() {
  // Parallel fetching for performance
  const [slides, user, featuredArticle, featuredBrands, rotationProducts, exhibition, fitsData] = await Promise.all([
    /* eslint-disable @typescript-eslint/no-explicit-any */
    getInitialData<any>(`${API_BASE_URL}/home/slides/`),
    getInitialData<any>(`${API_BASE_URL}/user/profile/`),
    getInitialData<any>(`${API_BASE_URL}/magazine/featured/`),
    getInitialData<any>(`${API_BASE_URL}/brands/?featured=true`),
    getInitialData<any>(`${API_BASE_URL}/products/?featured=true`),
    getInitialData<any>(`${API_BASE_URL}/exhibitions/featured/`),
    getInitialData<any>(`${API_BASE_URL}/fitframes/`),
    /* eslint-enable @typescript-eslint/no-explicit-any */
  ]);

  return (
    <div className="flex flex-col">
      <HeroStatement initialSlides={slides?.results || slides} initialUser={user} />
      <EditorialEntry initialArticle={featuredArticle} />
      <CurrentExhibition initialExhibition={exhibition} />
      <FitsAndFrames initialFits={fitsData?.results || fitsData} />
      <CurrentRotation initialProducts={rotationProducts?.results || rotationProducts} />
      <FeaturedLabels initialBrands={featuredBrands?.results || featuredBrands} />
      <ManifestoFragment />
    </div>
  );
}
