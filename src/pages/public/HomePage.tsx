/**
 * DANASI OPPORTUNITY HUB — Public Home Page
 * Founder: NDAYIZEYE Samuel
 */

import React from 'react';
import { useTranslation } from '../../translations/index.tsx';
import {
  GraduationCap,
  Briefcase,
  Globe,
  Award,
  Compass,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuth }) => {
  const { t } = useTranslation();

  const categories = [
    {
      id: 'scholarships',
      title: t('categories.scholarships'),
      desc: t('categories.scholarshipsDesc'),
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-700 border-blue-100'
    },
    {
      id: 'jobs',
      title: t('categories.jobs'),
      desc: t('categories.jobsDesc'),
      icon: Briefcase,
      color: 'bg-amber-50 text-amber-800 border-amber-100'
    },
    {
      id: 'remote',
      title: t('categories.remote'),
      desc: t('categories.remoteDesc'),
      icon: Globe,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-100'
    },
    {
      id: 'internships',
      title: t('categories.internships'),
      desc: t('categories.internshipsDesc'),
      icon: Award,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-100'
    },
    {
      id: 'fellowships',
      title: t('categories.fellowships'),
      desc: t('categories.fellowshipsDesc'),
      icon: Compass,
      color: 'bg-sky-50 text-sky-700 border-sky-100'
    },
    {
      id: 'grants',
      title: t('categories.grants'),
      desc: t('categories.grantsDesc'),
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-700 border-purple-100'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-hidden py-16 lg:py-24">
        {/* Subtle geometric background accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Concrete Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-md">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{t('hero.badge')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
                {t('hero.title')}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                {t('hero.subtitle')}
              </p>

              {/* Founder Signature Kicker */}
              <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
                <span className="text-slate-200 font-medium">Directed by {t('founderName')}</span>
                <span aria-hidden="true">·</span>
                <span>Kigali, Rwanda</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-medium">Pan-African & Global Reach</span>
              </div>

              {/* CTAs */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('opportunities')}
                  className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>{t('hero.primaryCta')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-6 py-3 text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap shrink-0"
                >
                  {t('hero.secondaryCta')}
                </button>
              </div>
            </div>

            {/* Right Column: Visual Focal Carrier with Zero-Broken-Image Fallback */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3]">
                <img
                  src="/src/assets/images/hero_danasi_global_1794036198786.jpg"
                  alt="Scholars and professionals reviewing global opportunities at DANASI OPPORTUNITY HUB"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-200 flex items-center justify-between">
                  <span className="font-medium">DANASI Opportunity Pavilion</span>
                  <span className="text-amber-400 font-medium">Phase 1 Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width 4-Column Proof & Metrics Strip */}
          <div className="mt-14 pt-10 border-t border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-slate-400">{t('hero.statPillars')}</p>
              <p className="text-2xl font-bold text-white font-mono tabular-nums">06 Sectors</p>
              <p className="text-[11px] text-slate-400">Jobs, scholarships, grants & more</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400">{t('hero.statReach')}</p>
              <p className="text-2xl font-bold text-white font-mono tabular-nums">190+ Countries</p>
              <p className="text-[11px] text-slate-400">Rwanda to international hubs</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400">Security Invariant</p>
              <p className="text-2xl font-bold text-white font-mono tabular-nums">100% Vetted</p>
              <p className="text-[11px] text-slate-400">Zero recruitment fee policy</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400">Platform Languages</p>
              <p className="text-2xl font-bold text-white font-mono tabular-nums">3 Languages</p>
              <p className="text-[11px] text-slate-400">English, Kinyarwanda, French</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MISSION & FOUNDER INTRODUCTION */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t('mission.heading')}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              {t('mission.lead')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t('mission.pillar1Title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('mission.pillar1Desc')}
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t('mission.pillar2Title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('mission.pillar2Desc')}
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {t('mission.pillar3Title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('mission.pillar3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE OPPORTUNITY CATEGORIES */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {t('categories.heading')}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2">
                {t('categories.subheading')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-sm font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>{t('common.viewAll')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => onNavigate(cat.id === 'jobs' || cat.id === 'remote-jobs' ? 'jobs' : 'opportunities')}
                  className="p-6 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center border ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-blue-700">Explore Pathway</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-blue-700" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. HOW DANASI WORKS */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t('howItWorks.heading')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {t('howItWorks.subheading')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <span className="text-3xl font-bold text-blue-700 font-mono">
                {t('howItWorks.step1Num')}
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {t('howItWorks.step1Title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('howItWorks.step1Desc')}
              </p>
            </div>

            <div className="space-y-4">
              <span className="text-3xl font-bold text-amber-600 font-mono">
                {t('howItWorks.step2Num')}
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {t('howItWorks.step2Title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('howItWorks.step2Desc')}
              </p>
            </div>

            <div className="space-y-4">
              <span className="text-3xl font-bold text-emerald-600 font-mono">
                {t('howItWorks.step3Num')}
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {t('howItWorks.step3Title')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('howItWorks.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE DANASI & TRUST VERIFICATION */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Lock className="w-4 h-4" />
                <span>Zero-Tolerance Fraud Protection</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                {t('whyChoose.heading')}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {t('whyChoose.subheading')}
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{t('whyChoose.reason1Title')}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{t('whyChoose.reason1Desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{t('whyChoose.reason2Title')}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{t('whyChoose.reason2Desc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{t('whyChoose.reason3Title')}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{t('whyChoose.reason3Desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                  <Building2 className="w-6 h-6 text-blue-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Institutional Oversight</h4>
                    <p className="text-xs text-slate-400">Founded in Rwanda · Serving Worldwide</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  DANASI OPPORTUNITY HUB operates under direct project ownership of <strong>NDAYIZEYE Samuel</strong>. We collaborate with accredited educational establishments, certified scholarship funds, and verified global employers to create authentic socio-economic pathways.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => onNavigate('contact')}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap text-center"
                  >
                    Partnership & Listing Inquiries
                  </button>
                  <button
                    onClick={() => onNavigate('about')}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors whitespace-nowrap text-center"
                  >
                    Read Platform Mission
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Begin Your International Journey with DANASI Today
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto">
            Create your candidate profile, configure your educational background, and be primed as verified scholarship and job cycles open.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3 text-sm font-bold text-blue-900 bg-white hover:bg-slate-100 rounded-lg shadow-md transition-all whitespace-nowrap"
            >
              {t('common.joinPlatform')}
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 text-sm font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap"
            >
              {t('nav.contact')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
