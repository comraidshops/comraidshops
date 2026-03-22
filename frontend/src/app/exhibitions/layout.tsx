import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Current Exhibitions | ComraidShops Virtual Gallery',
  description: 'Experience fashion as art. Our digital exhibitions showcase the narrative and craftsmanship behind the world\'s most innovative independent brands.',
  openGraph: {
    title: 'Exhibitions | ComraidShops Virtual Gallery',
    description: 'The intersection of fashion, art, and digital narrative.',
  },
};

export default function ExhibitionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
