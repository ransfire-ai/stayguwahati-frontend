'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface PropertyHost {
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  photo?: string;
  image?: string;
  profileImage?: string;
  profilePicture?: string;
  isVerified?: boolean;
}

interface PropertyData {
  id: string;
  _id?: string;
  title: string;
  pricePerNight?: string | number;
  price?: string | number;
  locality?: string;
  description?: string;
  images: string[];
  features?: string[];
  amenities?: string[];
  host?: PropertyHost | string;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict';
  isVerified?: boolean;
  verified?: boolean;
}

interface Review {
  _id: string;
  guestName?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

const BACKEND_URL = 'https://stayguwahati-backend.onrender.com';

const getHostAvatarUrl = (host?: PropertyHost | string) => {
  if (!host) return null;

  let name = 'Host';
  let rawPath = '';

  if (typeof host === 'string') {
    name = host;
  } else {
    name = host.name || 'Host';
    rawPath = (
      host.avatar ||
      host.photo ||
      host.image ||
      host.profileImage ||
      host.profilePicture ||
      ''
    ).trim();
  }

  // Check localStorage fallback if backend didn't return an avatar path
  if (!rawPath) {
    try {
      const localAvatar = localStorage.getItem('hostAvatar');
      if (localAvatar) return localAvatar;

      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const profileAvatar = userProfile.avatar || userProfile.photo || userProfile.image;
      if (profileAvatar) {
        return profileAvatar.startsWith('http') ? profileAvatar : `${BACKEND_URL}${profileAvatar.startsWith('/') ? '' : '/'}${profileAvatar}`;
      }
    } catch (e) {
      console.warn(e);
    }

    const formattedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${formattedName}&background=0d9488&color=fff&size=128`;
  }

  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath;
  }
  return `${BACKEND_URL}${rawPath.startsWith('/') ? '' : '/'}${rawPath}`;
};

function PropertyDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [selectedMainImage, setSelectedMainImage] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(true);

  useEffect(() => {
    const propertyId = searchParams.get('id');
    const titleParam = searchParams.get('title');

    async function loadProperty() {
      let prop: PropertyData | null = null;

      // 1. Check Session Storage
      const cachedProp = sessionStorage.getItem('selectedProperty');
      if (cachedProp) {
        try {
          const parsed = JSON.parse(cachedProp);
          if (!propertyId || parsed.id === propertyId || parsed._id === propertyId) {
            prop = parsed;
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Fetch from Backend API if not found in session
      if (!prop && propertyId && propertyId !== 'default') {
        try {
          const response = await fetch(`${BACKEND_URL}/api/homestays/${propertyId}`);
          if (response.ok) {
            const json = await response.json();
            prop = json.data || json;
          }
        } catch (err) {
          console.warn('Could not fetch property from API, checking local stores...', err);
        }
      }

      // 3. Fallback to LocalStorage
      if (!prop) {
        const localPropsStr = localStorage.getItem('userProperties');
        if (localPropsStr) {
          const localProps: PropertyData[] = JSON.parse(localPropsStr);
          prop =
            localProps.find(
              (p) => p.id === propertyId || p._id === propertyId || p.title === titleParam
            ) || null;
        }
      }

      // 4. Default Fallback Object
      if (!prop) {
        prop = {
          id: propertyId || 'default',
          title: titleParam || 'Paltan House',
          pricePerNight: searchParams.get('price') || '1500',
          locality: searchParams.get('locality') || 'Paltan Bazar',
          description:
            'Experience premier hospitality in Guwahati. This verified local homestay features handpicked interior accents, responsive management, and comprehensive amenities.',
          images: [],
          features: ['Premium Linens', 'Free Wi-Fi', 'Great Location', 'Air Conditioning'],
        };

        const singleImg = searchParams.get('image');
        if (singleImg && singleImg !== 'null' && singleImg !== '' && singleImg.length < 1000) {
          let cleanImg = decodeURIComponent(singleImg);
          if (cleanImg.startsWith('/uploads')) cleanImg = `${BACKEND_URL}${cleanImg}`;
          prop.images.push(cleanImg);
        }
      }

      // Automatically attach local host avatar if backend host object is missing avatar
      if (prop) {
        if (typeof prop.host === 'string') {
          prop.host = { name: prop.host };
        }
        if (prop.host && typeof prop.host === 'object') {
          if (!prop.host.avatar) {
            const localHostAvatar = localStorage.getItem('hostAvatar') || (() => {
              try {
                const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
                return profile.avatar || profile.photo || profile.image || null;
              } catch {
                return null;
              }
            })();
            if (localHostAvatar) {
              prop.host.avatar = localHostAvatar;
            }
          }
        }
      }

      // Clean image URLs
      if (prop.images && prop.images.length > 0) {
        prop.images = prop.images.map((img) =>
          img.startsWith('/uploads') ? `${BACKEND_URL}${img}` : img
        );
      }

      // Ensure at least fallback images exist
      if (!prop.images || prop.images.length === 0) {
        prop.images = [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600',
        ];
      }

      setProperty(prop);
      setSelectedMainImage(prop.images[0]);
    }

    loadProperty();
  }, [searchParams]);

  // Dynamic reviews fetcher
  useEffect(() => {
    const propertyId = searchParams.get('id');

    if (!propertyId) {
      setReviewsLoading(false);
      return;
    }

    async function fetchReviews() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/reviews?propertyId=${propertyId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setReviews(data.data);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    }

    fetchReviews();
  }, [searchParams]);

  const handleShareProperty = () => {
    const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search.split('&image=')[0]}`;
    const shareData = {
      title: property ? `StayGuwahati | ${property.title}` : 'StayGuwahati Homestay',
      text: 'Check out this amazing local stay on StayGuwahati!',
      url: cleanUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.log('Error sharing:', err));
    } else {
      navigator.clipboard
        .writeText(cleanUrl)
        .then(() => alert('Property link copied to your clipboard!'))
        .catch(() => alert('Could not copy link automatically. Please manually copy the URL.'));
    }
  };

