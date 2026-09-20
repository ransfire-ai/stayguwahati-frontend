import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StayGuwahati Support | Homestays in Guwahati',
  description: 'Get help with bookings, homestays, host verification, payments and other StayGuwahati questions.',
  alternates: { canonical: '/support' },
  openGraph: {
    title: 'StayGuwahati Support | Homestays in Guwahati',
    description: 'Get help with bookings, homestays, host verification, payments and other StayGuwahati questions.',
    url: '/support',
    type: 'website',
    siteName: 'StayGuwahati',
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
