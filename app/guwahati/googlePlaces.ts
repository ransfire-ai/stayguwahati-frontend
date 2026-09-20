import type { Neighbourhood } from "./data";

export type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  primaryType?: string;
  types?: string[];
};

const BACKEND_URL = (
  process.env.STAYGUWAHATI_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://stayguwahati-backend.onrender.com"
).replace(/\/$/, "");

export async function getNearbyFood(neighbourhood: Neighbourhood): Promise<GooglePlace[]> {
  // The browser/Vercel frontend never talks to Google Places directly.
  // Vercel calls the existing Render backend, and the backend holds the Google key.
  const proxySecret = process.env.STAYGUWAHATI_PLACES_PROXY_SECRET;
  if (!proxySecret) {
    console.error("STAYGUWAHATI_PLACES_PROXY_SECRET is not configured on the frontend.");
    return [];
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/places/nearby-food?slug=${encodeURIComponent(neighbourhood.slug)}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "X-StayGuwahati-Places-Secret": proxySecret,
      },
    });

    if (!response.ok) {
      console.error(`StayGuwahati Places proxy failed for ${neighbourhood.name}: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as { places?: GooglePlace[] };
    return Array.isArray(data.places) ? data.places.slice(0, 10) : [];
  } catch (error) {
    console.error(`StayGuwahati Places proxy error for ${neighbourhood.name}:`, error);
    return [];
  }
}

export function googleMapsSearchUrl(place: GooglePlace) {
  if (place.googleMapsUri) return place.googleMapsUri;
  const query = [place.displayName?.text, place.formattedAddress].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
