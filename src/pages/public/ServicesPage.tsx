/**
 * DANASI OPPORTUNITY HUB — Career & Application Services
 * Founder: NDAYIZEYE Samuel
 */

import React from 'react';
import { useTranslation } from '../../translations/index.tsx';
import {
  FileText,
  MailCheck,
  CheckCheck,
  CalendarDays,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Layers
} from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (route: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { t } = useTranslation();

  const services = [
    {
      id: 'cv_builder',
      title: t('servicesPage.cvBuilderTitle'),
      desc: t('servicesPage.cvBuilderDesc'),
      icon: FileText,
      specs: [
        'ATS-Compliant Parsing Standards (Workday, Taleo, Greenhouse)',
        'European Europass & North American 1-Page Layouts',
        'Direct Export to PDF & Word Format'
      ],
      phase: 'Module 3 — Career AI'
    },
    {
      id: 'cover_letter',
      title: t('servicesPage.coverLetterTitle'),
      desc: t('servicesPage.coverLetterDesc'),
      icon: MailCheck,
      specs: [
        'Tailored Motivation Letters for Erasmus Mundus & Chevening',
        'Academic Statement of Purpose (SOP) Templates',
        'Tone Calibration: Corporate, Academic, or Non-Profit'
      ],
      phase: 'Module 3 — Career AI'
    },
    {
      id: 'eligibility_checker',
      title: t('servicesPage.eligibilityTitle'),
      desc: t('servicesPage.eligibilityDesc'),
      icon: CheckCheck,
      specs: [
        'Automated GPA Conversion (Rwanda 5.0, UK 1st Class, US 4.0)',
        'Language Proficiency Requirement Analysis (IELTS, TOEFL, Duolingo)',
        'Country of Origin Eligibility Matrices'
      ],
      phase: 'Module 4 — Hidden AI'
    },
    {
      id: 'tracker',
      title: t('servicesPage.trackerTitle'),
      desc: t('servicesPage.trackerDesc'),
      icon: CalendarDays,
      specs: [
        'Centralized Application Kanban Board',
        'Automated Email & Telegram Deadline Reminders',
        'Secure Cloud Storage for Transcripts & Recommendation Letters'
      ],
      phase: 'Module 5 — Application Tracker'
    },
    {
      id: 'interview_prep',
      title: 'Interview Simulation & Coaching',
      desc: 'AI-assisted and mentor-guided mock interviews covering standard behavioral, technical, and scholarship committee questions.',
      icon: Users,
      specs: [
        'STAR Method Response Evaluation',
        'Scholarship Panel Behavioral Question Bank',
        'Industry-Specific Technical Prompts'
      ],
      phase: 'Module 3 — Career AI'
    },
    {
      id: 'career_development',
      title: 'Global Career Development Pathway',
      desc: 'Comprehensive roadmaps guiding scholars from secondary school through university graduation into multinational employment.',
      icon: Compass,
      specs: [
        'Quarterly Career Milestones & Skill Gap Audits',
        'Direct Mentorship Pairing with Global Rwandan Diaspora',
        'Cross-Border Remote Work Transition Frameworks'
      ],
      phase: 'Module 6 — DANASI Business'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
            <Layers className="w-3.5 h-3.5" />
            <span>Professional Career Development Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('servicesPage.title')}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            {t('servicesPage.subtitle')}
          </p>
        </div>

        {/* Foundation Notice */}
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-950 space-y-1">
            <p className="font-bold">Phase 1 Infrastructure Scope</p>
            <p className="leading-relaxed text-amber-900">
              {t('servicesPage.notice')}
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {svc.phase}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{svc.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{svc.desc}</p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-700">Planned Architectural Features:</p>
                    <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
                      {svc.specs.map((s, idx) => (
                        <li key={idx} className="truncate">{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-amber-700 font-semibold text-[11px]">Under Active Development</span>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Early Access</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise & Institutional Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Are you an Educational Institution or Employer?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              DANASI OPPORTUNITY HUB partners with universities, scholarship funds, and employers seeking vetted, disciplined candidates from Rwanda and across Africa.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="px-6 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-md whitespace-nowrap transition-colors"
          >
            Submit Institutional Inquiries
          </button>
        </div>
      </div>
    </div>
  );
};
