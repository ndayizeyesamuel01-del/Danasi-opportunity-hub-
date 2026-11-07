/**
 * DANASI OPPORTUNITY HUB — Cloud Firestore Database Engine & Migrations
 * Founder: NDAYIZEYE Samuel
 * 
 * Production-ready Firestore persistence layer with DANASI JOBS Module integration.
 * Supports ACID transactions, 12 Job Categories, Verification Workflow, Duplicate Detection,
 * Suspicious Link Screening, Employer Management, Application Tracking, and Immutable Audit Records.
 */

import crypto from 'crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  User,
  UserProfile,
  UserPreferences,
  RoleDefinition,
  PermissionDefinition,
  PlatformSettings,
  OpportunityCategory,
  NotificationItem,
  AuditLogItem,
  ContactMessage,
  SavedItem,
  Job,
  Employer,
  JobCategoryDefinition,
  JobReport,
  SavedJob,
  JobApplicationTracker,
  VerificationRecord,
  JobVerificationStatus,
  JobSourceConfig,
  JobSyncRun,
  JobSourceLog,
  NormalizedJob
} from '../types/index.ts';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Connect to provisioned Firestore database
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Password Cryptography
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Recursively removes properties with undefined values to prevent Firestore serialization errors.
 */
export function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanUndefined(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefined(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// 12 Mandatory Job Categories
export const JOB_CATEGORIES: JobCategoryDefinition[] = [
  {
    id: 'jcat_rwanda',
    slug: 'rwanda-jobs',
    nameEn: 'Rwanda Jobs',
    nameRw: 'Imirimo yo mu Rwanda',
    nameFr: 'Emplois au Rwanda',
    descriptionEn: 'Vacancies based in Rwanda across Kigali and all provincial districts.',
    descriptionRw: 'Imirimo ibarizwa mu Rwanda i Kigali no mu ntara zose.',
    descriptionFr: 'Postes basés au Rwanda à Kigali et dans tous les districts.',
    displayOrder: 1
  },
  {
    id: 'jcat_international',
    slug: 'international-jobs',
    nameEn: 'International Jobs',
    nameRw: 'Imirimo Mpuzamahanga',
    nameFr: 'Emplois Internationaux',
    descriptionEn: 'Global positions in Europe, North America, Asia, and worldwide.',
    descriptionRw: 'Imirimo yo ku mugabane w’Uburayi, Amerika, Aziya no ku isi yose.',
    descriptionFr: 'Opportunités mondiales en Europe, Amérique du Nord, Asie et partout.',
    displayOrder: 2
  },
  {
    id: 'jcat_remote',
    slug: 'remote-jobs',
    nameEn: 'Remote Jobs',
    nameRw: 'Akazi ko gukorera Kure',
    nameFr: 'Emplois en Télétravail',
    descriptionEn: 'Distributed and work-from-anywhere positions with global teams.',
    descriptionRw: 'Akazi ko gukorera mu rugo ku makipe mpuzamahanga.',
    descriptionFr: 'Postes à distance avec équipes internationales distribuées.',
    displayOrder: 3
  },
  {
    id: 'jcat_government',
    slug: 'government-jobs',
    nameEn: 'Government Jobs',
    nameRw: 'Imirimo ya Leta',
    nameFr: 'Emplois Gouvernementaux',
    descriptionEn: 'Public sector vacancies, ministries, public agencies, and civil service.',
    descriptionRw: 'Imirimo yo mu bigo bya Leta, muri za minisiteri n’inzego z’ubuyobozi.',
    descriptionFr: 'Postes dans le secteur public, ministères et agences étatiques.',
    displayOrder: 4
  },
  {
    id: 'jcat_ngo',
    slug: 'ngo-jobs',
    nameEn: 'NGO Jobs',
    nameRw: 'Imirimo y’Imiryango Itari iya Leta',
    nameFr: 'Emplois en ONG',
    descriptionEn: 'Humanitarian, development, UN agencies, and non-profit organization careers.',
    descriptionRw: 'Imirimo mu miryango itegamiye kuri Leta (NGOs) n’amashami ya Loni.',
    descriptionFr: 'Carrières humanitaires, de développement et dans les agences de l’ONU.',
    displayOrder: 5
  },
  {
    id: 'jcat_private',
    slug: 'private-sector-jobs',
    nameEn: 'Private Sector Jobs',
    nameRw: 'Imirimo y’Abikorera',
    nameFr: 'Emplois du Secteur Privé',
    descriptionEn: 'Commercial enterprise, corporate, tech startups, and banking vacancies.',
    descriptionRw: 'Imirimo mu bigo by’ubucuruzi, amabanki n’ibigo by’ikoranabuhanga.',
    descriptionFr: 'Postes en entreprises commerciales, banques et startups technologiques.',
    displayOrder: 6
  },
  {
    id: 'jcat_internships',
    slug: 'internships',
    nameEn: 'Internships',
    nameRw: 'Kwimenyereza Umwuga',
    nameFr: 'Stages Professionnels',
    descriptionEn: 'Structured traineeships for current university students and recent graduates.',
    descriptionRw: 'Amahirwe yo kwimenyereza umwuga ku banyeshuri n’abasoje kaminuza vuba.',
    descriptionFr: 'Stages pratiques pour étudiants universitaires et jeunes diplômés.',
    displayOrder: 7
  },
  {
    id: 'jcat_fellowships',
    slug: 'fellowships',
    nameEn: 'Fellowships',
    nameRw: 'Amahirwe y’Ubuyobozi',
    nameFr: 'Programmes de Leadership',
    descriptionEn: 'Prestigious leadership cohorts, civic fellowships, and policy residencies.',
    descriptionRw: 'Amahugurwa y’ubuyobozi ku rwego mpuzamahanga n’ubushakashatsi.',
    descriptionFr: 'Programmes d’excellence en leadership mondial et résidences de recherche.',
    displayOrder: 8
  },
  {
    id: 'jcat_entry_level',
    slug: 'entry-level-jobs',
    nameEn: 'Entry-Level Jobs',
    nameRw: 'Imirimo y’Abagitangira',
    nameFr: 'Emplois Débutants',
    descriptionEn: 'Early career positions designed for candidates with 0-2 years of experience.',
    descriptionRw: 'Imirimo y’abafite uburambe buri munsi y’imyaka ibiri cyangwa badafite.',
    descriptionFr: 'Postes d’accès pour candidats ayant 0 à 2 ans d’expérience.',
    displayOrder: 9
  },
  {
    id: 'jcat_part_time',
    slug: 'part-time-jobs',
    nameEn: 'Part-Time Jobs',
    nameRw: 'Akazi k’Igihe Gito',
    nameFr: 'Emplois à Temps Partiel',
    descriptionEn: 'Flexible part-time contracts accommodating ongoing studies or secondary commitments.',
    descriptionRw: 'Akazi kakazi gakorwa mu masaha make akwiranye n’abiga.',
    descriptionFr: 'Postes flexibles compatibles avec les études ou d’autres engagements.',
    displayOrder: 10
  },
  {
    id: 'jcat_full_time',
    slug: 'full-time-jobs',
    nameEn: 'Full-Time Jobs',
    nameRw: 'Akazi k’Igihe Cyose',
    nameFr: 'Emplois à Temps Plein',
    descriptionEn: 'Permanent and fixed-term standard full-time professional employment.',
    descriptionRw: 'Imirimo y’igihe cyose ifite amasezerano arambye n’umushahara wuzuye.',
    descriptionFr: 'Emplois permanents à temps plein avec avantages sociaux.',
    displayOrder: 11
  },
  {
    id: 'jcat_volunteer',
    slug: 'volunteer-opportunities',
    nameEn: 'Volunteer Opportunities',
    nameRw: 'Ubukorerabushake',
    nameFr: 'Opportunités de Bénévolat',
    descriptionEn: 'Community impact, civic engagement, and skill-building volunteer positions.',
    descriptionRw: 'Ibikorwa by’ubukorerabushake byubaka uburambe n’iterambere ry’abaturage.',
    descriptionFr: 'Missions bénévoles d’engagement citoyen et de développement de compétences.',
    displayOrder: 12
  }
];

// Seed Employers
const DEFAULT_EMPLOYERS: Employer[] = [
  {
    id: 'emp_rdb',
    name: 'Rwanda Development Board (RDB)',
    logo: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=120&h=120&q=80',
    website: 'https://rdb.rw',
    description: 'Government agency mandated to accelerate Rwanda’s economic development by fostering private sector growth and digital infrastructure.',
    country: 'Rwanda',
    city: 'Kigali',
    industry: 'Government & Economic Development',
    verified: true,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'emp_undp',
    name: 'United Nations Development Programme (UNDP)',
    logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&h=120&q=80',
    website: 'https://www.undp.org',
    description: 'United Nations global development network promoting inclusive socio-economic recovery, sustainable climate action, and democratic governance.',
    country: 'Rwanda',
    city: 'Kigali',
    industry: 'International Development / NGO',
    verified: true,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'emp_gitlab',
    name: 'GitLab Global Distributed',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    website: 'https://about.gitlab.com',
    description: 'The DevSecOps platform delivered as an all-remote global organization hiring across 65+ countries.',
    country: 'Worldwide',
    city: 'Remote',
    industry: 'Software & Cloud Technology',
    verified: true,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'emp_irembo',
    name: 'Irembo Technologies',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
    website: 'https://irembo.com',
    description: 'Pioneering technology company modernizing public digital services across the African continent from Kigali, Rwanda.',
    country: 'Rwanda',
    city: 'Kigali',
    industry: 'FinTech & GovTech Software',
    verified: true,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'emp_mastercard',
    name: 'Mastercard Foundation',
    logo: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=120&h=120&q=80',
    website: 'https://mastercardfdn.org',
    description: 'Global foundation working with visionary organizations to enable young people in Africa and Indigenous youth in Canada to access dignified work.',
    country: 'Rwanda',
    city: 'Kigali',
    industry: 'Philanthropy & Education NGO',
    verified: true,
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

// Seed Jobs with Verified Details (All clearly marked with [DEMO] tag)
const DEFAULT_JOBS: Job[] = [
  {
    id: 'job_rdb_001',
    title: '[DEMO] Senior Cloud Systems & Security Architect',
    employerId: 'emp_rdb',
    employerName: 'Rwanda Development Board (RDB)',
    country: 'Rwanda',
    city: 'Kigali',
    workplaceArrangement: 'hybrid',
    employmentType: 'Full-Time',
    categorySlug: 'rwanda-jobs',
    experienceLevel: 'Senior',
    educationRequirement: "Bachelor's Degree",
    salaryRange: 'RWF 2,400,000 - 3,200,000 / month',
    requiredSkills: ['Cloud Infrastructure', 'Kubernetes', 'Cybersecurity', 'Terraform', 'PostgreSQL'],
    description: 'The Rwanda Development Board is seeking a Senior Cloud Systems Architect to lead sovereign cloud infrastructure modernization and national digital integration initiatives.',
    responsibilities: [
      'Architect resilient, multi-region government cloud solutions with 99.99% uptime target.',
      'Implement Zero-Trust access control frameworks across national digital service gateways.',
      'Mentor and train junior Rwandan systems engineers in cloud automation and site reliability engineering.'
    ],
    applicationRequirements: [
      'Bachelor’s or Master’s degree in Computer Science, Software Engineering or related discipline.',
      'Minimum 5 years of production cloud infrastructure architecture experience.',
      'Recognized cloud certification (AWS Solutions Architect, Google Cloud Professional, or CKA).'
    ],
    deadline: '2027-04-30',
    originalSourceUrl: 'https://rdb.rw/careers/cloud-architect',
    sourceOrganization: 'Rwanda Development Board Recruitment Portal',
    isDemo: true,
    status: 'VERIFIED',
    providerId: 'user_super_admin_001',
    providerEmail: 'danasitechnicalcollege@gmail.com',
    verifiedAt: '2026-11-01T10:00:00.000Z',
    verifiedBy: 'NDAYIZEYE Samuel',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z'
  },
  {
    id: 'job_undp_002',
    title: '[DEMO] Regional Climate Resilience & Policy Fellow',
    employerId: 'emp_undp',
    employerName: 'United Nations Development Programme (UNDP)',
    country: 'Rwanda',
    city: 'Kigali',
    workplaceArrangement: 'on-site',
    employmentType: 'Fellowship',
    categorySlug: 'fellowships',
    experienceLevel: 'Entry-Level',
    educationRequirement: "Master's Degree",
    salaryRange: 'USD 2,800 - 3,500 / month + UN Stipend',
    requiredSkills: ['Policy Research', 'Environmental Economics', 'Data Analysis', 'Grant Writing'],
    description: 'Prestigious 12-month UNDP Fellowship for young African researchers and policy advocates committed to accelerating climate adaptation frameworks across East and Central Africa.',
    responsibilities: [
      'Conduct rigorous field data collection on agro-ecological resilience in Western and Southern Rwanda.',
      'Co-author multilateral policy briefs for presentation at international climate conferences.',
      'Liaise with community cooperatives to evaluate non-dilutive climate financing distribution.'
    ],
    applicationRequirements: [
      'Master’s degree in Environmental Science, Sustainable Development, Economics or Public Policy.',
      'Strong quantitative research capability with Stata, R, or Python.',
      'Excellent bilingual communication skills in English and French or Kinyarwanda.'
    ],
    deadline: '2027-05-15',
    originalSourceUrl: 'https://jobs.undp.org/climate-fellowship-rwanda',
    sourceOrganization: 'United Nations Global Careers Portal',
    isDemo: true,
    status: 'VERIFIED',
    providerId: 'user_super_admin_001',
    providerEmail: 'danasitechnicalcollege@gmail.com',
    verifiedAt: '2026-11-02T12:00:00.000Z',
    verifiedBy: 'NDAYIZEYE Samuel',
    createdAt: '2026-11-02T12:00:00.000Z',
    updatedAt: '2026-11-02T12:00:00.000Z'
  },
  {
    id: 'job_gitlab_003',
    title: '[DEMO] Staff Site Reliability Engineer — Global Remote',
    employerId: 'emp_gitlab',
    employerName: 'GitLab Global Distributed',
    country: 'Worldwide',
    city: 'Remote',
    workplaceArrangement: 'remote',
    employmentType: 'Full-Time',
    categorySlug: 'remote-jobs',
    experienceLevel: 'Senior',
    educationRequirement: 'Self-Taught / Professional',
    salaryRange: 'USD 120,000 - 150,000 / year + Equity',
    requiredSkills: ['Go', 'Ruby', 'Linux Kernel', 'Prometheus', 'Distributed Systems'],
    description: 'Work from anywhere in the world on GitLab’s core reliability engineering team. Full remote autonomy with global compensation benchmarks.',
    responsibilities: [
      'Maintain sub-100ms API response latency and reliability across millions of global developer pipelines.',
      'Participate in distributed 24/7 on-call rotations with follow-the-sun handoffs.',
      'Design chaos engineering experiments to harden cloud infrastructure against upstream network partitions.'
    ],
    applicationRequirements: [
      'Demonstrated expertise diagnosing production incidents in large-scale distributed cloud systems.',
      'Fluency in asynchronous written collaboration and open-source contribution workflows.',
      'Active GitHub/GitLab portfolio or documented production systems management.'
    ],
    deadline: '2027-06-30',
    originalSourceUrl: 'https://about.gitlab.com/jobs/staff-sre-global',
    sourceOrganization: 'GitLab Global Careers Portal',
    isDemo: true,
    status: 'VERIFIED',
    providerId: 'user_super_admin_001',
    providerEmail: 'danasitechnicalcollege@gmail.com',
    verifiedAt: '2026-11-03T09:00:00.000Z',
    verifiedBy: 'NDAYIZEYE Samuel',
    createdAt: '2026-11-03T09:00:00.000Z',
    updatedAt: '2026-11-03T09:00:00.000Z'
  },
  {
    id: 'job_irembo_004',
    title: '[DEMO] Frontend Software Engineer (React & TypeScript)',
    employerId: 'emp_irembo',
    employerName: 'Irembo Technologies',
    country: 'Rwanda',
    city: 'Kigali',
    workplaceArrangement: 'hybrid',
    employmentType: 'Full-Time',
    categorySlug: 'private-sector-jobs',
    experienceLevel: 'Mid-Level',
    educationRequirement: "Bachelor's Degree",
    salaryRange: 'Competitive Local Tech Compensation + Health Package',
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'REST APIs'],
    description: 'Join the engineering team that powers Rwanda’s unified e-governance platform. Building accessible, fast web applications for over 10 million citizens.',
    responsibilities: [
      'Build responsive citizen-facing portal modules with WCAG AA accessibility compliance.',
      'Optimize frontend bundle sizes for low-bandwidth mobile network environments.',
      'Collaborate with UX researchers to design multilingual interfaces in Kinyarwanda, English, and French.'
    ],
    applicationRequirements: [
      '2+ years of professional web development experience with React and TypeScript.',
      'Demonstrated experience building clean responsive UIs with modern CSS frameworks.',
      'Passion for citizen-centered public digital transformation in Rwanda.'
    ],
    deadline: '2027-04-15',
    originalSourceUrl: 'https://irembo.com/careers/frontend-engineer',
    sourceOrganization: 'Irembo Career Portal',
    isDemo: true,
    status: 'VERIFIED',
    providerId: 'user_super_admin_001',
    providerEmail: 'danasitechnicalcollege@gmail.com',
    verifiedAt: '2026-11-04T14:00:00.000Z',
    verifiedBy: 'NDAYIZEYE Samuel',
    createdAt: '2026-11-04T14:00:00.000Z',
    updatedAt: '2026-11-04T14:00:00.000Z'
  },
  {
    id: 'job_mastercard_005',
    title: '[DEMO] Education Strategy & Youth Inclusion Intern',
    employerId: 'emp_mastercard',
    employerName: 'Mastercard Foundation',
    country: 'Rwanda',
    city: 'Kigali',
    workplaceArrangement: 'on-site',
    employmentType: 'Internship',
    categorySlug: 'internships',
    experienceLevel: 'Entry-Level',
    educationRequirement: "Bachelor's Degree",
    salaryRange: 'Monthly Traineeship Allowance + Transport & Health',
    requiredSkills: ['Stakeholder Research', 'Technical Writing', 'Data Analysis', 'Project Tracking'],
    description: '6-month structured internship at the Mastercard Foundation Africa Hub in Kigali, supporting higher-education scholarship programs across Africa.',
    responsibilities: [
      'Assist program directors with monitoring university scholarship cohort progress.',
      'Prepare summary documentation and presentation decks for institutional stakeholders.',
      'Coordinate feedback sessions with student scholars and alumni leadership networks.'
    ],
    applicationRequirements: [
      'Recent university graduate (graduated within last 18 months).',
      'Strong academic record and demonstrable leadership in campus or community initiatives.',
      'Proficiency in Microsoft Office / Google Workspace and written English.'
    ],
    deadline: '2027-05-30',
    originalSourceUrl: 'https://mastercardfdn.org/careers/education-intern',
    sourceOrganization: 'Mastercard Foundation Global Portal',
    isDemo: true,
    status: 'VERIFIED',
    providerId: 'user_super_admin_001',
    providerEmail: 'danasitechnicalcollege@gmail.com',
    verifiedAt: '2026-11-05T08:00:00.000Z',
    verifiedBy: 'NDAYIZEYE Samuel',
    createdAt: '2026-11-05T08:00:00.000Z',
    updatedAt: '2026-11-05T08:00:00.000Z'
  },
  {
    id: 'job_pending_006',
    title: '[DEMO] Junior AI Data Annotation Associate (Provider Submission)',
    employerId: 'emp_irembo',
    employerName: 'African Tech Alliance Partner',
    country: 'Rwanda',
    city: 'Kigali',
    workplaceArrangement: 'hybrid',
    employmentType: 'Part-Time',
    categorySlug: 'part-time-jobs',
    experienceLevel: 'Entry-Level',
    educationRequirement: 'High School',
    salaryRange: 'RWF 350,000 / month',
    requiredSkills: ['Kinyarwanda NLP', 'Computer Literacy', 'Text Evaluation'],
    description: 'Part-time opportunity evaluating Kinyarwanda natural language datasets for speech-to-text models. Under administrative moderation review.',
    responsibilities: [
      'Review and annotate audio transcriptions for acoustic speech training models.',
      'Flag translation inconsistencies and dialectal variants across Rwandan regions.'
    ],
    applicationRequirements: [
      'Native fluency in Kinyarwanda with excellent spelling and grammar.',
      'Basic computer literacy and attention to detail.'
    ],
    deadline: '2027-06-15',
    originalSourceUrl: 'https://africantech.org/vacancies/kinyarwanda-ai',
    sourceOrganization: 'Partner Submission Portal',
    isDemo: true,
    status: 'PENDING_REVIEW',
    providerId: 'user_student_002',
    providerEmail: 'student@danasi.com',
    createdAt: '2026-11-06T15:00:00.000Z',
    updatedAt: '2026-11-06T15:00:00.000Z'
  }
];

export const DEFAULT_JOB_SOURCES: JobSourceConfig[] = [
  {
    id: 'remotive',
    name: 'Remotive Public API',
    description: 'Global remote tech, marketing, and design opportunities directly from Remotive.',
    type: 'PUBLIC_FEED',
    website: 'https://remotive.com',
    attribution: 'Remote opportunities provided via Remotive Public API',
    termsUrl: 'https://remotive.com/remote-jobs/api',
    enabled: true,
    status: 'CONNECTED',
    syncIntervalHours: 6,
    totalJobsImported: 0,
    activeJobsCount: 0,
    duplicatesCount: 0,
    requiresAuth: false,
    authConfigured: true,
    lastSyncStatus: 'NEVER_RUN',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'arbeitnow',
    name: 'Arbeitnow API',
    description: 'European, visa-sponsored, and global remote opportunities from Arbeitnow.',
    type: 'PUBLIC_FEED',
    website: 'https://www.arbeitnow.com',
    attribution: 'European & Global opportunities provided via Arbeitnow API',
    termsUrl: 'https://www.arbeitnow.com/blog/job-board-api',
    enabled: true,
    status: 'CONNECTED',
    syncIntervalHours: 6,
    totalJobsImported: 0,
    activeJobsCount: 0,
    duplicatesCount: 0,
    requiresAuth: false,
    authConfigured: true,
    lastSyncStatus: 'NEVER_RUN',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'adzuna',
    name: 'Adzuna API',
    description: 'Global multi-country search index with salary normalization.',
    type: 'API',
    website: 'https://www.adzuna.com',
    attribution: 'Jobs indexed via Adzuna Global Employment Engine',
    termsUrl: 'https://developer.adzuna.com/overview',
    enabled: false,
    status: (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) ? 'CONNECTED' : 'CONFIGURATION_REQUIRED',
    errorMessage: (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) ? undefined : 'Adzuna API credentials (ADZUNA_APP_ID, ADZUNA_APP_KEY) required in .env',
    syncIntervalHours: 6,
    totalJobsImported: 0,
    activeJobsCount: 0,
    duplicatesCount: 0,
    requiresAuth: true,
    authConfigured: Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY),
    lastSyncStatus: 'NEVER_RUN',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mifotra',
    name: 'Rwanda MIFOTRA Recruitment Portal',
    description: 'Official Government of Rwanda public service vacancies from ministries, agencies, and districts.',
    type: 'OFFICIAL_GOV_PORTAL',
    website: 'https://www.recruitment.mifotra.gov.rw/',
    attribution: 'Official Government of Rwanda Public Service Recruitment Portal (MIFOTRA)',
    termsUrl: 'https://www.recruitment.mifotra.gov.rw/',
    enabled: true,
    status: 'CONNECTED',
    syncIntervalHours: 12,
    totalJobsImported: 0,
    activeJobsCount: 0,
    duplicatesCount: 0,
    requiresAuth: false,
    authConfigured: true,
    lastSyncStatus: 'NEVER_RUN',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'united_nations',
    name: 'United Nations Careers',
    description: 'Official United Nations Secretariat, UNDP, UNICEF, and UN agency opportunities worldwide.',
    type: 'INSTITUTIONAL_PORTAL',
    website: 'https://careers.un.org/',
    attribution: 'Official United Nations Careers & Global Secretariat Vacancy Notice',
    termsUrl: 'https://careers.un.org/',
    enabled: true,
    status: 'CONNECTED',
    syncIntervalHours: 12,
    totalJobsImported: 0,
    activeJobsCount: 0,
    duplicatesCount: 0,
    requiresAuth: false,
    authConfigured: true,
    lastSyncStatus: 'NEVER_RUN',
    updatedAt: new Date().toISOString()
  }
];

class FirestoreDatabase {
  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const settingsRef = doc(firestore, 'platform_settings', 'global');
      const settingsSnap = await getDoc(settingsRef);

      if (!settingsSnap.exists()) {
        console.log('[Firestore] Seeding initial platform foundation...');
        await this.runBaseMigrations();
      }

      // Check if DANASI JOBS module categories are seeded
      const jobCatCheck = await getDoc(doc(firestore, 'job_categories', 'jcat_rwanda'));
      if (!jobCatCheck.exists()) {
        console.log('[Firestore] Seeding DANASI JOBS Module data...');
        await this.runJobsMigrations();
      }

      // Check if Real Job Data Sources are seeded
      const remotiveSourceCheck = await getDoc(doc(firestore, 'job_sources', 'remotive'));
      if (!remotiveSourceCheck.exists()) {
        console.log('[Firestore] Seeding Real Job Data Sources configuration...');
        await this.runSourceMigrations();
      }

      this.initialized = true;
      console.log('[Firestore] Database connected and operational with Real Job Data Engine.');
    } catch (err) {
      console.error('[Firestore] Initialization error:', err);
    }
  }

  private async runBaseMigrations(): Promise<void> {
    const batch = writeBatch(firestore);
    const now = new Date().toISOString();

    const settings: PlatformSettings = {
      platformName: 'DANASI OPPORTUNITY HUB',
      tagline: 'Your Gateway to Jobs, Scholarships & Global Opportunities.',
      founder: 'NDAYIZEYE Samuel',
      contactEmail: 'hello@danasi.com',
      supportPhone: '+250 788 000 000',
      maintenanceMode: false,
      registrationOpen: true,
      defaultLanguage: 'en',
      systemNotice: 'DANASI Opportunity Hub Phase 2 live with DANASI JOBS discovery and application preparation engine.',
      updatedAt: now
    };
    batch.set(doc(firestore, 'platform_settings', 'global'), settings);

    // Super Admin Account (Founder: NDAYIZEYE Samuel)
    const adminInitialPassword = process.env.DANASI_ADMIN_INITIAL_PASSWORD;
    if (!adminInitialPassword) {
      throw new Error('[Firestore] DANASI_ADMIN_INITIAL_PASSWORD env variable is required for first-run seeding.');
    }
    const { hash: adminHash, salt: adminSalt } = hashPassword(adminInitialPassword);
    const { hash: adminHash, salt: adminSalt } = hashPassword('DanasiAdmin2026!');
    batch.set(doc(firestore, 'users', superAdminId), {
      id: superAdminId,
      email: 'danasitechnicalcollege@gmail.com',
      passwordHash: adminHash,
      salt: adminSalt,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isSuspended: false,
      createdAt: now,
      updatedAt: now
    });

    batch.set(doc(firestore, 'user_profiles', superAdminId), {
      userId: superAdminId,
      fullName: 'NDAYIZEYE Samuel',
      country: 'Rwanda',
      city: 'Kigali',
      headline: 'Founder & Project Owner, DANASI OPPORTUNITY HUB',
      bio: 'Dedicated to empowering Rwandan and African talent through verified global opportunities, education access, and institutional career pipelines.',
      educationLevel: "Bachelor's Degree",
      professionalInterests: ['Education Technology', 'Global Mobility', 'Institutional Partnerships', 'Youth Empowerment'],
      preferredCategories: ['scholarships', 'jobs', 'remote-jobs', 'grants'],
      preferredLanguage: 'en',
      createdAt: now,
      updatedAt: now
    });

    // Test Candidate Account (Aline Keza)
    const studentInitialPassword = process.env.DANASI_STUDENT_INITIAL_PASSWORD;
    if (!studentInitialPassword) {
      throw new Error('[Firestore] DANASI_STUDENT_INITIAL_PASSWORD env variable is required for first-run seeding.');
    }
    const { hash: studentHash, salt: studentSalt } = hashPassword(studentInitialPassword);
    const { hash: studentHash, salt: studentSalt } = hashPassword('Student2026!');
    batch.set(doc(firestore, 'users', studentId), {
      id: studentId,
      email: 'student@danasi.com',
      passwordHash: studentHash,
      salt: studentSalt,
      role: 'STUDENT_JOBSEEKER',
      emailVerified: true,
      isSuspended: false,
      createdAt: now,
      updatedAt: now
    });

    batch.set(doc(firestore, 'user_profiles', studentId), {
      userId: studentId,
      fullName: 'Aline Keza',
      country: 'Rwanda',
      city: 'Kigali',
      headline: 'Computer Science Graduate & Global Fellowship Aspirant',
      bio: 'Passionate about artificial intelligence and seeking career opportunities in Rwanda and worldwide.',
      educationLevel: "Bachelor's Degree",
      professionalInterests: ['Computer Science', 'Software Engineering', 'Data Analytics'],
      preferredCategories: ['scholarships', 'internships', 'remote-jobs'],
      preferredLanguage: 'en',
      createdAt: now,
      updatedAt: now
    });

    await batch.commit();
  }

  private async runJobsMigrations(): Promise<void> {
    const batch = writeBatch(firestore);

    // 1. Seed 12 Job Categories
    for (const cat of JOB_CATEGORIES) {
      batch.set(doc(firestore, 'job_categories', cat.id), cat);
    }

    // 2. Seed Employers
    for (const emp of DEFAULT_EMPLOYERS) {
      batch.set(doc(firestore, 'employers', emp.id), emp);
    }

    // 3. Seed Demo Jobs
    for (const job of DEFAULT_JOBS) {
      batch.set(doc(firestore, 'jobs', job.id), job);
    }

    await batch.commit();
    console.log('[Firestore] Seeded 12 Job Categories, Employers, and Demo Jobs successfully.');
  }

  private async runSourceMigrations(): Promise<void> {
    const batch = writeBatch(firestore);
    for (const src of DEFAULT_JOB_SOURCES) {
      batch.set(doc(firestore, 'job_sources', src.id), cleanUndefined(src));
    }
    await batch.commit();
    console.log('[Firestore] Seeded 5 Real Job Data Sources successfully.');
  }

  // ---------------------------------------------------------------------------
  // JOBS MODULE METHODS
  // ---------------------------------------------------------------------------

  public async getJobCategories(): Promise<JobCategoryDefinition[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'job_categories'));
    if (snap.empty) return JOB_CATEGORIES;
    return snap.docs
      .map((d) => d.data() as JobCategoryDefinition)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public async getJobs(params?: {
    keyword?: string;
    country?: string;
    city?: string;
    categorySlug?: string;
    employmentType?: string;
    experienceLevel?: string;
    educationRequirement?: string;
    workplaceArrangement?: string;
    status?: JobVerificationStatus | 'ALL';
    source?: string;
    includeDemo?: boolean;
    sortBy?: 'latest' | 'deadline' | 'relevance';
    limitCount?: number;
    offset?: number;
  }): Promise<{ jobs: Job[]; totalCount: number }> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'jobs'));
    let allJobs = snap.docs.map((d) => d.data() as Job);

    // Expiration dynamic check
    const nowStr = new Date().toISOString().split('T')[0];
    allJobs = allJobs.map((j) => {
      if (j.status === 'VERIFIED' && j.deadline && j.deadline < nowStr) {
        return { ...j, status: 'EXPIRED' as JobVerificationStatus };
      }
      return j;
    });

    // Filtering
    let filtered = allJobs;

    if (params?.status && params.status !== 'ALL') {
      filtered = filtered.filter((j) => j.status === params.status);
    } else if (!params?.status) {
      // Default public view only shows VERIFIED listings
      filtered = filtered.filter((j) => j.status === 'VERIFIED');
    }

    if (params?.source && params.source !== 'ALL') {
      const src = params.source.toLowerCase();
      filtered = filtered.filter((j) => {
        if (src === 'danasi direct') {
          return !j.sourceName || j.sourceName.toLowerCase() === 'danasi direct';
        }
        return j.sourceName?.toLowerCase() === src;
      });
    }

    if (params?.includeDemo === false) {
      filtered = filtered.filter((j) => !j.isDemo);
    }

    if (params?.keyword) {
      const q = params.keyword.toLowerCase();
      filtered = filtered.filter((j) =>
        j.title.toLowerCase().includes(q) ||
        j.employerName.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        (j.sourceName && j.sourceName.toLowerCase().includes(q)) ||
        j.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (params?.country && params.country !== 'ALL') {
      filtered = filtered.filter((j) => j.country.toLowerCase() === params.country!.toLowerCase());
    }

    if (params?.city && params.city !== 'ALL') {
      filtered = filtered.filter((j) => j.city.toLowerCase() === params.city!.toLowerCase());
    }

    if (params?.categorySlug && params.categorySlug !== 'ALL') {
      filtered = filtered.filter((j) => j.categorySlug === params.categorySlug);
    }

    if (params?.employmentType && params.employmentType !== 'ALL') {
      filtered = filtered.filter((j) => j.employmentType === params.employmentType);
    }

    if (params?.experienceLevel && params.experienceLevel !== 'ALL') {
      filtered = filtered.filter((j) => j.experienceLevel === params.experienceLevel);
    }

    if (params?.educationRequirement && params.educationRequirement !== 'ALL') {
      filtered = filtered.filter((j) => j.educationRequirement === params.educationRequirement);
    }

    if (params?.workplaceArrangement && params.workplaceArrangement !== 'ALL') {
      filtered = filtered.filter((j) => j.workplaceArrangement === params.workplaceArrangement);
    }

    // Sorting
    if (params?.sortBy === 'deadline') {
      filtered.sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'));
    } else {
      // Default: latest created first
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const totalCount = filtered.length;
    const offset = params?.offset || 0;
    const limit = params?.limitCount || 50;
    const paginated = filtered.slice(offset, offset + limit);

    return { jobs: paginated, totalCount };
  }

  public async getJobById(id: string): Promise<Job | undefined> {
    await this.init();
    const snap = await getDoc(doc(firestore, 'jobs', id));
    if (!snap.exists()) return undefined;
    return snap.data() as Job;
  }

  // Duplicate and Suspicious Link Detection
  public async detectSuspiciousFlags(job: Partial<Job>): Promise<string[]> {
    const flags: string[] = [];
    const url = job.originalSourceUrl?.trim() || '';

    // 1. Non-HTTPS or missing protocol
    if (!url.startsWith('https://')) {
      flags.push('SUSPICIOUS_PROTOCOL: Application link is not secure (must use https://).');
    }

    // 2. Generic URL shorteners (often used in phishing scams)
    if (/bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd/i.test(url)) {
      flags.push('SUSPICIOUS_REDIRECT: URL shorteners are prohibited on DANASI for verified vacancies.');
    }

    // 3. Free form hosts claiming to be verified enterprises
    if (/forms\.gle|docs\.google\.com\/forms|typeform\.com|formstack\.com/i.test(url)) {
      flags.push('FREE_FORM_HOST: Corporate or government positions must direct to official career pages.');
    }

    // 4. Misleading or exaggerated salary claims
    if (job.salaryRange && /(million dollars|100% guaranteed|immediate cash|1000000 per day)/i.test(job.salaryRange)) {
      flags.push('UNREALISTIC_COMPENSATION: Flagged for potentially misleading salary claims.');
    }

    return flags;
  }

  public async checkDuplicateJob(title: string, employerName: string, sourceUrl: string): Promise<Job | undefined> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'jobs'));
    const all = snap.docs.map((d) => d.data() as Job);

    const normTitle = title.trim().toLowerCase();
    const normEmp = employerName.trim().toLowerCase();
    const normUrl = sourceUrl.trim().toLowerCase();

    return all.find((j) => {
      const matchUrl = j.originalSourceUrl.trim().toLowerCase() === normUrl;
      const matchTitleAndEmp = j.title.trim().toLowerCase() === normTitle && j.employerName.trim().toLowerCase() === normEmp;
      return matchUrl || matchTitleAndEmp;
    });
  }

  public async createJob(
    jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'suspiciousFlags' | 'providerId' | 'providerEmail'>,
    providerId: string,
    providerEmail: string
  ): Promise<{ job: Job; duplicateWarning?: boolean }> {
    await this.init();

    // Check Duplicate
    const existing = await this.checkDuplicateJob(jobData.title, jobData.employerName, jobData.originalSourceUrl);
    let duplicateWarning = false;
    if (existing) {
      duplicateWarning = true;
    }

    // Detect suspicious links
    const suspiciousFlags = await this.detectSuspiciousFlags(jobData);

    const now = new Date().toISOString();
    const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const newJob: Job = {
      ...jobData,
      id: jobId,
      status: 'PENDING_REVIEW', // Mandatory review workflow
      suspiciousFlags,
      providerId,
      providerEmail,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(doc(firestore, 'jobs', jobId), newJob);

    // Initial Verification Record
    const recordId = `vrec_${Date.now()}`;
    await setDoc(doc(firestore, 'verification_records', recordId), {
      id: recordId,
      jobId,
      jobTitle: newJob.title,
      previousStatus: 'PENDING_REVIEW',
      newStatus: 'PENDING_REVIEW',
      moderatorId: providerId,
      moderatorEmail: providerEmail,
      notes: duplicateWarning
        ? 'Submitted with duplicate vacancy alert. Requires manual admin cross-verification.'
        : suspiciousFlags.length > 0
        ? `Submitted with ${suspiciousFlags.length} security flags.`
        : 'Initial submission by opportunity provider.',
      timestamp: now
    } as VerificationRecord);

    return { job: newJob, duplicateWarning };
  }

  public async moderateJob(jobId: string, newStatus: JobVerificationStatus, moderatorId: string, moderatorEmail: string, notes?: string, rejectionReason?: string): Promise<Job | undefined> {
    await this.init();
    const ref = doc(firestore, 'jobs', jobId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;

    const existing = snap.data() as Job;
    const now = new Date().toISOString();

    const updates: Partial<Job> = {
      status: newStatus,
      updatedAt: now
    };

    if (newStatus === 'VERIFIED') {
      updates.verifiedAt = now;
      updates.verifiedBy = moderatorEmail;
      updates.rejectionReason = '';
    } else if (newStatus === 'REJECTED') {
      updates.rejectionReason = rejectionReason || notes || 'Listing does not comply with verification criteria.';
    }

    await updateDoc(ref, updates);

    // Record in verification audit table
    const recordId = `vrec_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    await setDoc(doc(firestore, 'verification_records', recordId), {
      id: recordId,
      jobId,
      jobTitle: existing.title,
      previousStatus: existing.status,
      newStatus,
      moderatorId,
      moderatorEmail,
      notes: notes || `Moderation action: ${newStatus}`,
      timestamp: now
    } as VerificationRecord);

    // Add platform audit log
    await this.addAuditLog({
      actorId: moderatorId,
      actorEmail: moderatorEmail,
      action: `JOB_MODERATION_${newStatus}`,
      entity: 'Job',
      entityId: jobId,
      details: `Job "${existing.title}" transitioned from ${existing.status} to ${newStatus}. Notes: ${notes || 'N/A'}`,
      ipAddress: '127.0.0.1'
    });

    return { ...existing, ...updates } as Job;
  }

  public async getVerificationRecords(jobId?: string): Promise<VerificationRecord[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'verification_records'));
    let all = snap.docs.map((d) => d.data() as VerificationRecord);
    if (jobId) {
      all = all.filter((r) => r.jobId === jobId);
    }
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Employers
  public async getEmployers(): Promise<Employer[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'employers'));
    if (snap.empty) return DEFAULT_EMPLOYERS;
    return snap.docs.map((d) => d.data() as Employer);
  }

  public async createEmployer(data: Omit<Employer, 'id' | 'createdAt' | 'updatedAt' | 'verified' | 'createdBy'>, creatorId: string): Promise<Employer> {
    await this.init();
    const id = `emp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();
    const emp: Employer = {
      ...data,
      id,
      verified: false, // Must be verified by admin
      createdBy: creatorId,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(doc(firestore, 'employers', id), emp);
    return emp;
  }

  // Job Reports (Fraud & Suspicious Reporting)
  public async reportJob(reportData: Omit<JobReport, 'id' | 'status' | 'createdAt'>): Promise<JobReport> {
    await this.init();
    const id = `jrep_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const report: JobReport = {
      ...reportData,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'job_reports', id), report);

    // Notify admins via audit log
    await this.addAuditLog({
      actorId: reportData.reporterId || 'anonymous',
      actorEmail: reportData.reporterEmail || 'guest',
      action: 'JOB_REPORT_FILED',
      entity: 'Job',
      entityId: reportData.jobId,
      details: `Vacancy reported for reason: ${reportData.reason}. Details: ${reportData.details}`,
      ipAddress: '127.0.0.1'
    });

    return report;
  }

  public async getJobReports(): Promise<JobReport[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'job_reports'));
    return snap.docs.map((d) => d.data() as JobReport).reverse();
  }

  public async updateJobReportStatus(reportId: string, status: 'resolved' | 'dismissed', moderatorId: string): Promise<JobReport | undefined> {
    await this.init();
    const ref = doc(firestore, 'job_reports', reportId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;

    const updates = cleanUndefined({
      status,
      resolvedAt: new Date().toISOString(),
      resolvedBy: moderatorId
    });
    await updateDoc(ref, updates);
    return { ...snap.data(), ...updates } as JobReport;
  }

  // ---------------------------------------------------------------------------
  // DATA SOURCES & SYNC ENGINE METHODS
  // ---------------------------------------------------------------------------

  public async getJobSources(): Promise<JobSourceConfig[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'job_sources'));
    if (snap.empty) return DEFAULT_JOB_SOURCES;
    return snap.docs.map((d) => d.data() as JobSourceConfig);
  }

  public async getJobSourceById(id: string): Promise<JobSourceConfig | undefined> {
    await this.init();
    const snap = await getDoc(doc(firestore, 'job_sources', id));
    if (!snap.exists()) return undefined;
    return snap.data() as JobSourceConfig;
  }

  public async updateJobSource(id: string, updates: Partial<JobSourceConfig>): Promise<JobSourceConfig | undefined> {
    await this.init();
    const ref = doc(firestore, 'job_sources', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;

    const updated = cleanUndefined({
      ...snap.data(),
      ...updates,
      updatedAt: new Date().toISOString()
    }) as JobSourceConfig;
    await updateDoc(ref, updated as any);
    return updated;
  }

  public async recordSyncRun(run: Omit<JobSyncRun, 'id' | 'startedAt'>): Promise<JobSyncRun> {
    await this.init();
    const id = `sync_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const newRun: JobSyncRun = cleanUndefined({
      ...run,
      id,
      startedAt: new Date().toISOString()
    });
    await setDoc(doc(firestore, 'job_sync_runs', id), newRun);
    return newRun;
  }

  public async updateSyncRun(id: string, updates: Partial<JobSyncRun>): Promise<JobSyncRun | undefined> {
    await this.init();
    const ref = doc(firestore, 'job_sync_runs', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;

    const updated = cleanUndefined({
      ...snap.data(),
      ...updates
    }) as JobSyncRun;
    await updateDoc(ref, updated as any);
    return updated;
  }

  public async getSyncRuns(limitCount = 50): Promise<JobSyncRun[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'job_sync_runs'));
    const all = snap.docs.map((d) => d.data() as JobSyncRun);
    return all
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limitCount);
  }

  public async addSourceLog(log: Omit<JobSourceLog, 'id' | 'timestamp'>): Promise<JobSourceLog> {
    await this.init();
    const id = `slog_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const newLog: JobSourceLog = cleanUndefined({
      ...log,
      id,
      timestamp: new Date().toISOString()
    });
    await setDoc(doc(firestore, 'job_source_logs', id), newLog);
    return newLog;
  }

  public async getSourceLogs(sourceId?: string, limitCount = 60): Promise<JobSourceLog[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'job_source_logs'));
    let all = snap.docs.map((d) => d.data() as JobSourceLog);
    if (sourceId && sourceId !== 'ALL') {
      all = all.filter((l) => l.sourceId === sourceId);
    }
    return all
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limitCount);
  }

  public async importNormalizedJobs(
    jobs: NormalizedJob[],
    sourceId: string,
    runId: string
  ): Promise<{ importedCount: number; duplicatesCount: number; errorsCount: number }> {
    await this.init();
    let importedCount = 0;
    let duplicatesCount = 0;
    let errorsCount = 0;

    const snap = await getDocs(collection(firestore, 'jobs'));
    const existingJobs = snap.docs.map((d) => d.data() as Job);

    // Fast duplicate detection lookups
    const existingExternalIds = new Set<string>();
    const existingUrls = new Set<string>();
    const existingHashes = new Set<string>();
    const existingKeys = new Set<string>();

    for (const ej of existingJobs) {
      if (ej.externalJobId) existingExternalIds.add(`${ej.sourceName || ''}:${ej.externalJobId}`);
      if (ej.originalSourceUrl) existingUrls.add(ej.originalSourceUrl.toLowerCase().trim());
      if (ej.contentHash) existingHashes.add(ej.contentHash);
      existingKeys.add(`${ej.title.toLowerCase().trim()}|${ej.employerName.toLowerCase().trim()}`);
    }

    const now = new Date().toISOString();

    for (const nJob of jobs) {
      try {
        const extKey = `${nJob.sourceName}:${nJob.externalJobId}`;
        const urlKey = nJob.originalApplicationUrl.toLowerCase().trim();
        const normKey = `${nJob.title.toLowerCase().trim()}|${nJob.employerName.toLowerCase().trim()}`;
        const hash = crypto.createHash('sha256').update(`${normKey}|${nJob.description.slice(0, 300)}`).digest('hex');

        // Check if duplicate
        if (
          existingExternalIds.has(extKey) ||
          existingUrls.has(urlKey) ||
          existingHashes.has(hash) ||
          existingKeys.has(normKey)
        ) {
          duplicatesCount++;
          continue;
        }

        const jobId = `job_${sourceId}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        const newJob: Job = cleanUndefined({
          id: jobId,
          externalJobId: nJob.externalJobId,
          title: nJob.title,
          employerId: `emp_${sourceId}_${crypto.randomBytes(3).toString('hex')}`,
          employerName: nJob.employerName,
          employerWebsite: nJob.employerWebsite,
          employerLogo: nJob.employerLogo,
          country: nJob.country,
          city: nJob.city,
          workplaceArrangement: nJob.workplaceArrangement,
          employmentType: nJob.employmentType,
          categorySlug: nJob.categorySlug,
          experienceLevel: nJob.experienceLevel,
          educationRequirement: nJob.educationRequirement,
          salaryMin: nJob.salaryMin,
          salaryMax: nJob.salaryMax,
          salaryCurrency: nJob.salaryCurrency,
          salaryRange: nJob.salaryRange,
          requiredSkills: nJob.requiredSkills,
          description: nJob.description,
          responsibilities: nJob.responsibilities,
          applicationRequirements: nJob.applicationRequirements,
          deadline: nJob.deadline,
          originalSourceUrl: nJob.originalApplicationUrl,
          sourceName: nJob.sourceName,
          sourceUrl: nJob.sourceUrl,
          sourceAttribution: nJob.sourceAttribution,
          sourcePublishedAt: nJob.sourcePublishedAt || now,
          importedAt: now,
          lastVerifiedAt: now,
          publicationStatus: 'PUBLISHED',
          expirationStatus: 'ACTIVE',
          contentHash: hash,
          isDemo: false,
          status: nJob.status || 'VERIFIED',
          providerId: `system_${sourceId}`,
          providerEmail: 'data-engine@danasi.com',
          createdAt: now,
          updatedAt: now
        });

        await setDoc(doc(firestore, 'jobs', jobId), newJob);

        existingExternalIds.add(extKey);
        existingUrls.add(urlKey);
        existingHashes.add(hash);
        existingKeys.add(normKey);
        importedCount++;
      } catch (err) {
        errorsCount++;
        console.error(`[DataEngine] Error importing job ${nJob.title}:`, err);
      }
    }

    // Update Source Statistics
    const sourceRef = doc(firestore, 'job_sources', sourceId);
    const sourceSnap = await getDoc(sourceRef);
    if (sourceSnap.exists()) {
      const src = sourceSnap.data() as JobSourceConfig;
      await updateDoc(sourceRef, cleanUndefined({
        totalJobsImported: (src.totalJobsImported || 0) + importedCount,
        duplicatesCount: (src.duplicatesCount || 0) + duplicatesCount,
        lastSyncAt: now,
        lastSyncStatus: errorsCount > 0 ? (importedCount > 0 ? 'PARTIAL' : 'FAILED') : 'SUCCESS',
        updatedAt: now
      }));
    }

    return { importedCount, duplicatesCount, errorsCount };
  }

  // Candidate Saved Jobs
  public async getSavedJobs(userId: string): Promise<SavedJob[]> {
    await this.init();
    const q = query(collection(firestore, 'saved_jobs'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SavedJob);
  }

  public async saveJob(userId: string, job: Job): Promise<SavedJob> {
    await this.init();
    const q = query(collection(firestore, 'saved_jobs'), where('userId', '==', userId), where('jobId', '==', job.id));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as SavedJob;
    }

    const id = `sjob_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const saved: SavedJob = cleanUndefined({
      id,
      userId,
      jobId: job.id,
      jobTitle: job.title,
      employerName: job.employerName,
      workplaceArrangement: job.workplaceArrangement,
      deadline: job.deadline || '',
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(firestore, 'saved_jobs', id), saved);
    return saved;
  }

  public async removeSavedJob(userId: string, savedJobId: string): Promise<boolean> {
    await this.init();
    const ref = doc(firestore, 'saved_jobs', savedJobId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    if (snap.data().userId !== userId) return false;

    await deleteDoc(ref);
    return true;
  }

  // Candidate Application Tracking
  public async getJobApplications(userId: string): Promise<JobApplicationTracker[]> {
    await this.init();
    const q = query(collection(firestore, 'job_applications'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as JobApplicationTracker);
  }

  public async trackJobApplication(data: Omit<JobApplicationTracker, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobApplicationTracker> {
    await this.init();
    const q = query(collection(firestore, 'job_applications'), where('userId', '==', data.userId), where('jobId', '==', data.jobId));
    const snap = await getDocs(q);
    const now = new Date().toISOString();

    if (!snap.empty) {
      // Update existing record
      const existingDoc = snap.docs[0];
      const updated = cleanUndefined({
        ...existingDoc.data(),
        ...data,
        updatedAt: now
      }) as JobApplicationTracker;
      await updateDoc(existingDoc.ref, updated as any);
      return updated;
    }

    const id = `japp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const application: JobApplicationTracker = cleanUndefined({
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    });
    await setDoc(doc(firestore, 'job_applications', id), application);
    return application;
  }

  public async updateJobApplication(appId: string, userId: string, updates: Partial<JobApplicationTracker>): Promise<JobApplicationTracker | undefined> {
    await this.init();
    const ref = doc(firestore, 'job_applications', appId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;
    if (snap.data().userId !== userId) return undefined;

    const updated = cleanUndefined({
      ...snap.data(),
      ...updates,
      updatedAt: new Date().toISOString()
    }) as JobApplicationTracker;
    await updateDoc(ref, updated as any);
    return updated;
  }

  // Saved Items (General)
  public async getSavedItems(userId: string): Promise<SavedItem[]> {
    await this.init();
    const q = query(collection(firestore, 'saved_items'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SavedItem);
  }

  public async addSavedItem(userId: string, data: Omit<SavedItem, 'id' | 'userId' | 'createdAt'>): Promise<SavedItem> {
    await this.init();
    const id = `saved_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const item: SavedItem = cleanUndefined({
      ...data,
      id,
      userId,
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(firestore, 'saved_items', id), item);
    return item;
  }

  public async removeSavedItem(userId: string, id: string): Promise<boolean> {
    await this.init();
    const ref = doc(firestore, 'saved_items', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    if (snap.data().userId !== userId) return false;
    await deleteDoc(ref);
    return true;
  }

  // ---------------------------------------------------------------------------
  // BASE PLATFORM METHODS
  // ---------------------------------------------------------------------------

  public async getUsers(): Promise<User[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'users'));
    return snap.docs.map((d) => d.data() as User);
  }

  public async getUserById(id: string): Promise<User | undefined> {
    await this.init();
    const snap = await getDoc(doc(firestore, 'users', id));
    return snap.exists() ? (snap.data() as User) : undefined;
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    await this.init();
    const q = query(collection(firestore, 'users'), where('email', '==', email.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (snap.empty) return undefined;
    return snap.docs[0].data() as User;
  }

  public async createUser(user: User, profile: UserProfile, preferences: UserPreferences): Promise<void> {
    await this.init();
    await runTransaction(firestore, async (transaction) => {
      const userRef = doc(firestore, 'users', user.id);
      const profileRef = doc(firestore, 'user_profiles', user.id);
      const prefsRef = doc(firestore, 'user_preferences', user.id);

      transaction.set(userRef, user);
      transaction.set(profileRef, profile);
      transaction.set(prefsRef, preferences);
    });
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    await this.init();
    const userRef = doc(firestore, 'users', id);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return undefined;

    const updatedData = { ...snap.data(), ...updates, updatedAt: new Date().toISOString() };
    await updateDoc(userRef, updatedData);
    return updatedData as User;
  }

  public async getProfileByUserId(userId: string): Promise<UserProfile | undefined> {
    await this.init();
    const snap = await getDoc(doc(firestore, 'user_profiles', userId));
    return snap.exists() ? (snap.data() as UserProfile) : undefined;
  }

  public async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    await this.init();
    const profileRef = doc(firestore, 'user_profiles', userId);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) return undefined;

    const updatedData = { ...snap.data(), ...updates, updatedAt: new Date().toISOString() };
    await updateDoc(profileRef, updatedData);
    return updatedData as UserProfile;
  }

  public async getPreferencesByUserId(userId: string): Promise<UserPreferences | undefined> {
    await this.init();
    const snap = await getDoc(doc(firestore, 'user_preferences', userId));
    return snap.exists() ? (snap.data() as UserPreferences) : undefined;
  }

  public async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences | undefined> {
    await this.init();
    const prefsRef = doc(firestore, 'user_preferences', userId);
    const snap = await getDoc(prefsRef);
    const updatedData = snap.exists()
      ? { ...snap.data(), ...updates, updatedAt: new Date().toISOString() }
      : { userId, emailNotifications: true, opportunityAlerts: true, weeklyDigest: true, theme: 'light', ...updates, updatedAt: new Date().toISOString() };

    await setDoc(prefsRef, updatedData);
    return updatedData as UserPreferences;
  }

  public async getRoles(): Promise<RoleDefinition[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'roles'));
    return snap.docs.map((d) => d.data() as RoleDefinition);
  }

  public async getPlatformSettings(): Promise<PlatformSettings> {
    await this.init();
    const snap = await getDoc(doc(firestore, 'platform_settings', 'global'));
    if (!snap.exists()) {
      return {
        platformName: 'DANASI OPPORTUNITY HUB',
        tagline: 'Your Gateway to Jobs, Scholarships & Global Opportunities.',
        founder: 'NDAYIZEYE Samuel',
        contactEmail: 'hello@danasi.com',
        supportPhone: '+250 788 000 000',
        maintenanceMode: false,
        registrationOpen: true,
        defaultLanguage: 'en',
        updatedAt: new Date().toISOString()
      };
    }
    return snap.data() as PlatformSettings;
  }

  public async updatePlatformSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    await this.init();
    const ref = doc(firestore, 'platform_settings', 'global');
    const snap = await getDoc(ref);
    const updated = {
      ...(snap.exists() ? snap.data() : {}),
      ...updates,
      updatedAt: new Date().toISOString()
    } as PlatformSettings;
    await setDoc(ref, updated);
    return updated;
  }

  public async getCategories(): Promise<OpportunityCategory[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'opportunity_categories'));
    return snap.docs.map((d) => d.data() as OpportunityCategory);
  }

  public async updateCategory(id: string, updates: Partial<OpportunityCategory>): Promise<OpportunityCategory | undefined> {
    await this.init();
    const ref = doc(firestore, 'opportunity_categories', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;

    const updated = { ...snap.data(), ...updates };
    await updateDoc(ref, updated);
    return updated as OpportunityCategory;
  }

  public async getNotificationsForUser(userId: string): Promise<NotificationItem[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'notifications'));
    const all = snap.docs.map((d) => d.data() as NotificationItem);
    return all.filter((n) => n.userId === 'ALL' || n.userId === userId).reverse();
  }

  public async markNotificationRead(id: string): Promise<void> {
    await this.init();
    const ref = doc(firestore, 'notifications', id);
    await updateDoc(ref, { read: true });
  }

  public async addNotification(notification: NotificationItem): Promise<void> {
    await this.init();
    await setDoc(doc(firestore, 'notifications', notification.id), notification);
  }

  public async getAuditLogs(limitCount = 60): Promise<AuditLogItem[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'audit_logs'));
    const all = snap.docs.map((d) => d.data() as AuditLogItem);
    return all
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limitCount);
  }

  public async addAuditLog(entry: Omit<AuditLogItem, 'id' | 'timestamp'>): Promise<void> {
    await this.init();
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const item: AuditLogItem = {
      id,
      timestamp: new Date().toISOString(),
      ...entry
    };
    await setDoc(doc(firestore, 'audit_logs', id), item);
  }

  public async getContactMessages(): Promise<ContactMessage[]> {
    await this.init();
    const snap = await getDocs(collection(firestore, 'contact_messages'));
    const all = snap.docs.map((d) => d.data() as ContactMessage);
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async addContactMessage(msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>): Promise<ContactMessage> {
    await this.init();
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const item: ContactMessage = {
      id,
      status: 'new',
      createdAt: new Date().toISOString(),
      ...msg
    };
    await setDoc(doc(firestore, 'contact_messages', id), item);
    return item;
  }

  public async updateContactMessageStatus(id: string, status: 'new' | 'read' | 'replied'): Promise<ContactMessage | undefined> {
    await this.init();
    const ref = doc(firestore, 'contact_messages', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;

    const updates: Partial<ContactMessage> = { status };
    if (status === 'replied') {
      updates.repliedAt = new Date().toISOString();
    }
    await updateDoc(ref, updates);
    return { ...snap.data(), ...updates } as ContactMessage;
  }
}

export const db = new FirestoreDatabase();
