import type { Metadata } from 'next';

const SITE_URL = 'https://stayguwahati.in';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stayguwahati-backend.onrender.com').replace(/\/$/, '');

interface Property {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  locality?: string;
  city?: string;
  description?: string;
  images?: string[];
  pricePerNight?: number | string;
  price?: number | string;
  status?: string;
  isActive?: boolean;
  active?: boolean;
  isAvailable?: boolean;
}

function cleanDescription(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 155);
}

async function getProperty(id: string): Promise<Property | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/homestays/${encodeURIComponent(id)}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const result = await response.json();
    return result?.data || result?.property || result || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  const canonical = `${SITE_URL}/properties/${encodeURIComponent(id)}`;

  if (!property) {
    return {
      title: 'Homestay in Guwahati | StayGuwahati',
      description: 'Find local homestays and stays in Guwahati with StayGuwahati.',
      alternates: { canonical },
      robots: { index: false, follow: true },
    };
  }

  const title = property.title || property.name || 'Homestay in Guwahati';
  const location = property.locality || property.city || 'Guwahati';
  const description = cleanDescription(property.description || `${title} in ${location}. Find details, amenities and booking information on StayGuwahati.`);
  const image = property.images?.find(Boolean);
  const imageUrl = image ? (/^https?:\/\//i.test(image) ? image : `${API_BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`) : undefined;

  const inactive = property.isActive === false || property.active === false || property.isAvailable === false || ['pending','rejected','inactive','disabled','deleted','draft'].includes(String(property.status || '').toLowerCase());

  return {
    title: `${title} | StayGuwahati`,
    description,
    alternates: { canonical },
    robots: { index: !inactive, follow: true },
    openGraph: {
      type: 'website',
      url: canonical,
      title: `${title} | StayGuwahati`,
      description,
      siteName: 'StayGuwahati',
      locale: 'en_IN',
      ...(imageUrl ? { images: [{ url: imageUrl, alt: title }] } : {}),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title: `${title} | StayGuwahati`,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
