'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Property {
  _id?: string;
  id?: string;
  title: string;
  locality: string;
  description?: string;
  features?: string[];
  pricePerNight: number;
  images?: string[];
  rating?: number;
  reviewsCount?: number;
  tags?: string[];
  status?: 'pending' | 'approved' | 'rejected';
}

const translations = {
  en: {
    page_title: "StayGuwahati | Find Your Perfect Homestay",
    nav_brand: "StayGuwahati",
    nav_home: "Home",
    nav_list_property: "List Property",
    nav_refer_host: "Refer a Host",
    nav_explore_map: "Explore Map View",
    nav_support: "Support",
    nav_sign_in: "Sign In",
    nav_dashboard: "My Dashboard",
    hero_tag: "Premium Local Verifications",
    hero_title: "Find Handpicked Homestays Across Guwahati",
    hero_subtitle: "Skip the clinical hotels. Stay in authentic neighborhoods with trusted local hosts around Uzan Bazar, Paltan Bazar, and beyond.",
    hero_btn: "Search Properties Live",
    sec1_title: "Popular Neighborhoods",
    sec1_subtitle: "Discover strategic locations to stay around the city.",
    loc1_title: "Uzan Bazar",
    loc1_desc: "Historic Riverside charm, culture hubs, and quiet leafy cafes.",
    loc2_title: "Paltan Bazar",
    loc2_desc: "Centrally located near transit links and active marketplaces.",
    loc3_title: "Ganeshguri",
    loc3_desc: "Vibrant commercial hub filled with food courts and boutique shopping.",
    explore_link: "Explore listings →",
    sec2_title: "Verified Local Homestays",
    sec2_subtitle: "Handpicked properties verified for hygiene, security, and warmth.",
    showing_text: "Showing",
    active_options_text: "active property options",
    pipeline_loading: "Connecting to database pipeline...",
    no_properties: "No properties available in this neighborhood",
    no_properties_sub: "Check back later or view our alternative neighborhood choices.",
    show_all: "← Show All Listings",
    privacy: "Privacy Policy",
    reserve_btn: "Reserve Space"
  },
  as: {
    page_title: "StayGuwahati | আপোনাৰ নিখুঁত হোমষ্টে বিচাৰক",
    nav_brand: "StayGuwahati",
    nav_home: "হোম",
    nav_list_property: "সম্পত্তি তালিকাভুক্ত কৰক",
    nav_refer_host: "হোষ্টক ৰিফাৰ কৰক",
    nav_explore_map: "মানচিত্ৰ দৰ্শন কৰক",
    nav_support: "সহায়তা",
    nav_sign_in: "ছাইন ইন কৰক",
    nav_dashboard: "মোৰ ড্যাশবৰ্ড",
    hero_tag: "প্ৰিমিয়াম স্থানীয় প্ৰমাণীকৰণ",
    hero_title: "গুৱাহাটীৰ বাচনি কৰা সুন্দৰ হোমষ্টেসমূহ বিচাৰক",
    hero_subtitle: "গতানুগতিক হোটেল বাদ দিয়ক। উজান বজাৰ, পল্টন বজাৰ আদিৰ দৰে ঠাইত থকা বিশ্বাসী স্থানীয় হোষ্টৰ সৈতে থকাৰ অভিজ্ঞতা লওক।",
    hero_btn: "প্ৰপাৰ্টি সন্ধান কৰক",
    sec1_title: "জনপ্ৰিয় অঞ্চলসমূহ",
    sec1_subtitle: "চহৰখনৰ গুৰুত্বপূৰ্ণ স্থানসমূহ অন্বেষণ কৰক।",
    loc1_title: "উজান বজাৰ",
    loc1_desc: "ঐতিহাসিক নদীৰ পাৰৰ আকৰ্ষণ, সাংস্কৃতিক কেন্দ্ৰ আৰু শান্ত কেফে।",
    loc2_title: "পল্টন বজাৰ",
    loc2_desc: "যাতায়ত ব্যৱস্থা আৰু সক্ৰিয় বজাৰসমূহৰ কেন্দ্ৰবিন্দু।",
    loc3_title: "গণেশগুৰি",
    loc3_desc: "খাদ্য আৰু বজাৰ কৰাৰ বাবে এক সক্ৰিয় ব্যৱসায়িক কেন্দ্ৰ।",
    explore_link: "তালিকা অন্বেষণ কৰক →",
    sec2_title: "প্ৰমাণিত স্থানীয় হোমষ্টেসমূহ",
    sec2_subtitle: "পৰিষ্কাৰ-পৰিচ্ছন্নতা, সুৰক্ষা আৰু আতিথ্যৰ বাবে নিৰ্বাচিত সম্পত্তি।",
    showing_text: "বৰ্তমান",
    active_options_text: "টা সক্ৰিয় সম্পত্তি উপলব্ধ আছে",
    pipeline_loading: "ডাটাবেচ পাইপলাইনৰ সৈতে সংযোগ কৰা হৈছে...",
    no_properties: "এই অঞ্চলত কোনো সম্পত্তি উপলব্ধ নাই",
    no_properties_sub: "পাছত আকৌ চেষ্টা কৰক বা অন্যান্য বিকল্প অঞ্চলসমূহ চাওক।",
    show_all: "← সকলো তালিকা দেখুৱাওক",
    privacy: "গোপনীয়তা নীতি",
    reserve_btn: "স্থান সংৰক্ষণ কৰক"
  },
  hi: {
    page_title: "StayGuwahati | अपना आदर्श होमस्टे खोजें",
    nav_brand: "StayGuwahati",
    nav_home: "होम",
    nav_list_property: "प्रॉपर्टी लिस्ट करें",
    nav_refer_host: "होस्ट को रेफर करें",
    nav_explore_map: "मैप व्यू देखें",
    nav_support: "सहायता",
    nav_sign_in: "साइन इन करें",
    nav_dashboard: "मेरा डैशबोर्ड",
    hero_tag: "प्रीमियम स्थानीय सत्यापन",
    hero_title: "गुवाहाटी भर में चुनिंदा शानदार होमस्टे खोजें",
    hero_subtitle: "अस्पताल जैसे ठंडे होटलों को छोड़ें। उजान बाजार, पलटन बाजार जैसे प्रामाणिक इलाकों में भरोसेमंद स्थानीय मेजबानों के साथ रहें।",
    hero_btn: "लाइव प्रॉपर्टीज खोजें",
    sec1_title: "लोकप्रिय इलाके",
    sec1_subtitle: "शहर के आसपास रहने के लिए रणनीतिक स्थानों की खोज करें।",
    loc1_title: "उजान बाजार",
    loc1_desc: "ऐतिहासिक नदी किनारे का आकर्षण, सांस्कृतिक केंद्र और शांत कैफे।",
    loc2_title: "पलटन बाजार",
    loc2_desc: "पारगमन लिंक और सक्रिय बाजारों के पास केंद्रीय रूप से स्थित।",
    loc3_title: "गणेशगुरी",
    loc3_desc: "फूड कोर्ट और बुटीक शॉपिंग से भरा जीवंत व्यावसायिक केंद्र।",
    explore_link: "प्रविष्टियां देखें →",
    sec2_title: "सत्यापित स्थानीय होमस्टे",
    sec2_subtitle: "स्वच्छता, सुरक्षा और गर्मजोशी के लिए चुने गए सत्यापित होमस्टे।",
    showing_text: "कुल",
    active_options_text: "सक्रिय प्रॉपर्टी विकल्प उपलब्ध हैं",
    pipeline_loading: "डेटाबेस पाइपलाइन से कनेक्ट किया जा रहा है...",
    no_properties: "इस इलाके में कोई संपत्ति उपलब्ध नहीं है",
    no_properties_sub: "बाद में पुन: प्रयास करें या वैकल्पिक पड़ोस विकल्प देखें।",
    show_all: "← सभी लिस्टिंग दिखाएं",
    privacy: "गोपनीयता नीति",
    reserve_btn: "स्थान आरक्षित करें"
  }
};


