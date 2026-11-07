/**
 * DANASI OPPORTUNITY HUB — Legal & Governance Documentation
 * Founder: NDAYIZEYE Samuel
 */

import React, { useState } from 'react';
import { useTranslation } from '../../translations/index.tsx';
import { ShieldCheck, FileText, Cookie, AlertTriangle } from 'lucide-react';

export const LegalPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cookies' | 'disclaimer'>('privacy');

  return (
    <div className="min-h-screen bg-slate-50 py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Institutional Governance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Legal & Compliance Framework
          </h1>
          <p className="text-xs text-slate-500 mt-1">{t('legal.lastUpdated')}</p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-white border-t border-x border-slate-200 text-blue-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {t('legal.privacyTitle')}
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'terms'
                ? 'bg-white border-t border-x border-slate-200 text-blue-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t('legal.termsTitle')}
          </button>
          <button
            onClick={() => setActiveTab('cookies')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'cookies'
                ? 'bg-white border-t border-x border-slate-200 text-blue-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cookie className="w-4 h-4" />
            {t('legal.cookieTitle')}
          </button>
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'disclaimer'
                ? 'bg-white border-t border-x border-slate-200 text-blue-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {t('legal.disclaimerTitle')}
          </button>
        </div>

        {/* Content Container */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-sm text-slate-700 space-y-6 leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">Privacy Policy</h2>
              <p>
                At <strong>DANASI OPPORTUNITY HUB</strong>, directed by NDAYIZEYE Samuel, we are committed to safeguarding candidate data with the highest standard of confidentiality. This policy outlines how information is gathered, managed, and secured.
              </p>
              
              <h3 className="text-base font-bold text-slate-900">1. Information We Collect</h3>
              <p>
                We collect personal information necessary to deliver educational and career opportunities. This includes: full name, email address, country of residence, city, educational attainment level, professional interests, and language preferences.
              </p>

              <h3 className="text-base font-bold text-slate-900">2. How Information is Used</h3>
              <p>
                Data is utilized strictly to:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-xs text-slate-600">
                <li>Authenticate account access and maintain session security.</li>
                <li>Filter scholarship, job, and grant recommendations matching user qualifications.</li>
                <li>Communicate verified application updates and platform announcements.</li>
                <li>Conduct administrative audit trails to detect fraudulent activities.</li>
              </ul>

              <h3 className="text-base font-bold text-slate-900">3. Non-Disclosure & Third Parties</h3>
              <p>
                DANASI does not sell, lease, or monetize candidate data to commercial third-party brokers. Data is transferred only with explicit candidate authorization when submitting direct institutional applications.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">Terms and Conditions of Use</h2>
              <p>
                By accessing or registering with DANASI OPPORTUNITY HUB, you agree to comply with the following institutional terms and conditions.
              </p>

              <h3 className="text-base font-bold text-slate-900">1. Account Accuracy & Integrity</h3>
              <p>
                Users must provide truthful and accurate academic and professional credentials. Falsification of diplomas, grades, or national identification may result in permanent suspension of access.
              </p>

              <h3 className="text-base font-bold text-slate-900">2. Prohibition of Unauthorized Recruitment</h3>
              <p>
                No user or entity may solicit monetary payments from applicants on DANASI. Legitimate opportunities listed on DANASI do not charge recruitment commissions. Violators will face immediate legal reporting.
              </p>

              <h3 className="text-base font-bold text-slate-900">3. Intellectual Property</h3>
              <p>
                All platform marks, software interfaces, and proprietary curation systems are property of DANASI OPPORTUNITY HUB and project owner NDAYIZEYE Samuel.
              </p>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">Cookie & Storage Policy</h2>
              <p>
                DANASI uses local storage and standard technical cookies solely for essential functional operations.
              </p>

              <h3 className="text-base font-bold text-slate-900">1. Essential Authentication Tokens</h3>
              <p>
                We store secure cryptographic session tokens to preserve your logged-in session across page refreshes and browser tabs.
              </p>

              <h3 className="text-base font-bold text-slate-900">2. Language & Interface Preferences</h3>
              <p>
                We store your chosen platform language (English, Kinyarwanda, or French) to ensure consistent user experience upon return visits.
              </p>

              <h3 className="text-base font-bold text-slate-900">3. No Invasive Tracking</h3>
              <p>
                We do not deploy invasive cross-site advertising pixels or sell tracking beacons to behavioral ad networks.
              </p>
            </div>
          )}

          {activeTab === 'disclaimer' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">Disclaimer & Verification Notice</h2>
              <p>
                DANASI OPPORTUNITY HUB acts as a verified discovery and preparatory bridge between applicants and international institutions.
              </p>

              <h3 className="text-base font-bold text-slate-900">1. Independent Institutional Decisions</h3>
              <p>
                Final admission, scholarship awards, and employment hiring decisions remain the exclusive prerogative of the respective host universities, foundations, and employers. DANASI facilitates transparent preparation but does not guarantee admission or selection.
              </p>

              <h3 className="text-base font-bold text-slate-900">2. Due Diligence</h3>
              <p>
                While our administrative team rigorously screens opportunity sources, applicants are advised to review official university websites and visa guidelines directly before making travel or financial commitments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
