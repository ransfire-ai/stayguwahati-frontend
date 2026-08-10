'use client';

import React from 'react';
import { useLanguage, Language } from '@/context/LanguageContext';

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Language)}
      className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 transition cursor-pointer"
    >
      <option value="en">English</option>
      <option value="as">অসমীয়া (Assamese)</option>
      <option value="hi">हिंदी (Hindi)</option>
    </select>
  );
}