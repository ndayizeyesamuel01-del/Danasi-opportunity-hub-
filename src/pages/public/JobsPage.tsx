/**
 * DANASI OPPORTUNITY HUB — DANASI JOBS Discovery & Application Engine (Phase 2)
 * Founder & Project Owner: NDAYIZEYE Samuel
 * Tagline: Your Gateway to Jobs, Scholarships & Global Opportunities.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../translations/index.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Job, JobCategoryDefinition, WorkplaceArrangement, EmploymentType, ExperienceLevel, EducationLevel } from '../../types/index.ts';
import { ReportJobModal } from '../../components/jobs/ReportJobModal.tsx';
import { ProviderJobModal } from '../../components/jobs/ProviderJobModal.tsx';
import { CareerPrepModal } from '../../components/jobs/CareerPrepModal.tsx';
import {
  Search,
  Briefcase,
  MapPin,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Filter,
  RotateCcw,
  PlusCircle,
  AlertCircle,
  FileCheck2,
  Sparkles,
  ChevronRight,
  Eye,
  Flag,
  Share2,
  Check,
  SlidersHorizontal
} from 'lucide-react';

interface JobsPageProps {
  onNavigate: (route: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { t, language } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  // Data states
  const [categories, setCategories] = useState<JobCategoryDefinition[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Filter & Search states
  const [keyword, setKeyword] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [country, setCountry] = useState<string>('ALL');
  const [city, setCity] = useState<string>('ALL');
  const [workplaceArrangement, setWorkplaceArrangement] = useState<string>('ALL');
  const [employmentType, setEmploymentType] = useState<string>('ALL');
  const [experienceLevel, setExperienceLevel] = useState<string>('ALL');
  const [educationRequirement, setEducationRequirement] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'deadline' | 'relevance'>('latest');

  // Modals
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [jobToReport, setJobToReport] = useState<Job | null>(null);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [careerPrepModalOpen, setCareerPrepModalOpen] = useState(false);
  const [jobToPrep, setJobToPrep] = useState<Job | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [copyNotice, setCopyNotice] = useState(false);

  // Load Categories on mount
  useEffect(() => {
    api.getJobCategories()
      .then((res) => {
        setCategories(res.categories);
      })
      .catch((err) => console.error('Error loading job categories:', err));
  }, []);

  // Load Saved Jobs if logged in
  useEffect(() => {
    if (isAuthenticated) {
      api.getUserSavedJobs()
        .then((res) => {
          setSavedJobIds(new Set(res.savedJobs.map((sj) => sj.jobId)));
        })
        .catch(() => {});
    } else {
      setSavedJobIds(new Set());
    }
  }, [isAuthenticated]);

  // Fetch Jobs whenever filters change
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getJobs({
        keyword: keyword || undefined,
        categorySlug: selectedCategory !== 'all' ? selectedCategory : undefined,
        country: country !== 'ALL' ? country : undefined,
        city: city !== 'ALL' ? city : undefined,
        workplaceArrangement: workplaceArrangement !== 'ALL' ? workplaceArrangement : undefined,
        employmentType: employmentType !== 'ALL' ? employmentType : undefined,
        experienceLevel: experienceLevel !== 'ALL' ? experienceLevel : undefined,
        educationRequirement: educationRequirement !== 'ALL' ? educationRequirement : undefined,
        sortBy
      });
      setJobs(res.jobs);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 200);
    return () => clearTimeout(timer);
  }, [keyword, selectedCategory, country, city, workplaceArrangement, employmentType, experienceLevel, educationRequirement, sortBy]);

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedCategory('all');
    setCountry('ALL');
    setCity('ALL');
    setWorkplaceArrangement('ALL');
    setEmploymentType('ALL');
    setExperienceLevel('ALL');
    setEducationRequirement('ALL');
    setSortBy('latest');
  };

  const handleToggleSave = async (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }

    const isSaved = savedJobIds.has(job.id);
    if (isSaved) {
      // Find saved job record ID
      try {
        const res = await api.getUserSavedJobs();
        const found = res.savedJobs.find((sj) => sj.jobId === job.id);
        if (found) {
          await api.removeSavedJob(found.id);
          const next = new Set(savedJobIds);
          next.delete(job.id);
          setSavedJobIds(next);
        }
      } catch (err) {
        console.error('Error unsaving job:', err);
      }
    } else {
      try {
        await api.saveJob(job.id);
        const next = new Set(savedJobIds);
        next.add(job.id);
        setSavedJobIds(next);
      } catch (err) {
        console.error('Error saving job:', err);
      }
    }
  };

  const handleTrackApplication = async (job: Job) => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    try {
      await api.trackJobApplication({
        jobId: job.id,
        jobTitle: job.title,
        employerName: job.employerName,
        workplaceArrangement: job.workplaceArrangement || 'on-site',
        status: 'INTERESTED',
        deadline: job.deadline || '',
        notes: `Saved from DANASI JOBS portal on ${new Date().toLocaleDateString()}`,
        originalSourceUrl: job.originalSourceUrl || ''
      });
      onNavigate('dashboard');
    } catch (err: any) {
      console.error('Error tracking application:', err);
    }
  };

  const handleShare = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.location.href;
    navigator.clipboard.writeText(`${job.title} at ${job.employerName}: ${job.originalSourceUrl}`);
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2000);
  };

  const getCategoryName = (cat: JobCategoryDefinition) => {
    if (language === 'rw') return cat.nameRw;
    if (language === 'fr') return cat.nameFr;
    return cat.nameEn;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DANASI JOBS · Authenticated Global Vacancies</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {t('jobs.title')}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {t('jobs.subtitle')}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    onOpenAuth('login');
                  } else {
                    setProviderModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post an Opportunity (Provider Portal)</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              >
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <span>ATS Resume & Cover Letter Suite</span>
              </button>
            </div>
          </div>

          {/* Decorative geometric accent */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/15 to-transparent pointer-events-none hidden md:block" />
        </div>

        {/* 12 Categories Ribbon */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              12 Official Job Categories
            </h2>
            <span className="text-[11px] text-slate-500">
              Showing {jobs.length} verified listings
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-blue-700 text-white font-semibold shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-blue-700 text-white font-semibold shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {getCategoryName(cat)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search, Filter Bar and Sorting */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Keyword Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t('jobs.searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl border border-slate-200"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t('jobs.filtersHeading')}</span>
            </button>

            {/* Sorting Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortBy === 'latest' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                {t('jobs.sorting.latest')}
              </button>
              <button
                type="button"
                onClick={() => setSortBy('deadline')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  sortBy === 'deadline' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                {t('jobs.sorting.deadline')}
              </button>
            </div>
          </div>

          {/* Quick Filter Selects (Desktop or expanded Mobile) */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100 ${mobileFilterOpen ? 'block' : 'hidden md:grid'}`}>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('jobs.filters.country')}</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800"
              >
                <option value="ALL">{t('jobs.filters.allCountries')}</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Germany">Germany</option>
                <option value="United States">United States</option>
                <option value="Kenya">Kenya</option>
                <option value="Worldwide">Worldwide / Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('jobs.filters.arrangement')}</label>
              <select
                value={workplaceArrangement}
                onChange={(e) => setWorkplaceArrangement(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800"
              >
                <option value="ALL">{t('jobs.filters.allArrangements')}</option>
                <option value="on-site">On-Site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('jobs.filters.employmentType')}</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800"
              >
                <option value="ALL">{t('jobs.filters.allTypes')}</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
                <option value="Fellowship">Fellowship</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('jobs.filters.experienceLevel')}</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800"
              >
                <option value="ALL">{t('jobs.filters.allLevels')}</option>
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('jobs.filters.education')}</label>
              <select
                value={educationRequirement}
                onChange={(e) => setEducationRequirement(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 text-slate-800"
              >
                <option value="ALL">All Education Levels</option>
                <option value="High School">High School</option>
                <option value="Diploma / TVET">Diploma / TVET</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctorate / PhD">Doctorate / PhD</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('jobs.clearFilters')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Copy Feedback */}
        {copyNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{t('jobs.details.copySuccess')}</span>
          </div>
        )}

        {/* Listings Section */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Retrieving verified DANASI opportunities...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">No Opportunities Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{t('jobs.noJobsFound')}</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              {t('jobs.resetFilters')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>{totalCount} {t('jobs.resultsCount')}</span>
              <span className="flex items-center gap-1.5 text-blue-800 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Genuine External Portals</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => {
                const isSaved = savedJobIds.has(job.id);
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Employer and Title Block */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-blue-800 font-bold text-sm flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                          {job.employerLogo ? (
                            <img src={job.employerLogo} alt={job.employerName} className="w-full h-full object-cover" />
                          ) : (
                            job.employerName.substring(0, 2).toUpperCase()
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 hover:text-blue-700 transition-colors">
                              {job.title}
                            </h3>
                            {job.isDemo && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {t('jobs.card.demoNotice')}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {job.employerName}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {job.city}, {job.country}
                            </span>
                            <span>•</span>
                            <span className="capitalize font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {job.workplaceArrangement}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Badges & Actions */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{t('jobs.card.verified')}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Bookmark"
                            onClick={(e) => handleToggleSave(job, e)}
                            className={`p-2 rounded-lg border transition-colors ${
                              isSaved
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-white text-slate-400 hover:text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            title="Share"
                            onClick={(e) => handleShare(job, e)}
                            className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {job.description}
                    </p>

                    {/* Required Skills Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {job.requiredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md border border-slate-200/80"
                        >
                          {skill}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[11px] rounded-md">
                        {job.employmentType}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[11px] rounded-md">
                        {job.experienceLevel}
                      </span>
                    </div>

                    {/* Card Footer Info */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4 text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {t('jobs.card.deadlineLabel')}: {job.deadline || 'Rolling'}
                        </span>
                        {job.salaryRange ? (
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {job.salaryRange}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">{t('jobs.card.undisclosed')}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setJobToPrep(job);
                            setCareerPrepModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Prep Resume</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedJob(job)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                        >
                          <span>{t('jobs.card.viewDetails')}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Job View Modal */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
              {/* Modal Top Bar */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('jobs.details.verificationSeal')}</span>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        {selectedJob.title}
                      </h2>
                      <p className="text-sm font-semibold text-blue-700">
                        {selectedJob.employerName} · {selectedJob.city}, {selectedJob.country}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleSave(selectedJob, e)}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        savedJobIds.has(selectedJob.id)
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-white text-slate-500 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {savedJobIds.has(selectedJob.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                      {selectedJob.employmentType}
                    </span>
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md uppercase">
                      {selectedJob.workplaceArrangement}
                    </span>
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      {selectedJob.experienceLevel}
                    </span>
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      {selectedJob.educationRequirement}
                    </span>
                    {selectedJob.salaryRange && (
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                        {selectedJob.salaryRange}
                      </span>
                    )}
                  </div>
                </div>

                {/* Anti-Scam Notice */}
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{t('jobs.details.antiScamNotice')}</p>
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {t('jobs.details.overview')}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Core Responsibilities */}
                {selectedJob.responsibilities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {t('jobs.details.responsibilities')}
                    </h4>
                    <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-700">
                      {selectedJob.responsibilities.map((r, idx) => (
                        <li key={idx} className="leading-relaxed">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Application Requirements */}
                {selectedJob.applicationRequirements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {t('jobs.details.requirements')}
                    </h4>
                    <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-700">
                      {selectedJob.applicationRequirements.map((req, idx) => (
                        <li key={idx} className="leading-relaxed">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {t('jobs.details.requiredSkills')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Source Organization & Attribution */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-slate-700">Source Organization:</span>
                    <span>{selectedJob.sourceOrganization || selectedJob.employerName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-slate-700">Application Deadline:</span>
                    <span className="font-bold text-slate-900">{selectedJob.deadline || 'Rolling'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-slate-700">Authentication Reference:</span>
                    <span className="font-mono text-[11px] text-slate-600">{selectedJob.id}</span>
                  </div>
                </div>

                {/* Report Option */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      setJobToReport(selectedJob);
                      setReportModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:underline font-medium"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{t('jobs.card.report')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setJobToPrep(selectedJob);
                      setCareerPrepModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-semibold"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Open Career Prep Tool (ATS Resume & Questions)</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer with Genuine External Application Button */}
              <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTrackApplication(selectedJob)}
                  className="px-4 py-2.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-300 rounded-xl transition-colors"
                >
                  Track in My Applications
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl"
                  >
                    Close
                  </button>

                  <a
                    href={selectedJob.originalSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md transition-all hover:scale-[1.02]"
                  >
                    <span>{t('jobs.card.applyNow')}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fraud / Report Modal */}
        <ReportJobModal
          job={jobToReport}
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setJobToReport(null);
          }}
        />

        {/* Opportunity Provider Submission Modal */}
        <ProviderJobModal
          isOpen={providerModalOpen}
          onClose={() => setProviderModalOpen(false)}
          categories={categories}
          onJobCreated={() => {
            fetchJobs();
          }}
        />

        {/* Career Preparation Suite Modal */}
        <CareerPrepModal
          job={jobToPrep}
          isOpen={careerPrepModalOpen}
          onClose={() => {
            setCareerPrepModalOpen(false);
            setJobToPrep(null);
          }}
          onTrackApplication={handleTrackApplication}
        />
      </div>
    </div>
  );
};
