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

type ApiResponse = {
  properties?: Property[];
  homestays?: Property[];
  data?: Property[] | { properties?: Property[]; homestays?: Property[] };
};

async function getActiveProperties(): Promise<Property[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/homestays`, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.error(
        `Sitemap: backend returned ${response.status} from /api/homestays`
      );
      return [];
    }

    const json: ApiResponse | Property[] = await response.json();

    // Handle APIs that directly return an array
    if (Array.isArray(json)) {
      return json;
    }

    // Handle { properties: [...] }
    if (Array.isArray(json.properties)) {
      return json.properties;
    }

    // Handle { homestays: [...] }
    if (Array.isArray(json.homestays)) {
      return json.homestays;
    }

    // Handle { data: [...] }
    if (Array.isArray(json.data)) {
      return json.data;
    }

    // Handle { data: { properties: [...] } }
    if (json.data && !Array.isArray(json.data)) {
      if (Array.isArray(json.data.properties)) {
        return json.data.properties;
      }

      if (Array.isArray(json.data.homestays)) {
        return json.data.homestays;
      }
    }

    return [];
  } catch (error) {
    console.error("Sitemap: failed to fetch properties", error);
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

function getPropertyUrl(property: Property): string | null {
  /*
   * Prefer the slug when available.
   *
   * Example:
   * /property/orchid-villa
   *
   * Otherwise fall back to:
   * /property/PROPERTY_ID
   */

  if (property.slug) {
    return `${SITE_URL}/property/${encodeURIComponent(property.slug)}`;
  }

  const id = getPropertyId(property);

  if (!id) {
    return null;
  }

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

function isActiveProperty(property: Property): boolean {
  // Explicit inactive values
  if (property.isActive === false) {
    return false;
  }

  if (property.active === false) {
    return false;
  }

  // If your backend uses status, exclude obvious inactive states
  if (property.status) {
    const status = property.status.toLowerCase();

    if (
      status === "inactive" ||
      status === "disabled" ||
      status === "deleted" ||
      status === "draft" ||
      status === "rejected"
    ) {
      return false;
    }
  }

  return true;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getActiveProperties();

  /*
   * Static pages
   */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/refer-a-host`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
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
   * We filter BEFORE mapping so the resulting array can NEVER
   * contain null values.
   */
  const activeProperties = properties.filter(isActiveProperty);

  const propertyPages: MetadataRoute.Sitemap = [];

  for (const property of activeProperties) {
    const url = getPropertyUrl(property);

    // Skip malformed properties without an ID/slug
    if (!url) {
      continue;
    }

    propertyPages.push({
      url,
      lastModified: getLastModified(property),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return [...staticPages, ...propertyPages];
}