/**
 * DANASI OPPORTUNITY HUB — Frontend API Service Client
 * Founder: NDAYIZEYE Samuel
 */

import { 
  AuthResponse, 
  ContactMessage, 
  OpportunityCategory, 
  PlatformSettings, 
  User, 
  UserProfile, 
  UserPreferences, 
  AuditLogItem, 
  NotificationItem, 
  SavedItem,
  Job,
  JobCategoryDefinition,
  Employer,
  JobReport,
  SavedJob,
  JobApplicationTracker,
  VerificationRecord,
  JobVerificationStatus
} from '../types/index.ts';

const TOKEN_KEY = 'danasi_auth_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (credentials: { email: string; password: string }) => request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request<{ message: string }>('/api/auth/logout', { method: 'POST' }),
  getCurrentUser: () => request<{ user: User; profile: UserProfile | null; preferences: UserPreferences | null }>('/api/auth/me'),
  forgotPassword: (email: string) => request<{ message: string; recoveryCode?: string }>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (body: { email: string; recoveryCode: string; newPassword: string }) => request<{ message: string }>('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  verifyEmail: () => request<{ message: string; user: User }>('/api/auth/verify-email', { method: 'POST' }),

  // User Profile & Settings
  updateProfile: (profile: Partial<UserProfile>) => request<{ message: string; profile: UserProfile }>('/api/user/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  updatePreferences: (prefs: Partial<UserPreferences>) => request<{ message: string; preferences: UserPreferences }>('/api/user/preferences', { method: 'PUT', body: JSON.stringify(prefs) }),
  changePassword: (body: { currentPassword: string; newPassword: string }) => request<{ message: string }>('/api/user/password', { method: 'PUT', body: JSON.stringify(body) }),

  // Notifications
  getNotifications: () => request<{ notifications: NotificationItem[] }>('/api/user/notifications'),
  markNotificationRead: (id: string) => request<{ success: boolean }>(`/api/user/notifications/${id}/read`, { method: 'POST' }),

  // Saved Items
  getSavedItems: () => request<{ savedItems: SavedItem[] }>('/api/user/saved-items'),
  saveItem: (body: { itemType: string; itemId: string; title: string; notes?: string }) => request<{ savedItem: SavedItem }>('/api/user/saved-items', { method: 'POST', body: JSON.stringify(body) }),
  removeSavedItem: (id: string) => request<{ success: boolean }>(`/api/user/saved-items/${id}`, { method: 'DELETE' }),

  // Public
  getPlatformInfo: () => request<{ platformName: string; tagline: string; founder: string; contactEmail: string; supportPhone: string; defaultLanguage: string; systemNotice?: string; stats: any }>('/api/platform-info'),
  getCategories: () => request<{ categories: OpportunityCategory[] }>('/api/categories'),
  sendContactMessage: (msg: { fullName: string; email: string; subject: string; message: string }) => request<{ message: string; id: string }>('/api/contact', { method: 'POST', body: JSON.stringify(msg) }),

  // Admin
  getAdminOverview: () => request<{ metrics: any; recentActivity: AuditLogItem[] }>('/api/admin/overview'),
  getAdminUsers: (params?: { search?: string; role?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<{ users: (User & { profile: UserProfile | null })[] }>(`/api/admin/users?${q}`);
  },
  updateUserRole: (id: string, newRole: string) => request<{ message: string; user: User }>(`/api/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ newRole }) }),
  updateUserStatus: (id: string, isSuspended: boolean) => request<{ message: string; user: User }>(`/api/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ isSuspended }) }),
  getRolesAndPermissions: () => request<{ roles: any[]; permissions: any[] }>('/api/admin/roles'),
  getAuditLogs: (limit = 50) => request<{ auditLogs: AuditLogItem[] }>(`/api/admin/audit-logs?limit=${limit}`),
  getContactMessages: () => request<{ messages: ContactMessage[] }>('/api/admin/messages'),
  updateContactMessageStatus: (id: string, status: 'new' | 'read' | 'replied') => request<{ message: string; contactMessage: ContactMessage }>(`/api/admin/messages/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getPlatformSettings: () => request<{ settings: PlatformSettings }>('/api/admin/settings'),
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => request<{ message: string; settings: PlatformSettings }>('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  updateCategory: (id: string, updates: Partial<OpportunityCategory>) => request<{ message: string; category: OpportunityCategory }>(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Phase 2 — DANASI JOBS Module
  getJobCategories: () => request<{ categories: JobCategoryDefinition[] }>('/api/job-categories'),
  getJobs: (params?: {
    keyword?: string;
    country?: string;
    city?: string;
    categorySlug?: string;
    employmentType?: string;
    experienceLevel?: string;
    educationRequirement?: string;
    workplaceArrangement?: string;
    status?: string;
    sortBy?: 'latest' | 'deadline' | 'relevance';
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const query = searchParams.toString();
    return request<{ jobs: Job[]; totalCount: number }>(`/api/jobs${query ? `?${query}` : ''}`);
  },
  getJobById: (id: string) => request<{ job: Job }>(`/api/jobs/${id}`),
  submitJob: (jobData: any) => request<{ message: string; job: Job; duplicateWarning?: boolean }>('/api/jobs', { method: 'POST', body: JSON.stringify(jobData) }),
  getEmployers: () => request<{ employers: Employer[] }>('/api/employers'),
  createEmployer: (data: any) => request<{ message: string; employer: Employer }>('/api/employers', { method: 'POST', body: JSON.stringify(data) }),
  reportJob: (jobId: string, reason: string, details: string) => request<{ message: string; report: JobReport }>(`/api/jobs/${jobId}/report`, { method: 'POST', body: JSON.stringify({ reason, details }) }),

  // Candidate Saved Jobs & Applications
  getUserSavedJobs: () => request<{ savedJobs: SavedJob[] }>('/api/user/saved-jobs'),
  saveJob: (jobId: string) => request<{ message: string; savedJob: SavedJob }>('/api/user/saved-jobs', { method: 'POST', body: JSON.stringify({ jobId }) }),
  removeSavedJob: (id: string) => request<{ message: string; success: boolean }>(`/api/user/saved-jobs/${id}`, { method: 'DELETE' }),
  getUserJobApplications: () => request<{ applications: JobApplicationTracker[] }>('/api/user/job-applications'),
  trackJobApplication: (data: Partial<JobApplicationTracker>) => request<{ message: string; application: JobApplicationTracker }>('/api/user/job-applications', { method: 'POST', body: JSON.stringify(data) }),
  updateJobApplication: (id: string, updates: Partial<JobApplicationTracker>) => request<{ message: string; application: JobApplicationTracker }>(`/api/user/job-applications/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Admin Job Moderation
  moderateJob: (id: string, data: { status: JobVerificationStatus; notes?: string; rejectionReason?: string }) => request<{ message: string; job: Job }>(`/api/admin/jobs/${id}/moderate`, { method: 'POST', body: JSON.stringify(data) }),
  getVerificationRecords: (jobId?: string) => request<{ records: VerificationRecord[] }>(`/api/admin/verification-records${jobId ? `?jobId=${jobId}` : ''}`),
  getAdminJobReports: () => request<{ reports: JobReport[] }>('/api/admin/job-reports'),
  updateJobReportStatus: (id: string, status: 'resolved' | 'dismissed') => request<{ message: string; report: JobReport }>(`/api/admin/job-reports/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Real Job Data Sources & Synchronization
  getJobSources: () => request<{ sources: any[] }>('/api/admin/job-sources'),
  syncJobSource: (id: string) => request<{ message: string; syncRun: any }>(`/api/admin/job-sources/${id}/sync`, { method: 'POST' }),
  syncAllJobSources: () => request<{ message: string; syncRuns: any[] }>('/api/admin/job-sources/sync-all', { method: 'POST' }),
  getJobSyncRuns: (limit = 30) => request<{ syncRuns: any[] }>(`/api/admin/job-sources/sync-runs?limit=${limit}`)
};
