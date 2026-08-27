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
    <main className="flex-1 bg-[#f6f4ef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) router.back();
            else router.push('/');
          }}
          className="mb-5 sm:mb-7 inline-flex items-center gap-2 text-sm font-extrabold text-[#0f766e] hover:text-[#064e4a] transition"
        >
          <span className="text-lg">←</span> Back to stays
        </button>

        {/* Homepage-matched property hero */}
        <section className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#103d3a] px-5 py-6 sm:px-8 sm:py-9 lg:px-10 lg:py-11 text-white shadow-[0_18px_50px_rgba(15,61,58,0.16)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,143,132,0.30),transparent_38%),linear-gradient(120deg,#0b302e,#164944)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center rounded-full border border-[#7bd1c6]/40 bg-white/10 px-3 py-1.5 text-[9px] font-black tracking-[0.18em] uppercase text-[#a9ebe2]">
                ✦ VERIFIED LOCAL STAY
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                {property.title}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#d3e8e4] sm:text-base">
                <span className="text-[#ffd24a]">●</span>
                {property.locality || 'Guwahati'}, Assam
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {bedroomCount > 0 && (
                  <span className="rounded-full border border-[#7bd1c6]/35 bg-[#164b47] px-4 py-2.5 text-sm font-extrabold text-white">
                    🛏️ {bedroomCount} {bedroomCount === 1 ? 'bedroom' : 'bedrooms'}
                  </span>
                )}
                {bathroomCount > 0 && (
                  <span className="rounded-full border border-[#7bd1c6]/35 bg-[#164b47] px-4 py-2.5 text-sm font-extrabold text-white">
                    🚿 {bathroomCountLabel} {bathroomCount === 1 ? 'bathroom' : 'bathrooms'}
                  </span>
                )}
                <span className="rounded-full bg-[#ffd24a] px-4 py-2.5 text-sm font-black text-[#123633] shadow-sm">
                  ★ {Number(property.rating || 0).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 lg:justify-end">
              <button
                type="button"
                onClick={handleShareProperty}
                className="rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/20"
              >
                ↗ Share
              </button>
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`rounded-full px-5 py-3 text-sm font-extrabold transition ${
                  isSaved
                    ? 'bg-[#ffd24a] text-[#123633]'
                    : 'bg-white text-[#123633] hover:bg-[#fff8dc]'
                }`}
              >
                {isSaved ? '♥ Saved' : '♡ Save'}
              </button>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="mt-5 sm:mt-7 overflow-hidden rounded-[28px] border border-[#d7e2dd] bg-white p-2.5 sm:p-3 shadow-[0_12px_35px_rgba(18,54,51,0.07)]">
          <div className="grid h-[310px] grid-cols-2 gap-2.5 sm:h-[430px] md:h-[520px] md:grid-cols-4">
            <button
              type="button"
              onClick={() => setSelectedMainImage(property.images[0])}
              className="group relative col-span-2 row-span-2 overflow-hidden rounded-[20px] bg-[#e8eeeb] text-left"
            >
              <img src={selectedMainImage} alt={`${property.title} main view`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedMainImage(img2)}
              className="group relative overflow-hidden rounded-[20px] bg-[#e8eeeb]"
            >
              <img src={img2} alt={`${property.title} view 2`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedMainImage(img3)}
              className="group relative overflow-hidden rounded-[20px] bg-[#e8eeeb]"
            >
              <img src={img3} alt={`${property.title} view 3`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedMainImage(img4)}
              className="group relative overflow-hidden rounded-[20px] bg-[#e8eeeb]"
            >
              <img src={img4} alt={`${property.title} view 4`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
              <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-2 text-xs font-black text-[#123633] shadow">
                🖼 {totalImages} Photos
              </span>
            </button>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-7 grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-5 sm:space-y-6">
            <section className="rounded-[24px] border border-[#d7e2dd] bg-white p-5 sm:p-7 shadow-[0_10px_28px_rgba(18,54,51,0.05)]">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e1f1ed] text-[#0f766e]">ℹ</span>
                <div>
                  <h2 className="text-lg font-black text-[#18302f] sm:text-xl">About this stay</h2>
                  <p className="text-xs text-[#71807b]">A local space, handpicked for your stay</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-[#52635f] sm:text-base">
                {property.description || 'No description provided by host.'}
              </p>
              <div className="mt-6 border-t border-[#e6ece9] pt-5">
                <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#69807a]">Amenities & highlights</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {featuresList.map((feat, idx) => (
                    <span key={idx} className="rounded-full border border-[#b9ddd6] bg-[#f2faf7] px-3 py-2 text-xs font-bold text-[#176b63]">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#d7e2dd] bg-white p-5 sm:p-7 shadow-[0_10px_28px_rgba(18,54,51,0.05)]">
              <h2 className="text-lg font-black text-[#18302f] sm:text-xl">🏡 Property details</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#dce6e2] bg-[#fafcfb] p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#77857f]">Bedrooms</p>
                  <p className="mt-2 text-2xl font-black text-[#173532]">{bedroomCount || '—'}</p>
                </div>
                <div className="rounded-2xl border border-[#dce6e2] bg-[#fafcfb] p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#77857f]">Bathrooms</p>
                  <p className="mt-2 text-2xl font-black text-[#173532]">{bathroomCount > 0 ? bathroomCountLabel : '—'}</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-[#b9ddd6] bg-[#eaf7f3] p-4 sm:col-span-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#34746c]">Stay summary</p>
                  <p className="mt-2 text-sm font-black leading-5 text-[#173532]">
                    {bedroomCount > 0 || bathroomCount > 0 ? `${bedroomCount || 0} bedrooms · ${bathroomCountLabel || 0} bathrooms` : 'Details not provided'}
                  </p>
                </div>
              </div>

              {bathroomTypeItems.length > 0 && (
                <div className="mt-5 border-t border-[#e6ece9] pt-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#69807a]">Bathroom type</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bathroomTypeItems.map((item) => (
                      <span key={item} className="rounded-full border border-[#dce6e2] bg-[#fafcfb] px-3 py-2 text-xs font-bold text-[#43534f]">
                        🚿 {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {property.host && (
              <section className="rounded-[24px] border border-[#d7e2dd] bg-white p-5 sm:p-7 shadow-[0_10px_28px_rgba(18,54,51,0.05)]">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#69807a]">Hosted by</p>
                <div className="mt-4 flex items-center gap-4">
                  <img
                    src={hostAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName)}&background=0d9488&color=fff&size=128`}
                    alt={hostName}
                    className="h-16 w-16 rounded-full border-2 border-[#d5ebe5] object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName || 'Host')}&background=0d9488&color=fff&size=128`;
                    }}
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-[#18302f]">{hostName}</h3>
                    <p className="mt-1 text-xs font-semibold text-[#70807b]">{hostPhone}</p>
                    <p className="mt-2 text-xs font-bold text-[#d09b00]">★ Local StayGuwahati host {hostIsVerified ? '· Verified' : ''}</p>
                  </div>
                </div>
                <Link href={hostProfileHref} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#103d3a] px-4 py-3 text-sm font-black text-white transition hover:bg-[#0a2f2c]">
                  View Host Profile →
                </Link>
              </section>
            )}

            <section className="rounded-[24px] border border-[#d7e2dd] bg-white p-5 sm:p-7 shadow-[0_10px_28px_rgba(18,54,51,0.05)]">
              <h2 className="text-lg font-black text-[#18302f] sm:text-xl">💬 Guest reviews</h2>
              <div className="mt-5">
                {reviewsLoading ? (
                  <p className="text-sm text-[#71807b]">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-[#71807b]">No reviews yet for this property.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="rounded-2xl border border-[#e0e8e5] bg-[#fafcfb] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <strong className="text-sm text-[#18302f]">{rev.guestName || 'Verified Guest'}</strong>
                          <span className="text-xs text-[#73817d]">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent'}</span>
                        </div>
                        <div className="mt-2 text-sm text-[#d09b00]">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</div>
                        <p className="mt-2 text-sm leading-6 text-[#596965]">{rev.comment || 'No comment provided.'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Reservation card */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[26px] border border-[#d7e2dd] bg-white p-5 shadow-[0_16px_40px_rgba(18,54,51,0.10)] sm:p-6">
              <div className="flex items-start justify-between gap-3 border-b border-[#e5ece8] pb-5">
                <div>
                  <p className="text-3xl font-black tracking-tight text-[#18302f]">₹{priceFormatted}</p>
                  <p className="mt-1 text-xs font-semibold text-[#74817d]">per night</p>
                </div>
                <span className="rounded-full border border-[#b9ddd6] bg-[#edf8f5] px-3 py-2 text-xs font-black text-[#176b63]">🛡 Verified stay</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-[#e0e8e5] bg-[#fafcfb] p-4">
                  <div className="flex items-center justify-between gap-3 text-xs font-black">
                    <span className="text-[#5f6f6a]">Cancellation policy</span>
                    <span className="text-[#176b63]">{getCancellationPolicy(property.cancellationPolicy).title}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#74817d]">{getCancellationPolicy(property.cancellationPolicy).short}</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[#e0e8e5] bg-[#fafcfb] p-4 text-xs font-bold text-[#5f6f6a]">
                  <span>Check-in</span><span className="text-[#18302f]">Self check-in</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReserveSpace}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ffd24a] px-4 py-4 text-sm font-black text-[#173532] shadow-[0_10px_24px_rgba(255,210,74,0.25)] transition hover:-translate-y-0.5 hover:bg-[#ffc928]"
              >
                Reserve this stay <span>→</span>
              </button>

              <div className="mt-5 rounded-2xl bg-[#103d3a] p-4 text-white">
                <p className="text-sm font-black">Need help?</p>
                <p className="mt-1 text-xs leading-5 text-[#cfe2de]">Questions about this stay? Our local support team is here to help.</p>
                <a
                  href={SUPPORT_WHATSAPP ? getWhatsAppUrl(SUPPORT_WHATSAPP, `Hi StayGuwahati Support, I need help with ${property.title}.`) : `mailto:${SUPPORT_EMAIL}`}
                  target={SUPPORT_WHATSAPP ? "_blank" : undefined}
                  rel={SUPPORT_WHATSAPP ? "noreferrer" : undefined}
                  className="mt-3 inline-flex rounded-xl bg-white px-4 py-2.5 text-xs font-black text-[#103d3a]"
                >
                  💬 WhatsApp support
                </a>
              </div>
            </div>
          </aside>
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
    <div className="bg-[#f6f4ef] text-[#18302f] font-sans antialiased min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-[#f8f7f2]/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#d7e2dd] shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="h-9 w-9 rounded-full bg-[#0f766e] grid place-items-center text-base shadow-sm">🏠</span>
            <span className="text-lg sm:text-xl font-black text-[#18302f] tracking-tight">
              Stay<span className="text-[#0f766e]">Guwahati</span>
            </span>
          </Link>
          <div className="flex gap-3 sm:gap-6 items-center text-xs sm:text-sm">
            <Link href="/" className="font-bold text-[#18302f] hover:text-[#0f766e] transition">
              Home
            </Link>
            <Link
              href="/map"
              className="bg-[#103d3a] text-white px-4 sm:px-5 py-2.5 rounded-full font-black hover:bg-[#0a2f2c] transition shadow-sm"
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
      <footer className="max-w-7xl w-full mx-auto py-7 px-4 text-center text-xs text-[#82908b] border-t border-[#d7e2dd] shrink-0">
        &copy; 2026 StayGuwahati. All rights reserved.
      </footer>
    </div>
  );
}