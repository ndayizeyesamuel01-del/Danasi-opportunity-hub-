/**
 * DANASI OPPORTUNITY HUB — Core TypeScript Definitions
 * Founder: NDAYIZEYE Samuel
 * Tagline: Your Gateway to Jobs, Scholarships & Global Opportunities.
 */

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CONTENT_MANAGER'
  | 'OPPORTUNITY_PROVIDER'
  | 'STUDENT_JOBSEEKER';

export type LanguageCode = 'en' | 'rw' | 'fr';

export type EducationLevel = 
  | 'High School'
  | 'Diploma / TVET'
  | "Bachelor's Degree"
  | "Master's Degree"
  | 'Doctorate / PhD'
  | 'Self-Taught / Professional';

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  salt?: string;
  role: UserRole;
  emailVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  country: string;
  city: string;
  profilePhoto?: string;
  headline?: string;
  bio?: string;
  phone?: string;
  educationLevel: EducationLevel;
  professionalInterests: string[];
  preferredCategories: string[];
  preferredLanguage: LanguageCode;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  userId: string;
  emailNotifications: boolean;
  opportunityAlerts: boolean;
  weeklyDigest: boolean;
  theme: 'light' | 'dark' | 'system';
  updatedAt: string;
}

export interface RoleDefinition {
  id: UserRole;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export interface PermissionDefinition {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'content' | 'opportunities' | 'settings' | 'audit' | 'reports';
}

export interface PlatformSettings {
  platformName: string;
  tagline: string;
  founder: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  defaultLanguage: LanguageCode;
  systemNotice?: string;
  updatedAt: string;
}

export interface OpportunityCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameRw: string;
  nameFr: string;
  descriptionEn: string;
  descriptionRw: string;
  descriptionFr: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'ALL' or specific user ID
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
  repliedAt?: string;
}

export interface SavedItem {
  id: string;
  userId: string;
  itemType: 'job' | 'scholarship' | 'internship' | 'fellowship' | 'grant' | 'service';
  itemId: string;
  title: string;
  notes?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
    createdAt: string;
  };
  profile: UserProfile;
  token: string;
}

/* -------------------------------------------------------------------------- */
/* PHASE 2 — DANASI JOBS MODULE TYPES                                         */
/* -------------------------------------------------------------------------- */

export type JobVerificationStatus = 
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'SUSPENDED';

export type WorkplaceArrangement = 'remote' | 'on-site' | 'hybrid';

export type EmploymentType = 
  | 'Full-Time'
  | 'Part-Time'
  | 'Internship'
  | 'Fellowship'
  | 'Contract'
  | 'Volunteer';

export type ExperienceLevel = 
  | 'Entry-Level'
  | 'Mid-Level'
  | 'Senior'
  | 'Executive';

export type ApplicationTrackingStatus = 
  | 'INTERESTED'
  | 'PREPARING'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'WITHDRAWN';

export interface JobCategoryDefinition {
  id: string;
  slug: string;
  nameEn: string;
  nameRw: string;
  nameFr: string;
  descriptionEn: string;
  descriptionRw: string;
  descriptionFr: string;
  displayOrder: number;
}

