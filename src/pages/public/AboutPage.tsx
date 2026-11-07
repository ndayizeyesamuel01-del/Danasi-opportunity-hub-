/**
 * DANASI OPPORTUNITY HUB — About Us Page
 * Founder: NDAYIZEYE Samuel
 */

import React from 'react';
import { useTranslation } from '../../translations/index.tsx';
import { ShieldCheck, Target, Eye, HeartHandshake, Globe2, Compass, Award } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (route: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Kicker */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Kigali, Rwanda · Pan-African · Worldwide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('about.title')}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t('about.missionTitle')}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('about.missionText')}
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t('about.visionTitle')}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('about.visionText')}
            </p>
          </div>
        </div>

        {/* Founder Section */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Portrait Column */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-slate-800">
                <img
                  src="/src/assets/images/founder_ndayizeye_samuel_1794036199140.jpg"
                  alt="NDAYIZEYE Samuel — Founder and Project Owner of DANASI OPPORTUNITY HUB"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-sm font-bold text-white tracking-wide">NDAYIZEYE Samuel</p>
                  <p className="text-xs text-amber-400 font-medium">Founder & Project Owner</p>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-block px-3 py-1 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                {t('about.founderHeading')}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                NDAYIZEYE Samuel
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {t('about.founderBio')}
              </p>

              <blockquote className="border-l-2 border-amber-400 pl-4 italic text-sm text-slate-300">
                "Our youth hold boundless brilliance. What they have lacked is not intelligence or ambition, but a transparent, uncorrupted gateway to the world’s scholarship halls and professional arenas. DANASI was founded to be that unbreakable bridge."
              </blockquote>

              <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Award className="w-4 h-4 text-amber-400" />
                  Direct Institutional Governance
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Compass className="w-4 h-4 text-blue-400" />
                  Kigali to Global Footprint
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t('about.valuesTitle')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              The institutional principles that govern every feature, listing, and partnership on DANASI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">{t('about.valIntegrity')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('about.valIntegrityDesc')}</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3">
              <Globe2 className="w-8 h-8 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">{t('about.valAccessibility')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('about.valAccessibilityDesc')}</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3">
              <Award className="w-8 h-8 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">{t('about.valExcellence')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('about.valExcellenceDesc')}</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3">
              <HeartHandshake className="w-8 h-8 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">{t('about.valEmpowerment')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('about.valEmpowermentDesc')}</p>
            </div>
          </div>
        </div>

        {/* Global Impact Objectives */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Global Impact Objectives (2026–2030)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">01. Academic Access</h4>
              <p className="leading-relaxed">
                Connect over 50,000 qualified African scholars with verified, fully-funded bachelor, master, and doctoral degree opportunities worldwide.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">02. Cross-Border Employment</h4>
              <p className="leading-relaxed">
                Foster legitimate international remote and on-site career pathways that preserve domestic talent while providing global compensation.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">03. Application Equity</h4>
              <p className="leading-relaxed">
                Provide open-access tools and training so that high-caliber candidates without wealthy networks can compete on equal merit.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between">
            <p className="text-xs text-slate-500">
              Want to support or partner with DANASI OPPORTUNITY HUB?
            </p>
            <button
              onClick={() => onNavigate('contact')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              Contact Project Leadership
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
