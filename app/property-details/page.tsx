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
    attached?: number | string;
    private?: number | string;
    dedicated?: number | string;
    shared?: number | string;
    total?: number | string;
    count?: number | string;
  };
  bathroomCount?: number | string;
  bathroomsCount?: number | string;
  numberOfBathrooms?: number | string;
  host?: PropertyHost | string;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict' | string;
}

interface Review {
  _id: string;
  guestName?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

const BACKEND_URL = 'https://stayguwahati-backend.onrender.com';

const SUPPORT_EMAIL = 'support@stayguwahati.in';
const SUPPORT_WHATSAPP =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/\\D/g, '') || '';

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

      // 1. ALWAYS fetch the latest property from the backend first.
      // Do not let an older selectedProperty session copy hide newly saved
      // fields such as bathrooms.
      if (propertyId && propertyId !== 'default') {
        try {
          const response = await fetch(
            `${BACKEND_URL}/api/homestays/${encodeURIComponent(propertyId)}`,
            { cache: 'no-store' }
          );

          if (response.ok) {
            const json = await response.json();
            prop = json.data || json;
          } else {
            console.warn(`Property API returned ${response.status}`);
          }
        } catch (err) {
          console.warn('Could not fetch latest property from API, checking local stores...', err);
        }
      }

      // 2. SessionStorage is only a fallback when the API did not return data.
      if (!prop) {
        const cachedProp = sessionStorage.getItem('selectedProperty');
        if (cachedProp) {
          try {
            const parsed = JSON.parse(cachedProp);
            if (!propertyId || parsed.id === propertyId || parsed._id === propertyId) {
              prop = parsed;
            }
          } catch (e) {
            console.error('Invalid cached property:', e);
          }
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

      // Normalize bathroom information from MongoDB and older listing formats.
      // The current List Property form stores:
      // bathrooms: { privateAttached, dedicated, shared, total }
      if (prop) {
        const rawBathrooms: any =
          prop.bathrooms && typeof prop.bathrooms === 'object'
            ? prop.bathrooms
            : {};

        const toCount = (value: unknown): number => {
          const n = Number(value);
          return Number.isFinite(n) && n >= 0 ? n : 0;
        };

        const privateAttached = toCount(
          rawBathrooms.privateAttached ??
          rawBathrooms.attached ??
          rawBathrooms.private ??
          0
        );

        const dedicated = toCount(rawBathrooms.dedicated ?? 0);
        const shared = toCount(rawBathrooms.shared ?? 0);

        const explicitTotal = toCount(
          rawBathrooms.total ??
          rawBathrooms.count ??
          prop.bathroomCount ??
          prop.bathroomsCount ??
          prop.numberOfBathrooms ??
          0
        );

        const calculatedTotal =
          privateAttached + dedicated + shared;

        prop.bathrooms = {
          privateAttached,
          dedicated,
          shared,
          total: explicitTotal > 0 ? explicitTotal : calculatedTotal,
        };
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
    if (!bookingData.id) {
      console.error('Cannot open booking page: property ID is missing.');
      return;
    }

    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));

    // /book-stay loads the property using the `id` query parameter.
    // Keep pendingBooking as well so existing booking data continues to work.
    router.push(`/book-stay?id=${encodeURIComponent(bookingData.id)}`);
  };

  if (!property) {
    return (
    <main className="w-full bg-[#f5f8f8] text-[#07152f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">

        {/* Dynamic breadcrumb / back */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => {
              if (typeof window === 'undefined') return;

              const referrer = document.referrer;

              try {
                if (referrer) {
                  const previousUrl = new URL(referrer);

                  if (
                    previousUrl.origin === window.location.origin &&
                    previousUrl.pathname !== '/property-details'
                  ) {
                    router.push(
                      `${previousUrl.pathname}${previousUrl.search}${previousUrl.hash}`
                    );
                    return;
                  }
                }
              } catch (error) {
                console.warn('Unable to resolve previous page:', error);
              }

              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/map');
              }
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-[#008f86] hover:text-[#006f69] transition group"
          >
            <span className="text-base transition-transform group-hover:-translate-x-1">←</span>
            Back to stays
          </button>
        </div>

        {/* Property identity — same visual language as the unique homepage */}
        <section className="bg-[#07152f] rounded-[26px] sm:rounded-[30px] px-5 sm:px-8 lg:px-10 py-6 sm:py-8 text-white shadow-[0_18px_50px_rgba(7,21,47,0.12)] mb-5 sm:mb-7">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#3bd8ca]/40 bg-[#0b2739] px-3 py-1 text-[9px] sm:text-[10px] font-black tracking-[0.16em] uppercase text-[#55e4d7]">
                VERIFIED LOCAL STAY
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                {property.title}
              </h1>

              <p className="mt-2 text-sm text-slate-300 flex items-center gap-2">
                <span className="text-[#55e4d7]">📍</span>
                {property.locality || 'Guwahati'}, Assam
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="rounded-full bg-[#fff4bd] text-[#07152f] px-3 py-1.5">
                  ★ {Number(property.rating || 0).toFixed(1)}
                </span>
                <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-slate-200">
                  {bedroomCount} {bedroomCount === 1 ? 'bedroom' : 'bedrooms'}
                </span>
                {bathroomCount > 0 && (
                  <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-slate-200">
                    {bathroomCountLabel} {bathroomCount === 1 ? 'bathroom' : 'bathrooms'}
                  </span>
                )}
                <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-slate-200">
                  Local host
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShareProperty}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-black transition"
              >
                🔗 Share
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition ${
                  isSaved
                    ? 'bg-[#fff4bd] text-[#07152f]'
                    : 'bg-white text-[#07152f] hover:bg-[#e8fffb]'
                }`}
              >
                {isSaved ? '♥ Saved' : '♡ Save'}
              </button>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="mb-6 sm:mb-8">
          <div className="rounded-[26px] sm:rounded-[30px] overflow-hidden bg-white border border-[#dce9e8] shadow-[0_12px_35px_rgba(7,21,47,0.07)] p-2 sm:p-3">
            <div className="relative flex overflow-x-auto snap-x snap-mandatory gap-2 sm:gap-3 md:grid md:grid-cols-4 md:grid-rows-2 h-[300px] sm:h-[390px] lg:h-[500px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

              {totalImages === 1 && (
                <div className="snap-center shrink-0 w-full md:col-span-4 md:row-span-2 h-full rounded-[20px] overflow-hidden bg-slate-100 relative">
                  <img
                    src={selectedMainImage}
                    className="w-full h-full object-cover"
                    alt={property.title}
                  />
                </div>
              )}

              {totalImages === 2 && (
                <>
                  <div className="snap-center shrink-0 w-[92vw] md:w-auto md:col-span-2 md:row-span-2 h-full rounded-[20px] overflow-hidden bg-slate-100">
                    <img
                      src={selectedMainImage}
                      className="w-full h-full object-cover"
                      alt={property.title}
                    />
                  </div>
                  <div
                    className="snap-center shrink-0 w-[88vw] md:w-auto md:col-start-3 md:col-span-2 md:row-span-2 h-full rounded-[20px] overflow-hidden bg-slate-100 cursor-pointer"
                    onClick={() => setSelectedMainImage(img2)}
                  >
                    <img src={img2} className="w-full h-full object-cover" alt={`${property.title} view 2`} />
                  </div>
                </>
              )}

              {totalImages >= 3 && (
                <>
                  <div className="snap-center shrink-0 w-[92vw] md:w-auto md:col-span-2 md:row-span-2 h-full rounded-[20px] overflow-hidden bg-slate-100">
                    <img
                      src={selectedMainImage}
                      className="w-full h-full object-cover"
                      alt={property.title}
                    />
                    <div className="absolute left-5 bottom-5 rounded-full bg-[#07152f]/90 text-white px-3 py-1.5 text-[10px] font-black">
                      Featured view
                    </div>
                  </div>

                  <div
                    className="snap-center shrink-0 w-[82vw] md:w-auto md:col-start-3 md:row-start-1 md:col-span-1 md:row-span-1 h-full rounded-[20px] overflow-hidden bg-slate-100 cursor-pointer"
                    onClick={() => setSelectedMainImage(img2)}
                  >
                    <img src={img2} className="w-full h-full object-cover" alt={`${property.title} view 2`} />
                  </div>

                  <div
                    className="snap-center shrink-0 w-[82vw] md:w-auto md:col-start-3 md:row-start-2 md:col-span-1 md:row-span-1 h-full rounded-[20px] overflow-hidden bg-slate-100 cursor-pointer"
                    onClick={() => setSelectedMainImage(img3)}
                  >
                    <img src={img3} className="w-full h-full object-cover" alt={`${property.title} view 3`} />
                  </div>

                  <div
                    className="snap-center shrink-0 w-[82vw] md:w-auto md:col-start-4 md:row-start-1 md:col-span-1 md:row-span-2 h-full rounded-[20px] overflow-hidden bg-slate-100 cursor-pointer relative"
                    onClick={() => setSelectedMainImage(img4)}
                  >
                    <img src={img4} className="w-full h-full object-cover" alt={`${property.title} view 4`} />
                    <div className="absolute bottom-4 right-4 bg-white/95 text-[#07152f] px-3 py-2 rounded-full text-[10px] font-black shadow-md">
                      🖼 {totalImages} Photos
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-7 items-start">

          <div className="lg:col-span-2 space-y-5">

            {/* About */}
            <section className="bg-white border border-[#dce9e8] rounded-[24px] p-5 sm:p-7 shadow-[0_8px_25px_rgba(7,21,47,0.045)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-2xl bg-[#e9fbf8] grid place-items-center text-lg">ℹ️</div>
                <div>
                  <p className="text-[9px] font-black tracking-[0.15em] text-[#008f86] uppercase">The stay</p>
                  <h2 className="text-xl sm:text-2xl font-black text-[#07152f]">About this space</h2>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-7">
                {property.description || 'No description provided by host.'}
              </p>

              <div className="mt-7 pt-6 border-t border-[#e8efee]">
                <p className="text-[10px] font-black tracking-[0.14em] text-[#7b8b98] uppercase mb-3">
                  Amenities & highlights
                </p>
                <div className="flex flex-wrap gap-2">
                  {featuresList.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#e9fbf8] border border-[#ccefea] text-[#007c74] px-3.5 py-2 text-xs font-black"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Property details */}
            <section className="bg-white border border-[#dce9e8] rounded-[24px] p-5 sm:p-7 shadow-[0_8px_25px_rgba(7,21,47,0.045)]">
              <div className="mb-5">
                <p className="text-[9px] font-black tracking-[0.15em] text-[#008f86] uppercase">Good to know</p>
                <h2 className="text-xl sm:text-2xl font-black text-[#07152f] mt-1">Property details</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="rounded-2xl bg-[#f5f8f8] border border-[#e0eae9] p-4">
                  <div className="text-lg mb-1">🛏️</div>
                  <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Bedrooms</div>
                  <div className="font-black text-[#07152f] mt-1">{bedroomCount || '—'}</div>
                </div>
                <div className="rounded-2xl bg-[#f5f8f8] border border-[#e0eae9] p-4">
                  <div className="text-lg mb-1">🚿</div>
                  <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Bathrooms</div>
                  <div className="font-black text-[#07152f] mt-1">{bathroomCount || '—'}</div>
                </div>
                <div className="rounded-2xl bg-[#f5f8f8] border border-[#e0eae9] p-4 col-span-2 sm:col-span-1">
                  <div className="text-lg mb-1">⭐</div>
                  <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Guest rating</div>
                  <div className="font-black text-[#07152f] mt-1">{Number(property.rating || 0).toFixed(1)}</div>
                </div>
              </div>

              {bathroomCount > 0 && (
                <div>
                  <p className="text-[10px] font-black tracking-[0.14em] text-[#7b8b98] uppercase mb-3">
                    Bathroom details
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {privateAttachedBathrooms > 0 && (
                      <span className="rounded-full bg-[#e9fbf8] border border-[#ccefea] text-[#007c74] px-3.5 py-2 text-xs font-black">
                        🚿 {privateAttachedBathrooms} Private & attached
                      </span>
                    )}
                    {dedicatedBathrooms > 0 && (
                      <span className="rounded-full bg-[#e9fbf8] border border-[#ccefea] text-[#007c74] px-3.5 py-2 text-xs font-black">
                        🚿 {dedicatedBathrooms} Dedicated
                      </span>
                    )}
                    {sharedBathrooms > 0 && (
                      <span className="rounded-full bg-[#e9fbf8] border border-[#ccefea] text-[#007c74] px-3.5 py-2 text-xs font-black">
                        🚿 {sharedBathrooms} Shared
                      </span>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Host */}
            {property.host && (
              <section className="bg-white border border-[#dce9e8] rounded-[24px] p-5 sm:p-7 shadow-[0_8px_25px_rgba(7,21,47,0.045)]">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[9px] font-black tracking-[0.15em] text-[#008f86] uppercase">For local guests</p>
                    <h2 className="text-xl sm:text-2xl font-black text-[#07152f] mt-1">Meet your host</h2>
                    <p className="text-xs text-slate-400 mt-1">A local StayGuwahati host</p>
                  </div>
                  {hostIsVerified && (
                    <span className="shrink-0 rounded-full bg-[#fff4bd] text-[#07152f] px-3 py-1.5 text-[10px] font-black">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[#e9fbf8] border-2 border-[#ccefea] shrink-0 flex items-center justify-center shadow-sm">
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
                        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-[#07152f] text-base sm:text-lg truncate">{hostName}</h3>
                    <p className="text-xs text-slate-500 mt-1">{hostPhone}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[11px] font-black text-amber-500">★ Host profile</span>
                      <span className="text-[11px] text-slate-400">• Local host</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={hostProfileHref}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#07152f] hover:bg-[#008f86] text-white font-black py-3.5 px-4 text-sm transition"
                >
                  View Host Profile <span>→</span>
                </Link>
              </section>
            )}

            {/* Reviews */}
            <section className="bg-white border border-[#dce9e8] rounded-[24px] p-5 sm:p-7 shadow-[0_8px_25px_rgba(7,21,47,0.045)]">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-[9px] font-black tracking-[0.15em] text-[#008f86] uppercase">Real guest feedback</p>
                  <h2 className="text-xl sm:text-2xl font-black text-[#07152f] mt-1">Verified reviews</h2>
                </div>
                <span className="rounded-full bg-[#fff4bd] text-[#07152f] px-3 py-1.5 text-xs font-black">
                  ★ {Number(property.rating || 0).toFixed(1)}
                </span>
              </div>

              {reviewsLoading ? (
                <p className="text-sm text-slate-500">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl bg-[#f5f8f8] border border-[#e0eae9] p-5 text-sm text-slate-500">
                  No reviews yet for this property.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="bg-[#f7faf9] p-4 rounded-2xl border border-[#e0eae9]">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="font-black text-[#07152f] text-xs sm:text-sm">
                          {rev.guestName || 'Verified Guest'}
                        </span>
                        <span className="text-[10px] text-slate-400">
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
            </section>
          </div>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-24 z-10">
            <div className="bg-white border border-[#dce9e8] rounded-[26px] p-5 sm:p-6 shadow-[0_16px_45px_rgba(7,21,47,0.09)]">
              <div className="flex items-start justify-between gap-3 pb-5 border-b border-[#e8efee]">
                <div>
                  <p className="text-[9px] font-black tracking-[0.14em] text-[#008f86] uppercase">Stay price</p>
                  <div className="mt-1">
                    <span className="text-3xl font-black text-[#07152f]">₹{priceFormatted}</span>
                    <span className="text-xs font-bold text-slate-400 ml-1">/ night</span>
                  </div>
                </div>
                <span className="rounded-full bg-[#e9fbf8] border border-[#ccefea] text-[#007c74] px-3 py-1.5 text-[10px] font-black">
                  ✓ Verified Stay
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="bg-[#f5f8f8] border border-[#e0eae9] rounded-2xl p-4">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-slate-500">Cancellation</span>
                    <span className="text-[#008f86]">{getCancellationPolicy(property.cancellationPolicy).title}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {getCancellationPolicy(property.cancellationPolicy).short}
                  </p>
                </div>

                <div className="bg-[#f5f8f8] border border-[#e0eae9] rounded-2xl p-4 flex justify-between items-center text-xs font-black">
                  <span className="text-slate-500">Check-in</span>
                  <span className="text-[#07152f]">Self Check-in</span>
                </div>
              </div>

              <button
                onClick={handleReserveSpace}
                className="mt-5 w-full bg-[#008f86] hover:bg-[#00766f] text-white font-black py-4 px-4 rounded-full transition shadow-[0_8px_20px_rgba(0,143,134,0.2)] flex justify-center items-center gap-2 text-sm sm:text-base"
              >
                Proceed to Reservation
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>

              <p className="text-center text-[10px] text-slate-400 mt-3">
                You will review your booking details before confirming.
              </p>
            </div>
          </aside>
        </div>

        {/* Support */}
        <section className="mt-5 sm:mt-7 rounded-[24px] border border-[#dce9e8] bg-[#e9f7f5] p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 shrink-0 rounded-2xl bg-white grid place-items-center text-xl shadow-sm">💬</div>
              <div>
                <p className="text-[9px] font-black tracking-[0.15em] text-[#008f86] uppercase">StayGuwahati support</p>
                <h2 className="text-lg sm:text-xl font-black text-[#07152f] mt-1">Need help with this stay?</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Our support team can help with booking, dates, or property questions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto sm:min-w-[360px]">
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
                className="rounded-full bg-[#008f86] px-4 py-3 text-center text-xs font-black text-white hover:bg-[#00766f] transition"
              >
                💬 WhatsApp Support
              </a>

              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                  `Support request - ${property.title}`
                )}`}
                className="rounded-full border border-[#bcded9] bg-white px-4 py-3 text-center text-xs font-black text-[#07152f] hover:border-[#008f86] transition"
              >
                🎧 Contact Support
              </a>
            </div>
          </div>

          {!SUPPORT_WHATSAPP && (
            <p className="mt-3 text-[10px] text-slate-400">
              Configure NEXT_PUBLIC_SUPPORT_WHATSAPP to enable the direct WhatsApp button.
            </p>
          )}
        </section>
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
    <div className="min-h-screen bg-[#f5f8f8] text-[#07152f] font-sans antialiased flex flex-col">
      {/* StayGuwahati unique homepage-style navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-[#dce9e8] sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="h-8 w-8 rounded-full bg-[#008f86] grid place-items-center text-base">🏠</span>
            <span className="text-base sm:text-lg font-black tracking-tight text-[#07152f]">
              Stay<span className="text-[#008f86]">Guwahati</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-[#07152f]">
            <Link href="/" className="hover:text-[#008f86] transition">Home</Link>
            <Link href="/list-property" className="hover:text-[#008f86] transition">List Property</Link>
            <Link href="/refer-host" className="hover:text-[#008f86] transition">Refer a Host</Link>
            <Link
              href="/map"
              className="rounded-full bg-[#07152f] text-white px-4 py-2.5 hover:bg-[#008f86] transition"
            >
              Explore Map 🗺️
            </Link>
            <Link href="/support" className="hover:text-[#008f86] transition">Support</Link>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Language"
              className="hidden sm:block bg-white border border-[#d7e4e3] rounded-full px-3 py-1.5 text-[10px] font-bold text-[#07152f] outline-none"
              defaultValue="English"
            >
              <option>English</option>
            </select>
            <Link
              href="/login"
              className="rounded-full border border-[#d7e4e3] bg-white px-3.5 py-2 text-[10px] sm:text-xs font-black text-[#07152f] shadow-sm hover:border-[#008f86] transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <Suspense fallback={<div className="flex-1 p-10 text-center text-slate-500">Loading stay...</div>}>
        <PropertyDetailsContent />
      </Suspense>

      <footer className="border-t border-[#dce9e8] bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-[10px] sm:text-xs text-[#7a8b9b]">
          © 2026 StayGuwahati · Local stays, trusted hosts.
        </div>
      </footer>
    </div>
  );
}