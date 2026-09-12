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

  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'StayGuwahati',
    title: 'Homestays in Guwahati | StayGuwahati',
    description:
      'Discover handpicked homestays in Guwahati with trusted local hosts. Explore local neighbourhoods and find a comfortable stay in Guwahati.',
    locale: 'en_IN',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'StayGuwahati - Homestays in Guwahati',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Homestays in Guwahati | StayGuwahati',
    description:
      'Discover handpicked homestays in Guwahati with trusted local hosts.',
    images: ['/og-image.jpg'],
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
      {
        url: '/favicon-32x32.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        url: '/favicon-48x48.png',
        type: 'image/png',
        sizes: '48x48',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
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