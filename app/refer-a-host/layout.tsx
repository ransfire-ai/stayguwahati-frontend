import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refer a Host in Guwahati | StayGuwahati',
  description: 'Refer a Guwahati host to StayGuwahati and help local accommodation providers reach more guests.',
  alternates: { canonical: '/refer-a-host' },
  openGraph: {
    title: 'Refer a Host in Guwahati | StayGuwahati',
    description: 'Refer a Guwahati host to StayGuwahati and help local accommodation providers reach more guests.',
    url: '/refer-a-host',
    type: 'website',
    siteName: 'StayGuwahati',
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
};

export default function ReferAHostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
