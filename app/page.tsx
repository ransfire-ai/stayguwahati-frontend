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
  bedrooms?: number | string;
  bathrooms?: {
    privateAttached?: number | string;
    dedicated?: number | string;
    shared?: number | string;
    total?: number | string;
  };
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
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      const response = await fetch(`${BACKEND_URL}/api/homestays`, {
        method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' }, signal: controller.signal,
      });
      window.clearTimeout(timeout);
      if (!response.ok) throw new Error(`Property API returned ${response.status}`);
      const raw = await response.json();
      const list = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : Array.isArray(raw.homestays) ? raw.homestays : Array.isArray(raw.properties) ? raw.properties : [];
      setProperties(list.map((item: any) => ({
        ...item, _id: item._id || item.id, title: item.title || item.name || 'Homestay',
        locality: item.locality || item.city || 'Guwahati',
        pricePerNight: Number(item.pricePerNight ?? item.price ?? 0),
        bedrooms: item.bedrooms ?? item.bedroomCount ?? undefined,
        bathrooms: item.bathrooms ?? undefined,
        images: Array.isArray(item.images) ? item.images : [],
        rating: typeof item.rating === 'number' ? item.rating : undefined,
        reviewsCount: Number(item.reviewsCount || 0),
      })));
    } catch (error) {
      console.error('Failed to load homestays:', error);
      setProperties([]);
    } finally { setLoading(false); }
  };

  const filteredProperties = properties.filter((property) => {
    const locality = (property.locality || '').toLowerCase();
    const title = (property.title || '').toLowerCase();
    const localityFilter = (selectedFilterLocality || searchLocality).trim().toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    return (!localityFilter || locality.includes(localityFilter)) && (!query || title.includes(query) || locality.includes(query));
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
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-20 lg:pb-0">
      {/* Desktop navigation */}
      <nav className="hidden lg:block sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <span className="text-xl font-black tracking-tight">Stay<span className="text-teal-600">Guwahati</span></span>
          </button>
          <div className="flex items-center gap-6 text-sm font-semibold">
            <button onClick={() => router.push('/')} className="text-teal-600">{t.nav_home}</button>
            <a href="/list-property" onClick={requireLoginToList}>{t.nav_list_property}</a>
            <button onClick={() => router.push('/refer-a-host')}>{t.nav_refer_host}</button>
            <button onClick={() => router.push('/map')} className="rounded-full bg-slate-950 px-4 py-2 text-white">🗺️ {t.nav_explore_map}</button>
            <button onClick={() => router.push('/support')}>{t.nav_support}</button>
            <select value={currentLang} onChange={(e) => handleLangChange(e.target.value as 'en' | 'as' | 'hi')} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold">
              <option value="en">English</option><option value="as">অসমীয়া</option><option value="hi">हिंदी</option>
            </select>
            <button onClick={() => router.push(userProfile ? '/dashboard' : '/login')} className="rounded-full border border-slate-300 px-4 py-2">
              {userProfile ? '👤 ' + (userProfile.name || t.nav_dashboard) : t.nav_sign_in}
            </button>
          </div>
        </div>
      </nav>

      {/* Airbnb-style mobile search header */}
      <header className="sticky top-0 z-40 bg-white px-4 pb-4 pt-3 shadow-[0_4px_18px_rgba(0,0,0,0.08)] lg:static lg:px-6 lg:py-8 lg:shadow-none">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} aria-label="Go back" className="flex h-10 w-10 shrink-0 items-center justify-center text-3xl font-light lg:hidden">‹</button>
            <button onClick={openSearch} className="min-w-0 flex-1 rounded-[30px] border border-slate-300 bg-white px-5 py-3 text-left shadow-[0_2px_10px_rgba(0,0,0,0.08)] lg:mx-auto lg:max-w-2xl">
              <div className="truncate text-[17px] font-bold text-slate-900">Homes in Guwahati</div>
              <div className="mt-0.5 text-sm font-medium text-slate-500">Any weekend <span className="px-1">•</span> Add guests</div>
            </button>
            <button onClick={() => setShowFilters(!showFilters)} aria-label="Filters" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xl lg:hidden">☷</button>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-1 lg:mx-auto lg:max-w-2xl">
            <button onClick={() => setShowFilters(!showFilters)} className="shrink-0 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold shadow-sm">Price <span className="ml-2">⌄</span></button>
            <button onClick={() => setShowFilters(!showFilters)} className="shrink-0 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold shadow-sm">Type of place <span className="ml-2">⌄</span></button>
            <button onClick={() => setShowFilters(!showFilters)} className="shrink-0 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold shadow-sm">Bedrooms <span className="ml-2">⌄</span></button>
          </div>

          {showFilters && (
            <div className="mx-auto mt-3 max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-lg lg:hidden">
              <p className="text-sm font-bold">Search by locality</p>
              <div className="mt-3 flex gap-2 overflow-x-auto">
                <button onClick={() => { setSelectedFilterLocality(null); setSearchLocality(''); setShowFilters(false); }} className="shrink-0 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white">All Guwahati</button>
                {['Uzan Bazar', 'Paltan Bazar', 'Dispur', 'Beltola', 'Ganeshguri', 'GS Road'].map((locality) => (
                  <button key={locality} onClick={() => { handleLocalitySelect(locality); setShowFilters(false); }} className="shrink-0 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold">{locality}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Desktop hero */}
      <section className="hidden lg:block bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl rounded-3xl bg-slate-950 px-8 py-12 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">{t.hero_tag}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black">{t.hero_title}</h1>
          <p className="mt-3 max-w-2xl text-slate-300">{t.hero_subtitle}</p>
        </div>
      </section>

      {/* Listings */}
      <main id="listings" className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-4 sm:px-6 lg:pt-10">
        <div className="mb-5 hidden items-end justify-between lg:flex">
          <div>
            <h2 className="text-2xl font-black">{t.sec2_title}</h2>
            <p className="mt-1 text-sm text-slate-500">{filteredProperties.length} {t.active_options_text}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="animate-spin text-3xl">⏳</div>
            <p className="mt-3 text-sm">{t.pipeline_loading}</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <div className="text-4xl">🏠</div>
            <p className="mt-3 font-bold">{t.no_properties}</p>
            <button onClick={() => { setSelectedFilterLocality(null); setSearchLocality(''); setSearchQuery(''); }} className="mt-4 font-bold text-teal-600">{t.show_all}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
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
                <article key={propertyId} className="min-w-0">
                  <div className="relative aspect-[1.08/1] overflow-hidden rounded-[28px] bg-slate-100 sm:aspect-[1.1/1]">
                    <button type="button" onClick={() => handleReserveSpace(stay)} className="absolute inset-0 z-0 h-full w-full">
                      <img src={img} alt={stay.title} loading={idx < 3 ? 'eager' : 'lazy'} className="h-full w-full object-cover" onError={(e) => { if (e.currentTarget.src !== FALLBACK_PROPERTY_IMAGE) e.currentTarget.src = FALLBACK_PROPERTY_IMAGE; }} />
                    </button>

                    {isFavourite && (
                      <span className="absolute left-4 top-4 z-10 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm">Guest favourite</span>
                    )}

                    <button type="button" onClick={() => toggleWishlist(propertyId)} aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'} className="absolute right-4 top-4 z-10 text-3xl leading-none text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {isSaved ? '♥' : '♡'}
                    </button>

                    {gallery.length > 1 && (
                      <>
                        <button type="button" onClick={(e) => { e.stopPropagation(); changeGalleryImage(propertyId, gallery.length, -1); }} className="absolute left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow-md sm:flex">‹</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); changeGalleryImage(propertyId, gallery.length, 1); }} className="absolute right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow-md sm:flex">›</button>
                        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                          {gallery.slice(0, 6).map((_, photoIndex) => (
                            <button key={photoIndex} type="button" aria-label={`Show photo ${photoIndex + 1}`} onClick={(e) => { e.stopPropagation(); setGalleryIndexes((current) => ({ ...current, [propertyId]: photoIndex })); }} className={`h-1.5 rounded-full shadow ${photoIndex === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/70'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <button type="button" onClick={() => handleReserveSpace(stay)} className="mt-3 block w-full text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-[18px] font-semibold text-slate-900">{stay.title || 'Place to stay in Guwahati'}</h3>
                        <p className="mt-1 text-[16px] text-slate-500">{stay.locality || 'Guwahati'}, Guwahati</p>

                        {(() => {
                          const bedroomCount = Number(stay.bedrooms);
                          const bathroomData = stay.bathrooms || {};
                          const explicitBathroomTotal = Number(bathroomData.total);
                          const calculatedBathroomTotal =
                            Number.isFinite(explicitBathroomTotal) && explicitBathroomTotal > 0
                              ? explicitBathroomTotal
                              : [
                                  Number(bathroomData.privateAttached) || 0,
                                  Number(bathroomData.dedicated) || 0,
                                  Number(bathroomData.shared) || 0,
                                ].reduce((sum, value) => sum + value, 0);

                          const hasBedrooms = Number.isFinite(bedroomCount) && bedroomCount > 0;
                          const hasBathrooms = calculatedBathroomTotal > 0;

                          if (!hasBedrooms && !hasBathrooms) {
                            return (
                              <p className="mt-1 text-[16px] text-slate-500">
                                Homestay · Local host
                              </p>
                            );
                          }

                          return (
                            <>
                              <p className="mt-1 text-[16px] font-medium text-slate-600">
                                {hasBedrooms ? `${bedroomCount} ${bedroomCount === 1 ? 'bedroom' : 'bedrooms'}` : ''}
                                {hasBedrooms && hasBathrooms ? ' · ' : ''}
                                {hasBathrooms ? `${calculatedBathroomTotal} ${calculatedBathroomTotal === 1 ? 'bathroom' : 'bathrooms'}` : ''}
                              </p>
                              <p className="mt-1 text-[14px] text-slate-500">
                                Homestay · Local host
                              </p>
                            </>
                          );
                        })()}
                      </div>
                      {rating !== null && (
                        <div className="shrink-0 pt-0.5 text-[16px] font-semibold text-slate-900">★ {rating.toFixed(2)} {reviews > 0 && <span className="font-normal">({reviews})</span>}</div>
                      )}
                    </div>
                    <div className="mt-2 text-[16px] text-slate-600">
                      <span className="font-bold text-slate-900">₹{Number(stay.pricePerNight || 0).toLocaleString('en-IN')}</span> night
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating map button */}
      <button onClick={() => router.push('/map')} className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-xl lg:bottom-8">
        Map 🗺️
      </button>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-5 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <button onClick={openSearch} className="flex min-w-20 flex-col items-center gap-1 py-1 text-teal-700">
            <span className="text-3xl leading-none">⌕</span><span className="text-xs font-bold">Explore</span>
          </button>
          <button onClick={() => setWishlist(wishlist.length ? [] : wishlist)} className="flex min-w-20 flex-col items-center gap-1 py-1 text-slate-500">
            <span className="text-3xl leading-none">♡</span><span className="text-xs">Wishlists</span>
          </button>
          <button onClick={() => router.push(userProfile ? '/dashboard' : '/login')} className="flex min-w-20 flex-col items-center gap-1 py-1 text-slate-500">
            <span className="text-3xl leading-none">◯</span><span className="text-xs">{userProfile ? 'Profile' : 'Log in'}</span>
          </button>
        </div>
      </nav>

      {/* Desktop footer */}
      <footer className="mt-16 hidden border-t border-slate-200 bg-white px-6 py-8 text-center text-xs text-slate-500 lg:block">
        © 2026 StayGuwahati. All rights reserved.
      </footer>
    </div>
  );
}