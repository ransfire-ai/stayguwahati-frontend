import type { MetadataRoute } from "next";

const SITE_URL = "https://stayguwahati.in";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://stayguwahati-backend.onrender.com";

type Property = {
  _id?: string;
  id?: string;
  slug?: string;

  name?: string;
  title?: string;

  updatedAt?: string;
  createdAt?: string;

  isActive?: boolean;
  active?: boolean;
  status?: string;
};

function getPropertyId(property: Property): string | null {
  const id = property._id || property.id;

  if (!id) return null;

  return String(id);
}

function getPropertyUrl(property: Property): string | null {
  // Prefer slug when available because it creates a cleaner SEO URL.
  if (property.slug && property.slug.trim()) {
    return `${SITE_URL}/property/${encodeURIComponent(
      property.slug.trim()
    )}`;
  }

  const id = getPropertyId(property);

  if (!id) return null;

  return `${SITE_URL}/property/${encodeURIComponent(id)}`;
}

function getLastModified(property: Property): Date {
  const dateValue = property.updatedAt || property.createdAt;

  if (dateValue) {
    const date = new Date(dateValue);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
}

async function getActiveProperties(): Promise<Property[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/homestays`, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.error(
        `Sitemap: backend returned ${response.status} for /api/homestays`
      );

      return [];
    }

    const data = await response.json();

    // Support common backend response formats.
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data.homestays)) {
      return data.homestays;
    }

    if (Array.isArray(data.properties)) {
      return data.properties;
    }

    if (Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error("Sitemap: failed to fetch properties", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getActiveProperties();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
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
      priority: 0.6,
    },
  ];

  const propertyPages: MetadataRoute.Sitemap = properties
    // Only include genuinely active properties.
    .filter((property) => {
      if (property.isActive === false) return false;
      if (property.active === false) return false;

      if (
        property.status &&
        ["inactive", "disabled", "deleted", "draft"].includes(
          property.status.toLowerCase()
        )
      ) {
        return false;
      }

      return true;
    })
    .map((property) => {
      const url = getPropertyUrl(property);

      if (!url) {
        return null;
      }

      return {
        url,
        lastModified: getLastModified(property),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    })
    // Remove properties that don't have a usable ID/slug.
    .filter(
      (item): item is MetadataRoute.Sitemap[number] => item !== null
    );

  return [...staticPages, ...propertyPages];
}