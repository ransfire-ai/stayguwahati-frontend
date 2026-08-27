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
  bedrooms?: number | string;
  bathrooms?: {
    privateAttached?: number | string;
    dedicated?: number | string;
    shared?: number | string;
    total?: number | string;
  };
  host?: PropertyHost | string;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict' | string;
  rating?: number;

}

interface Review {
  _id: string;
  guestName?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

const BACKEND_URL = 'https://stayguwahati-backend.onrender.com';

// StayGuwahati support WhatsApp (updated 23 Aug 2026)
const SUPPORT_EMAIL = 'support@stayguwahati.in';
const SUPPORT_WHATSAPP = '8486699452';

const getWhatsAppUrl = (phone: string, message: string) => {
  const digits = phone.replace(/\\D/g, '');
  if (!digits) return '';
  const normalized = digits.startsWith('91') ? digits : `91${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

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
    const mainImage = property.images && property.images.length > 0 ? property.images[0] : '';
    const bookingData = {
      id: property.id || property._id || '',
      title: property.title || '',
      price: property.pricePerNight || property.price || 1500,
      locality: property.locality || 'Guwahati',
      image: mainImage,
    };
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    router.push('/book-stay');
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

  // Bedroom & bathroom summary shown to guests.
  const bedroomCount = Number(property.bedrooms ?? 0);
  const privateAttachedBathrooms = Number(property.bathrooms?.privateAttached ?? 0);
  const dedicatedBathrooms = Number(property.bathrooms?.dedicated ?? 0);
  const sharedBathrooms = Number(property.bathrooms?.shared ?? 0);
  const bathroomTotalFromTypes =
    privateAttachedBathrooms + dedicatedBathrooms + sharedBathrooms;
  const bathroomCount = Number(
    property.bathrooms?.total ?? bathroomTotalFromTypes
  );

  const bathroomCountLabel = Number.isInteger(bathroomCount)
    ? String(bathroomCount)
    : bathroomCount.toFixed(1).replace(/\\.0$/, '');

  const bathroomTypeItems = [
    privateAttachedBathrooms > 0
      ? `${privateAttachedBathrooms} private & attached`
      : null,
    dedicatedBathrooms > 0 ? `${dedicatedBathrooms} dedicated` : null,
    sharedBathrooms > 0 ? `${sharedBathrooms} shared` : null,
  ].filter(Boolean) as string[];

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
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex-1">
      {/* Back button - return to the actual previous page */}
      <div className="w-full mb-6">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.push('/map');
            }
          }}
          className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-2 group transition"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Back
        </button>
      </div>

      {/* Property Title & Top Actions — unique StayGuwahati style */}
      <section className="w-full mb-6 bg-[#07152f] rounded-[26px] px-5 sm:px-8 lg:px-9 py-6 sm:py-8 text-white shadow-[0_16px_40px_rgba(7,21,47,0.12)]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="min-w-0">
            <div className="inline-flex items-center rounded-full border border-[#3bd8ca]/40 bg-[#0b2739] px-3 py-1 text-[9px] font-black tracking-[0.16em] uppercase text-[#55e4d7]">
              VERIFIED LOCAL STAY
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              {property.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 flex items-center gap-2 font-medium">
              <span className="text-[#55e4d7]">📍</span>
              {property.locality || 'Guwahati'}, Assam
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
              {bedroomCount > 0 && (
                <span className="rounded-full bg-white text-[#07152f] border border-white/20 px-3 py-1.5 shadow-sm">
                  🛏️ {bedroomCount} {bedroomCount === 1 ? 'bedroom' : 'bedrooms'}
                </span>
              )}

              {bathroomCount > 0 && (
                <span className="rounded-full bg-white text-[#07152f] border border-white/20 px-3 py-1.5 shadow-sm">
                  🚿 {bathroomCountLabel} {bathroomCount === 1 ? 'bathroom' : 'bathrooms'}
                </span>
              )}

              <span className="rounded-full bg-[#fff4bd] text-[#07152f] px-3 py-1.5 shadow-sm">
                ★ {Number(property.rating || 0).toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShareProperty}
              className="flex items-center gap-2 hover:bg-white/15 transition bg-white/10 text-white px-3.5 py-2.5 rounded-full border border-white/15 text-xs font-black"
            >
              🔗 Share
            </button>

            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`flex items-center gap-2 transition px-3.5 py-2.5 rounded-full border text-xs font-black ${
                isSaved
                  ? 'text-[#07152f] border-[#fff4bd] bg-[#fff4bd]'
                  : 'text-[#07152f] hover:bg-[#e9fbf8] border-white bg-white'
              }`}
            >
              <span>{isSaved ? '♥' : '♡'}</span>
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Image Gallery Grid Container */}
      <div className="w-full mb-6 sm:mb-8 bg-white border border-[#dce9e8] rounded-[26px] p-2 sm:p-3 shadow-[0_10px_30px_rgba(7,21,47,0.05)]">
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
          <div className="bg-white border border-[#dce9e8] rounded-[24px] p-5 sm:p-7 shadow-[0_10px_30px_rgba(7,21,47,0.05)]">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-teal-600">ℹ️</span> About This Space
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {property.description || 'No description provided by host.'}
            </p>

            <div className="border-t border-[#e0eae9] mt-6 pt-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Amenities & Highlights
              </h3>
              <div className="flex flex-wrap gap-2">
                {featuresList.map((feat, idx) => (
                  <span
                    key={idx}
                    className="bg-[#e9fbf8] text-[#007c74] text-xs font-black px-3.5 py-2 rounded-full border border-[#ccefea] flex items-center gap-1.5"
                  >
                    <span>✓</span> {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Property Details / Bedroom & Bathroom Summary */}
          <div className="bg-white border border-[#dce9e8] rounded-[24px] p-5 sm:p-7 shadow-[0_10px_30px_rgba(7,21,47,0.05)]">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-teal-600">🏡</span> Property Details
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#e0eae9] bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Bedrooms
                </div>
                <div className="mt-1 text-base sm:text-lg font-black text-slate-900">
                  {bedroomCount > 0 ? bedroomCount : '—'}
                </div>
              </div>

              <div className="rounded-xl border border-[#e0eae9] bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Bathrooms
                </div>
                <div className="mt-1 text-base sm:text-lg font-black text-slate-900">
                  {bathroomCount > 0 ? bathroomCountLabel : '—'}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#ccefea] bg-[#e9fbf8] p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Guest summary
                </div>
                <div className="mt-1 text-sm sm:text-base font-black text-slate-900">
                  {bedroomCount > 0 || bathroomCount > 0
                    ? `${bedroomCount || 0} bedrooms · ${bathroomCountLabel || 0} bathrooms`
                    : 'Details not provided'}
                </div>
              </div>
            </div>

            {bathroomTypeItems.length > 0 && (
              <div className="mt-5 border-t border-[#e0eae9] pt-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Bathroom types
                </h3>
                <div className="flex flex-wrap gap-2">
                  {bathroomTypeItems.map((item) => (
                    <span
                      key={item}
                      className="bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl border border-slate-200"
                    >
                      🚿 {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Host Profile */}
          {property.host && (
            <div className="bg-white border border-[#dce9e8] rounded-[24px] p-5 sm:p-7 shadow-[0_10px_30px_rgba(7,21,47,0.05)]">
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
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-700 border border-[#ccefea] px-2.5 py-1 text-[10px] font-black">
                    ✓ StayGuwahati Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-teal-50 border border-[#ccefea] shrink-0 flex items-center justify-center relative shadow-sm">
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
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#07152f] hover:bg-[#008f86] text-white font-bold py-3 px-4 text-sm transition shadow-sm"
              >
                View Host Profile
                <span>→</span>
              </Link>
            </div>
          )}

          {/* Dynamic Reviews Section */}
          <div className="bg-white border border-[#dce9e8] rounded-[24px] p-5 sm:p-7 shadow-[0_10px_30px_rgba(7,21,47,0.05)]">
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
                  <div key={rev._id} className="bg-[#f7faf9] p-4 rounded-xl border border-[#e0eae9]">
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
          <div className="bg-white border border-[#dce9e8] rounded-[26px] p-5 sm:p-6 shadow-[0_16px_45px_rgba(7,21,47,0.09)] space-y-5 sm:space-y-6 w-full">
            <div className="flex justify-between items-center border-b border-[#e8efee] pb-4">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹{priceFormatted}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-400 block mt-0.5">
                  / night value
                </span>
              </div>
              <div className="bg-[#e9fbf8] text-[#007c74] font-bold px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs border border-[#ccefea] flex items-center gap-1">
                <span>🛡️</span> Verified Stay
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-[#f5f8f8] border border-[#e0eae9] rounded-2xl p-4">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500">Cancellation Policy</span>
                  <span className="text-teal-700">{getCancellationPolicy(property.cancellationPolicy).title}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {getCancellationPolicy(property.cancellationPolicy).short}
                </p>
              </div>
              <div className="bg-[#f5f8f8] border border-[#e0eae9] rounded-2xl p-4 flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Check-in Status</span>
                <span className="text-slate-800">Self Check-in</span>
              </div>
            </div>

            <button
              onClick={handleReserveSpace}
              className="w-full bg-[#07152f] hover:bg-[#008f86] text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-md flex justify-center items-center gap-2 group text-sm sm:text-base cursor-pointer"
            >
              Proceed to Reservation{' '}
              <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guest Support */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-xl">
            💬
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">Need help?</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Our support team can help with your booking, dates, or property questions.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href={
              SUPPORT_WHATSAPP
                ? getWhatsAppUrl(
                    SUPPORT_WHATSAPP,
                    `Hi StayGuwahati Support, I need help with ${property.title}.`
                  )
                : `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                    `Help with ${property.title}`
                  )}`
            }
            target={SUPPORT_WHATSAPP ? "_blank" : undefined}
            rel={SUPPORT_WHATSAPP ? "noreferrer" : undefined}
            className="rounded-xl bg-teal-600 px-4 py-3 text-center text-sm font-black text-white hover:bg-teal-700 transition"
          >
            💬 WhatsApp Support
          </a>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
              `Support request - ${property.title}`
            )}`}
            className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-black text-slate-700 hover:border-teal-300 hover:text-teal-700 transition"
          >
            🎧 Contact StayGuwahati
          </a>
        </div>
      </section>

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
    <div className="bg-[#f5f8f8] text-[#07152f] font-sans antialiased min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#dce9e8] shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="h-8 w-8 rounded-full bg-[#008f86] grid place-items-center text-base">🏠</span>
            <span className="text-lg sm:text-xl font-black text-[#07152f] tracking-tight">
              Stay<span className="text-teal-600">Guwahati</span>
            </span>
          </Link>
          <div className="flex gap-3 sm:gap-6 items-center text-xs sm:text-sm">
            <Link href="/" className="font-bold text-[#07152f] hover:text-[#008f86] transition">
              Home
            </Link>
            <Link
              href="/map"
              className="bg-[#07152f] text-white px-3 sm:px-4 py-2.5 rounded-full font-black hover:bg-[#008f86] transition shadow-sm"
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
      <footer className="max-w-6xl w-full mx-auto py-6 px-4 text-center text-xs text-gray-400 border-t border-[#dce9e8] mt-8 shrink-0">
        &copy; 2026 StayGuwahati. All rights reserved.
      </footer>
    </div>
  );
}