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

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans pb-28 sm:pb-12">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-base font-black text-slate-900 tracking-tight">
              Stay<span className="text-teal-600">Guwahati</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700"
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-700'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {/* Hero Image Block */}
        <div className="relative w-full aspect-[16/9] max-h-[380px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-200 shadow-sm border border-slate-200/80">
          <Image
            src={primaryImage}
            alt={activeHomestay.title}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Left Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {activeHomestay.title}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>
                  Entire villa in{' '}
                  {activeHomestay.locality
                    ? `${activeHomestay.locality}, ${activeHomestay.location}`
                    : activeHomestay.location}
                </span>
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-2 mt-5 py-3.5 bg-slate-50 rounded-xl text-center border border-slate-100">
                <div>
                  <div className="flex items-center justify-center gap-1 font-black text-slate-900 text-sm">
                    <Star className="w-3.5 h-3.5 fill-slate-900" />
                    <span>{activeHomestay.rating}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Ratings</span>
                </div>
                <div className="border-x border-slate-200">
                  <div className="flex items-center justify-center gap-1 font-black text-slate-900 text-sm">
                    <Award className="w-3.5 h-3.5 text-slate-900" />
                    <span>Guest favorite</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Top 5% of homes</span>
                </div>
                <div>
                  <div className="font-black text-slate-900 text-sm">
                    {activeHomestay.bedrooms}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Bedrooms</span>
                </div>
              </div>
            </div>

            {/* Host Section */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-teal-50 shrink-0">
                <img
                  src={
                    avatarError
                      ? fallbackAvatarUrl
                      : getSafeHostAvatar(activeHomestay.hostAvatar, activeHomestay.hostName)
                  }
                  alt={activeHomestay.hostName || 'Host'}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Hosted by {activeHomestay.hostName}
                </h2>
                <p className="text-xs text-slate-500 font-medium">Superhost · Host in Guwahati</p>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">Dedicated workspace</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    A comfortable room equipped with Wi-Fi for remote work.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <Award className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">Self check-in</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Check yourself in using the digital keypad.</p>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <Lock className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Free cancellation before arrival
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Full refund if your travel plans change.
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-2">About this space</h2>
              <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${!showFullDesc && 'line-clamp-3'}`}>
                {activeHomestay.description}
              </p>
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-xs font-bold text-teal-600 underline mt-3 hover:text-teal-700 transition"
              >
                {showFullDesc ? 'Show less' : 'Show more'}
              </button>
            </div>

            {/* Amenities */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Wifi className="w-4 h-4 text-slate-700" />
                  <span>Fast wifi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Tv className="w-4 h-4 text-slate-700" />
                  <span>HDTV with Netflix</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 text-slate-700" />
                  <span>Free parking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Dog className="w-4 h-4 text-slate-700" />
                  <span>Pets allowed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Desktop Card */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    ₹{activeHomestay.pricePerNight}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ night</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                  <Star className="w-3.5 h-3.5 fill-slate-900" />
                  <span>{activeHomestay.rating}</span>
                </div>
              </div>

              {/* Interactive Date & Guest Input Card */}
              <div className="my-4 border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-rose-500 transition">
                <div className="grid grid-cols-2 border-b border-slate-300">
                  <label className="p-2.5 border-r border-slate-300 bg-white cursor-pointer hover:bg-slate-50 block">
                    <span className="block text-[9px] font-black uppercase text-slate-500 tracking-wider">
                      CHECK-IN
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
                      className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
                    />
                  </label>

                  <label className="p-2.5 bg-white cursor-pointer hover:bg-slate-50 block">
                    <span className="block text-[9px] font-black uppercase text-slate-500 tracking-wider">
                      CHECKOUT
                    </span>
                    <input
                      type="date"
                      min={checkIn}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
                    />
                  </label>
                </div>

                <label className="p-2.5 bg-white block cursor-pointer hover:bg-slate-50">
                  <span className="block text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    GUESTS
                  </span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
                  >
                    <option value={1}>1 guest</option>
                    <option value={2}>2 guests</option>
                    <option value={3}>3 guests</option>
                    <option value={4}>4 guests</option>
                    <option value={5}>5+ guests</option>
                  </select>
                </label>
              </div>

              {/* Subtotal Calculation Summary */}
              <div className="space-y-2 my-4 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>
                    ₹{activeHomestay.pricePerNight} × {nights} {nights === 1 ? 'night' : 'nights'}
                  </span>
                  <span className="font-semibold text-slate-900">₹{totalPrice}</span>
                </div>
              </div>

              <Link
                href={`/checkout?id=${activeHomestay._id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-md shadow-rose-600/20 block text-center"
              >
                Reserve Stay
              </Link>

              <p className="text-[11px] text-center text-slate-400 mt-3 font-medium">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Reservation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-4 z-40 shadow-lg">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900">
                ₹{activeHomestay.pricePerNight}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ night</span>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileModalOpen(true)}
              className="text-[11px] text-teal-600 font-bold underline text-left block hover:text-teal-700 transition mt-0.5 cursor-pointer"
            >
              {nights} {nights === 1 ? 'night' : 'nights'} · {guests} {guests === 1 ? 'guest' : 'guests'}
            </button>
          </div>

          <Link
            href={`/checkout?id=${activeHomestay._id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition"
          >
            Reserve
          </Link>
        </div>
      </div>

      {/* Mobile Date & Guest Selection Modal */}
      {isMobileModalOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-0">
          <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Select Dates & Guests</h3>
              <button
                type="button"
                onClick={() => setIsMobileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-300 rounded-xl p-2.5">
                <label className="block text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1">
                  CHECK-IN
                </label>
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
                  className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
                />
              </div>
              <div className="border border-slate-300 rounded-xl p-2.5">
                <label className="block text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1">
                  CHECKOUT
                </label>
                <input
                  type="date"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-2.5">
              <label className="block text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1">
                GUESTS
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
              >
                <option value={1}>1 guest</option>
                <option value={2}>2 guests</option>
                <option value={3}>3 guests</option>
                <option value={4}>4 guests</option>
                <option value={5}>5+ guests</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Total for {nights} {nights === 1 ? 'night' : 'nights'}</span>
              <span className="font-bold text-slate-900 text-sm">₹{totalPrice}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileModalOpen(false)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md cursor-pointer"
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