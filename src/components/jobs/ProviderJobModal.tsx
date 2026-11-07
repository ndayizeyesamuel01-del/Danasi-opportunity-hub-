/**
 * DANASI OPPORTUNITY HUB — Opportunity Provider Submission Modal
 * Founder: NDAYIZEYE Samuel
 */

import React, { useState } from 'react';
import { useTranslation } from '../../translations/index.tsx';
import { api } from '../../services/api.ts';
import { Job, JobCategoryDefinition, WorkplaceArrangement, EmploymentType, ExperienceLevel, EducationLevel } from '../../types/index.ts';
import { Briefcase, X, AlertTriangle, ShieldCheck, CheckCircle2, Globe, Sparkles } from 'lucide-react';

interface ProviderJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: JobCategoryDefinition[];
  onJobCreated?: (job: Job) => void;
}

export const ProviderJobModal: React.FC<ProviderJobModalProps> = ({ isOpen, onClose, categories, onJobCreated }) => {
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [country, setCountry] = useState('Rwanda');
  const [city, setCity] = useState('Kigali');
  const [workplaceArrangement, setWorkplaceArrangement] = useState<WorkplaceArrangement>('on-site');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-Time');
  const [categorySlug, setCategorySlug] = useState('rwanda-jobs');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Entry-Level');
  const [educationRequirement, setEducationRequirement] = useState<EducationLevel>("Bachelor's Degree");
  const [salaryRange, setSalaryRange] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [applicationRequirements, setApplicationRequirements] = useState('');
  const [deadline, setDeadline] = useState('');
  const [originalSourceUrl, setOriginalSourceUrl] = useState('');
  const [sourceOrganization, setSourceOrganization] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateAlert, setDuplicateAlert] = useState(false);
  const [successJob, setSuccessJob] = useState<Job | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDuplicateAlert(false);

    if (!title.trim() || !employerName.trim() || !country.trim() || !originalSourceUrl.trim()) {
      setError('Title, Employer Name, Country, and Genuine Application URL are required.');
      return;
    }

    if (!originalSourceUrl.startsWith('https://')) {
      setError('Application URL must use secure https:// protocol.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.submitJob({
        title: title.trim(),
        employerName: employerName.trim(),
        country: country.trim(),
        city: city.trim(),
        workplaceArrangement,
        employmentType,
        categorySlug,
        experienceLevel,
        educationRequirement,
        salaryRange: salaryRange.trim() || undefined,
        requiredSkills: requiredSkills ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        description: description.trim(),
        responsibilities: responsibilities ? responsibilities.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        applicationRequirements: applicationRequirements ? applicationRequirements.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        deadline: deadline || undefined,
        originalSourceUrl: originalSourceUrl.trim(),
        sourceOrganization: sourceOrganization.trim() || employerName.trim()
      });

      if (res.duplicateWarning) {
        setDuplicateAlert(true);
      }
      setSuccessJob(res.job);
      if (onJobCreated) onJobCreated(res.job);
    } catch (err: any) {
      setError(err.message || 'Failed to submit opportunity.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessJob(null);
    setDuplicateAlert(false);
    setTitle('');
    setEmployerName('');
    setSalaryRange('');
    setRequiredSkills('');
    setDescription('');
    setResponsibilities('');
    setApplicationRequirements('');
    setDeadline('');
    setOriginalSourceUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t('jobs.providerPortal.title')}</h3>
              <p className="text-[11px] text-slate-300">{t('jobs.providerPortal.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {successJob ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Vacancy Submitted for DANASI Review</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Opportunity listing <span className="font-semibold text-slate-900">"{successJob.title}"</span> has been queued for verification. Our administrative compliance unit reviews all source links before publishing.
                </p>
              </div>

              {duplicateAlert && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 max-w-md mx-auto flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{t('jobs.providerPortal.duplicateNotice')}</span>
                </div>
              )}

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.jobTitle')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('jobs.providerPortal.jobTitlePlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.employerName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={employerName}
                    onChange={(e) => setEmployerName(e.target.value)}
                    placeholder={t('jobs.providerPortal.employerNamePlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.category')} *
                  </label>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.nameEn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.workplaceArrangement')} *
                  </label>
                  <select
                    value={workplaceArrangement}
                    onChange={(e) => setWorkplaceArrangement(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  >
                    <option value="on-site">On-Site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.employmentType')} *
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Fellowship">Fellowship</option>
                    <option value="Contract">Contract</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.country')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Rwanda, Germany, Kenya, United States"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.city')}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kigali, Berlin, Nairobi, Remote"
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.experienceLevel')}
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Entry-Level">Entry-Level</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.educationRequirement')}
                  </label>
                  <select
                    value={educationRequirement}
                    onChange={(e) => setEducationRequirement(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  >
                    <option value="High School">High School</option>
                    <option value="Diploma / TVET">Diploma / TVET</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate / PhD">Doctorate / PhD</option>
                    <option value="Self-Taught / Professional">Self-Taught / Professional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.salaryRange')}
                  </label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder={t('jobs.providerPortal.salaryRangePlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.deadline')}
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('jobs.providerPortal.originalSourceUrl')} *
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={originalSourceUrl}
                    onChange={(e) => setOriginalSourceUrl(e.target.value)}
                    placeholder={t('jobs.providerPortal.originalSourceUrlPlaceholder')}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Must link directly to the employer's genuine recruitment portal or official careers board.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('jobs.providerPortal.requiredSkills')}
                </label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder={t('jobs.providerPortal.requiredSkillsPlaceholder')}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('jobs.providerPortal.description')}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('jobs.providerPortal.descriptionPlaceholder')}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.responsibilities')}
                  </label>
                  <textarea
                    rows={3}
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    placeholder={t('jobs.providerPortal.responsibilitiesPlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('jobs.providerPortal.applicationRequirements')}
                  </label>
                  <textarea
                    rows={3}
                    value={applicationRequirements}
                    onChange={(e) => setApplicationRequirements(e.target.value)}
                    placeholder={t('jobs.providerPortal.applicationRequirementsPlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mandatory quality review workflow</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {loading ? t('jobs.providerPortal.submitting') : t('jobs.providerPortal.submitBtn')}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