  const handleToggleWishlist = () => {
    setIsSaved(!isSaved);
  };

  const handleReserveSpace = () => {
    if (!property) return;

    if (!checkIn || !checkOut) {
      window.alert('Please select your check-in and check-out dates.');
      return;
    }

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    if (end <= start) {
      window.alert('Check-out must be after check-in.');
      return;
    }

    const propertyId = property.id || property._id || '';

    router.push(
      `/checkout?id=${encodeURIComponent(propertyId)}` +
      `&checkIn=${encodeURIComponent(checkIn)}` +
      `&checkOut=${encodeURIComponent(checkOut)}` +
      `&guests=${encodeURIComponent(String(guests))}`
    );
  };

  if (!property) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500 font-medium animate-pulse">Loading property details...</div>
      </div>
    );
  }

  const featuresList =
    property.features || property.amenities || ['Premium Linens', 'Free Wi-Fi', 'Great Location'];
  const priceFormatted = parseInt(
    String(property.pricePerNight || property.price || 1500)
  ).toLocaleString('en-IN');

  const pricePerNightNumber = Number(
    property.pricePerNight || property.price || 1500
  );

  const selectedNights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.ceil(
            (new Date(`${checkOut}T00:00:00`).getTime() -
              new Date(`${checkIn}T00:00:00`).getTime()) /
              86400000
          )
        )
      : 0;

  const bookingTotal = pricePerNightNumber * selectedNights;

  const today = new Date().toISOString().split('T')[0];

  const totalImages = property.images.length;
  const img2 = property.images[1] || selectedMainImage;
  const img3 = property.images[2] || selectedMainImage;
  const img4 = property.images[3] || selectedMainImage;
  
  const hostAvatarUrl = getHostAvatarUrl(property.host);
  const hostName =
    typeof property.host === 'object' && property.host !== null
      ? property.host.name
      : (typeof property.host === 'string' ? property.host : 'Host');

  const hostPhone =
    typeof property.host === 'object' && property.host !== null
      ? (property.host.phone || 'Verified Host')
      : 'Verified Host';

  const hostEmail =
    typeof property.host === 'object' && property.host !== null
      ? (property.host.email || '')
      : '';

  const hostIsVerified =
    typeof property.host === 'object' &&
    property.host !== null &&
    property.host.isVerified === true;

  const hostProfileHref = `/host-profile?${hostEmail
    ? `email=${encodeURIComponent(hostEmail)}`
    : `name=${encodeURIComponent(hostName || 'Host')}`}`;

  return (
    <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 flex-1">
      {/* Back button link */}
      <div className="w-full mb-6">
        <Link
          href="/map"
          className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-2 group transition"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Exploration Stream
        </Link>
      </div>

      {/* Property Title & Top Actions */}
      <div className="w-full mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            {property.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 flex items-center gap-2 font-medium">
            <span className="text-teal-600 animate-pulse">📍</span> {property.locality || 'Guwahati'}, Guwahati
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-600">
          <button
            onClick={handleShareProperty}
            className="flex items-center gap-2 hover:text-teal-600 transition bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <span>🔗</span> Share
          </button>
          <button
            onClick={handleToggleWishlist}
            className={`flex items-center gap-2 transition px-3 py-2 rounded-xl border shadow-sm ${
              isSaved
                ? 'text-rose-600 border-rose-200 bg-rose-50'
                : 'text-slate-600 hover:text-rose-600 border-slate-200 bg-white'
            }`}
          >
            <span>{isSaved ? '❤️' : '🤍'}</span>
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Image Gallery Grid Container */}
      <div className="w-full mb-8 sm:mb-10">
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 md:grid md:grid-cols-4 md:grid-rows-2 h-[280px] sm:h-[350px] md:h-[450px] pb-2 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {totalImages === 1 && (
            <div className="snap-center shrink-0 w-[90vw] md:w-auto md:col-span-4 md:row-span-2 h-full rounded-2xl overflow-hidden bg-slate-200 shadow-sm relative group">
              <img
                src={selectedMainImage}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                alt="Main Property View"
              />
            </div>
          )}

          {totalImages === 2 && (
            <>
              <div className="snap-center shrink-0 w-[90vw] md:w-auto md:col-span-2 md:row-span-2 h-full rounded-2xl overflow-hidden bg-slate-200 shadow-sm relative group">
                <img
                  src={selectedMainImage}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  alt="Main Property View"
                />
              </div>
              <div
                className="snap-center shrink-0 w-[80vw] md:w-auto md:col-start-3 md:col-span-2 md:row-span-2 h-full rounded-2xl overflow-hidden bg-slate-200 shadow-sm relative group cursor-pointer"
                onClick={() => setSelectedMainImage(img2)}
              >
                <img
                  src={img2}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  alt="Property View 2"
                />
              </div>
            </>
          )}

          {totalImages >= 3 && (
            <>
              <div className="snap-center shrink-0 w-[90vw] md:w-auto md:col-span-2 md:row-span-2 h-full rounded-2xl overflow-hidden bg-slate-200 shadow-sm relative group">
                <img
                  src={selectedMainImage}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  alt="Main Property View"
                />
              </div>

              <div
                className="snap-center shrink-0 w-[80vw] md:w-auto md:col-start-3 md:row-start-1 md:col-span-1 md:row-span-1 h-full rounded-2xl overflow-hidden bg-slate-200 shadow-sm relative group cursor-pointer"
                onClick={() => setSelectedMainImage(img2)}
              >
                <img
                  src={img2}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  alt="Property View 2"
                />
              </div>

              <div
                className="snap-center shrink-0 w-[80vw] md:w-auto md:col-start-3 md:row-start-2 md:col-span-1 md:row-span-1 h-full rounded-2xl overflow-hidden bg-slate-200 shadow-sm relative group cursor-pointer"
                onClick={() => setSelectedMainImage(img3)}
              >
                <img
                  src={img3}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  alt="Property View 3"
                />
              </div>

              <div
                className="snap-center shrink-0 w-[80vw] md:w-auto md:col-start-4 md:row-start-1 md:col-span-1 md:row-span-2 h-full rounded-2xl overflow-hidden bg-slate-200 shadow-sm relative group cursor-pointer"
                onClick={() => setSelectedMainImage(img4)}
              >
                <img
                  src={img4}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  alt="Property View 4"
                />
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur text-slate-900 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold shadow-md border border-slate-200/50 pointer-events-none flex items-center gap-1.5">
                  <span className="text-teal-600">🖼️</span> <span>{totalImages}</span> Photos
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start w-full">
        <div className="lg:col-span-2 space-y-6">
          {/* About Space Box */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-teal-600">ℹ️</span> About This Space
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {property.description || 'No description provided by host.'}
            </p>

            <div className="border-t border-slate-100 mt-6 pt-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Amenities & Highlights
              </h3>
              <div className="flex flex-wrap gap-2">
                {featuresList.map((feat, idx) => (
                  <span
                    key={idx}
                    className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-teal-100/50 flex items-center gap-1.5"
                  >
                    <span>✓</span> {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Host Profile */}
          {property.host && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Hosted by
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Get to know your local StayGuwahati host
                  </p>
                </div>

                {hostIsVerified && (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 text-[10px] font-black">
                    ✓ StayGuwahati Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-teal-50 border border-teal-100 shrink-0 flex items-center justify-center relative shadow-sm">
                  <img
                    src={
                      hostAvatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        hostName
                      )}&background=0d9488&color=fff&size=128`
                    }
                    alt={hostName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        hostName || 'Host'
                      )}&background=0d9488&color=fff&size=128`;
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-slate-900 text-base sm:text-lg truncate">
                    {hostName}
                  </h4>

                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {hostPhone}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-amber-500">
                      ★ Host profile
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • Local host
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={hostProfileHref}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-teal-600 text-white font-bold py-3 px-4 text-sm transition shadow-sm"
              >
                View Host Profile
                <span>→</span>
              </Link>
            </div>
          )}

          {/* Dynamic Reviews Section */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-teal-600">💬</span> Verified Guest Reviews
            </h2>
            {reviewsLoading ? (
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-500 font-medium">No reviews yet for this property.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {rev.guestName || 'Verified Guest'}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                        {rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </span>
                    </div>
                    <div className="text-amber-400 text-xs mb-2">
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {rev.comment || 'No comment provided.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Sidebar Sticky Card */}
        <div className="lg:sticky lg:top-24 z-10 w-full">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-100 space-y-5 sm:space-y-6 w-full">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹{priceFormatted}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-400 block mt-0.5">
                  / night value
                </span>
              </div>
              {(property.isVerified === true || property.verified === true) && (
                <div className="bg-emerald-50 text-emerald-700 font-bold px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs border border-emerald-100 flex items-center gap-1">
                  <span>🛡️</span> Verified Stay
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 rounded-xl border border-slate-200 overflow-hidden">
                <label className="p-3 border-r border-slate-200 bg-white">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Check-in
                  </span>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (checkOut && e.target.value >= checkOut) setCheckOut('');
                    }}
                    className="mt-1 w-full text-sm font-bold text-slate-800 outline-none bg-transparent"
                  />
                </label>

                <label className="p-3 bg-white">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Check-out
                  </span>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="mt-1 w-full text-sm font-bold text-slate-800 outline-none bg-transparent"
                  />
                </label>
              </div>

              <label className="block rounded-xl border border-slate-200 p-3 bg-white">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Guests
                </span>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
                >
                  <option value={1}>1 guest</option>
                  <option value={2}>2 guests</option>
                  <option value={3}>3 guests</option>
                  <option value={4}>4 guests</option>
                  <option value={5}>5 guests</option>
                  <option value={6}>6 guests</option>
                  <option value={7}>7 guests</option>
                  <option value={8}>8 guests</option>
                </select>
              </label>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500">Cancellation Policy</span>
                  <span className="text-teal-700">
                    {getCancellationPolicy(property.cancellationPolicy).title}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {getCancellationPolicy(property.cancellationPolicy).short}
                </p>
              </div>

              {selectedNights > 0 && (
                <div className="rounded-xl border border-slate-100 bg-white p-3 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>₹{pricePerNightNumber.toLocaleString('en-IN')} × {selectedNights} night{selectedNights === 1 ? '' : 's'}</span>
                    <span className="font-bold text-slate-800">
                      ₹{bookingTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 font-black">
                    <span>Total</span>
                    <span>₹{bookingTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleReserveSpace}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-3.5 px-4 rounded-xl transition duration-200 shadow-md flex justify-center items-center gap-2 group text-sm sm:text-base cursor-pointer"
            >
              Request Booking{' '}
              <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
            </button>

            <p className="text-center text-[11px] text-slate-400">
              You’ll enter your guest details on the existing checkout page. No online payment.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function getCancellationPolicy(policy?: string) {
  if (policy === 'moderate') {
    return {
      title: 'Moderate',
      short: 'Free cancellation up to 5 days before check-in.',
      detail: 'Free cancellation is available up to 5 days before check-in.'
    };
  }

  if (policy === 'strict') {
    return {
      title: 'Strict',
      short: 'Limited cancellation.',
      detail: 'Cancellation is limited. After the host confirms your booking, please contact the host or StayGuwahati support for assistance.'
    };
  }

  return {
    title: 'Flexible',
    short: 'Free cancellation up to 24 hours before check-in.',
    detail: 'Free cancellation is available up to 24 hours before check-in.'
  };
}

export default function PropertyPage() {
  return (
    <div className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen flex flex-col justify-between">
      {/* Navigation Bar */}
      <nav className="bg-white/85 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="text-xl sm:text-2xl text-teal-600">🏠</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Stay<span className="text-teal-600">Guwahati</span>
            </span>
          </Link>
          <div className="flex gap-3 sm:gap-6 items-center text-xs sm:text-sm">
            <Link href="/" className="font-medium text-slate-600 hover:text-teal-600 transition">
              Home
            </Link>
            <Link
              href="/map"
              className="bg-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition shadow-sm"
            >
              Explore Map
            </Link>
          </div>
        </div>
      </nav>

      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
        <PropertyDetailsContent />
      </Suspense>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-6 px-4 text-center text-xs text-gray-400 border-t border-gray-100 mt-8 shrink-0">
        &copy; 2026 StayGuwahati. All rights reserved.
      </footer>
    </div>
  );
}