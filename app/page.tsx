'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resolveImageUrl } from '@/lib/utils';

interface Property {
  _id?: string;
  id?: string;
  title: string;
  locality: string;
  pricePerNight: number;
  images?: string[];
  rating?: number;
  reviewsCount?: number;
  tags?: string[];
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
    pipeline_loading: "Connecting to property database...",
    api_error: "We could not load properties right now.",
    api_retry: "Retry",
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
    pipeline_loading: "প্ৰপাৰ্টি ডাটাবেচৰ সৈতে সংযোগ কৰা হৈছে...",
    api_error: "এই মুহূৰ্তত প্ৰপাৰ্টি লোড কৰিব পৰা নগ’ল।",
    api_retry: "পুনৰ চেষ্টা কৰক",
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
    pipeline_loading: "प्रॉपर्टी डेटाबेस से कनेक्ट किया जा रहा है...",
    api_error: "अभी प्रॉपर्टी लोड नहीं हो सकीं।",
    api_retry: "फिर कोशिश करें",
    no_properties: "इस इलाके में कोई संपत्ति उपलब्ध नहीं है",
    no_properties_sub: "बाद में पुन: प्रयास करें या वैकल्पिक पड़ोस विकल्प देखें।",
    show_all: "← सभी लिस्टिंग दिखाएं",
    privacy: "गोपनीयता नीति",
    reserve_btn: "स्थान आरक्षित करें"
  }
};

