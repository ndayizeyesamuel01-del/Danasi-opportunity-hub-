/**
 * DANASI OPPORTUNITY HUB — User Dashboard
 * Founder: NDAYIZEYE Samuel
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useTranslation } from '../../translations/index.tsx';
import { api } from '../../services/api.ts';
import {
  User as UserIcon,
  CheckCircle,
  Clock,
  Bell,
  Bookmark,
  Shield,
  Save,
  KeyRound,
  ExternalLink,
  Sparkles,
  Settings,
  AlertCircle,
  Briefcase,
  Layers,
  Trash2,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { EducationLevel, LanguageCode, NotificationItem, SavedItem, JobApplicationTracker, SavedJob, ApplicationTrackingStatus } from '../../types/index.ts';

export const UserDashboard: React.FC = () => {
  const { user, profile, preferences, updateProfile, updatePreferences, verifyEmail, refreshUser } = useAuth();
  const { t, setLanguage } = useTranslation();

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'saved' | 'profile' | 'notifications' | 'settings'>('overview');

  // Application Tracker State
  const [applications, setApplications] = useState<JobApplicationTracker[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [appNotesInput, setAppNotesInput] = useState('');
  const [trackingMsg, setTrackingMsg] = useState<string | null>(null);

  // Profile Form State
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [country, setCountry] = useState(profile?.country || 'Rwanda');
  const [city, setCity] = useState(profile?.city || 'Kigali');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(profile?.educationLevel || "Bachelor's Degree");
  const [preferredLang, setPreferredLang] = useState<LanguageCode>(profile?.preferredLanguage || 'en');
  const [interestsInput, setInterestsInput] = useState(profile?.professionalInterests?.join(', ') || 'Technology, Education');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Notifications & Saved Items
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setCountry(profile.country || 'Rwanda');
      setCity(profile.city || 'Kigali');
      setEducationLevel(profile.educationLevel || "Bachelor's Degree");
      setPreferredLang(profile.preferredLanguage || 'en');
      setInterestsInput(profile.professionalInterests?.join(', ') || '');
    }
  }, [profile]);

  const loadData = async () => {
    try {
      const [nRes, sRes, appRes, sjRes] = await Promise.all([
        api.getNotifications(),
        api.getSavedItems(),
        api.getUserJobApplications().catch(() => ({ applications: [] })),
        api.getUserSavedJobs().catch(() => ({ savedJobs: [] }))
      ]);
      setNotifications(nRes.notifications);
      setSavedItems(sRes.savedItems);
      setApplications(appRes.applications);
      setSavedJobs(sjRes.savedJobs);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateAppStatus = async (appId: string, newStatus: ApplicationTrackingStatus) => {
    try {
      await api.updateJobApplication(appId, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a))
      );
      setTrackingMsg(`Application updated to ${newStatus}`);
      setTimeout(() => setTrackingMsg(null), 2500);
    } catch (err: any) {
      setTrackingMsg(err.message || 'Failed to update application');
    }
  };

  const handleSaveAppNotes = async (appId: string) => {
    try {
      await api.updateJobApplication(appId, { notes: appNotesInput });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, notes: appNotesInput } : a))
      );
      setEditingAppId(null);
      setAppNotesInput('');
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  };

  const handleRemoveSavedJob = async (id: string) => {
    try {
      await api.removeSavedJob(id);
      setSavedJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      console.error('Error removing saved job:', err);
    }
  };

  const handleMoveToTracker = async (saved: SavedJob) => {
    try {
      const res = await api.trackJobApplication({
        jobId: saved.jobId,
        jobTitle: saved.jobTitle,
        employerName: saved.employerName,
        workplaceArrangement: saved.workplaceArrangement || 'on-site',
        status: 'INTERESTED',
        deadline: saved.deadline || '',
        notes: `Converted from saved bookmark on ${new Date().toLocaleDateString()}`
      });
      setApplications((prev) => [res.application, ...prev]);
      setActiveTab('applications');
      setTrackingMsg(`"${saved.jobTitle}" added to your application tracker!`);
      setTimeout(() => setTrackingMsg(null), 3000);
    } catch (err: any) {
      setTrackingMsg(err.message || 'Failed to track opportunity');
    }
  };

  // Calculate Real Profile Completion Percentage
  const calculateCompletion = () => {
    let score = 0;
    if (user?.email) score += 20;
    if (user?.emailVerified) score += 15;
    if (profile?.fullName) score += 15;
    if (profile?.country && profile?.city) score += 15;
    if (profile?.headline) score += 15;
    if (profile?.bio) score += 10;
    if (profile?.professionalInterests && profile.professionalInterests.length > 0) score += 10;
    return Math.min(100, score);
  };

  const completionPercent = calculateCompletion();

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileMsg(null);
    try {
      const interestsArray = interestsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfile({
        fullName,
        headline,
        bio,
        phone,
        country,
        city,
        educationLevel,
        preferredLanguage: preferredLang,
        professionalInterests: interestsArray
      });

      // Sync active language if user changed preferred language
      setLanguage(preferredLang);
      setProfileMsg('Profile updated successfully.');
      await refreshUser();
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordMsg({ text: 'Password successfully updated.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'Failed to update password.', type: 'error' });
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await verifyEmail();
      await loadData();
    } catch {
      // ignore
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white shadow-md border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {user?.role}
                </span>
                {user?.emailVerified ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified Candidate
                  </span>
                ) : (
                  <button
                    onClick={handleVerifyEmail}
                    className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                  >
                    Click to Verify Email
                  </button>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t('dashboard.welcome')}, {profile?.fullName || user?.email}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {profile?.headline || 'Candidate Portal · Configured for African and Global Opportunity Pipelines.'}
              </p>
            </div>

            {/* Profile Completion Bar */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 w-full md:w-64 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{t('dashboard.profileComplete')}</span>
                <span className="text-amber-400 font-bold font-mono">{completionPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {completionPercent === 100
                  ? 'All essential candidate fields complete!'
                  : t('dashboard.completePrompt')}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-white border-t border-x border-slate-200 text-blue-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('dashboard.accountOverview')}
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'applications'
                ? 'bg-white border-t border-x border-slate-200 text-blue-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Application Tracker ({applications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-white border-t border-x border-slate-200 text-blue-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Jobs ({savedJobs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-white border-t border-x border-slate-200 text-blue-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('dashboard.editProfile')}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-white border-t border-x border-slate-200 text-blue-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('dashboard.notificationCenter')} ({notifications.filter((n) => !n.read).length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white border-t border-x border-slate-200 text-blue-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('nav.settings')}
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Quick Navigation Cards */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900">{t('dashboard.quickLinks')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setActiveTab('profile')}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer transition-colors space-y-1 bg-slate-50/50"
                  >
                    <p className="text-xs font-bold text-slate-900">Update Educational Credentials</p>
                    <p className="text-[11px] text-slate-500">Keep degrees, GPA, and country updated for matching.</p>
                  </div>
                  <div
                    onClick={() => setActiveTab('saved')}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer transition-colors space-y-1 bg-slate-50/50"
                  >
                    <p className="text-xs font-bold text-slate-900">Review Saved Opportunities</p>
                    <p className="text-[11px] text-slate-500">Track bookmarked scholarships and application deadlines.</p>
                  </div>
                </div>
              </div>

              {/* Real Account Details Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900">Candidate Dossier</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Registered Email</span>
                    <span className="font-semibold text-slate-900 truncate block">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Education Level</span>
                    <span className="font-semibold text-slate-900 block">{profile?.educationLevel || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Primary Location</span>
                    <span className="font-semibold text-slate-900 block">{profile?.city}, {profile?.country}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">System Role</span>
                    <span className="font-semibold text-blue-700 block">{user?.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Member Since</span>
                    <span className="font-semibold text-slate-900 block font-mono">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Preferred Interface</span>
                    <span className="font-semibold text-slate-900 uppercase block">{profile?.preferredLanguage || 'en'}</span>
                  </div>
                </div>
              </div>

              {/* Phase 2 Architecture Preview */}
              <div className="p-6 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  <span>Phase 2 Modules In Preparation</span>
                </div>
                <p className="text-xs text-blue-900 leading-relaxed">
                  Your DANASI account will automatically integrate with Module 1 (DANASI JOBS), Module 2 (DANASI SCHOLARSHIPS), Module 3 (DANASI CAREER AI CV Builder), and Module 5 (Application Milestone Tracker) upon Phase 2 deployment.
                </p>
              </div>
            </div>

            {/* Sidebar Column: Recent Activity */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{t('dashboard.recentActivity')}</h3>
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <p className="font-semibold text-slate-800">Session Initialized</p>
                    <p className="text-[11px] text-slate-500">Logged into DANASI secure foundation.</p>
                  </div>
                  {user?.emailVerified && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 space-y-1 text-emerald-900">
                      <p className="font-semibold">Email Verified</p>
                      <p className="text-[11px] text-emerald-700">Account verified in persistent registry.</p>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 text-center pt-2">
                    {t('dashboard.noActivityYet')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE EDIT */}
        {activeTab === 'profile' && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('dashboard.profileDetails')}</h2>
              <p className="text-xs text-slate-500">Update personal credentials stored in the persistent database.</p>
            </div>

            {profileMsg && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">{t('common.fullName')} *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Professional Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 788 000 000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Candidate Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={t('dashboard.headlinePlaceholder')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Professional Bio / Academic Aspirations</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('dashboard.bioPlaceholder')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">{t('common.country')}</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">{t('common.city')}</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">{t('common.educationLevel')}</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-600"
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {t('common.interests')} (Comma-separated)
                </label>
                <input
                  type="text"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Renewable Energy, Economics"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Preferred Language</label>
                <select
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value as LanguageCode)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="en">English (Default)</option>
                  <option value="rw">Kinyarwanda</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? t('common.saving') : t('common.save')}</span>
              </button>
            </form>
          </div>
        )}

        {/* Tracking Feedback Alert */}
        {trackingMsg && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-700" />
            <span>{trackingMsg}</span>
          </div>
        )}

        {/* TAB: APPLICATION TRACKER */}
        {activeTab === 'applications' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t('jobs.tracker.title')}</h2>
                <p className="text-xs text-slate-500">{t('jobs.tracker.subtitle')}</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  Total Tracked: {applications.length}
                </span>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">{t('jobs.tracker.noApplications')}</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Browse opportunities in the DANASI JOBS discovery catalog and click "Track in My Applications" or save a bookmark.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {applications.map((app) => {
                    const statusColors: Record<ApplicationTrackingStatus, string> = {
                      INTERESTED: 'bg-slate-100 text-slate-800 border-slate-200',
                      PREPARING: 'bg-amber-50 text-amber-800 border-amber-200',
                      APPLIED: 'bg-blue-50 text-blue-800 border-blue-200',
                      INTERVIEW: 'bg-purple-50 text-purple-800 border-purple-200',
                      REJECTED: 'bg-red-50 text-red-800 border-red-200',
                      ACCEPTED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      WITHDRAWN: 'bg-slate-100 text-slate-500 border-slate-200'
                    };

                    const isEditing = editingAppId === app.id;

                    return (
                      <div
                        key={app.id}
                        className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${statusColors[app.status]}`}>
                              {app.status}
                            </span>
                            <span className="text-[11px] text-slate-400 capitalize">
                              {app.workplaceArrangement}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-slate-900 leading-tight">
                              {app.jobTitle}
                            </h3>
                            <p className="text-xs font-semibold text-blue-700 mt-0.5">
                              {app.employerName}
                            </p>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-500">
                            {app.deadline && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Deadline: <strong className="text-slate-700">{app.deadline}</strong></span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Updated: {new Date(app.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Notes view / edit */}
                          <div className="pt-2 border-t border-slate-100">
                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  rows={2}
                                  value={appNotesInput}
                                  onChange={(e) => setAppNotesInput(e.target.value)}
                                  placeholder="Add notes, interview schedule, contact person..."
                                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                                />
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingAppId(null)}
                                    className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveAppNotes(app.id)}
                                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-700 hover:bg-blue-800 rounded"
                                  >
                                    Save Note
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingAppId(app.id);
                                  setAppNotesInput(app.notes || '');
                                }}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-[11px] text-slate-600 space-y-1 border border-slate-100"
                              >
                                <div className="flex items-center justify-between text-slate-500 font-semibold text-[10px] uppercase">
                                  <span>Personal Notes</span>
                                  <span className="text-blue-600">Edit</span>
                                </div>
                                <p className="line-clamp-2 italic">
                                  {app.notes || 'Click to write personal application notes or interview dates...'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Transition & External Link */}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Update Stage:
                            </label>
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as ApplicationTrackingStatus)}
                              className="w-full px-2 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-semibold text-slate-800"
                            >
                              <option value="INTERESTED">1. Interested</option>
                              <option value="PREPARING">2. Preparing Documents</option>
                              <option value="APPLIED">3. Applied</option>
                              <option value="INTERVIEW">4. Interviewing</option>
                              <option value="ACCEPTED">5. Offer Accepted</option>
                              <option value="REJECTED">6. Rejected</option>
                              <option value="WITHDRAWN">7. Withdrawn</option>
                            </select>
                          </div>

                          {app.originalSourceUrl && (
                            <a
                              href={app.originalSourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              <span>Official Career Portal</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: SAVED OPPORTUNITIES & BOOKMARKS */}
        {activeTab === 'saved' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('dashboard.savedOpportunities')}</h2>
              <p className="text-xs text-slate-500">Bookmarked vacancies and opportunities ready for preparation.</p>
            </div>

            {savedJobs.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">{t('dashboard.noSavedYet')}</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Bookmark vacancies from the DANASI JOBS portal to save and review them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedJobs.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded uppercase">
                          {item.workplaceArrangement}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.deadline || 'Rolling'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{item.jobTitle}</h3>
                      <p className="text-xs font-semibold text-slate-600">{item.employerName}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveSavedJob(item.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveToTracker(item)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
                      >
                        Track Application
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t('dashboard.notificationCenter')}</h2>
                <p className="text-xs text-slate-500">Platform notices, security updates, and opportunity alerts.</p>
              </div>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6">{t('dashboard.noNotifications')}</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
                      n.read ? 'bg-slate-50/60 border-slate-100' : 'bg-blue-50/40 border-blue-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{n.title}</span>
                        {!n.read && (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-[11px] text-blue-700 hover:underline font-medium shrink-0"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Security & Credentials</h2>

              {passwordMsg && (
                <div
                  className={`p-3 rounded-lg text-xs ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">New Password (Min 8 characters)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Update Account Password</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
