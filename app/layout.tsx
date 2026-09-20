import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://stayguwahati.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'Homestays in Guwahati | StayGuwahati',
    template: '%s | StayGuwahati',
  },

  description:
    'Discover handpicked homestays in Guwahati with trusted local hosts. Explore stays in Uzan Bazar, Paltan Bazar, Ganeshguri, Dispur, Beltola and other Guwahati neighbourhoods.',

  applicationName: 'StayGuwahati',

  alternates: {
    canonical: SITE_URL,
  },

  keywords: [
    'homestays in Guwahati',
    'Guwahati homestays',
    'best homestays in Guwahati',
    'stays in Guwahati',
    'Guwahati stays',
    'homestay in Uzan Bazar',
    'homestay in Paltan Bazar',
    'homestay in Ganeshguri',
    'homestay in Dispur',
    'homestay in Beltola',
    'homestay near Guwahati railway station',
    'StayGuwahati',
  ],


  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'StayGuwahati',
    title: 'Homestays in Guwahati | StayGuwahati',
    description:
      'Discover handpicked homestays in Guwahati with trusted local hosts. Explore local neighbourhoods and find a comfortable stay in Guwahati.',
    locale: 'en_IN',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Homestays in Guwahati | StayGuwahati',
    description:
      'Discover handpicked homestays in Guwahati with trusted local hosts.',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
    ],
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}