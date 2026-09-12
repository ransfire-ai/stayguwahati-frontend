import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/profile/',
        '/host-dashboard/',
        '/owner-dashboard/',
        '/signin/',
        '/login/',
        '/register/',
        '/forgot-password/',
        '/reset-password/',
        '/bookings/',
      ],
    },

    sitemap: 'https://stayguwahati.in/sitemap.xml',
  };
}