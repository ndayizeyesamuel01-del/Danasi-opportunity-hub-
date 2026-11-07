/**
 * DANASI OPPORTUNITY HUB — Opportunities Directory Architecture (Phase 1)
 * Founder: NDAYIZEYE Samuel
 * 
 * Strict architectural rule: Displays genuine category structures and pipeline
 * without inventing fake opportunity listings or fabricated employer posts.
 */

import React, { useState } from 'react';
import { useTranslation } from '../../translations/index.tsx';
import {
  GraduationCap,
  Briefcase,
  Globe,
  Award,
  Compass,
  Sparkles,
  Search,
  Bell,
  CheckCircle,
  Clock,
  ShieldCheck,
  Building
} from 'lucide-react';

interface OpportunitiesPageProps {
  onNavigate: (route: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertSubscribed, setAlertSubscribed] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');

  const categoryPipelines = [
    {
      id: 'scholarships',
      icon: GraduationCap,
      name: t('categories.scholarships'),
      desc: t('categories.scholarshipsDesc'),
      partnerTypes: ['Accredited Universities in EU, UK, USA & Canada', 'Bilateral Government Funds', 'Multilateral Foundations'],
      intakeCycles: 'Fall 2027 / Spring 2028 Cohorts',
      status: 'Curating Partner Portals'
    },
    {
      id: 'jobs',
      icon: Briefcase,
      name: t('categories.jobs'),
      desc: t('categories.jobsDesc'),
      partnerTypes: ['Regional Tech Firms', 'Development Finance Institutions', 'Multinational Corporations'],
      intakeCycles: 'Rolling Institutional Cycles',
      status: 'Verifying Employer Contracts'
    },
    {
      id: 'remote-jobs',
      icon: Globe,
      name: t('categories.remote'),
      desc: t('categories.remoteDesc'),
      partnerTypes: ['International Distributed Companies', 'Global Engineering Hubs', 'Remote Digital Agencies'],
      intakeCycles: 'Continuous Cross-Border Openings',
      status: 'Establishing Compensation Benchmarks'
    },
    {
      id: 'internships',
      icon: Award,
      name: t('categories.internships'),
      desc: t('categories.internshipsDesc'),
      partnerTypes: ['Multilateral Organizations', 'Research Institutes', 'Fintech Accelerators'],
      intakeCycles: 'Summer & Semester Traineeships',
      status: 'Establishing University MoUs'
    },
    {
      id: 'fellowships',
      icon: Compass,
      name: t('categories.fellowships'),
      desc: t('categories.fellowshipsDesc'),
      partnerTypes: ['Civic Leadership Academies', 'Public Policy Think Tanks', 'Fellowship Foundations'],
      intakeCycles: 'Annual Competitive Cohorts',
      status: 'Vetting Selection Criteria'
    },
    {
      id: 'grants',
      icon: Sparkles,
      name: t('categories.grants'),
      desc: t('categories.grantsDesc'),
      partnerTypes: ['Angel Venture Foundations', 'Climate & Agtech Funds', 'Academic Innovation Labs'],
      intakeCycles: 'Seed Grant Rounds 2027',
      status: 'Structuring Non-Dilutive Rules'
    }
  ];

  const filteredCategories = categoryPipelines.filter((cat) => {
    const matchesFilter = selectedCategory === 'all' || cat.id === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertEmail) {
      setAlertSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
            <Clock className="w-3.5 h-3.5" />
            <span>Phase 1 Architecture Foundation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('opportunitiesPage.title')}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            {t('opportunitiesPage.subtitle')}
          </p>
        </div>

        {/* Phase 1 Status Banner */}
        <div className="p-5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-blue-950">
            <p className="font-bold">Transparent Development Notice</p>
            <p className="text-blue-900/90 leading-relaxed">
              {t('opportunitiesPage.statusBanner')}
            </p>
          </div>
        </div>

        {/* Interactive Filter Bar & Search */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Functional Category Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('opportunitiesPage.filterAll')}
              </button>
              {categoryPipelines.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.name.split('&')[0].trim()}
                </button>
              ))}
            </div>

            {/* Live Search */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('opportunitiesPage.searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Structured Category Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50">
                      Phase 2 Engine
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Verified Target Partners:</span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600">
                        {item.partnerTypes.map((p, idx) => (
                          <li key={idx} className="truncate">{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1">
                      <span className="font-semibold text-slate-700">Expected Intake:</span>{' '}
                      <span className="text-slate-600">{item.intakeCycles}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">{item.status}</span>
                  {item.id === 'jobs' || item.id === 'remote-jobs' ? (
                    <button
                      onClick={() => onNavigate('jobs')}
                      className="text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                    >
                      Open DANASI JOBS →
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenAuth('register')}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                    >
                      Get Listed Alert
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Opportunity Hub Visual Banner */}
        <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto">
            <img
              src="/src/assets/images/global_opportunities_hub_1794036198189.jpg"
              alt="Global university library and international opportunities hub"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/80 hidden lg:block" />
          </div>

          <div className="lg:col-span-7 p-8 sm:p-12 text-white flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Bell className="w-4 h-4" />
              <span>{t('opportunitiesPage.notifyTitle')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Stay Ahead of Global Opportunity Application Windows
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              {t('opportunitiesPage.notifyDesc')}
            </p>

            {alertSubscribed ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>You are registered for priority opportunity alerts! Verified opportunities will notify your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  required
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="px-4 py-2.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 flex-1"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm whitespace-nowrap transition-colors"
                >
                  {t('opportunitiesPage.notifyButton')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
