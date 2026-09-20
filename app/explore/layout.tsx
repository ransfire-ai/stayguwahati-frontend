import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Homestays in Guwahati | StayGuwahati',
  description: 'Browse homestays and local stays across Guwahati, Assam. Explore properties by neighbourhood, price and amenities.',
  alternates: { canonical: '/explore' },
  openGraph: {
    title: 'Explore Homestays in Guwahati | StayGuwahati',
    description: 'Browse homestays and local stays across Guwahati, Assam. Explore properties by neighbourhood, price and amenities.',
    url: '/explore',
    type: 'website',
    siteName: 'StayGuwahati',
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
