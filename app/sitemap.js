export default async function sitemap() {
  const baseUrl = 'https://stayguwahati.in';

  // 1. Fetch dynamic homestays from your Render backend
  let propertyUrls = [];
  try {
    const response = await fetch('https://stayguwahati-backend.onrender.com/api/homestays');
    const result = await response.json();
    const properties = result.data || [];

    propertyUrls = properties.map((property) => ({
      url: `${baseUrl}/property.html?id=${property._id}`,
      lastModified: property.updatedAt ? new Date(property.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error);
  }

  // 2. Define static core pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/support.html`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  return [...staticPages, ...propertyUrls];
}