'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://stayguwahati-backend.onrender.com';

type Language = 'en' | 'as' | 'hi';

const dictionary = {
  en: {
    login: 'Welcome Back',
    sub: 'Access your secure profile pipeline',
    email: 'Email Address',
    pass: 'Password',
    rem: 'Remember session',
    forg: 'Forgot password?',
    btn: 'Secure Access',
    reg: 'New to our network?',
    regLink: 'Create an account',
    invalidCreds: 'Invalid credentials',
    authenticating: 'Authenticating...',
    serverError: 'Server communication error',
  },
  as: {
    login: 'নমস্কাৰ',
    sub: 'আপোনাৰ সুৰক্ষিত প্ৰফাইল পাইপলাইনত প্ৰৱেশ কৰক',
    email: 'ইমেইল ঠিকনা',
    pass: 'পাছৱৰ্ড',
    rem: 'ছেছন মনত ৰাখক',
    forg: 'পাছৱৰ্ড পাহৰিলে?',
    btn: 'সুৰক্ষিত প্ৰৱেশ',
    reg: 'নেটৱৰ্কত নতুন?',
    regLink: 'একাউন্ট সৃষ্টি কৰক',
    invalidCreds: 'অবৈধ ক্ৰেডেনচিয়েল',
    authenticating: 'প্ৰমাণীকৰণ কৰা হৈছে...',
    serverError: 'চাৰ্ভাৰ যোগাযোগৰ ত্ৰুটি',
  },
  hi: {
    login: 'नमस्ते',
    sub: 'अपने सुरक्षित प्रोफ़ाइल पाइपलाइन तक पहुंचें',
    email: 'ईमेल पता',
    pass: 'पासवर्ड',
    rem: 'सत्र याद रखें',
    forg: 'पासवर्ड भूल गए?',
    btn: 'सुरक्षित प्रवेश',
    reg: 'नेटवर्क में नए हैं?',
    regLink: 'खाता बनाएं',
    invalidCreds: 'अमान्य क्रेडेंशियल',
    authenticating: 'प्रमाणित किया जा रहा है...',
    serverError: 'सर्वर संचार त्रुटि',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = dictionary[currentLang] || dictionary.en;

  useEffect(() => {
    const savedLang = (localStorage.getItem('preferredLanguage') as Language) || 'en';
    setCurrentLang(savedLang);

    // Check both localStorage and sessionStorage for existing sessions
    const token =
      sessionStorage.getItem('token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('authToken') ||
      localStorage.getItem('authToken');

    const userProfileStr =
      sessionStorage.getItem('userProfile') || localStorage.getItem('userProfile');

    if (token && userProfileStr) {
      try {
        const user = JSON.parse(userProfileStr);
        const userRole = String(user.role || user.type || '').toLowerCase();
        const isAdmin = userRole === 'admin' || user.isAdmin === true || user.isAdmin === 'true';

        router.push(isAdmin ? '/admin' : '/dashboard');
      } catch (e) {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && (data.token || data.accessToken || data.data?.token)) {
        const token = data.token || data.accessToken || data.data?.token;
        const user = data.user || data.profile || data.data?.user || data.data || {};

        // Store tokens across BOTH localStorage and sessionStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userProfile', JSON.stringify(user));
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('userProfile', JSON.stringify(user));

        // Robust role detection logic
        const userRole = String(user.role || user.type || '').toLowerCase();
        const isAdmin = userRole === 'admin' || user.isAdmin === true || user.isAdmin === 'true';

        const activeRole = isAdmin ? 'admin' : 'traveler';
        localStorage.setItem('activeDashboardRole', activeRole);
        sessionStorage.setItem('activeDashboardRole', activeRole);

        // Force full refresh navigation to guarantee state clean load
        if (isAdmin) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setErrorMessage(data.message || t.invalidCreds);
      }
    } catch (err: any) {
      setErrorMessage(err.message || t.serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
            <span className="text-lg sm:text-xl font-bold text-teal-800 tracking-tight">
              Stay<span className="text-teal-600">Guwahati</span>
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-xs font-bold text-gray-500">
            <select
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value as Language)}
              className="bg-gray-50 border border-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 font-semibold text-gray-700 cursor-pointer shadow-sm"
            >
              <option value="en">English</option>
              <option value="as">অসমীয়া</option>
              <option value="hi">हिंदी</option>
            </select>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full my-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="bg-teal-50 text-teal-600 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto text-xl sm:text-2xl mb-4 shadow-inner">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {t.login}
            </h1>
            <p className="text-gray-400 text-xs mt-1">{t.sub}</p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs p-3 rounded-xl mb-4 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                {t.email}
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                {t.pass}
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-medium pt-1">
              <label className="flex items-center gap-2 text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="accent-teal-600 rounded"
                />
                <span>{t.rem}</span>
              </label>
              <Link href="/forgot-password" className="text-teal-600 font-bold hover:underline">
                {t.forg}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-teal-600 text-white font-bold py-3 rounded-xl text-sm transition mt-2 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.authenticating}</span>
                </>
              ) : (
                <>
                  <span>{t.btn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center text-xs text-gray-500">
            <span>{t.reg}</span>{' '}
            <Link href="/register" className="text-teal-600 font-bold hover:underline">
              {t.regLink}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 px-4 text-[10px] text-gray-400 border-t border-gray-100 bg-white sm:bg-transparent sm:border-t-0">
        <p>&copy; 2026 StayGuwahati Platform Unified Core. All rights reserved.</p>
        <Link href="/privacy" className="hover:text-teal-600 underline mt-1 inline-block">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}