export interface Employer {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description: string;
  country: string;
  city: string;
  industry: string;
  verified: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  externalJobId?: string;
  title: string;
  employerId: string;
  employerName: string;
  employerWebsite?: string;
  employerLogo?: string;
  country: string;
  city: string;
  workplaceArrangement: WorkplaceArrangement;
  employmentType: EmploymentType;
  categorySlug: string;
  experienceLevel: ExperienceLevel;
  educationRequirement: EducationLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryRange?: string; // Disclosed or formatted string
  requiredSkills: string[];
  description: string;
  responsibilities: string[];
  applicationRequirements: string[];
  deadline: string; // ISO format or date string
  originalSourceUrl: string; // Original employer career portal
  sourceOrganization?: string;
  sourceName?: string; // Remotive | Arbeitnow | Adzuna | MIFOTRA Rwanda | United Nations | DANASI Direct
  sourceUrl?: string;
  sourceAttribution?: string;
  sourcePublishedAt?: string;
  importedAt?: string;
  lastVerifiedAt?: string;
  publicationStatus?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  expirationStatus?: 'ACTIVE' | 'EXPIRED';
  contentHash?: string;
  isDemo: boolean;
  status: JobVerificationStatus;
  rejectionReason?: string;
  suspiciousFlags?: string[];
  providerId: string; // Creator user ID or system provider
  providerEmail: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobReport {
  id: string;
  jobId: string;
  jobTitle: string;
  employerName: string;
  reporterId: string;
  reporterEmail: string;
  reason: 'MISLEADING_SALARY' | 'SUSPICIOUS_LINK' | 'FEE_SOLICITATION' | 'EXPIRED_VACANCY' | 'OTHER';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  employerName: string;
  workplaceArrangement: WorkplaceArrangement;
  deadline: string;
  createdAt: string;
}

export interface JobApplicationTracker {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  employerName: string;
  workplaceArrangement: WorkplaceArrangement;
  status: ApplicationTrackingStatus;
  appliedDate?: string;
  deadline: string;
  notes: string;
  originalSourceUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  previousStatus: JobVerificationStatus;
  newStatus: JobVerificationStatus;
  moderatorId: string;
  moderatorEmail: string;
  notes?: string;
  timestamp: string;
}

/* -------------------------------------------------------------------------- */
/* PHASE 2.5 — REAL JOB DATA INTEGRATION ENGINE TYPES                         */
/* -------------------------------------------------------------------------- */

export type JobSourceType = 'API' | 'PUBLIC_FEED' | 'OFFICIAL_GOV_PORTAL' | 'INSTITUTIONAL_PORTAL';
export type JobSourceStatus = 'CONNECTED' | 'CONFIGURATION_REQUIRED' | 'ERROR' | 'IDLE' | 'SYNCING';
export type SyncRunStatus = 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';

export interface JobSourceConfig {
  id: string; // 'adzuna' | 'remotive' | 'arbeitnow' | 'mifotra' | 'united_nations'
  name: string;
  description: string;
  type: JobSourceType;
  website: string;
  attribution: string;
  termsUrl: string;
  enabled: boolean;
  status: JobSourceStatus;
  errorMessage?: string;
  lastSyncAt?: string;
  nextSyncAt?: string;
  syncIntervalHours: number;
  totalJobsImported: number;
  activeJobsCount: number;
  duplicatesCount: number;
  requiresAuth: boolean;
  authConfigured: boolean;
  lastSyncStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'NEVER_RUN';
  updatedAt: string;
}

export interface JobSyncRun {
  id: string;
  sourceId: string;
  sourceName: string;
  trigger: 'MANUAL' | 'SCHEDULED';
  status: SyncRunStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  jobsFetched: number;
  jobsNormalized: number;
  jobsImported: number;
  duplicatesSkipped: number;
  errorsCount: number;
  logSummary: string;
  initiatedBy: string; // User email or 'SYSTEM_SCHEDULER'
}

export interface JobSourceLog {
  id: string;
  sourceId: string;
  syncRunId?: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface NormalizedJob {
  externalJobId: string;
  title: string;
  employerName: string;
  employerWebsite?: string;
  employerLogo?: string;
  description: string;
  responsibilities: string[];
  applicationRequirements: string[];
  country: string;
  city: string;
  categorySlug: string;
  employmentType: EmploymentType;
  workplaceArrangement: WorkplaceArrangement;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryRange?: string;
  educationRequirement: EducationLevel;
  experienceLevel: ExperienceLevel;
  requiredSkills: string[];
  deadline: string;
  originalApplicationUrl: string;
  sourceName: string;
  sourceUrl: string;
  sourceAttribution: string;
  sourcePublishedAt?: string;
  status: JobVerificationStatus;
}
