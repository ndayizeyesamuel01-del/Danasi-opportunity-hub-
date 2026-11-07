/**
 * DANASI OPPORTUNITY HUB — Fraud & Suspicious Listing Report Modal
 * Founder: NDAYIZEYE Samuel
 */

import React, { useState } from 'react';
import { useTranslation } from '../../translations/index.tsx';
import { api } from '../../services/api.ts';
import { Job } from '../../types/index.ts';
import { AlertTriangle, X, ShieldAlert, CheckCircle, Lock } from 'lucide-react';

interface ReportJobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted?: () => void;
}

export const ReportJobModal: React.FC<ReportJobModalProps> = ({ job, isOpen, onClose, onReportSubmitted }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState<'MISLEADING_SALARY' | 'SUSPICIOUS_LINK' | 'FEE_SOLICITATION' | 'EXPIRED_VACANCY' | 'OTHER'>('SUSPICIOUS_LINK');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('Please provide explanatory details for your report.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.reportJob(job.id, reason, details.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDetails('');
        onClose();
        if (onReportSubmitted) onReportSubmitted();
      }, 2200);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-50/80 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold">{t('jobs.reportModal.title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Report Successfully Logged</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {t('jobs.reportModal.success')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-semibold text-slate-900 block truncate">{job.title}</span>
                <span className="text-slate-500">{job.employerName} · {job.country}</span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('jobs.reportModal.reasonLabel')}
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                >
                  <option value="SUSPICIOUS_LINK">{t('jobs.reportModal.reasonLink')}</option>
                  <option value="FEE_SOLICITATION">{t('jobs.reportModal.reasonFee')}</option>
                  <option value="MISLEADING_SALARY">{t('jobs.reportModal.reasonMisleading')}</option>
                  <option value="EXPIRED_VACANCY">{t('jobs.reportModal.reasonExpired')}</option>
                  <option value="OTHER">{t('jobs.reportModal.reasonOther')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('jobs.reportModal.detailsLabel')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={t('jobs.reportModal.detailsPlaceholder')}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Reports are encrypted and reviewed by the DANASI Verification Bureau.</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading ? t('jobs.reportModal.submitting') : t('jobs.reportModal.submitReport')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
