/**
 * DANASI OPPORTUNITY HUB — Admin Dashboard Console
 * Founder: NDAYIZEYE Samuel
 * 
 * Production administration console with RBAC enforcement, real database metrics,
 * user role management, contact message processing, audit logs, and system settings.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useTranslation } from '../../translations/index.tsx';
import { api } from '../../services/api.ts';
import {
  ShieldAlert,
  Users,
  Shield,
  Layers,
  MessageSquare,
  FileText,
  Sliders,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCw,
  Mail,
  UserCheck,
  Ban,
  Activity,
  Save,
  Clock,
  Briefcase,
  Flag,
  ExternalLink,
  CheckCheck,
  CheckCircle2,
  XSquare,
  AlertOctagon
} from 'lucide-react';
import { AuditLogItem, ContactMessage, OpportunityCategory, PlatformSettings, User, UserProfile, UserRole, Job, JobReport, VerificationRecord, JobVerificationStatus } from '../../types/index.ts';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'reports' | 'verifications' | 'users' | 'roles' | 'categories' | 'messages' | 'audit' | 'settings'>('overview');

  // Overview metrics state
  const [metrics, setMetrics] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([]);

  // Jobs moderation state
  const [adminJobs, setAdminJobs] = useState<Job[]>([]);
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('ALL');
  const [jobReports, setJobReports] = useState<JobReport[]>([]);
  const [verificationRecords, setVerificationRecords] = useState<VerificationRecord[]>([]);
  const [rejectionModalJob, setRejectionModalJob] = useState<Job | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');

  // Users management state
  const [usersList, setUsersList] = useState<(User & { profile: UserProfile | null })[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Categories & Settings
  const [categories, setCategories] = useState<OpportunityCategory[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [rolesMatrix, setRolesMatrix] = useState<{ roles: any[]; permissions: any[] } | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<(User & { profile: UserProfile | null }) | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('STUDENT_JOBSEEKER');

  // Unauthorized guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-red-200 shadow-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            This administration console is protected by strict role-based access control (RBAC). Only authenticated platform administrators and super administrators are authorized to access this zone.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
            Current Account Role: <strong>{user?.role || 'Guest'}</strong>
          </div>
        </div>
      </div>
    );
  }

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOverview();
      setMetrics(res.metrics);
      setRecentLogs(res.recentActivity);
    } catch (err: any) {
      setActionMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers({ search: userSearch, role: roleFilter, status: statusFilter });
      setUsersList(res.users);
    } catch (err: any) {
      setActionMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.categories);
    } catch {
      // ignore
    }
  };

  const loadMessages = async () => {
    try {
      const res = await api.getContactMessages();
      setMessages(res.messages);
    } catch {
      // ignore
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await api.getAuditLogs(60);
      setAuditLogs(res.auditLogs);
    } catch {
      // ignore
    }
  };

  const loadRoles = async () => {
    try {
      const res = await api.getRolesAndPermissions();
      setRolesMatrix(res);
    } catch {
      // ignore
    }
  };

  const loadSettings = async () => {
    try {
      const res = await api.getPlatformSettings();
      setSettings(res.settings);
    } catch {
      // ignore
    }
  };

  const loadAdminJobs = async () => {
    try {
      setLoading(true);
      const res = await api.getJobs({
        status: jobStatusFilter
      });
      setAdminJobs(res.jobs);
    } catch (err: any) {
      setActionMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminReports = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminJobReports();
      setJobReports(res.reports);
    } catch (err: any) {
      setActionMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminVerifications = async () => {
    try {
      setLoading(true);
      const res = await api.getVerificationRecords();
      setVerificationRecords(res.records);
    } catch (err: any) {
      setActionMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') loadOverview();
    if (activeTab === 'jobs') loadAdminJobs();
    if (activeTab === 'reports') loadAdminReports();
    if (activeTab === 'verifications') loadAdminVerifications();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'messages') loadMessages();
    if (activeTab === 'audit') loadAuditLogs();
    if (activeTab === 'roles') loadRoles();
    if (activeTab === 'settings') loadSettings();
  }, [activeTab, jobStatusFilter]);

  const handleModerateJob = async (jobId: string, status: JobVerificationStatus, notes?: string, rejectionReason?: string) => {
    try {
      await api.moderateJob(jobId, { status, notes, rejectionReason });
      setActionMsg({ text: `Opportunity listing transitioned to ${status}.`, type: 'success' });
      setRejectionModalJob(null);
      setRejectionReasonText('');
      await loadAdminJobs();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Moderation action failed.', type: 'error' });
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await api.updateJobReportStatus(reportId, status);
      setActionMsg({ text: `Fraud report updated to ${status}.`, type: 'success' });
      await loadAdminReports();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Report action failed.', type: 'error' });
    }
  };

  const handleUpdateRole = async () => {
    if (!roleModalUser) return;
    try {
      await api.updateUserRole(roleModalUser.id, newSelectedRole);
      setActionMsg({ text: `Successfully updated ${roleModalUser.email} to ${newSelectedRole}.`, type: 'success' });
      setRoleModalUser(null);
      await loadUsers();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to update role.', type: 'error' });
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    try {
      const newSuspended = !targetUser.isSuspended;
      await api.updateUserStatus(targetUser.id, newSuspended);
      setActionMsg({
        text: `Account for ${targetUser.email} has been ${newSuspended ? 'suspended' : 'reactivated'}.`,
        type: 'success'
      });
      await loadUsers();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Action prohibited.', type: 'error' });
    }
  };

  const handleUpdateMessageStatus = async (id: string, status: 'read' | 'replied') => {
    try {
      await api.updateContactMessageStatus(id, status);
      await loadMessages();
    } catch {
      // ignore
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await api.updatePlatformSettings(settings);
      setSettings(res.settings);
      setActionMsg({ text: 'Platform settings saved successfully to database.', type: 'success' });
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to update settings.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {user?.role} Mode
                </span>
                <span className="text-xs text-slate-400">Founder: NDAYIZEYE Samuel</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{t('adminDashboard.title')}</h1>
              <p className="text-xs text-slate-300 mt-1">{t('adminDashboard.subtitle')}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (activeTab === 'overview') loadOverview();
                  if (activeTab === 'users') loadUsers();
                  if (activeTab === 'audit') loadAuditLogs();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionMsg && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-sm ${
              actionMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="font-bold ml-4">
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {t('adminDashboard.tabOverview')}
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'jobs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>DANASI Jobs Moderation</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'reports' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Fraud Reports</span>
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'verifications' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Verification Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {t('adminDashboard.tabUsers')}
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'roles' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {t('adminDashboard.tabRoles')}
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'categories' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {t('adminDashboard.tabCategories')}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'messages' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {t('adminDashboard.tabInquiries')}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'audit' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {t('adminDashboard.tabAudit')}
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              {t('adminDashboard.tabSettings')}
            </button>
          )}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* Real Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Total Registered</span>
                <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{metrics.totalUsers}</p>
                <span className="text-[10px] text-slate-400">Database users</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Active Accounts</span>
                <p className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">{metrics.activeUsers}</p>
                <span className="text-[10px] text-slate-400">Can authenticate</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Suspended</span>
                <p className="text-2xl font-bold text-red-600 font-mono tabular-nums">{metrics.suspendedUsers}</p>
                <span className="text-[10px] text-slate-400">Access revoked</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Verified Emails</span>
                <p className="text-2xl font-bold text-blue-700 font-mono tabular-nums">{metrics.verifiedEmails}</p>
                <span className="text-[10px] text-slate-400">Confirmed contacts</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Contact Inquiries</span>
                <p className="text-2xl font-bold text-amber-700 font-mono tabular-nums">{metrics.totalInquiries}</p>
                <span className="text-[10px] text-amber-600 font-semibold">{metrics.pendingInquiries} new</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Categories</span>
                <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{metrics.categoriesCount}</p>
                <span className="text-[10px] text-slate-400">Live opportunity paths</span>
              </div>
            </div>

            {/* Role Breakdown Strip */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Registered Role Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(metrics.roleDistribution || {}).map(([roleName, count]: [string, any]) => (
                  <div key={roleName} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                    <p className="text-[11px] text-slate-500 truncate">{roleName}</p>
                    <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Audit Feed */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent Security Audit Stream</h3>
                <span className="text-[11px] text-slate-500">Live Immutable Log</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {recentLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{log.action}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-blue-700">{log.actorEmail}</span>
                      </div>
                      <p className="text-slate-600">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: DANASI JOBS MODERATION */}
        {activeTab === 'jobs' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">DANASI Opportunity Verification Bureau</h2>
                <p className="text-xs text-slate-500">
                  Review, authenticate, or reject provider submissions. Suspicious links and duplicates are automatically flagged.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Filter Status:</span>
                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
                >
                  <option value="ALL">All Statuses ({adminJobs.length})</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="VERIFIED">Verified Only</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>

            {/* Jobs List */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Opportunity & Employer</th>
                    <th className="px-4 py-3">Category & Type</th>
                    <th className="px-4 py-3">Submitted By</th>
                    <th className="px-4 py-3">Security & Quality Flags</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Moderator Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {adminJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No opportunities matching status "{jobStatusFilter}".
                      </td>
                    </tr>
                  ) : (
                    adminJobs.map((job) => {
                      const statusStyles: Record<string, string> = {
                        VERIFIED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                        PENDING_REVIEW: 'bg-amber-50 text-amber-800 border-amber-200',
                        REJECTED: 'bg-red-50 text-red-800 border-red-200',
                        SUSPENDED: 'bg-slate-100 text-slate-700 border-slate-200',
                        EXPIRED: 'bg-slate-100 text-slate-500 border-slate-200'
                      };

                      return (
                        <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 leading-snug">{job.title}</div>
                            <div className="text-[11px] text-blue-700 font-medium">
                              {job.employerName} · {job.city}, {job.country}
                            </div>
                            <a
                              href={job.originalSourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 mt-0.5"
                            >
                              <span className="truncate max-w-[200px]">{job.originalSourceUrl}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          </td>

                          <td className="px-4 py-3">
                            <span className="text-[11px] font-semibold text-slate-800 block">{job.categorySlug}</span>
                            <span className="text-[10px] text-slate-500">{job.employmentType} ({job.workplaceArrangement})</span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="font-mono text-[11px] text-slate-600 block">{job.providerEmail}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            {job.suspiciousFlags && job.suspiciousFlags.length > 0 ? (
                              <div className="space-y-1">
                                {job.suspiciousFlags.map((fl, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200"
                                  >
                                    <AlertOctagon className="w-2.5 h-2.5" />
                                    {fl.split(':')[0]}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Clean Link
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${statusStyles[job.status] || 'bg-slate-100'}`}>
                              {job.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                            {job.status !== 'VERIFIED' && (
                              <button
                                type="button"
                                onClick={() => handleModerateJob(job.id, 'VERIFIED', 'Verified by compliance officer')}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-sm"
                              >
                                Approve
                              </button>
                            )}

                            {job.status !== 'REJECTED' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectionModalJob(job);
                                  setRejectionReasonText('');
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors"
                              >
                                Reject
                              </button>
                            )}

                            {job.status === 'VERIFIED' && (
                              <button
                                type="button"
                                onClick={() => handleModerateJob(job.id, 'SUSPENDED', 'Temporarily suspended by administrator')}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                              >
                                Suspend
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: CANDIDATE FRAUD REPORTS */}
        {activeTab === 'reports' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Candidate Fraud & Suspicious Listing Reports</h2>
              <p className="text-xs text-slate-500">
                User-filed incident alerts regarding deceptive salaries, unauthorized placement fee solicitations, or expired posts.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {jobReports.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No fraud reports currently recorded.
                </div>
              ) : (
                jobReports.map((rep) => (
                  <div key={rep.id} className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{rep.jobTitle}</span>
                          <span className="text-xs font-semibold text-blue-700">({rep.employerName})</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                              rep.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : rep.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {rep.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Report Category: <strong className="text-red-700">{rep.reason}</strong> · Filed by: {rep.reporterEmail} · {new Date(rep.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {rep.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdateReportStatus(rep.id, 'resolved')}
                              className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm"
                            >
                              Resolve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateReportStatus(rep.id, 'dismissed')}
                              className="px-3 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-200 leading-relaxed">
                      {rep.details}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: VERIFICATION AUDIT TRAIL */}
        {activeTab === 'verifications' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Moderation & Verification Audit History</h2>
              <p className="text-xs text-slate-500">
                Immutable ledger recording each status transition, reviewing moderator, and audit explanation.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-slate-200 font-mono">
                <thead className="bg-slate-50 text-slate-600 font-sans font-semibold">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Opportunity Title</th>
                    <th className="px-4 py-3">Status Transition</th>
                    <th className="px-4 py-3">Moderator</th>
                    <th className="px-4 py-3">Audit Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {verificationRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-sans">
                        No verification records found.
                      </td>
                    </tr>
                  ) : (
                    verificationRecords.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                          {new Date(v.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 font-sans font-semibold text-slate-900">
                          {v.jobTitle}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="text-slate-500">{v.previousStatus}</span>
                          <span className="mx-1 text-slate-400">→</span>
                          <span className="font-bold text-blue-700">{v.newStatus}</span>
                        </td>
                        <td className="px-4 py-2.5 font-sans text-slate-700">
                          {v.moderatorEmail}
                        </td>
                        <td className="px-4 py-2.5 font-sans text-slate-600">
                          {v.notes || 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                  placeholder={t('adminDashboard.searchUsers')}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                  }}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CONTENT_MANAGER">Content Manager</option>
                  <option value="OPPORTUNITY_PROVIDER">Opportunity Provider</option>
                  <option value="STUDENT_JOBSEEKER">Student / Job Seeker</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>

                <button
                  onClick={loadUsers}
                  className="px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Candidate / User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Verified</th>
                    <th className="px-4 py-3 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{u.profile?.fullName || 'Anonymous Candidate'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {u.profile?.city ? `${u.profile.city}, ${u.profile.country}` : 'Not specified'}
                      </td>
                      <td className="px-4 py-3">
                        {u.isSuspended ? (
                          <span className="text-red-600 font-semibold flex items-center gap-1">
                            <Ban className="w-3.5 h-3.5" /> Suspended
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.emailVerified ? (
                          <span className="text-emerald-700 font-medium">Yes</span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              setRoleModalUser(u);
                              setNewSelectedRole(u.role);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                          >
                            Assign Role
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={u.id === user?.id}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors ${
                            u.isSuspended
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                              : 'text-red-700 bg-red-50 hover:bg-red-100 border-red-200'
                          } disabled:opacity-30`}
                        >
                          {u.isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ROLES & PERMISSIONS MATRIX */}
        {activeTab === 'roles' && rolesMatrix && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Role-Based Access Control (RBAC) Architecture</h2>
              <p className="text-xs text-slate-500">
                Enforced server-side in auth middleware. Roles dictate verified access levels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rolesMatrix.roles.map((r: any) => (
                <div key={r.id} className="p-5 rounded-xl border border-slate-200 space-y-3 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{r.name}</h3>
                    <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {r.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Granted Permissions:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {r.permissions.map((p: string) => (
                        <span key={p} className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Opportunity Categories Schema</h2>
                <p className="text-xs text-slate-500">
                  Persistent sector classification with English, Kinyarwanda, and French descriptors.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 rounded-xl border border-slate-200 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{cat.nameEn}</span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <p><strong className="text-slate-700">RW:</strong> {cat.nameRw}</p>
                    <p><strong className="text-slate-700">FR:</strong> {cat.nameFr}</p>
                  </div>
                  <p className="text-xs text-slate-600">{cat.descriptionEn}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT INQUIRIES & REPORTS */}
        {activeTab === 'messages' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Contact Messages & Partnership Inquiries</h2>
              <p className="text-xs text-slate-500">
                Inquiries submitted through the public contact form stored in the database.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-500 py-6">No messages received yet.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{m.subject}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              m.status === 'new'
                                ? 'bg-amber-100 text-amber-800'
                                : m.status === 'replied'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {m.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          From: <strong>{m.fullName}</strong> ({m.email}) ·{' '}
                          <span className="font-mono">{new Date(m.createdAt).toLocaleString()}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {m.status === 'new' && (
                          <button
                            onClick={() => handleUpdateMessageStatus(m.id, 'read')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                          >
                            Mark Read
                          </button>
                        )}
                        {m.status !== 'replied' && (
                          <button
                            onClick={() => handleUpdateMessageStatus(m.id, 'replied')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                          >
                            Mark Replied
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">
                      {m.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Security & Administrative Audit Logs</h2>
              <p className="text-xs text-slate-500">
                Permanent audit trail of logins, role updates, status changes, and settings modifications.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor Email</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-blue-700 font-sans font-medium whitespace-nowrap">
                        {log.actorEmail}
                      </td>
                      <td className="px-4 py-2.5 text-slate-900 font-bold whitespace-nowrap">{log.action}</td>
                      <td className="px-4 py-2.5 text-slate-600">{log.entity}</td>
                      <td className="px-4 py-2.5 text-slate-500">{log.ipAddress}</td>
                      <td className="px-4 py-2.5 text-slate-700 font-sans">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: PLATFORM SETTINGS */}
        {activeTab === 'settings' && settings && isSuperAdmin && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Global Platform Settings</h2>
              <p className="text-xs text-slate-500">
                Platform-wide configuration managed by NDAYIZEYE Samuel (Super Admin).
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Platform Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Official Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Support Secretariat Phone</label>
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">System Announcement Notice</label>
                <textarea
                  rows={2}
                  value={settings.systemNotice || ''}
                  onChange={(e) => setSettings({ ...settings, systemNotice: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-6 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={settings.registrationOpen}
                    onChange={(e) => setSettings({ ...settings, registrationOpen: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Allow Public Candidate Registration</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-700">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Maintenance Mode</span>
                </label>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors flex items-center gap-2 mt-4"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Platform Configuration</span>
              </button>
            </form>
          </div>
        )}

        {/* ROLE ASSIGNMENT MODAL (Super Admin Only) */}
        {roleModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign Platform Role</h3>
                <p className="text-xs text-slate-500">
                  Modify role permissions for <strong>{roleModalUser.email}</strong>.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                {(
                  [
                    'SUPER_ADMIN',
                    'ADMIN',
                    'CONTENT_MANAGER',
                    'OPPORTUNITY_PROVIDER',
                    'STUDENT_JOBSEEKER'
                  ] as UserRole[]
                ).map((roleOpt) => (
                  <label
                    key={roleOpt}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      newSelectedRole === roleOpt
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="roleOption"
                      checked={newSelectedRole === roleOpt}
                      onChange={() => setNewSelectedRole(roleOpt)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{roleOpt}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateRole}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm"
                >
                  Confirm Role Change
                </button>
              </div>
            </div>
          </div>
        )}

        {/* JOB REJECTION MODAL */}
        {rejectionModalJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Decline / Reject Opportunity</h3>
                <p className="text-xs text-slate-500">
                  Provide compliance feedback for <strong>"{rejectionModalJob.title}"</strong> ({rejectionModalJob.employerName}).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReasonText}
                  onChange={(e) => setRejectionReasonText(e.target.value)}
                  placeholder="e.g. Unverified application link, suspicious recruitment fee detected, or duplicate of existing vacancy."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalJob(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleModerateJob(rejectionModalJob.id, 'REJECTED', rejectionReasonText, rejectionReasonText)}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
