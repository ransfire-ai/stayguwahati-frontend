'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { resolveImageUrl } from '@/lib/utils';
import {
  ChevronLeft,
  Share2,
  Heart,
  Star,
  Award,
  ShieldCheck,
  MapPin,
  Wifi,
  Tv,
  Car,
  Dog,
  Lock,
  Loader2,
  Building2
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stayguwahati-backend.onrender.com';

interface HomestayDetail {
  _id: string;
  title: string;
  locality?: string;
  location?: string;
  pricePerNight: number;
  rating?: number;
  reviewCount?: number;
  bedrooms?: number;
  description?: string;
  images?: string[];
  image?: string;
  hostName?: string;
  hostAvatar?: string;
}

const DEFAULT_HOMESTAY: HomestayDetail = {
  _id: 'default-1',
  title: 'Ankan Villa',
  locality: 'Lachit Nagar, Guwahati',
  location: 'Guwahati, Assam, India',
  pricePerNight: 3800,
  rating: 4.9,
  reviewCount: 28,
  bedrooms: 2,
  description:
    'A luxury escape nestled in serene surroundings, offering modern architectural style with warm interiors. Features large windows with natural sunlight, plush bedding, and an outdoor garden area. Perfect for couples, families, or solo travelers seeking a peaceful stay in Guwahati.',
  images: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000',
  ],
  hostName: 'Moitreyee Devi',
  hostAvatar: '',
};

// Helper function to resolve avatar with dynamic fallback generator
const getSafeHostAvatar = (rawAvatar?: string, hostName?: string) => {
  const clean = (rawAvatar || '').trim();
  if (clean !== '') {
    return resolveImageUrl(clean);
  }
  const formattedName = encodeURIComponent(hostName || 'Host');
  return `https://ui-avatars.com/api/?name=${formattedName}&background=0d9488&color=fff&size=128`;
};

