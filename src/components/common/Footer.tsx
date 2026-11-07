/**
 * DANASI OPPORTUNITY HUB — Platform Footer
 * Organization: DANASITECHNICALCOLLEGE
 */

import React from 'react';
import { Logo } from './Logo.tsx';
import { useTranslation } from '../../translations/index.tsx';
import { Mail, MapPin, ExternalLink, Globe, Phone, MessageCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Organization */}
          <div className="lg:col-span-2">
            <Logo variant="light" size="lg" className="mb-4" />
            <p className="text-sm text-slate-400 mb-4 max-w-sm leading-relaxed">
              Your Gateway to Jobs, Scholarships & Global Opportunities.
            </p>
            <div className="text-xs text-slate-400 space-y-1.5">
              <p>
                <span className="text-slate-200 font-medium">Platform Leadership:</span>{' '}
                <span className="text-amber-400 font-semibold">DANASITECHNICALCOLLEGE</span>
              </p>
              <p className="flex items-center gap-1.5 pt-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Kigali, Rwanda · Global Digital Operations</span>
              </p>
              <p className="flex items-center gap-1.5 pt-0.5 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href="mailto:danasitechnicalcollege@gmail.com" className="hover:text-white transition-colors">
                  danasitechnicalcollege@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-1.5 pt-0.5 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href="tel:+250792772425" className="hover:text-white transition-colors">
                  +250792772425
                </a>
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/250792772425?text=Hello%20DANASI%20Support!%20I%20need%20assistance%20with%20your%20platform."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp: +250792772425</span>
                </a>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('jobs')} className="hover:text-white transition-colors">
                  Find Jobs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('opportunities')} className="hover:text-white transition-colors">
                  Scholarships & Fellowships
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors">
                  Career Tools
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Opportunity Sectors
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('jobs')} className="hover:text-white transition-colors">
                  Rwanda Jobs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('jobs')} className="hover:text-white transition-colors">
                  Remote Careers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('jobs')} className="hover:text-white transition-colors">
                  MIFOTRA Public Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('jobs')} className="hover:text-white transition-colors">
                  United Nations Careers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('opportunities')} className="hover:text-white transition-colors">
                  International Scholarships
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('opportunities')} className="hover:text-white transition-colors">
                  Civic Fellowships
                </button>
              </li>
            </ul>
          </div>

          {/* Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Governance & Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">
                  Anti-Fraud Guidelines
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DANASI OPPORTUNITY HUB. All rights reserved. Organized by DANASITECHNICALCOLLEGE.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Kigali</span>
            <span aria-hidden="true">·</span>
            <span>Rwanda</span>
            <span aria-hidden="true">·</span>
            <span>Worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
