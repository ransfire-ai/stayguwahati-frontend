import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'List Your Homestay | StayGuwahati',
  description: 'List your homestay on StayGuwahati and reach guests looking for stays across Guwahati.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ListPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