// Helper functions for dynamic dates
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getFutureDateString = (daysToAdd: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

function BookStayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [homestay, setHomestay] = useState<HomestayDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Dynamic booking selection states initialized to today and 2 days later
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || getTodayString());
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || getFutureDateString(2));
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);

  // Calculate night count dynamically
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();

  useEffect(() => {
    async function fetchHomestayData() {
      setLoading(true);
      setAvatarError(false);

      try {
        let endpoint = id
          ? `${BACKEND_URL}/api/homestays/${id}`
          : `${BACKEND_URL}/api/homestays`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData = await response.json();
        let item = rawData.data || rawData.homestay || rawData;

        if (Array.isArray(item)) {
          if (item.length > 0) {
            item = item[0];
          } else {
            throw new Error('No homestays found in API response');
          }
        }

        if (item && (item._id || item.id)) {
          const mapped: HomestayDetail = {
            _id: item._id || item.id || '1',
            title: item.title || item.name || 'Untitled Homestay',
            locality: item.locality || item.city || item.address || '',
            location: item.location || item.state || 'Guwahati, Assam, India',
            pricePerNight: Number(item.pricePerNight || item.price || item.rate || 3800),
            rating: item.rating ? Number(item.rating) : 4.9,
            reviewCount: item.reviewCount || item.reviewsCount || 18,
            bedrooms: item.bedrooms || item.rooms || 2,
            description: item.description || item.about || DEFAULT_HOMESTAY.description,
            images: Array.isArray(item.images) && item.images.length > 0
              ? item.images
              : item.image ? [item.image] : DEFAULT_HOMESTAY.images,
            image: item.image || (Array.isArray(item.images) ? item.images[0] : ''),
            hostName: item.hostName || item.host?.name || DEFAULT_HOMESTAY.hostName,
            hostAvatar:
              item.hostAvatar ||
              item.hostPic ||
              item.profilePic ||
              item.hostPhoto ||
              item.host?.avatar ||
              item.host?.image ||
              item.host?.profilePic ||
              item.host?.hostAvatar ||
              item.host?.picture ||
              '',
          };
          setHomestay(mapped);
        } else {
          setHomestay(DEFAULT_HOMESTAY);
        }
      } catch (err) {
        console.warn('API connection issue or missing ID, loading fallback property:', err);
        setHomestay(DEFAULT_HOMESTAY);
      } finally {
        setLoading(false);
      }
    }

    fetchHomestayData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-3" />
        <p className="text-sm font-medium">Loading property details...</p>
      </div>
    );
  }

  const activeHomestay = homestay || DEFAULT_HOMESTAY;
  const totalPrice = activeHomestay.pricePerNight * nights;

  const rawImg =
    activeHomestay.images && activeHomestay.images.length > 0
      ? activeHomestay.images[0]
      : activeHomestay.image;

  const primaryImage = resolveImageUrl(rawImg || DEFAULT_HOMESTAY.images![0]);
  const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    activeHomestay.hostName || 'Host'
  )}&background=0d9488&color=fff&size=128`;

  const hostAvatar = avatarError
    ? fallbackAvatarUrl
    : getSafeHostAvatar(activeHomestay.hostAvatar, activeHomestay.hostName);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 lg:pb-10">
      {/* Compact header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="text-lg font-black tracking-tight">
              Stay<span className="text-teal-600">Guwahati</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Share property"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={() => setIsLiked(!isLiked)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
            >
              <Heart
                className={`h-4 w-4 ${
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-700'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Property title */}
        <div className="mb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {activeHomestay.title}
              </h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
                <span>
                  {activeHomestay.locality
                    ? `${activeHomestay.locality}, ${activeHomestay.location}`
                    : activeHomestay.location}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
                <Star className="h-4 w-4 fill-current" />
                {activeHomestay.rating}
              </span>
              <span className="text-slate-500">
                {activeHomestay.reviewCount || 0} reviews
              </span>
            </div>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-200 shadow-sm ring-1 ring-slate-200 sm:rounded-3xl">
          <div className="relative h-[260px] sm:h-[360px] lg:h-[410px]">
            <Image
              src={primaryImage}
              alt={activeHomestay.title}
              fill
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 92vw, 1200px"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>

        {/* Main content + booking card */}
        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          <section className="space-y-5">
            {/* Summary */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">
                  {activeHomestay.bedrooms} bedrooms
                </span>
                <span className="text-slate-300">•</span>
                <span>Entire place</span>
                <span className="text-slate-300">•</span>
                <span>Guwahati, Assam</span>
              </div>

              <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50">
                <div className="px-2 py-3 text-center">
                  <div className="flex items-center justify-center gap-1 font-bold text-slate-900">
                    <Star className="h-4 w-4 fill-current" />
                    {activeHomestay.rating}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">Rating</p>
                </div>
                <div className="px-2 py-3 text-center">
                  <div className="font-bold text-slate-900">
                    {activeHomestay.reviewCount || 0}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">Reviews</p>
                </div>
                <div className="px-2 py-3 text-center">
                  <div className="font-bold text-slate-900">
                    {activeHomestay.bedrooms}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">Bedrooms</p>
                </div>
              </div>
            </div>

            {/* Host */}
            <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-teal-50 ring-2 ring-white shadow-sm">
                <img
                  src={hostAvatar}
                  alt={activeHomestay.hostName || 'Host'}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Hosted by
                </p>
                <h2 className="mt-0.5 truncate text-base font-bold text-slate-950">
                  {activeHomestay.hostName}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Verified host · Guwahati
                </p>
              </div>
              <ShieldCheck className="ml-auto h-5 w-5 shrink-0 text-teal-600" />
            </div>

            {/* Highlights */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
              <h2 className="text-lg font-bold text-slate-950">Why you'll love this stay</h2>
              <div className="mt-5 space-y-5">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
                  <div>
                    <h3 className="text-sm font-semibold">Comfortable workspace</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      A comfortable space with Wi-Fi for work and relaxing.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
                  <div>
                    <h3 className="text-sm font-semibold">Easy self check-in</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Simple arrival arrangements for a smooth stay.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
                  <div>
                    <h3 className="text-sm font-semibold">Flexible cancellation</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Check the booking terms before confirming your reservation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
              <h2 className="text-lg font-bold text-slate-950">About this space</h2>
              <p
                className={`mt-3 text-sm leading-7 text-slate-600 ${
                  !showFullDesc ? 'line-clamp-4' : ''
                }`}
              >
                {activeHomestay.description}
              </p>
              <button
                type="button"
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="mt-3 text-sm font-bold text-teal-700 underline underline-offset-2"
              >
                {showFullDesc ? 'Show less' : 'Show more'}
              </button>
            </div>

            {/* Amenities */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
              <h2 className="text-lg font-bold text-slate-950">What this place offers</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  [Wifi, 'Fast Wi-Fi'],
                  [Tv, 'HDTV with Netflix'],
                  [Car, 'Free parking'],
                  [Dog, 'Pets allowed'],
                ].map(([Icon, label]) => (
                  <div
                    key={label as string}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    <Icon className="h-5 w-5 text-teal-600" />
                    <span>{label as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Desktop booking card */}
          <aside className="hidden lg:block lg:sticky lg:top-24">
            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
              <div className="flex items-end justify-between border-b border-slate-100 pb-5">
                <div>
                  <span className="text-2xl font-black text-slate-950">
                    ₹{activeHomestay.pricePerNight.toLocaleString('en-IN')}
                  </span>
                  <span className="ml-1 text-sm text-slate-500">/ night</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Star className="h-4 w-4 fill-current" />
                  {activeHomestay.rating}
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-slate-300">
                <div className="grid grid-cols-2">
                  <label className="block border-r border-b border-slate-300 p-3">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Check-in
                    </span>
                    <input
                      type="date"
                      min={getTodayString()}
                      value={checkIn}
                      onChange={(e) => {
                        const newCheckIn = e.target.value;
                        setCheckIn(newCheckIn);
                        if (newCheckIn >= checkOut) {
                          const nextDay = new Date(newCheckIn);
                          nextDay.setDate(nextDay.getDate() + 1);
                          setCheckOut(nextDay.toISOString().split('T')[0]);
                        }
                      }}
                      className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"
                    />
                  </label>

                  <label className="block border-b border-slate-300 p-3">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Checkout
                    </span>
                    <input
                      type="date"
                      min={checkIn}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"
                    />
                  </label>
                </div>

                <label className="block p-3">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Guests
                  </span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"
                  >
                    <option value={1}>1 guest</option>
                    <option value={2}>2 guests</option>
                    <option value={3}>3 guests</option>
                    <option value={4}>4 guests</option>
                    <option value={5}>5+ guests</option>
                  </select>
                </label>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>
                    ₹{activeHomestay.pricePerNight.toLocaleString('en-IN')} × {nights}{' '}
                    {nights === 1 ? 'night' : 'nights'}
                  </span>
                  <span className="font-semibold text-slate-900">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 font-bold text-slate-950">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                href={`/checkout?id=${activeHomestay._id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                className="mt-5 block w-full rounded-xl bg-teal-600 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-teal-600/20 transition hover:bg-teal-700"
              >
                Reserve Stay
              </Link>

              <p className="mt-3 text-center text-xs text-slate-400">
                You won't be charged yet
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile reservation bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-950">
                ₹{activeHomestay.pricePerNight.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500">/ night</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileModalOpen(true)}
              className="mt-0.5 block text-left text-xs font-semibold text-teal-700"
            >
              {nights} {nights === 1 ? 'night' : 'nights'} · {guests}{' '}
              {guests === 1 ? 'guest' : 'guests'}
            </button>
          </div>

          <Link
            href={`/checkout?id=${activeHomestay._id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
            className="shrink-0 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-teal-600/20 transition hover:bg-teal-700"
          >
            Reserve
          </Link>
        </div>
      </div>

      {/* Mobile booking modal */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end bg-slate-950/50 lg:hidden">
          <div className="w-full rounded-t-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-950">Select dates & guests</h3>
              <button
                type="button"
                onClick={() => setIsMobileModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-xl border border-slate-300 p-3">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Check-in
                </span>
                <input
                  type="date"
                  min={getTodayString()}
                  value={checkIn}
                  onChange={(e) => {
                    const newCheckIn = e.target.value;
                    setCheckIn(newCheckIn);
                    if (newCheckIn >= checkOut) {
                      const nextDay = new Date(newCheckIn);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setCheckOut(nextDay.toISOString().split('T')[0]);
                    }
                  }}
                  className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"
                />
              </label>

              <label className="rounded-xl border border-slate-300 p-3">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Checkout
                </span>
                <input
                  type="date"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"
                />
              </label>
            </div>

            <label className="mt-3 block rounded-xl border border-slate-300 p-3">
              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                Guests
              </span>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"
              >
                <option value={1}>1 guest</option>
                <option value={2}>2 guests</option>
                <option value={3}>3 guests</option>
                <option value={4}>4 guests</option>
                <option value={5}>5+ guests</option>
              </select>
            </label>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
              <span className="text-slate-600">Total for {nights} {nights === 1 ? 'night' : 'nights'}</span>
              <span className="text-lg font-black text-slate-950">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileModalOpen(false)}
              className="mt-5 w-full rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );

}

export default function BookStayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-3" />
        </div>
      }
    >
      <BookStayContent />
    </Suspense>
  );
}