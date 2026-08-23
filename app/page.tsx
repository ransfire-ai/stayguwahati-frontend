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

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stayguwahati-backend.onrender.com';
  const t = translations[currentLang] || translations.en;

  useEffect(() => {
    const savedLang = (localStorage.getItem('preferredLang') as 'en' | 'as' | 'hi') || 'en';
    setCurrentLang(savedLang);

    const storedSession = localStorage.getItem('userProfile') || sessionStorage.getItem('userProfile');
    if (storedSession) {
      try {
        setUserProfile(JSON.parse(storedSession));
      } catch (err) {
        console.error('Failed to parse user profile session:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const loc = urlParams.get('location');
      if (loc) {
        setSelectedFilterLocality(loc);
        setSearchLocality(loc);
      }
    }

    fetchHomestays();
  }, []);

  const fetchHomestays = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/homestays`);
      let data = await response.json();

      if (data && data.data) {
        data = data.data;
      }

      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to sync listing data grid pipeline:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLangChange = (lang: 'en' | 'as' | 'hi') => {
    setCurrentLang(lang);
    localStorage.setItem('preferredLang', lang);
  };

  const requireLoginToList = (e: React.MouseEvent) => {
    if (!userProfile) {
      e.preventDefault();
      router.push('/login?redirect=/list-property');
    }
  };

  const handleSearch = () => {
    const locality = searchLocality.trim();
    setSelectedFilterLocality(locality || null);

    setTimeout(() => {
      document.getElementById('listings')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 0);
  };

  const handleLocalitySelect = (locality: string) => {
    setSearchLocality(locality);
    setSelectedFilterLocality(locality || null);

    setTimeout(() => {
      document.getElementById('listings')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 0);
  };

  const changeGalleryImage = (propertyId: string, total: number, direction: number) => {
    if (total <= 1) return;

    setGalleryIndexes((current) => {
      const currentIndex = current[propertyId] || 0;
      return {
        ...current,
        [propertyId]: (currentIndex + direction + total) % total,
      };
    });
  };

  const handleReserveSpace = (stay: Property) => {
    const propertyId = stay._id || stay.id;
    router.push(`/property-details?id=${propertyId}&title=${encodeURIComponent(stay.title)}`);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const normalizedLocality = selectedFilterLocality?.trim().toLowerCase() || '';

  const filteredProperties = properties.filter((p) => {
    const title = (p.title || '').toLowerCase();
    const locality = (p.locality || '').toLowerCase();
    const description = (p.description || '').toLowerCase();
    const features = Array.isArray(p.features)
      ? p.features.join(' ').toLowerCase()
      : '';

    const matchesSearch =
      !normalizedQuery ||
      title.includes(normalizedQuery) ||
      locality.includes(normalizedQuery) ||
      description.includes(normalizedQuery) ||
      features.includes(normalizedQuery);

    const matchesLocality =
      !normalizedLocality ||
      locality === normalizedLocality ||
      locality.includes(normalizedLocality);

    return matchesSearch && matchesLocality;
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans flex flex-col justify-between">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto flex h-16 min-w-0 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <span className="text-xl sm:text-2xl">🏠</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Stay<span className="text-teal-600">Guwahati</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex gap-5 xl:gap-6 items-center">
            <button
              onClick={() => router.push('/')}
              className="font-medium text-teal-600 border-b-2 border-teal-600 pb-1 text-sm cursor-pointer"
            >
              {t.nav_home}
            </button>

            <a
              href="/list-property"
              onClick={requireLoginToList}
              className="text-slate-600 hover:text-teal-600 font-medium transition text-sm flex items-center gap-1"
            >
              <span>➕</span>
              <span>{t.nav_list_property}</span>
            </a>

            <button
              onClick={() => router.push('/refer-a-host')}
              className="text-slate-600 hover:text-teal-600 font-medium transition text-sm flex items-center gap-1 cursor-pointer"
            >
              <span>🎁</span>
              <span>{t.nav_refer_host}</span>
            </button>

            <button
              onClick={() => router.push('/map')}
              className="bg-teal-600 text-white px-3.5 py-2 rounded-lg font-medium hover:bg-teal-700 transition shadow-sm text-sm flex items-center gap-2"
            >
              <span>🗺️</span>
              <span>{t.nav_explore_map}</span>
            </button>

            <button
              onClick={() => router.push('/support')}
              className="font-medium text-slate-600 hover:text-teal-600 transition flex items-center gap-1.5 text-sm"
            >
              <span>🎧</span>
              <span>{t.nav_support}</span>
            </button>

            <select
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value as 'en' | 'as' | 'hi')}
              className="bg-gray-50 border border-gray-200 text-xs rounded-lg p-1.5 focus:outline-none focus:border-teal-500 font-semibold text-gray-700 cursor-pointer shadow-sm"
            >
              <option value="en">English</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>

            <div className="flex items-center">
              {!userProfile ? (
                <button
                  onClick={() => router.push('/login')}
                  className="bg-slate-950 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-600 transition shadow-sm flex items-center gap-2 text-sm"
                >
                  <span>🚪</span>
                  <span>{t.nav_sign_in}</span>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 border border-gray-200 hover:border-teal-500 bg-gray-50 px-3 py-1.5 rounded-xl transition shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-gray-700 hidden sm:inline">{t.nav_dashboard}</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex items-center gap-3 lg:hidden">
            <select
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value as 'en' | 'as' | 'hi')}
              className="bg-gray-50 border border-gray-200 text-[10px] rounded-lg p-1 focus:outline-none focus:border-teal-500 font-semibold text-gray-700 cursor-pointer shadow-sm"
            >
              <option value="en">English</option>
              <option value="as">অসমীয়া</option>
              <option value="hi">हिंदी</option>
            </select>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-800 hover:text-teal-600 focus:outline-none text-xl p-1.5"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-5 space-y-3 shadow-lg">
            <button
              onClick={() => router.push('/')}
              className="block w-full text-left font-medium text-teal-600 py-1.5 text-sm border-b border-gray-100"
            >
              {t.nav_home}
            </button>
            <a
              href="/list-property"
              onClick={requireLoginToList}
              className="block text-slate-600 hover:text-teal-600 font-medium py-1.5 text-sm border-b border-gray-100"
            >
              ➕ {t.nav_list_property}
            </a>
            <button
              onClick={() => router.push('/refer-a-host')}
              className="block w-full text-left text-slate-600 hover:text-teal-600 font-medium py-1.5 text-sm border-b border-gray-100"
            >
              🎁 {t.nav_refer_host}
            </button>
            <button
              onClick={() => router.push('/map')}
              className="block w-full text-left text-slate-600 hover:text-teal-600 font-medium py-1.5 text-sm border-b border-gray-100"
            >
              🗺️ {t.nav_explore_map}
            </button>
            <button
              onClick={() => router.push('/support')}
              className="block w-full text-left text-slate-600 hover:text-teal-600 font-medium py-1.5 text-sm border-b border-gray-100"
            >
              🎧 {t.nav_support}
            </button>
            <button
              onClick={() => router.push('/privacy')}
              className="block w-full text-left text-slate-600 hover:text-teal-600 font-medium py-1.5 text-sm border-b border-gray-100"
            >
              🛡️ {t.privacy}
            </button>
            <div className="pt-3">
              {!userProfile ? (
                <button
                  onClick={() => router.push('/login')}
                  className="w-full text-center block bg-slate-950 text-white px-4 py-2.5 rounded-xl font-medium text-xs hover:bg-teal-600 transition shadow-sm"
                >
                  🚪 {t.nav_sign_in}
                </button>
              ) : (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-gray-50 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                    {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{t.nav_dashboard}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero / Search */}
      <header className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950/90" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
          <span className="inline-flex rounded-full border border-teal-300/30 bg-teal-400/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-teal-200 sm:text-xs">
            {t.hero_tag}
          </span>

          <h1 className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            {t.hero_title}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base md:text-lg">
            {t.hero_subtitle}
          </p>

          <div className="mx-auto mt-8 max-w-5xl rounded-2xl bg-white p-2 text-left shadow-2xl shadow-black/25 sm:mt-10 sm:rounded-3xl sm:p-2.5">
            <div className="grid gap-2 lg:grid-cols-[1.2fr_0.8fr_auto]">
              <label className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-200">
                <span className="text-lg">🔎</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch();
                    }}
                    placeholder="Property, locality or area"
                    className="mt-1 w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
                  />
                </span>
              </label>

              <label className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-200">
                <span className="text-lg">📍</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Locality
                  </span>
                  <select
                    value={searchLocality}
                    onChange={(e) => handleLocalitySelect(e.target.value)}
                    className="mt-1 w-full bg-transparent text-sm font-bold text-slate-900 outline-none"
                  >
                    <option value="">All Guwahati</option>
                    {[
                      'Amingaon', 'Azara', 'Bamunimaidam', 'Basistha', 'Beltola',
                      'Bhangagarh', 'Borjhar', 'Chandmari', 'Christian Basti', 'Dispur',
                      'Ganeshguri', 'Geetanagar', 'GS Road', 'Jalukbari', 'Kahilipara',
                      'Kamakhya', 'Khanapara', 'Kharghuli', 'Lal Ganesh', 'Lokhra',
                      'Maligaon', 'Narengi', 'Paltan Bazar', 'Pan Bazar', 'Rehabari',
                      'Rukminigaon', 'Silpukhuri', 'Six Mile', 'Supermarket', 'Ulubari',
                      'Uzan Bazar', 'Zoo Road'
                    ].map((locality) => (
                      <option key={locality} value={locality}>
                        {locality}
                      </option>
                    ))}
                  </select>
                </span>
              </label>

              <button
                onClick={handleSearch}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 lg:min-w-36"
              >
                🔎 Search
              </button>
            </div>

            <div className="mt-2 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
              {['Dispur', 'Uzan Bazar', 'Beltola', 'GS Road', 'Ganeshguri', 'Paltan Bazar'].map((locality) => (
                <button
                  key={locality}
                  onClick={() => handleLocalitySelect(locality)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                    selectedFilterLocality === locality
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700'
                  }`}
                >
                  {locality}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-300">
            <span>✓ Local properties</span>
            <span>✓ Clear pricing</span>
            <span>✓ Direct host information</span>
          </div>
        </div>
      </header>

      {/* Popular Neighborhoods Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.sec1_title}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.sec1_subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition">
            <div className="h-44 sm:h-48 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500"
                alt="Uzan Bazar"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="p-4 sm:p-5">
              <h3 className="font-bold text-base sm:text-lg text-slate-900">{t.loc1_title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.loc1_desc}</p>
              <button
                onClick={() => handleLocalitySelect('Uzan Bazar')}
                className="inline-block text-xs sm:text-sm font-bold text-teal-600 mt-4 hover:text-teal-700"
              >
                {t.explore_link}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition">
            <div className="h-44 sm:h-48 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500"
                alt="Paltan Bazar"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="p-4 sm:p-5">
              <h3 className="font-bold text-base sm:text-lg text-slate-900">{t.loc2_title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.loc2_desc}</p>
              <button
                onClick={() => handleLocalitySelect('Paltan Bazar')}
                className="inline-block text-xs sm:text-sm font-bold text-teal-600 mt-4 hover:text-teal-700"
              >
                {t.explore_link}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition sm:col-span-2 md:col-span-1">
            <div className="h-44 sm:h-48 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500"
                alt="Ganeshguri"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="p-4 sm:p-5">
              <h3 className="font-bold text-base sm:text-lg text-slate-900">{t.loc3_title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.loc3_desc}</p>
              <button
                onClick={() => handleLocalitySelect('Ganeshguri')}
                className="inline-block text-xs sm:text-sm font-bold text-teal-600 mt-4 hover:text-teal-700"
              >
                {t.explore_link}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Local Homestays Grid */}
      <section id="listings" className="max-w-7xl mx-auto scroll-mt-24 px-4 sm:px-6 pb-20 sm:pb-24 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.sec2_title}</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.sec2_subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {(selectedFilterLocality || searchQuery.trim()) && (
              <button
                onClick={() => {
                  setSelectedFilterLocality(null);
                  setSearchLocality('');
                  setSearchQuery('');
                }}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-teal-300 hover:text-teal-700"
              >
                Clear search
              </button>
            )}

            {selectedFilterLocality && (
              <span className="rounded-full bg-teal-600 px-3 py-2 text-xs font-bold text-white">
                📍 {selectedFilterLocality}
              </span>
            )}

            {searchQuery.trim() && (
              <span className="max-w-48 truncate rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                🔎 {searchQuery.trim()}
              </span>
            )}

            <div className="rounded-full border border-teal-100 bg-teal-50 px-3.5 py-1.5 text-xs font-semibold text-teal-700 sm:px-4 sm:py-2 sm:text-sm">
              <span>{t.showing_text}</span>{' '}
              <span className="font-bold">{filteredProperties.length}</span>{' '}
              <span>{t.active_options_text}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            <div className="inline-block animate-spin text-3xl mb-3 text-teal-500">⏳</div>
            <p className="text-xs sm:text-sm">{t.pipeline_loading}</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="text-4xl text-slate-300 mb-3">🏨</div>
            <p className="font-semibold text-slate-700 text-sm">{t.no_properties}</p>
            <p className="text-slate-400 text-xs mt-1">{t.no_properties_sub}</p>
            <button
              onClick={() => {
                setSelectedFilterLocality(null);
                setSearchLocality('');
                setSearchQuery('');
              }}
              className="inline-block mt-4 text-xs sm:text-sm font-bold text-teal-600 hover:underline"
            >
              {t.show_all}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((stay, idx) => {
              const gallery = Array.isArray(stay.images)
                ? stay.images.filter(Boolean).slice(0, 8)
                : [];
              const propertyId = stay._id || stay.id || `prop-${idx}`;
              const currentIndex = Math.min(
                galleryIndexes[propertyId] || 0,
                Math.max(gallery.length - 1, 0)
              );
              const img = resolvePropertyImage(gallery[currentIndex], BACKEND_URL);
              const rating = stay.rating;
              const reviews = stay.reviewsCount || 0;
              const tags = Array.isArray(stay.tags) ? stay.tags : [];

              return (
                <article
                  key={propertyId}
                  className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <button
                      type="button"
                      onClick={() => handleReserveSpace(stay)}
                      className="block h-full w-full cursor-pointer"
                      aria-label={`View ${stay.title}`}
                    >
                      <img
                        src={img}
                        alt={stay.title}
                        loading={idx < 3 ? 'eager' : 'lazy'}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          if (e.currentTarget.src !== FALLBACK_PROPERTY_IMAGE) {
                            e.currentTarget.src = FALLBACK_PROPERTY_IMAGE;
                          }
                        }}
                      />
                    </button>

                    <div className="absolute left-4 top-4 rounded-full bg-teal-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white shadow-md">
                      ✓ Verified Stay
                    </div>

                    {typeof rating === 'number' && (
                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-slate-900 shadow-md backdrop-blur">
                        <span className="text-amber-500">★</span>
                        {rating.toFixed(1)}
                        {reviews > 0 && (
                          <span className="font-medium text-slate-500">({reviews})</span>
                        )}
                      </div>
                    )}

                    {gallery.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Previous property photo"
                          onClick={(e) => {
                            e.stopPropagation();
                            changeGalleryImage(propertyId, gallery.length, -1);
                          }}
                          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-lg font-bold text-slate-900 shadow-lg transition hover:bg-white"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          aria-label="Next property photo"
                          onClick={(e) => {
                            e.stopPropagation();
                            changeGalleryImage(propertyId, gallery.length, 1);
                          }}
                          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-lg font-bold text-slate-900 shadow-lg transition hover:bg-white"
                        >
                          ›
                        </button>

                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-950/55 px-2.5 py-1.5 backdrop-blur">
                          {gallery.map((_, photoIndex) => (
                            <button
                              key={photoIndex}
                              type="button"
                              aria-label={`Show photo ${photoIndex + 1}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setGalleryIndexes((current) => ({
                                  ...current,
                                  [propertyId]: photoIndex,
                                }));
                              }}
                              className={`h-1.5 rounded-full transition-all ${
                                photoIndex === currentIndex
                                  ? 'w-4 bg-white'
                                  : 'w-1.5 bg-white/60'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                          {currentIndex + 1}/{gallery.length} photos
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-teal-700 sm:text-xs">
                        📍 {stay.locality || 'Guwahati'}, Guwahati
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReserveSpace(stay)}
                        className="mt-2 text-left text-xl font-black tracking-tight text-slate-950 transition hover:text-teal-700"
                      >
                        {stay.title}
                      </button>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <span className="text-2xl font-black text-slate-950">
                            ₹{Number(stay.pricePerNight || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="ml-1 text-sm text-slate-400">/ night</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleReserveSpace(stay)}
                          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-teal-600"
                        >
                          View Stay →
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Why StayGuwahati */}
      <section className="border-y border-slate-200 bg-white px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
              Why StayGuwahati
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              A simpler way to find a stay in Guwahati
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Explore local properties with clear information before you decide where to stay.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['📍', 'Local stays', 'Discover properties across Guwahati neighbourhoods.'],
              ['✓', 'Verified listings', 'Browse properties published through our approved listing pipeline.'],
              ['₹', 'Clear nightly pricing', 'See the listed price per night before booking.'],
              ['🤝', 'Host connection', 'View the host information provided with each property.'],
            ].map(([icon, title, description]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-slate-200">
                  {icon}
                </div>
                <h3 className="mt-4 text-sm font-black text-slate-950">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>&copy; 2026 StayGuwahati. All rights reserved.</div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <button onClick={() => router.push('/list-property')} className="text-slate-600 hover:text-teal-600 font-medium transition">
              {t.nav_list_property}
            </button>
            <button onClick={() => router.push('/refer-a-host')} className="text-slate-600 hover:text-teal-600 font-medium transition">
              {t.nav_refer_host}
            </button>
            <button onClick={() => router.push('/support')} className="text-slate-600 hover:text-teal-600 font-medium transition">
              {t.nav_support}
            </button>
            <button onClick={() => router.push('/privacy')} className="text-slate-600 hover:text-teal-600 font-medium transition">
              {t.privacy}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}