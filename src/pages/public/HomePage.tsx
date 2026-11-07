/**
 * DANASI OPPORTUNITY HUB — Complete Professional Homepage
 * Official Platform Identity: DANASITECHNICALCOLLEGE
 * Tagline: Your Gateway to Jobs, Scholarships & Global Opportunities.
 */

import React, { useState } from 'react';
import { useTranslation } from '../../translations/index.tsx';
import heroImg from '../../assets/images/hero_danasi_global_1794036198786.jpg';
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
  Building2,
  FileText,
  Search,
  MessageCircle,
  BookOpen,
  CheckSquare,
  Flame,
  ChevronRight,
  Landmark,
  HeartHandshake
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuth }) => {
  const { t } = useTranslation();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCategory, setSearchCategory] = useState('ALL');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('jobs');
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-600 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white overflow-hidden py-16 lg:py-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-md">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>DANASITECHNICALCOLLEGE · Verified Global Opportunities</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
                Your Gateway to Jobs, Scholarships & Global Opportunities.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Connecting talented individuals across Rwanda, Africa, and worldwide with vetted employment, remote careers, university scholarships, fellowships, and comprehensive career tools.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('jobs')}
                  className="px-6 py-3 text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                >
                  Browse All Vacancies
                </button>
                <a
                  href="https://wa.me/250792772425?text=Hello%20DANASI%20Support!%20I%20need%20assistance%20with%20your%20platform."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp (+250792772425)</span>
                </a>
              </div>
            </div>

            {/* Focal Hero Banner Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3]">
                <img
                  src={heroImg}
                  alt="Scholars reviewing global opportunities at DANASI OPPORTUNITY HUB"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-white">DANASI Global Pavilion</span>
                  <span className="text-amber-400 font-medium">DANASITECHNICALCOLLEGE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH OPPORTUNITIES SECTION */}
      <section className="py-8 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearchSubmit} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search job title, skills, organization, or country..."
                className="w-full pl-10 pr-4 py-2.5 text-xs text-white bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="px-3 py-2.5 text-xs text-white bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="rwanda-jobs">Rwanda Jobs</option>
              <option value="remote-jobs">Remote Work</option>
              <option value="government-jobs">Government of Rwanda (MIFOTRA)</option>
              <option value="ngo-jobs">NGO & United Nations</option>
              <option value="scholarships">University Scholarships</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors whitespace-nowrap"
            >
              Search Opportunities
            </button>
          </form>
        </div>
      </section>

      {/* 3. LATEST JOBS SPOTLIGHT */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Featured Listings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Latest Verified Vacancies</h2>
            </div>
            <button
              onClick={() => onNavigate('jobs')}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800"
            >
              <span>Explore All Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Senior Cloud Systems Architect', org: 'Rwanda Development Board', loc: 'Kigali, Rwanda', type: 'Full-Time', salary: 'RWF 2,400,000 - 3,200,000' },
              { title: 'Digital Transformation Specialist', org: 'MINICT (MIFOTRA)', loc: 'Kigali, Rwanda', type: 'Public Service', salary: 'Statutory Grade A1' },
              { title: 'Senior Technical Lead', org: 'Irembo Technologies', loc: 'Kigali / Hybrid', type: 'Full-Time', salary: 'Competitive Tech Package' }
            ].map((j, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white shadow-sm transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full uppercase">{j.type}</span>
                  <h3 className="text-base font-bold text-slate-900">{j.title}</h3>
                  <p className="text-xs font-semibold text-blue-700">{j.org}</p>
                  <p className="text-xs text-slate-500">{j.loc} · {j.salary}</p>
                </div>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="w-full py-2 text-xs font-bold text-slate-800 hover:text-white bg-slate-200 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  View Details & Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. REMOTE WORK & GLOBAL CAREERS */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Distributed Employment</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Work From Anywhere Worldwide</h2>
            </div>
            <button
              onClick={() => onNavigate('jobs')}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-800"
            >
              <span>Browse Remote Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Staff Site Reliability Engineer', org: 'GitLab Global', loc: 'Worldwide Remote', salary: '$120,000 - $150,000 / yr', src: 'Remotive API' },
              { title: 'Senior React / TypeScript Engineer', org: 'European Tech Partner', loc: 'Remote (Europe & Africa)', salary: '€65,000 - €85,000 / yr', src: 'Arbeitnow' },
              { title: 'International Product Manager', org: 'Remote Global Corp', loc: 'Global Remote', salary: '$90,000 - $110,000 / yr', src: 'Adzuna Global' }
            ].map((r, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Remote</span>
                    <span>Source: {r.src}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{r.title}</h3>
                  <p className="text-xs font-semibold text-slate-700">{r.org}</p>
                  <p className="text-xs text-slate-500">{r.salary}</p>
                </div>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="w-full py-2 text-xs font-bold text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-700 rounded-xl transition-colors border border-indigo-200"
                >
                  Direct Application Link
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SCHOLARSHIPS & HIGHER EDUCATION */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Academic Pathways</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">International University Scholarships</h2>
            </div>
            <button
              onClick={() => onNavigate('opportunities')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>Explore Scholarships</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Mastercard Foundation Scholars Program', org: 'African Leadership Academy & Partners', level: "Master's Degree", benefit: 'Fully Funded (Tuition, Stipend, Flights)' },
              { title: 'Chevening International Excellence Award', org: 'UK Foreign & Commonwealth Office', level: "Master's Degree", benefit: 'Full UK University Tuition & Living Allowance' },
              { title: 'Erasmus Mundus Joint Master Degrees', org: 'European Commission', level: 'Joint European Master', benefit: 'Full Study Grant across 3 European Countries' }
            ].map((s, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white shadow-sm transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">{s.level}</span>
                  <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs font-semibold text-emerald-700">{s.org}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.benefit}</p>
                </div>
                <button
                  onClick={() => onNavigate('opportunities')}
                  className="w-full py-2 text-xs font-bold text-emerald-800 hover:text-white bg-emerald-100 hover:bg-emerald-700 rounded-xl transition-colors"
                >
                  Scholarship Criteria & Dates
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. INTERNSHIPS & CIVIC FELLOWSHIPS */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Early Career Traineeships</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Internships & Civic Fellowships</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Structured leadership cohorts and graduate traineeships designed for university scholars.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded uppercase">6-Month Traineeship</span>
              <h3 className="text-base font-bold text-slate-900">Youth Education & Strategy Internship</h3>
              <p className="text-xs font-semibold text-sky-700">Mastercard Foundation Africa Hub (Kigali)</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Work alongside education specialists to monitor higher-education scholarship cohorts across Africa. Monthly traineeship allowance with health and transport coverage.
              </p>
              <button onClick={() => onNavigate('opportunities')} className="text-xs font-bold text-blue-700 hover:underline">
                View Requirements →
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded uppercase">12-Month Fellowship</span>
              <h3 className="text-base font-bold text-slate-900">Regional Climate Policy & Resilience Fellow</h3>
              <p className="text-xs font-semibold text-purple-700">United Nations Development Programme (UNDP)</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conduct field data collection and contribute to multilateral policy briefs on climate resilience across East and Central Africa with international UN mentors.
              </p>
              <button onClick={() => onNavigate('opportunities')} className="text-xs font-bold text-blue-700 hover:underline">
                View Requirements →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GOVERNMENT & NGO OPPORTUNITIES */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <Landmark className="w-3.5 h-3.5" />
                <span>Public Sector & Multilateral</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Official Government & NGO Careers</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                DANASI aggregates official vacancies published by the Government of Rwanda Ministry of Public Service and Labour (MIFOTRA), Rwanda Revenue Authority, Rwanda Development Board, United Nations agencies (UNDP, UNICEF), and multilateral non-profits.
              </p>
              <div className="space-y-2 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Direct redirect to official government e-recruitment systems (recruitment.mifotra.gov.rw).</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero fees or intermediary recruitment charges.</span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('jobs')}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  View Public Sector Openings
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Official Institutional Portals</h3>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">MIFOTRA E-Recruitment Portal</p>
                    <p className="text-[11px] text-slate-500">Government of Rwanda Public Service</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Gov Rwanda</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">United Nations Careers (Inspira)</p>
                    <p className="text-[11px] text-slate-500">UN Secretariat & Regional Agencies</p>
                  </div>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">UN Global</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CAREER PREPARATION SUITE (CV, COVER LETTER, MOTIVATION LETTER, INTERVIEW PREP) */}
      <section className="py-20 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">DANASI Career Engine</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mt-1">
              Professional Application Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Equip your candidate profile with international standard ATS resumes, tailored cover letters, and interview coaching.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">ATS CV Builder</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Keyword-optimized resume templates formatted for global corporate and university applicant tracking systems.
              </p>
              <button onClick={() => onNavigate('services')} className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                Launch CV Tool →
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Cover Letter Builder</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Structured value-proposition letters tailored specifically to hiring managers and corporate recruitment committees.
              </p>
              <button onClick={() => onNavigate('services')} className="text-xs font-semibold text-amber-400 hover:text-amber-300">
                Draft Cover Letter →
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Motivation Letter</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compelling academic statements of purpose designed for Chevening, Mastercard Foundation, and Erasmus applications.
              </p>
              <button onClick={() => onNavigate('services')} className="text-xs font-semibold text-purple-400 hover:text-purple-300">
                Generate Statement →
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Interview Coaching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                STAR-method competency frameworks and typical behavioral scenarios for international interviews.
              </p>
              <button onClick={() => onNavigate('services')} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                Practice Scenarios →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. APPLICATION TRACKING & CANDIDATE MILESTONES */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Candidate Portal Feature</span>
              <h2 className="text-2xl font-bold">Personal Job & Scholarship Application Tracker</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Keep every opportunity organized from initial bookmarking through document preparation, submission, interviews, and offer letters. Never miss an international deadline again.
              </p>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all whitespace-nowrap shadow"
            >
              Open Application Tracker
            </button>
          </div>
        </div>
      </section>

      {/* 10. WHY CHOOSE DANASI & INSTITUTIONAL TRUST */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Why Candidates & Institutions Choose DANASI
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Organized under DANASITECHNICALCOLLEGE to safeguard African youth from deceptive employment schemes while opening legitimate international pathways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero Recruitment Fees</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict invariant: no candidate is ever charged an application or recruitment fee. Any fee-soliciting listings are permanently barred.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Direct Employer Links</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every listed vacancy directs candidates directly to the authentic hiring portal or government gazette with zero deceptive intermediate links.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Global & Remote Focus</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Curated remote tech, design, writing, and institutional positions allowing African talent to earn competitive global compensation from home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. DEDICATED WHATSAPP & DIRECT SUPPORT BANNER */}
      <section className="py-16 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Need Direct Application Assistance?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Our support desk is available on WhatsApp and verified email for candidate guidance, employer partnership listings, and institutional verification inquiries.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/250792772425?text=Hello%20DANASI%20Support!%20I%20need%20assistance%20with%20your%20platform."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp (+250792772425)</span>
            </a>
            <a
              href="mailto:danasitechnicalcollege@gmail.com"
              className="px-6 py-3 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
            >
              Email Support (danasitechnicalcollege@gmail.com)
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
