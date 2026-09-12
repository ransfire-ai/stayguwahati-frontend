import type { MetadataRoute } from "next";

const SITE_URL = "https://stayguwahati.in";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://stayguwahati-backend.onrender.com"
).replace(/\/$/, "");

type Property = {
  _id?: string;
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  status?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse =
  | Property[]
  | {
      data?: Property[] | { properties?: Property[]; homestays?: Property[] };
      homestays?: Property[];
      properties?: Property[];
    };

async function getProperties(): Promise<Property[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/homestays`, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.error(
        `Sitemap: backend returned ${response.status}`
      );
      return [];
    }

    const result: ApiResponse = await response.json();

    // API returns an array directly
    if (Array.isArray(result)) {
      return result;
    }

    // { homestays: [...] }
    if (Array.isArray(result.homestays)) {
      return result.homestays;
    }

    // { properties: [...] }
    if (Array.isArray(result.properties)) {
      return result.properties;
    }

    // { data: [...] }
    if (Array.isArray(result.data)) {
      return result.data;
    }

    // { data: { properties: [...] } }
    if (result.data && !Array.isArray(result.data)) {
      if (Array.isArray(result.data.properties)) {
        return result.data.properties;
      }

      if (Array.isArray(result.data.homestays)) {
        return result.data.homestays;
      }
    }

    return [];
  } catch (error) {
    console.error(
      "Sitemap: failed to fetch properties",
      error
    );

    return [];
  }
}

function getPropertyId(property: Property): string | null {
  const id = property._id || property.id;

  if (!id) {
    return null;
  }

  return String(id);
}

function isActiveProperty(property: Property): boolean {
  // Explicitly inactive properties should not be indexed.
  if (property.isActive === false) {
    return false;
  }

  if (property.active === false) {
    return false;
  }

  if (property.isAvailable === false) {
    return false;
  }

  // Exclude properties that are clearly not public.
  if (property.status) {
    const status = property.status.toLowerCase();

    if (
      status === "pending" ||
      status === "rejected" ||
      status === "inactive" ||
      status === "disabled" ||
      status === "deleted" ||
      status === "draft"
    ) {
      return false;
    }
  }

  return true;
}

function getLastModified(property: Property): Date {
  const value =
    property.updatedAt ||
    property.createdAt;

  if (value) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getProperties();

  /*
   * Static pages
   */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${SITE_URL}/refer-a-host`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },

    {
      url: `${SITE_URL}/list-your-stay`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  /*
   * Dynamic property pages
   *
   * IMPORTANT:
   * Your homepage currently uses:
   *
   * /properties/[id]
   *
   * Therefore the sitemap uses the same route.
   */
  const propertyPages: MetadataRoute.Sitemap = [];

  for (const property of properties) {
    if (!isActiveProperty(property)) {
      continue;
    }

    const propertyId = getPropertyId(property);

    if (!propertyId) {
      continue;
    }

    propertyPages.push({
      url: `${SITE_URL}/properties/${encodeURIComponent(
        propertyId
      )}`,
      lastModified: getLastModified(property),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return [
    ...staticPages,
    ...propertyPages,
  ];
}