import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | StayGuwahati',
  description: 'Read the StayGuwahati privacy policy and learn how information is handled on the platform.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy | StayGuwahati',
    description: 'Read the StayGuwahati privacy policy and learn how information is handled on the platform.',
    url: '/privacy',
    type: 'website',
    siteName: 'StayGuwahati',
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
