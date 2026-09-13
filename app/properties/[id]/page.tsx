'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Heart,
  ImageIcon,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Share2,
  Star,
  UserRound,
  Users,
  Wifi,
  X,
} from 'lucide-react';

type ImageValue = string | { url?: string; secure_url?: string; path?: string };

type Host = {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  photo?: string;
  image?: string;
  profileImage?: string;
  profilePicture?: string;
  isVerified?: boolean;
};

type Property = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  pricePerNight?: number | string;
  price?: number | string;
  locality?: string;
  city?: string;
  address?: string;
  description?: string;
  images?: ImageValue[];
  photos?: ImageValue[];
  features?: string[];
  amenities?: string[];
  bedrooms?: number | string;
  guests?: number | string;
  maxGuests?: number | string;
  bathrooms?: unknown;
  bathroomCount?: number | string;
  bathroomsCount?: number | string;
  numberOfBathrooms?: number | string;
  rating?: number;
  reviewsCount?: number;
  host?: Host | string;
  cancellationPolicy?: string;
  mapUrl?: string;
  googleMapsLink?: string;
  status?: string;
};

type Review = {
  _id?: string;
  guestName?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  'https://stayguwahati-backend.onrender.com'
).replace(/\/$/, '');

function resolveImage(value: ImageValue | unknown): string {
  if (typeof value === 'object' && value !== null) {
    const objectValue = value as {
      url?: string;
      secure_url?: string;
      path?: string;
    };
    return resolveImage(
      objectValue.url || objectValue.secure_url || objectValue.path || ''
    );
  }

  if (typeof value !== 'string') return '';

  const src = value.trim();
  if (!src) return '';

  if (
    /^https?:\/\//i.test(src) ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src;
  }

  return `${API_BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}

function numberValue(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getBathroomCount(property: Property) {
  const value = property.bathrooms;

  if (typeof value === 'number' || typeof value === 'string') {
    return numberValue(value);
  }

  if (value && typeof value === 'object') {
    const b = value as Record<string, unknown>;

    const explicit = numberValue(
      b.total ??
        b.count ??
        property.bathroomCount ??
        property.bathroomsCount ??
        property.numberOfBathrooms,
      0
    );

    if (explicit > 0) return explicit;

    return (
      numberValue(b.privateAttached) +
      numberValue(b.attached) +
      numberValue(b.dedicated) +
      numberValue(b.shared)
    );
  }

  return numberValue(
    property.bathroomCount ??
      property.bathroomsCount ??
      property.numberOfBathrooms,
    0
  );
}

function cancellationPolicy(policy?: string) {
  const value = String(policy || 'flexible').toLowerCase();

  if (value === 'strict') {
    return {
      name: 'Strict',
      text: 'Cancellation is limited. Contact support for help with changes.',
    };
  }

  if (value === 'moderate') {
    return {
      name: 'Moderate',
      text: 'Free cancellation may be available up to 5 days before check-in.',
    };
  }

  return {
    name: 'Flexible',
    text: 'Free cancellation may be available up to 24 hours before check-in.',
  };
}

function extractProperty(payload: any): Property | null {
  const candidates = [
    payload?.data?.property,
    payload?.data?.homestay,
    payload?.property,
    payload?.homestay,
    payload?.data,
    payload,
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === 'object' &&
      !Array.isArray(candidate) &&
      (candidate._id || candidate.id || candidate.title || candidate.name)
    ) {
      return candidate as Property;
    }
  }

  return null;
}

function normalizeProperty(property: Property): Property {
  const sourceImages = [
    ...(Array.isArray(property.images) ? property.images : []),
    ...(Array.isArray(property.photos) ? property.photos : []),
  ];

  const images = Array.from(
    new Set(sourceImages.map(resolveImage).filter(Boolean))
  );

  return {
    ...property,
    images,
    title: property.title || property.name || 'StayGuwahati stay',
    locality: property.locality || property.city || 'Guwahati',
    pricePerNight: numberValue(
      property.pricePerNight ?? property.price,
      0
    ),
  };
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  let payload: any = null;

  try {
    payload = await response.json();
  } catch {
    // Keep the original status for a useful error message.
  }

  return { response, payload };
}

function PropertyDetailsContent() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();

  const propertyId =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : '';

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadProperty() {
      if (!propertyId) {
        setLoadError('Property ID is missing from the URL.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError('');

      let loaded: Property | null = null;
      const errors: string[] = [];

      // 1. Fetch the exact MongoDB property by the URL ID.
      const exactEndpoints = [
        `${API_BASE_URL}/api/homestays/${encodeURIComponent(propertyId)}`,
        `${API_BASE_URL}/api/properties/${encodeURIComponent(propertyId)}`,
      ];

      for (const endpoint of exactEndpoints) {
        if (loaded) break;

        try {
          const { response, payload } = await fetchJson(endpoint);

          if (!response.ok) {
            errors.push(`${response.status} from ${endpoint}`);
            continue;
          }

          loaded = extractProperty(payload);
        } catch (error) {
          errors.push(`Network error from ${endpoint}`);
        }
      }

      // 2. If the single-property endpoint is unavailable, use the approved
      // listings endpoint and locate the same MongoDB _id.
      if (!loaded) {
        try {
          const { response, payload } = await fetchJson(
            `${API_BASE_URL}/api/homestays`
          );

          if (response.ok) {
            const list = Array.isArray(payload)
              ? payload
              : Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.homestays)
                  ? payload.homestays
                  : Array.isArray(payload?.properties)
                    ? payload.properties
                    : [];

            const match = list.find(
              (item: Property) =>
                String(item?._id || item?.id || '') === String(propertyId)
            );

            if (match) loaded = match;
          } else {
            errors.push(`${response.status} from /api/homestays`);
          }
        } catch {
          errors.push('Network error from /api/homestays');
        }
      }

      // 3. Browser cache is only a final fallback. It must never replace
      // live backend data when the backend successfully returned the property.
      if (!loaded && typeof window !== 'undefined') {
        try {
          const cached = sessionStorage.getItem('selectedProperty');

          if (cached) {
            const parsed = JSON.parse(cached);
            if (
              String(parsed?._id || parsed?.id || '') ===
              String(propertyId)
            ) {
              loaded = parsed;
            }
          }

          if (!loaded) {
            const rawList = localStorage.getItem('userProperties');
            const list = rawList ? JSON.parse(rawList) : [];

            if (Array.isArray(list)) {
              loaded =
                list.find(
                  (item: Property) =>
                    String(item?._id || item?.id || '') ===
                    String(propertyId)
                ) || null;
            }
          }
        } catch {
          // Ignore invalid browser cache.
        }
      }

      if (!loaded) {
        if (alive) {
          setProperty(null);
          setLoadError(
            `Unable to load property ${propertyId}. ` +
              (errors.length
                ? 'Please verify that the backend deployment is serving this property ID.'
                : 'The property was not returned by the backend.')
          );
          setLoading(false);
        }
        return;
      }

      const normalized = normalizeProperty(loaded);

      if (alive) {
        setProperty(normalized);
        setSelected(0);
        setLoading(false);
      }
    }

    loadProperty();

    return () => {
      alive = false;
    };
  }, [propertyId]);

  useEffect(() => {
    let alive = true;

    async function loadReviews() {
      if (!propertyId) {
        setReviewsLoading(false);
        return;
      }

      try {
        const { response, payload } = await fetchJson(
          `${API_BASE_URL}/api/reviews?propertyId=${encodeURIComponent(
            propertyId
          )}`
        );

        if (!response.ok) {
          if (alive) setReviews([]);
          return;
        }

        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        if (alive) setReviews(list);
      } catch {
        if (alive) setReviews([]);
      } finally {
        if (alive) setReviewsLoading(false);
      }
    }

    loadReviews();

    return () => {
      alive = false;
    };
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;

    try {
      const list = JSON.parse(
        localStorage.getItem('stayguwahati_wishlist') || '[]'
      );
      setSaved(Array.isArray(list) && list.includes(propertyId));
    } catch {
      setSaved(false);
    }
  }, [propertyId]);

  const derived = useMemo(() => {
    if (!property) return null;

    const bedrooms = numberValue(property.bedrooms);
    const bathrooms = getBathroomCount(property);
    const guests =
      numberValue(property.maxGuests ?? property.guests, 0) || 2;
    const price =
      numberValue(property.pricePerNight ?? property.price, 0);

    const amenitiesSource =
      Array.isArray(property.features) && property.features.length
        ? property.features
        : Array.isArray(property.amenities) && property.amenities.length
          ? property.amenities
          : ['Local host', 'Comfortable stay'];

    const amenities = Array.from(
      new Set(amenitiesSource.filter(Boolean))
    );

    const host =
      typeof property.host === 'string'
        ? { name: property.host }
        : property.host || {};

    const hostName = host.name || 'StayGuwahati Host';

    const avatar = resolveImage(
      host.avatar ||
        host.photo ||
        host.image ||
        host.profileImage ||
        host.profilePicture ||
        ''
    );

    return {
      bedrooms,
      bathrooms,
      guests,
      price,
      amenities,
      host,
      hostName,
      avatar,
      policy: cancellationPolicy(property.cancellationPolicy),
    };
  }, [property]);

  function toggleSave() {
    if (!propertyId) return;

    try {
      const old = JSON.parse(
        localStorage.getItem('stayguwahati_wishlist') || '[]'
      );
      const list = Array.isArray(old) ? old : [];

      const next = list.includes(propertyId)
        ? list.filter((x: string) => x !== propertyId)
        : [...list, propertyId];

      localStorage.setItem(
        'stayguwahati_wishlist',
        JSON.stringify(next)
      );
      setSaved(next.includes(propertyId));
    } catch {
      setSaved((value) => !value);
    }
  }

  async function share() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: property?.title || 'StayGuwahati',
          text: 'Check out this stay on StayGuwahati',
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // User cancelled native share.
    }
  }

  function book() {
    if (!property || !derived) return;

    const id = String(property._id || property.id || propertyId || '');

    if (!id) {
      alert('This property is missing its booking ID.');
      return;
    }

    sessionStorage.setItem(
      'pendingBooking',
      JSON.stringify({
        id,
        title: property.title || property.name || 'Stay',
        price: derived.price,
        locality:
          property.locality || property.city || 'Guwahati',
        image: property.images?.[0] || '',
      })
    );

    router.push(`/book-stay?id=${encodeURIComponent(id)}`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f1e9] grid place-items-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#d6e0da] border-t-[#28655c]" />
          <p className="mt-4 text-sm font-semibold text-[#62736e]">
            Loading your stay…
          </p>
        </div>
      </main>
    );
  }

  if (!property || !derived) {
    return (
      <main className="min-h-screen bg-[#f5f1e9] grid place-items-center px-5">
        <div className="max-w-md rounded-3xl border border-[#d7ded8] bg-white p-8 text-center shadow-sm">
          <MapPin className="mx-auto h-10 w-10 text-[#28655c]" />
          <h1 className="mt-4 text-2xl font-black">
            Stay could not be loaded
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#71827d]">
            {loadError || 'This property is currently unavailable.'}
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex rounded-xl bg-[#173f3a] px-5 py-3 text-sm font-bold text-white"
          >
            Explore stays
          </Link>
        </div>
      </main>
    );
  }

  // IMPORTANT:
  // Never use unrelated stock/fallback photos here. If MongoDB has no images,
  // show a clean placeholder instead of making it look like the property has
  // photos that were not actually stored for it.
  const images = property.images || [];

  const rating = Number(
    property.rating ||
      (reviews.length
        ? reviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0
          ) / reviews.length
        : 0)
  );

  const mapQuery = encodeURIComponent(
    `${property.title || property.name || 'Homestay'} ${
      property.address ||
      property.locality ||
      property.city ||
      'Guwahati'
    }, Assam`
  );

  const mapHref =
    property.mapUrl ||
    property.googleMapsLink ||
    `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const heroImage = images[0] || '';

  return (
    <main className="min-h-screen bg-[#f5f1e9] text-[#173f3a]">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              if (
                typeof window !== 'undefined' &&
                window.history.length > 1
              ) {
                router.back();
              } else {
                router.push('/explore');
              }
            }}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#46625c]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to explore</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={share}
              className="rounded-full border border-[#d5ddd8] bg-white p-2.5"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button
              onClick={toggleSave}
              className={`rounded-full border p-2.5 ${
                saved
                  ? 'border-[#cba848] bg-[#fff4c7] text-[#8a6510]'
                  : 'border-[#d5ddd8] bg-white'
              }`}
              aria-label="Save"
            >
              <Heart
                className={`h-4 w-4 ${
                  saved ? 'fill-current' : ''
                }`}
              />
            </button>
          </div>
        </div>

        <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#e4efe9] px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-[#28655c]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Local stay · Guwahati
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              {property.title || property.name || 'StayGuwahati Home'}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#637670]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#28655c]" />
                {property.locality || property.city || 'Guwahati'}, Assam
              </span>

              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-[#e0ad36] text-[#e0ad36]" />
                {rating > 0 ? rating.toFixed(1) : 'New'}
                {reviews.length ? ` · ${reviews.length} reviews` : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full border border-[#d6ded9] bg-white px-3 py-2">
              <BedDouble className="mr-1 inline h-3.5 w-3.5" />
              {derived.bedrooms || '—'} bedrooms
            </span>

            <span className="rounded-full border border-[#d6ded9] bg-white px-3 py-2">
              <Bath className="mr-1 inline h-3.5 w-3.5" />
              {derived.bathrooms || '—'} bathrooms
            </span>

            <span className="rounded-full border border-[#d6ded9] bg-white px-3 py-2">
              <Users className="mr-1 inline h-3.5 w-3.5" />
              Up to {derived.guests} guests
            </span>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[30px] bg-[#e5e9e6] p-2 shadow-sm">
          <div className="hidden h-[520px] gap-2 md:grid md:grid-cols-[1.18fr_0.82fr]">
            <button
              onClick={() => {
                if (images.length) {
                  setSelected(0);
                  setGalleryOpen(true);
                }
              }}
              className="group relative min-h-0 overflow-hidden rounded-[24px]"
            >
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={property.title || 'Property'}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-[#dfe8e2] text-[#28655c]">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12" />
                    <p className="mt-3 font-bold">Photos coming soon</p>
                  </div>
                </div>
              )}

              {heroImage && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent px-5 pb-5 pt-16 text-left">
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black text-[#173f3a] shadow-sm">
                    Featured view
                  </span>
                </span>
              )}
            </button>

            <div className="grid min-h-0 grid-cols-2 grid-rows-2 gap-2">
              {images.slice(1, 5).map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  onClick={() => {
                    setSelected(index + 1);
                    setGalleryOpen(true);
                  }}
                  className="group relative min-h-0 overflow-hidden rounded-[20px]"
                >
                  <img
                    src={img}
                    alt={`Property view ${index + 2}`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => {
                if (images.length) {
                  setSelected(0);
                  setGalleryOpen(true);
                }
              }}
              className="relative h-[330px] w-full overflow-hidden rounded-[24px]"
            >
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={property.title || 'Property'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-[#dfe8e2] text-[#28655c]">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12" />
                    <p className="mt-3 font-bold">Photos coming soon</p>
                  </div>
                </div>
              )}
            </button>

            {images.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {images.slice(1).map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    onClick={() => {
                      setSelected(index + 1);
                      setGalleryOpen(true);
                    }}
                    className="h-24 w-32 shrink-0 overflow-hidden rounded-2xl"
                  >
                    <img
                      src={img}
                      alt={`Property view ${index + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {images.length > 0 && (
            <button
              onClick={() => setGalleryOpen(true)}
              className="absolute bottom-5 right-5 z-10 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black text-[#173f3a] shadow-lg"
            >
              <ImageIcon className="h-4 w-4" />
              View all {images.length} photos
            </button>
          )}
        </section>

        <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_410px]">
          <div className="space-y-8">
            <section className="rounded-[28px] border border-[#d9e0db] bg-white p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">
                About this stay
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                {property.title || 'A comfortable base for your Guwahati visit'}
              </h2>

              <p className="mt-5 max-w-3xl text-[15px] leading-8 text-[#60716c]">
                {property.description ||
                  'Description for this property has not been provided yet.'}
              </p>
            </section>

            <section className="rounded-[28px] border border-[#d9e0db] bg-white p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">
                    What’s included
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    Amenities & highlights
                  </h2>
                </div>
                <Wifi className="hidden h-7 w-7 text-[#28655c] sm:block" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {derived.amenities.map((amenity, index) => (
                  <div
                    key={`${amenity}-${index}`}
                    className="flex items-center gap-3 rounded-2xl bg-[#f4f7f4] p-4 text-sm font-bold"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#dcece4] text-[#28655c]">
                      <Check className="h-4 w-4" />
                    </span>
                    {amenity}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#d9e0db] bg-white p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">
                Hosted locally
              </p>
              <h2 className="mt-2 text-2xl font-black">Meet your host</h2>

              <div className="mt-6 flex flex-col gap-5 rounded-3xl bg-[#f4f7f4] p-5 sm:flex-row sm:items-center">
                {derived.avatar ? (
                  <img
                    src={derived.avatar}
                    alt={derived.hostName}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#dcece4] text-[#28655c]">
                    <UserRound />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black">{derived.hostName}</h3>
                    {derived.host.isVerified && (
                      <span className="rounded-full bg-[#dcece4] px-2.5 py-1 text-[10px] font-black text-[#28655c]">
                        Verified host
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#70817b]">
                    Local host on StayGuwahati
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 text-xs font-bold text-[#28655c]">
                  <UserRound className="h-4 w-4" />
                  Host profile
                </span>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#d9e0db] bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">
                    Guest feedback
                  </p>
                  <h2 className="mt-2 text-2xl font-black">Reviews</h2>
                </div>

                <div className="rounded-2xl bg-[#fff2bd] px-4 py-3 text-sm font-black">
                  <Star className="mr-1 inline h-4 w-4 fill-[#d69f22] text-[#d69f22]" />
                  {rating > 0 ? rating.toFixed(1) : 'New'}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {reviewsLoading ? (
                  <p className="text-sm text-[#71827d]">
                    Loading guest reviews…
                  </p>
                ) : reviews.length ? (
                  reviews.slice(0, 4).map((review, index) => (
                    <article
                      key={review._id || index}
                      className="rounded-2xl border border-[#e1e6e2] p-5"
                    >
                      <div className="flex justify-between gap-3">
                        <strong className="text-sm">
                          {review.guestName || 'Verified guest'}
                        </strong>
                        <span className="text-xs text-[#d69f22]">
                          {'★'.repeat(
                            Math.max(
                              0,
                              Math.min(5, Number(review.rating || 0))
                            )
                          )}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-[#657670]">
                        {review.comment || 'No written comment provided.'}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#f4f7f4] p-5 text-sm text-[#71827d]">
                    No reviews yet. This stay is ready for its first guest
                    feedback.
                  </div>
                )}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-[28px] border border-[#d9e0db] bg-white p-6">
                <p className="text-xs font-black uppercase tracking-[.18em] text-[#28655c]">
                  Location
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Explore the area
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#71827d]">
                  {property.address ||
                    `${property.locality || property.city || 'Guwahati'}, Assam`}
                </p>
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#b9cec4] px-4 py-3 text-sm font-black text-[#28655c]"
                >
                  <MapPin className="h-4 w-4" />
                  Open in Maps
                </a>
              </div>

              <div className="rounded-[28px] bg-[#173f3a] p-6 text-white">
                <p className="text-xs font-black uppercase tracking-[.18em] text-[#b7d4c8]">
                  Stay rules
                </p>
                <h2 className="mt-2 text-2xl font-black">Good to know</h2>

                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#d2e0da]">
                  <li className="flex gap-2">
                    <Check className="mt-1 h-4 w-4 text-[#e9bf52]" />
                    Follow the host’s check-in instructions.
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-1 h-4 w-4 text-[#e9bf52]" />
                    Respect the property and local neighbourhood.
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-1 h-4 w-4 text-[#e9bf52]" />
                    {derived.policy.text}
                  </li>
                </ul>
              </div>
            </section>
          </div>

          <aside className="xl:sticky xl:top-24">
            <div className="overflow-hidden rounded-[32px] border border-[#c9d9d0] bg-white shadow-[0_25px_70px_rgba(23,63,58,.14)]">
              <div className="bg-[#173f3a] p-6 text-white">
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#b7d4c8]">
                  Reserve this stay
                </p>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <span className="text-4xl font-black">
                      ₹{derived.price.toLocaleString('en-IN')}
                    </span>
                    <span className="ml-1 text-sm text-[#b7d4c8]">
                      / night
                    </span>
                  </div>

                  <span className="rounded-full bg-[#e9bf52] px-3 py-1.5 text-[10px] font-black text-[#173f3a]">
                    Verified local stay
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="rounded-2xl bg-[#f4f7f4] p-4">
                  <p className="text-sm font-bold text-[#173f3a]">
                    Ready to reserve?
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#71827d]">
                    Continue to the booking page to provide your stay details
                    and complete your reservation.
                  </p>
                </div>

                <button
                  onClick={book}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e9bf52] px-5 py-4 text-sm font-black text-[#173f3a]"
                >
                  Proceed to reservation
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="mt-3 text-center text-xs text-[#71827d]">
                  You will review your booking details before confirming.
                </p>

                <div className="mt-5 space-y-3 border-t border-[#e1e7e3] pt-5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#71827d]">Cancellation</span>
                    <strong className="text-[#28655c]">
                      {derived.policy.name}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-[#71827d]">Hosted by</span>
                    <strong>{derived.hostName}</strong>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#71827d]">
                    <ShieldCheck className="h-4 w-4 text-[#28655c]" />
                    Booking details are reviewed before confirmation.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-[#d9e0db] bg-white p-5">
              <div className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e4efe9] text-[#28655c]">
                  <MessageCircle className="h-5 w-5" />
                </span>

                <div>
                  <strong className="text-sm">
                    Need help with this stay?
                  </strong>
                  <p className="mt-1 text-xs leading-5 text-[#71827d]">
                    Our support team can help with bookings and property
                    questions.
                  </p>
                  <Link
                    href="/support"
                    className="mt-3 inline-block text-xs font-black text-[#28655c]"
                  >
                    Contact support →
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {galleryOpen && images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-[#071f1c]/95 p-4 text-white">
          <div className="mx-auto flex h-full max-w-7xl flex-col">
            <div className="flex items-center justify-between py-3">
              <strong>
                {property.title || 'Photos'} · {selected + 1} /{' '}
                {images.length}
              </strong>

              <button
                onClick={() => setGalleryOpen(false)}
                className="rounded-full bg-white/10 p-3"
                aria-label="Close gallery"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden">
              <img
                src={images[selected]}
                alt=""
                className="max-h-[78vh] max-w-full rounded-2xl object-contain"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelected(
                        (selected - 1 + images.length) %
                          images.length
                      )
                    }
                    className="absolute left-2 rounded-full bg-white/10 p-3"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft />
                  </button>

                  <button
                    onClick={() =>
                      setSelected(
                        (selected + 1) % images.length
                      )
                    }
                    className="absolute right-2 rounded-full bg-white/10 p-3"
                    aria-label="Next photo"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto py-4">
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  onClick={() => setSelected(index)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                    selected === index
                      ? 'border-[#e9bf52]'
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {copied && (
        <div className="fixed bottom-6 left-1/2 z-[101] -translate-x-1/2 rounded-full bg-[#173f3a] px-4 py-3 text-sm font-bold text-white shadow-xl">
          <Copy className="mr-2 inline h-4 w-4" />
          Link copied
        </div>
      )}
    </main>
  );
}

export default function PropertyDetailsPage() {
  return (
    <div className="min-h-screen bg-[#f5f1e9]">
      <Suspense
        fallback={
          <main className="min-h-screen grid place-items-center bg-[#f5f1e9]">
            Loading stay…
          </main>
        }
      >
        <PropertyDetailsContent />
      </Suspense>
    </div>
  );
}
