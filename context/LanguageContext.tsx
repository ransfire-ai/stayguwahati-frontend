'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Language = 'en' | 'as' | 'hi';

type Ctx = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const LanguageContext = createContext<Ctx | undefined>(undefined);

const STORAGE_KEY = 'stayguwahati-language';

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'as' || saved === 'hi') {
        setLangState(saved);
      }
    } catch {
      // Ignore storage access errors.
    }
  }, []);

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLang);
    } catch {
      // Ignore storage access errors.
    }
  };

  const value = useMemo(() => ({ lang, setLang }), [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): Ctx {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}