export default function HomePage() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState<'en' | 'as' | 'hi'>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string } | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [selectedFilterLocality, setSelectedFilterLocality] = useState<string | null>(null);

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
      }
    }

    fetchHomestays();
  }, []);

  const fetchHomestays = async () => {
    setLoading(true);
    setApiError('');

    const maxAttempts = 3;
    const requestTimeoutMs = 12000;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        requestTimeoutMs
      );

      try {
        const response = await fetch(`${BACKEND_URL}/api/homestays`, {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.success) {
          throw new Error(
            payload?.message || `Property service returned HTTP ${response.status}`
          );
        }

        const data = Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        setProperties(data);
        setApiError('');
        window.clearTimeout(timeoutId);
        setLoading(false);
        return;
      } catch (error) {
        window.clearTimeout(timeoutId);

        const message =
          error instanceof Error && error.name === 'AbortError'
            ? 'Property service timed out.'
            : error instanceof Error
              ? error.message
              : 'Unable to load properties.';

        console.error(`Property API attempt ${attempt}/${maxAttempts} failed:`, message);

        if (attempt < maxAttempts) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, attempt * 1000)
          );
          continue;
        }

        setProperties([]);
        setApiError(message);
      }
    }

    setLoading(false);
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

  const handleReserveSpace = (stay: Property) => {
    const propertyId = stay._id || stay.id;
    router.push(`/property-details?id=${propertyId}&title=${encodeURIComponent(stay.title)}`);
  };

  const filteredProperties = selectedFilterLocality
    ? properties.filter((p) => p.locality?.toLowerCase().includes(selectedFilterLocality.toLowerCase()))
    : properties;

  return (
    <div className="bg-slate-50 font-sans min-h-screen flex flex-col justify-between">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <span className="text-xl sm:text-2xl">🏠</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Stay<span className="text-teal-600">Guwahati</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-6 items-center">
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
          <div className="flex items-center gap-3 md:hidden">
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
          <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-5 space-y-3 shadow-lg">
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

      {/* Hero Header */}
      <header className="relative bg-slate-900 text-white py-16 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200')" }}
        ></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="bg-teal-500/25 text-teal-300 font-bold text-[10px] sm:text-xs uppercase tracking-widest px-3.5 py-1 rounded-full border border-teal-500/30">
            {t.hero_tag}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mt-4 mb-4 sm:mb-6 leading-tight">
            {t.hero_title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-6 sm:mb-8">
            {t.hero_subtitle}
          </p>

          <button
            onClick={() => router.push('/explore')}
            className="inline-flex items-center justify-center bg-teal-500 text-slate-950 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg hover:bg-teal-400 transition transform hover:-translate-y-0.5 shadow-lg shadow-teal-500/20 group"
          >
            <span>{t.hero_btn}</span>
            <span className="ml-3 transition group-hover:translate-x-1">→</span>
          </button>
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
                onClick={() => setSelectedFilterLocality('Uzan Bazar')}
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
                onClick={() => setSelectedFilterLocality('Paltan Bazar')}
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
                onClick={() => setSelectedFilterLocality('Ganeshguri')}
                className="inline-block text-xs sm:text-sm font-bold text-teal-600 mt-4 hover:text-teal-700"
              >
                {t.explore_link}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Local Homestays Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.sec2_title}</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.sec2_subtitle}</p>
          </div>
          <div className="bg-teal-50 text-teal-700 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border border-teal-100 self-start sm:self-auto">
            <span>{t.showing_text}</span> <span className="font-bold">{filteredProperties.length}</span>{' '}
            <span>{t.active_options_text}</span>
          </div>
        </div>

        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            <div className="inline-block animate-spin text-3xl mb-3 text-teal-500">⏳</div>
            <p className="text-xs sm:text-sm">{t.pipeline_loading}</p>
          </div>
        ) : apiError ? (
          <div className="col-span-full text-center py-12 bg-white border border-amber-200 rounded-2xl shadow-sm">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold text-slate-700 text-sm">{t.api_error}</p>
            <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto">
              {apiError}
            </p>
            <button
              type="button"
              onClick={fetchHomestays}
              className="inline-flex items-center justify-center mt-5 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs sm:text-sm font-bold hover:bg-teal-700 transition"
            >
              ↻ {t.api_retry}
            </button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="text-4xl text-slate-300 mb-3">🏨</div>
            <p className="font-semibold text-slate-700 text-sm">{t.no_properties}</p>
            <p className="text-slate-400 text-xs mt-1">{t.no_properties_sub}</p>
            <button
              onClick={() => setSelectedFilterLocality(null)}
              className="inline-block mt-4 text-xs sm:text-sm font-bold text-teal-600 hover:underline"
            >
              {t.show_all}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProperties.map((stay, idx) => {
              const img = stay.images && stay.images.length > 0 ? resolveImageUrl(stay.images[0]) : resolveImageUrl();
              const rating = stay.rating || (4.3 + (idx % 5) * 0.1).toFixed(1);
              const reviews = stay.reviewsCount || 15 + idx * 7;
              const tags = stay.tags || ['Premium Linens', 'Wi-Fi', 'Great Location'];
              const propertyId = stay._id || stay.id || `prop-${idx}`;

              return (
                <div
                  key={propertyId}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between group"
                >
                  <div
                    onClick={() => router.push(`/property-details?id=${propertyId}&title=${encodeURIComponent(stay.title)}`)}
                    className="relative overflow-hidden aspect-[4/3] bg-slate-100 block cursor-pointer"
                  >
                    <img
                      src={img}
                      alt={stay.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1">
                      <span className="text-amber-500">★</span> {rating} ({reviews})
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-teal-600 tracking-wide uppercase">
                        📍 {stay.locality || 'Guwahati'}, GUWAHATI
                      </div>
                      <h3
                        onClick={() => router.push(`/property-details?id=${propertyId}&title=${encodeURIComponent(stay.title)}`)}
                        className="font-bold text-base sm:text-lg text-slate-900 mt-1 group-hover:text-teal-600 transition truncate cursor-pointer"
                      >
                        {stay.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-slate-100 text-slate-600 text-[10px] sm:text-xs px-2.5 py-1 rounded-md font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-lg sm:text-xl font-extrabold text-slate-900">₹{stay.pricePerNight}</span>
                        <span className="text-[10px] sm:text-xs text-slate-400 block -mt-0.5">/ night value</span>
                      </div>
                      <button
                        onClick={() => handleReserveSpace(stay)}
                        className="bg-slate-900 hover:bg-teal-600 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm"
                      >
                        {t.reserve_btn}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>&copy; 2026 StayGuwahati. All rights reserved.</div>
          <div className="flex gap-4">
            <button onClick={() => router.push('/refer-a-host')} className="text-slate-600 hover:text-teal-600 font-medium transition">
              {t.nav_refer_host}
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