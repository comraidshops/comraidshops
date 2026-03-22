import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Archive | ComraidShops Editorial',
  description: 'In-depth stories, brand-first deep dives, and cultural commentary. The Archive is the editorial soul of ComraidShops.',
  openGraph: {
    title: 'The Archive | ComraidShops Editorial',
    description: 'The editorial soul of ComraidShops, documenting the next era of fashion culture.',
    type: 'article',
  },
};

export default function MagazineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
