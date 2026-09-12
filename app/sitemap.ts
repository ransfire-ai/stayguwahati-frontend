import type { MetadataRoute } from 'next';

const SITE_URL = 'https://stayguwahati.in';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  'https://stayguwahati-backend.onrender.com'
).replace(/\/$/, '');

type Homestay = {
  _id?: string;
  id?: string;
  title?: string;
  status?: string;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse =
  | Homestay[]
  | {
      data?: Homestay[];
      homestays?: Homestay[];
      properties?: Homestay[];
      results?: Homestay[];
    };

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /*
   * ---------------------------------------------------------
   * STATIC PAGES
   * ---------------------------------------------------------
   */

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },

    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },

    {
      url: `${SITE_URL}/refer-a-host`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  /*
   * ---------------------------------------------------------
   * FETCH PROPERTIES FROM BACKEND
   * ---------------------------------------------------------
   */

  let properties: Homestay[] = [];

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/homestays`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Sitemap: backend returned ${response.status}`
      );

      return staticPages;
    }

    const payload: ApiResponse = await response.json();

    /*
     * Support the response formats your API may return:
     *
     * [
     *   {...},
     *   {...}
     * ]
     *
     * or
     *
     * {
     *   data: [...]
     * }
     *
     * or
     *
     * {
     *   homestays: [...]
     * }
     */

    if (Array.isArray(payload)) {
      properties = payload;
    } else if (Array.isArray(payload.data)) {
      properties = payload.data;
    } else if (Array.isArray(payload.homestays)) {
      properties = payload.homestays;
    } else if (Array.isArray(payload.properties)) {
      properties = payload.properties;
    } else if (Array.isArray(payload.results)) {
      properties = payload.results;
    }
  } catch (error) {
    console.error(
      'Sitemap: unable to fetch properties from backend:',
      error
    );

    /*
     * Do not break the entire Next.js build if the backend
     * is temporarily unavailable.
     */
    return staticPages;
  }

  /*
   * ---------------------------------------------------------
   * ONLY INCLUDE ACTIVE / PUBLIC PROPERTIES
   * ---------------------------------------------------------
   *
   * Your Homestay schema uses:
   *
   * status:
   *   pending | approved | rejected
   *
   * and:
   *
   * isAvailable: boolean
   *
   * Therefore Google should only receive approved and
   * available property URLs.
   */

  const activeProperties = properties.filter((property) => {
    const approved =
      String(property.status || '').toLowerCase() === 'approved';

    const available =
      property.isAvailable !== false;

    return approved && available;
  });

  /*
   * ---------------------------------------------------------
   * PROPERTY URLS
   * ---------------------------------------------------------
   */

  const propertyPages: MetadataRoute.Sitemap = activeProperties
    .map((property) => {
      const propertyId = property._id || property.id;

      if (!propertyId) {
        return null;
      }

      const lastModified =
        property.updatedAt ||
        property.createdAt ||
        new Date().toISOString();

      return {
        url: `${SITE_URL}/property/${encodeURIComponent(
          String(propertyId)
        )}`,

        lastModified: new Date(lastModified),

        changeFrequency: 'weekly' as const,

        priority: 0.8,
      };
    })
    .filter(
      (
        item
      ): item is MetadataRoute.Sitemap[number] =>
        item !== null
    );

  /*
   * ---------------------------------------------------------
   * FINAL SITEMAP
   * ---------------------------------------------------------
   */

  return [
    ...staticPages,
    ...propertyPages,
  ];
}