/**
 * DANASI OPPORTUNITY HUB — Internationalization (i18n) Engine
 * Supported Languages: English (en), Kinyarwanda (rw), French (fr)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en.ts';
import { rw } from './rw.ts';
import { fr } from './fr.ts';
import { LanguageCode } from '../types/index.ts';

const dictionaries: Record<LanguageCode, any> = {
  en,
  rw,
  fr
};

export const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' }
];

interface TranslationContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (keyPath: string, fallback?: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

function detectInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('danasi_lang') as LanguageCode;
    if (saved && (saved === 'en' || saved === 'rw' || saved === 'fr')) {
      return saved;
    }
    const navLang = navigator.language?.toLowerCase() || '';
    if (navLang.startsWith('rw')) return 'rw';
    if (navLang.startsWith('fr')) return 'fr';
  } catch {
    // ignore
  }
  return 'en';
}

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(detectInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem('danasi_lang', language);
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
  };

  const t = (keyPath: string, fallback?: string): string => {
    const keys = keyPath.split('.');
    
    // Attempt lookup in current language
    let current: any = dictionaries[language];
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        current = undefined;
        break;
      }
    }

    if (typeof current === 'string') {
      return current;
    }

    // Fallback to English dictionary
    let enFallback: any = dictionaries.en;
    for (const k of keys) {
      if (enFallback && typeof enFallback === 'object' && k in enFallback) {
        enFallback = enFallback[k];
      } else {
        enFallback = undefined;
        break;
      }
    }

    if (typeof enFallback === 'string') {
      return enFallback;
    }

    return fallback || keyPath;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
