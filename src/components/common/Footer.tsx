/**
 * DANASI OPPORTUNITY HUB — Platform Footer
 * Founder: NDAYIZEYE Samuel
 */

import React from 'react';
import { Logo } from './Logo.tsx';
import { useTranslation } from '../../translations/index.tsx';
import { Mail, MapPin, ExternalLink, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Founder Lockup */}
          <div className="lg:col-span-2">
            <Logo variant="light" size="lg" className="mb-4" />
            <p className="text-sm text-slate-400 mb-4 max-w-sm leading-relaxed">
              {t('tagline')}
            </p>
            <div className="text-xs text-slate-400 space-y-1">
              <p>
                <span className="text-slate-200 font-medium">{t('founderTitle')}:</span>{' '}
                <span className="text-amber-400 font-semibold">{t('founderName')}</span>
              </p>
              <p className="flex items-center gap-1.5 pt-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Kigali, Rwanda · Global Digital Operations</span>
              </p>
              <p className="flex items-center gap-1.5 pt-0.5 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href="mailto:hello@danasi.com" className="hover:text-white transition-colors">
                  hello@danasi.com
                </a>
              </p>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {t('nav.home')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('opportunities')} className="hover:text-white transition-colors">
                  {t('nav.opportunities')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors">
                  {t('nav.services')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  {t('nav.contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Opportunity Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {t('categories.heading')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('opportunities')} className="hover:text-white transition-colors">
                  {t('categories.scholarships')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('opportunities')} className="hover:text-white transition-colors">
                  {t('categories.jobs')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('opportunities')} className="hover:text-white transition-colors">
                  {t('categories.remote')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('opportunities')} className="hover:text-white transition-colors">
                  {t('categories.internships')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('opportunities')} className="hover:text-white transition-colors">
                  {t('categories.fellowships')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('opportunities')} className="hover:text-white transition-colors">
                  {t('categories.grants')}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Governance & Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  {t('legal.privacyTitle')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  {t('legal.termsTitle')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  {t('legal.cookieTitle')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  {t('legal.disclaimerTitle')}
                </button>
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-3 text-slate-400">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition-colors"
                    aria-label="Telegram"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DANASI OPPORTUNITY HUB. All rights reserved. Directed by NDAYIZEYE Samuel.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Kigali</span>
            <span aria-hidden="true">·</span>
            <span>Africa</span>
            <span aria-hidden="true">·</span>
            <span>Worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
