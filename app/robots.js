export default function robots() {
  const baseUrl = 'https://stayguwahati.in';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/private/'], // Protect private or backend routes
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}