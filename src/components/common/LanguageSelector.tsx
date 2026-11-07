/**
 * DANASI OPPORTUNITY HUB — Language Selector
 * Supports: English, Kinyarwanda, Français
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, LANGUAGE_OPTIONS } from '../../translations/index.tsx';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LanguageCode } from '../../types/index.ts';

interface LanguageSelectorProps {
  variant?: 'light' | 'dark';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'dark' }) => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const isLight = variant === 'light';

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
          isLight
            ? 'bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700/80'
            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="hidden sm:inline">{currentOption.flag}</span>
        <span className="whitespace-nowrap font-medium">{currentOption.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = option.code === language;
            return (
              <button
                key={option.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{option.flag}</span>
                  <span>{option.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