const FALLBACK_PROPERTY_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#e2e8f0"/>
      <text x="400" y="285" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#64748b">StayGuwahati</text>
      <text x="400" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#94a3b8">No photo available</text>
    </svg>
  `);

function resolvePropertyImage(path: string | undefined, backendUrl: string) {
  if (!path || !path.trim()) return FALLBACK_PROPERTY_IMAGE;

  const value = path.trim();

  // Full URLs and browser-local URLs can be used directly.
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  // Normalize old database values such as "uploads/photo.jpg",
  // "/uploads/photo.jpg", or "api/uploads/photo.jpg".
  let normalized = value.replace(/\\/g, '/');

  if (normalized.startsWith('api/')) {
    normalized = normalized.slice(4);
  }

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  return `${backendUrl.replace(/\/+$/, '')}${normalized}`;
}

export default function HomePage() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState<'en' | 'as' | 'hi'>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string } | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilterLocality, setSelectedFilterLocality] = useState<string | null>(null);
  const [searchLocality, setSearchLocality] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [galleryIndexes, setGalleryIndexes] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stayguwahati-backend.onrender.com';
  const t = translations[currentLang] || translations.en;


  const handleLangChange = (lang: 'en' | 'as' | 'hi') => {
    setCurrentLang(lang);
    localStorage.setItem('preferredLang', lang);
  };

  const requireLoginToList = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!sessionStorage.getItem('token')) {
      event.preventDefault();
      router.push('/login?redirect=/list-property');
    }
  };

  const handleLocalitySelect = (locality: string) => {
    setSelectedFilterLocality(locality);
    setSearchLocality(locality);
  };

  const handleReserveSpace = (stay: Property) => {
    const propertyId = stay._id || stay.id;
    if (!propertyId) return;
    router.push(`/property-details?id=${encodeURIComponent(propertyId)}`);
  };

  const changeGalleryImage = (propertyId: string, length: number, direction: number) => {
    if (length <= 0) return;
    setGalleryIndexes((current) => {
      const index = current[propertyId] || 0;
      return { ...current, [propertyId]: (index + direction + length) % length };
    });
  };

  const fetchHomestays = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${BACKEND_URL}/api/homestays`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      window.clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Property API returned HTTP ${response.status}`);
      }

      const raw = await response.json();

      if (raw?.success === false) {
        throw new Error(raw?.message || 'Property API returned an unsuccessful response');
      }

      // Current backend response: { success: true, count: 2, data: [...] }
      const list = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.homestays)
            ? raw.homestays
            : Array.isArray(raw?.properties)
              ? raw.properties
              : [];

      const normalized = list
        .filter(Boolean)
        .map((item: any) => ({
          ...item,
          _id: item._id || item.id,
          title: item.title || item.name || 'Homestay',
          locality: item.locality || item.city || 'Guwahati',
          description: item.description || '',
          pricePerNight: Number(item.pricePerNight ?? item.price ?? 0),
          images: Array.isArray(item.images) ? item.images : [],
          rating: typeof item.rating === 'number' ? item.rating : undefined,
          reviewsCount: Number(item.reviewsCount || 0),
          status: item.status || 'approved',
        }));

      console.info(`[StayGuwahati] /api/homestays returned ${normalized.length} properties`);
      setProperties(normalized);
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'AbortError'
          ? 'The property server took too long to respond.'
          : error instanceof Error
            ? error.message
            : 'Unable to load properties right now.';

      console.error('[StayGuwahati] Failed to load homestays:', error);
      setApiError(message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    // The backend already returns approved/available properties.
    // Do not hide valid older records when optional fields are absent.
    if (property.status && property.status !== 'approved') return false;

    const locality = (property.locality || '').toLowerCase();
    const title = (property.title || '').toLowerCase();
    const localityFilter = (selectedFilterLocality || searchLocality).trim().toLowerCase();
    const query = searchQuery.trim().toLowerCase();

    return (
      (!localityFilter || locality.includes(localityFilter)) &&
      (!query || title.includes(query) || locality.includes(query))
    );
  });

  useEffect(() => {
    const savedWishlist = localStorage.getItem('stayguwahati_wishlist');
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) setWishlist(parsed);
      } catch { localStorage.removeItem('stayguwahati_wishlist'); }
    }
  }, []);

  useEffect(() => {
    const TOKEN_KEY = 'token';
    const PROFILE_KEY = 'userProfile';
    const ROLE_KEY = 'activeDashboardRole';

    // This marker is deliberately NOT an authentication token.
    // It only tells us that an authenticated browser tab is still alive.
    const HEARTBEAT_KEY = 'stayguwahati_browser_heartbeat';

    // Last real user interaction. Kept in sessionStorage so a refresh does
    // not reset the inactivity clock.
    const LAST_ACTIVITY_KEY = 'stayguwahati_last_activity';

    // Five seconds gives us a much stronger browser-close/reopen check while
    // still allowing normal page loading and tab suspension.
    const STALE_HEARTBEAT_MS = 5000;

    // 30 minutes without real user activity = automatic logout.
    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

    const savedLang =
      (localStorage.getItem('preferredLang') as 'en' | 'as' | 'hi') || 'en';
    setCurrentLang(savedLang);

    // IMPORTANT:
    // Authentication is session-only. Never restore a login from localStorage.
    const token = sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      // Remove authentication left behind by older versions of the app.
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(HEARTBEAT_KEY);
      setUserProfile(null);

      // The homepage itself is public, so do not redirect here.
      fetchHomestays();
      return;
    }

    const now = Date.now();
    const previousHeartbeat = Number(
      localStorage.getItem(HEARTBEAT_KEY) || '0'
    );

    // If the browser/tab was previously authenticated but its heartbeat is
    // already stale, do not silently restore that old session.
    if (
      Number.isFinite(previousHeartbeat) &&
      previousHeartbeat > 0 &&
      now - previousHeartbeat > STALE_HEARTBEAT_MS
    ) {
      sessionStorage.clear();
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(HEARTBEAT_KEY);
      setUserProfile(null);

      fetchHomestays();
      return;
    }

    const savedSessionProfile = sessionStorage.getItem(PROFILE_KEY);

    if (savedSessionProfile) {
      try {
        setUserProfile(JSON.parse(savedSessionProfile));
      } catch (err) {
        console.error('Failed to parse user profile session:', err);
        sessionStorage.removeItem(PROFILE_KEY);
        setUserProfile(null);
      }
    }

    let lastActivity = Number(
      sessionStorage.getItem(LAST_ACTIVITY_KEY) || '0'
    );

    if (!Number.isFinite(lastActivity) || lastActivity <= 0) {
      lastActivity = now;
      sessionStorage.setItem(LAST_ACTIVITY_KEY, String(lastActivity));
    }

    // Refresh the heartbeat frequently while this authenticated tab is alive.
    // This is separate from "activity": a user can be reading a page without
    // moving the mouse, so the browser heartbeat must continue independently.
    localStorage.setItem(HEARTBEAT_KEY, String(now));

    let lastHeartbeatWrite = now;

    const logoutAndRedirect = () => {
      sessionStorage.clear();

      // Remove legacy persistent authentication values as well.
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(HEARTBEAT_KEY);

      setUserProfile(null);
      router.replace('/login');
    };

    const recordActivity = () => {
      if (!sessionStorage.getItem(TOKEN_KEY)) {
        setUserProfile(null);
        return;
      }

      const current = Date.now();
      lastActivity = current;
      sessionStorage.setItem(LAST_ACTIVITY_KEY, String(current));
    };

    const checkSession = () => {
      const currentToken = sessionStorage.getItem(TOKEN_KEY);

      if (!currentToken) {
        setUserProfile(null);
        localStorage.removeItem(HEARTBEAT_KEY);
        return;
      }

      const current = Date.now();

      if (current - lastActivity >= INACTIVITY_TIMEOUT_MS) {
        logoutAndRedirect();
        return;
      }

      // Keep the browser-alive heartbeat independent of user activity.
      // Throttling to once per second is enough for close/reopen detection.
      if (current - lastHeartbeatWrite >= 1000) {
        lastHeartbeatWrite = current;
        localStorage.setItem(HEARTBEAT_KEY, String(current));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };

    const handleFocus = () => {
      checkSession();
    };

    const handlePageShow = () => {
      checkSession();
    };

    const handleStorage = (event: StorageEvent) => {
      // If another tab explicitly logs out, immediately reflect it here.
      if (
        event.key === TOKEN_KEY &&
        event.newValue === null
      ) {
        sessionStorage.clear();
        localStorage.removeItem(HEARTBEAT_KEY);
        setUserProfile(null);
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousedown',
      'mousemove',
      'keydown',
      'touchstart',
      'touchmove',
      'scroll',
      'click',
      'pointerdown',
      'wheel',
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, { passive: true });
    });

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('storage', handleStorage);

    const sessionTimer = window.setInterval(checkSession, 1000);

    // Read URL filters on initial load.
    const urlParams = new URLSearchParams(window.location.search);
    const loc = urlParams.get('location');

    if (loc) {
      setSelectedFilterLocality(loc);
      setSearchLocality(loc);
    }

    fetchHomestays();

    return () => {
      window.clearInterval(sessionTimer);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('storage', handleStorage);
    };
  }, [router]);

  const toggleWishlist = (propertyId: string) => {
    setWishlist((current) => {
      const next = current.includes(propertyId)
        ? current.filter((id) => id !== propertyId)
        : [...current, propertyId];
      localStorage.setItem('stayguwahati_wishlist', JSON.stringify(next));
      return next;
    });
  };

  const openSearch = () => {
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#f5faf8] text-slate-900 font-sans pb-20 lg:pb-0">
      <nav className="sticky top-0 z-50 border-b border-teal-100 bg-[#f5faf8]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button onClick={() => router.push('/')} className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-xl">🏠</span>
            <span className="text-xl font-black">Stay<span className="text-teal-700">Guwahati</span></span>
          </button>
          <div className="hidden items-center gap-2 lg:flex">
            <button onClick={() => router.push('/')} className="rounded-full bg-teal-50 px-4 py-2 text-sm font-bold text-teal-800">{t.nav_home}</button>
            <a href="/list-property" onClick={requireLoginToList} className="rounded-full px-4 py-2 text-sm font-semibold">{t.nav_list_property}</a>
            <button onClick={() => router.push('/refer-a-host')} className="rounded-full px-4 py-2 text-sm font-semibold">{t.nav_refer_host}</button>
            <button onClick={() => router.push('/map')} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">Explore Map</button>
            <button onClick={() => router.push('/support')} className="rounded-full px-4 py-2 text-sm font-semibold">{t.nav_support}</button>
            <select value={currentLang} onChange={(e) => handleLangChange(e.target.value as 'en' | 'as' | 'hi')} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold">
              <option value="en">English</option><option value="as">অসমীয়া</option><option value="hi">हिंदी</option>
            </select>
            <button onClick={() => router.push(userProfile ? '/dashboard' : '/login')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm">
              {userProfile ? `👤 ${userProfile.name || t.nav_dashboard}` : t.nav_sign_in}
            </button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-[#073b39] text-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-teal-200/30 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-teal-100">✦ Made for Guwahati</span>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Stay local.<br /><span className="text-amber-300">Feel Guwahati.</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-teal-50/80 sm:text-lg">Handpicked homestays, warm local hosts and neighbourhoods worth discovering — all in one place.</p>
            <button onClick={openSearch} className="mt-7 rounded-2xl bg-amber-300 px-6 py-3.5 text-sm font-black text-[#173b38]">Discover a stay →</button>
          </div>
          <div className="mt-9 grid max-w-4xl gap-3 rounded-3xl bg-white p-3 text-slate-900 shadow-2xl sm:grid-cols-[1fr_auto]">
            <div className="rounded-2xl bg-[#f2f8f6] px-4 py-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-teal-700">Where</div>
              <input value={searchLocality} onChange={(e) => { setSearchLocality(e.target.value); setSelectedFilterLocality(null); }} placeholder="Search Guwahati neighbourhood" className="mt-1 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400" />
            </div>
            <button onClick={openSearch} className="rounded-2xl bg-teal-700 px-7 py-3 text-sm font-black text-white">Search stays</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-9 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Explore your way</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Guwahati, neighbourhood by neighbourhood</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['🌊', 'Riverside', 'Uzan Bazar'],
            ['🌿', 'Quiet stays', 'Beltola'],
            ['🚆', 'City access', 'Paltan Bazar'],
            ['🍜', 'Food & life', 'Ganeshguri'],
          ].map(([icon, title, locality]) => (
            <button key={locality} onClick={() => { handleLocalitySelect(locality); openSearch(); }} className="rounded-3xl border border-teal-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="text-2xl">{icon}</span>
              <h3 className="mt-4 font-black">{title}</h3>
              <p className="mt-1 text-xs font-medium text-slate-500">{locality}</p>
            </button>
          ))}
        </div>
      </section>

      <main id="listings" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-10 pt-10 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Local stays</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Places worth coming home to</h2>
            <p className="mt-1 text-sm text-slate-500">{filteredProperties.length} {t.active_options_text}</p>
          </div>
          <button onClick={() => { setSelectedFilterLocality(null); setSearchLocality(''); setSearchQuery(''); }} className="hidden rounded-full bg-white px-4 py-2 text-xs font-bold text-teal-700 shadow-sm ring-1 ring-teal-100 sm:block">All stays</button>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {['All', 'Uzan Bazar', 'Paltan Bazar', 'Beltola', 'Ganeshguri', 'Dispur'].map((locality) => (
            <button key={locality} onClick={() => { if (locality === 'All') { setSelectedFilterLocality(null); setSearchLocality(''); } else { handleLocalitySelect(locality); } }} className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600">
              {locality}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-teal-100 bg-white py-24 text-center shadow-sm">
            <div className="text-3xl animate-pulse">🏡</div>
            <p className="mt-3 text-sm font-semibold text-slate-500">Loading live stays...</p>
          </div>
        ) : apiError ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-20 text-center shadow-sm">
            <div className="text-5xl">📡</div>
            <p className="mt-4 text-lg font-black">We could not load the live stays</p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">{apiError}</p>
            <button onClick={fetchHomestays} className="mt-5 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-bold text-white">Retry</button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-3xl border border-teal-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="text-5xl">🌴</div>
            <p className="mt-4 text-lg font-black">
              {properties.length > 0 ? 'No stays match this search' : t.no_properties}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {properties.length > 0 ? 'Try another neighbourhood or clear the search.' : t.no_properties_sub}
            </p>
            <button onClick={() => { setSelectedFilterLocality(null); setSearchLocality(''); setSearchQuery(''); }} className="mt-5 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-bold text-white">Show all stays</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((stay, idx) => {
              const gallery = Array.isArray(stay.images) ? stay.images.filter(Boolean).slice(0, 8) : [];
              const propertyId = stay._id || stay.id || `prop-${idx}`;
              const currentIndex = Math.min(galleryIndexes[propertyId] || 0, Math.max(gallery.length - 1, 0));
              const img = resolvePropertyImage(gallery[currentIndex], BACKEND_URL);
              const rating = typeof stay.rating === 'number' ? stay.rating : null;
              const reviews = stay.reviewsCount || 0;
              const isFavourite = rating !== null && rating >= 4.8 && reviews >= 10;
              const isSaved = wishlist.includes(propertyId);
              return (
                <article key={propertyId} className="group overflow-hidden rounded-[30px] border border-teal-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <button type="button" onClick={() => handleReserveSpace(stay)} className="absolute inset-0 z-0 h-full w-full">
                      <img src={img} alt={stay.title} loading={idx < 3 ? 'eager' : 'lazy'} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" onError={(e) => { if (e.currentTarget.src !== FALLBACK_PROPERTY_IMAGE) e.currentTarget.src = FALLBACK_PROPERTY_IMAGE; }} />
                    </button>
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                      <span className="rounded-full bg-amber-300 px-3 py-1.5 text-[11px] font-black text-[#173b38]">{isFavourite ? 'LOCAL FAVOURITE' : 'STAYGUWAHATI'}</span>
                      <button type="button" onClick={() => toggleWishlist(propertyId)} aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl shadow-md">{isSaved ? '♥' : '♡'}</button>
                    </div>
                    {gallery.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                        {gallery.slice(0, 6).map((_, photoIndex) => (
                          <button key={photoIndex} type="button" aria-label={`Show photo ${photoIndex + 1}`} onClick={(e) => { e.stopPropagation(); setGalleryIndexes((current) => ({ ...current, [propertyId]: photoIndex })); }} className={`h-1.5 rounded-full ${photoIndex === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/70'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => handleReserveSpace(stay)} className="block w-full p-5 text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-black">{stay.title || 'Guwahati homestay'}</h3>
                        <p className="mt-1 text-sm font-semibold text-teal-700">{stay.locality || 'Guwahati'}, Assam</p>
                      </div>
                      {rating !== null && <div className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">★ {rating.toFixed(1)}</div>}
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-500">{stay.description || 'A comfortable local stay with a warm Guwahati welcome.'}</p>
                    <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                      <div><span className="text-lg font-black">₹{Number(stay.pricePerNight || 0).toLocaleString('en-IN')}</span><span className="ml-1 text-xs text-slate-500">/ night</span></div>
                      <span className="text-xs font-black text-teal-700">View stay →</span>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <section className="mx-auto mb-10 max-w-7xl px-5 lg:px-8">
        <div className="rounded-[32px] bg-[#e6f3ef] p-7 sm:p-9 lg:flex lg:items-center lg:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">For local hosts</p><h2 className="mt-2 text-2xl font-black">Your spare room could welcome someone to Guwahati.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">List your property on StayGuwahati and connect with guests looking for genuine local stays.</p></div>
          <a href="/list-property" onClick={requireLoginToList} className="mt-5 inline-flex rounded-2xl bg-teal-700 px-6 py-3 text-sm font-black text-white lg:mt-0">List your property →</a>
        </div>
      </section>

      <button onClick={() => router.push('/map')} className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#073b39] px-6 py-3.5 text-sm font-black text-white shadow-xl lg:bottom-8">Explore Map 🗺️</button>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-teal-100 bg-white/95 px-5 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <button onClick={openSearch} className="flex min-w-20 flex-col items-center gap-1 py-1 text-teal-700"><span className="text-2xl">⌕</span><span className="text-xs font-black">Explore</span></button>
          <button onClick={() => router.push('/wishlist')} className="flex min-w-20 flex-col items-center gap-1 py-1 text-slate-500"><span className="text-2xl">♡</span><span className="text-xs font-semibold">Saved</span></button>
          <button onClick={() => router.push(userProfile ? '/dashboard' : '/login')} className="flex min-w-20 flex-col items-center gap-1 py-1 text-slate-500"><span className="text-2xl">◯</span><span className="text-xs font-semibold">{userProfile ? 'Profile' : 'Sign in'}</span></button>
        </div>
      </nav>

      <footer className="border-t border-teal-100 bg-white px-5 py-8 text-center text-xs text-slate-500">© 2026 StayGuwahati · Local stays, local stories.</footer>
    </div>
  );
}