/**
 * DANASI OPPORTUNITY HUB — Contact Page
 * Founder: NDAYIZEYE Samuel
 */

import React, { useState } from 'react';
import { useTranslation } from '../../translations/index.tsx';
import { api } from '../../services/api.ts';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, Phone, Globe } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (route: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.sendContactMessage({
        fullName,
        email,
        subject,
        message
      });
      setSuccessMsg(res.message);
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || t('contactPage.sendError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
            <Mail className="w-3.5 h-3.5" />
            <span>Direct Project Communications</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('contactPage.title')}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            {t('contactPage.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Institutional Contact Points
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 font-medium">{t('contactPage.directEmail')}</p>
                    <a
                      href="mailto:hello@danasi.com"
                      className="text-white hover:text-amber-400 font-semibold transition-colors"
                    >
                      hello@danasi.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 font-medium">{t('contactPage.headquarters')}</p>
                    <p className="text-white font-medium">Kigali, Rwanda · Global Digital Operations</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 font-medium">Project Secretariat</p>
                    <p className="text-white font-mono">+250 788 000 000</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                  Project Leadership
                </p>
                <p className="text-xs text-slate-200">
                  <strong className="text-white">NDAYIZEYE Samuel</strong> — Founder & Project Owner
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  DANASI OPPORTUNITY HUB welcomes inquiries from international universities, multilateral development funds, and technology partners.
                </p>
              </div>

              <div className="pt-2">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-medium">
                  Connect on Official Channels
                </p>
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[11px]">LinkedIn</span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[11px]">X (Twitter)</span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[11px]">Telegram</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {t('contactPage.sendMsg')}
              </h3>

              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>{successMsg}</p>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      {t('common.fullName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('contactPage.fullNamePlaceholder')}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      {t('common.email')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('contactPage.emailPlaceholder')}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t('contactPage.subjectPlaceholder')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Message Details *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('contactPage.msgPlaceholder')}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoading ? t('common.loading') : t('common.submit')}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
