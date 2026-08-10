'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  PlusCircle,
  Map,
  Loader2,
  Hotel,
  AlertCircle
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stayguwahati-backend.onrender.com';

interface Homestay {
  _id: string;
  title: string;
  locality?: string;
  location?: string;
  pricePerNight: number;
  images?: string[];
  image?: string;
}

type Language = 'en' | 'as' | 'hi';

const dictionary = {
  en: {
    home: 'Home',
    exploreMap: 'Explore Map',
    listProperty: 'List Property',
    mainTitle: 'Verified Local Homestays',
    mainDesc: 'Handpicked properties verified for hygiene, security, and warmth.',
    showingLabel: 'active property options',
    reserve: 'Reserve',
    noProperties: 'No properties found',
    connecting: 'Connecting to database pipeline...',
    errorMsg: 'Pipeline Error: Could not connect to homestays server.'
  },
  as: {
    home: 'হোম',
    exploreMap: 'মেপ চাওক',
    listProperty: 'সম্পত্তি তালিকাভুক্ত কৰক',
    mainTitle: 'যাচাই কৰা স্থানীয় হোমষ্টে',
    mainDesc: 'স্বচ্ছতা, নিৰাপত্তা আৰু উষ্ণ আদৰণিৰ বাবে পৰীক্ষিত সম্পত্তি।',
    showingLabel: 'সক্ৰিয় সম্পত্তিৰ বিকল্প',
    reserve: 'বুক কৰক',
    noProperties: 'কোনো সম্পত্তি পোৱা নগ’ল',
    connecting: 'ডাটাবেছ সংযোগ কৰা হৈছে...',
    errorMsg: 'পাইপলাইন ত্ৰুটি: হোমষ্টে চাৰ্ভাৰৰ সৈতে সংযোগ কৰিব পৰা নগ’ল।'
  },
  hi: {
    home: 'होम',
    exploreMap: 'मैप देखें',
    listProperty: 'संपत्ति सूचीबद्ध करें',
    mainTitle: 'सत्यापित स्थानीय होमस्टे',
    mainDesc: 'स्वच्छता, सुरक्षा और आतिथ्य के लिए सत्यापित संपत्तियां।',
    showingLabel: 'सक्रिय संपत्ति विकल्प',
    reserve: 'आरक्षित करें',
    noProperties: 'कोई संपत्ति नहीं मिली',
    connecting: 'डेटाबेस से जुड़ रहा है...',
    errorMsg: 'पाइपलाइन त्रुटि: होमस्टे सर्वर से कनेक्ट नहीं हो सका।'
  }
};

function resolveImageUrl(imagePath?: string, imagesList?: string[]): string {
  const defaultImg = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
  let raw = imagePath;

  if (!raw && imagesList && imagesList.length > 0) {
    raw = imagesList[0];
  }

  if (!raw) return defaultImg;

  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
    return raw;
  }

  const cleanPath = raw.startsWith('/') ? raw : `/${raw}`;
  return `${BACKEND_URL}${cleanPath}`;
}

export default function HomePage() {
  const [properties, setProperties] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');

  const t = dictionary[currentLang] || dictionary.en;

  useEffect(() => {
    const savedLang = (localStorage.getItem('preferredLang') as Language) || 'en';
    setCurrentLang(savedLang);
  }, []);

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('preferredLang', lang);
  };

  useEffect(() => {
    async function fetchVerifiedHomestays() {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(`${BACKEND_URL}/api/homestays`);
        if (!response.ok) throw new Error('Network error');

        const result = await response.json();
        const dataList: Homestay[] = Array.isArray(result)
          ? result
          : result && Array.isArray(result.data)
          ? result.data
          : [];

        setProperties(dataList);
      } catch (err) {
        console.error('Failed to fetch homestays:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchVerifiedHomestays();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col justify-between antialiased">
      {/* Header Navigation */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
              Stay<span className="text-teal-600">Guwahati</span>
            </span>
          </Link>

          {/* Navigation Links & Language Selector */}
          <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-600 overflow-x-auto no-scrollbar py-1">
            <Link
              href="/"
              className="text-teal-600 border-b-2 border-teal-600 pb-1 font-bold whitespace-nowrap"
            >
              {t.home}
            </Link>
            <Link
              href="/map"
              className="hover:text-teal-600 transition pb-1 whitespace-nowrap flex items-center gap-1"
            >
              <Map className="w-3.5 h-3.5" />
              <span>{t.exploreMap}</span>
            </Link>
            <Link
              href="/add-property"
              className="hover:text-teal-600 transition pb-1 whitespace-nowrap flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.listProperty}</span>
            </Link>

            <select
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value as Language)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none shrink-0"
            >
              <option value="en">English</option>
              <option value="as">অসমীয়া</option>
              <option value="hi">हिंदी</option>
            </select>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t.mainTitle}
            </h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm md:text-base font-medium">
              {t.mainDesc}
            </p>
          </div>
          <div className="bg-teal-50 text-teal-700 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold border border-teal-100 self-start sm:self-auto">
            Showing <span className="font-extrabold">{properties.length}</span> {t.showingLabel}
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-400 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-3" />
              <p className="text-xs sm:text-sm">{t.connecting}</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12 text-rose-500 bg-rose-50 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-rose-100">
              <AlertCircle className="w-4 h-4" />
              <span>{t.errorMsg}</span>
            </div>
          ) : properties.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Hotel className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-xs sm:text-sm">{t.noProperties}</p>
            </div>
          ) : (
            properties.map((stay) => {
              const imgSrc = resolveImageUrl(stay.image, stay.images);
              const localityText = stay.locality || stay.location || 'Guwahati';

              return (
                <div
                  key={stay._id}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col group"
                >
                  <div className="relative overflow-hidden aspect-[4/3] bg-slate-100">
                    <img
                      src={imgSrc}
                      alt={stay.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
                      }}
                    />
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600 inline" />
                        {localityText}
                      </span>
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 mt-1 truncate">
                        {stay.title}
                      </h3>
                    </div>
                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-lg sm:text-xl font-black text-slate-900">
                        ₹{stay.pricePerNight}
                      </span>

                      <Link
                        href={`/book-stay?id=${stay._id}`}
                        className="bg-slate-900 hover:bg-teal-600 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm"
                      >
                        {t.reserve}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-5 px-3 text-xs text-slate-400 border-t border-slate-100 bg-white mt-12 shrink-0">
        &copy; 2026 StayGuwahati Platform Unified Core Engine. All rights reserved.
      </footer>
    </div>
  );
}