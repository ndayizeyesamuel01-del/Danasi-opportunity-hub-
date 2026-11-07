/**
 * DANASI OPPORTUNITY HUB — Remotive Provider Adapter
 * Founder: NDAYIZEYE Samuel
 * 
 * Connects to the Remotive Public Remote Jobs API.
 * Documentation: https://remotive.com/remote-jobs/api
 */

import { BaseProvider } from './BaseProvider.ts';
import { JobProviderAdapter, FetchOptions, FetchResult, HealthCheckResult } from './types.ts';
import { NormalizedJob, JobSourceConfig } from '../../types/index.ts';

export class RemotiveProvider extends BaseProvider implements JobProviderAdapter {
  public readonly id = 'remotive';
  public readonly name = 'Remotive Public API';
  public readonly website = 'https://remotive.com';
  public readonly attribution = 'Remote opportunities provided via Remotive Public API';
  private readonly baseUrl = 'https://remotive.com/api/remote-jobs';

  public async checkHealth(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}?limit=1`, {
        headers: { 'User-Agent': 'DANASI-Opportunity-Hub/2.5 (+https://danasi.rw)' },
        signal: AbortSignal.timeout(8000)
      });
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        return {
          ok: false,
          status: 'ERROR',
          message: `Remotive API responded with HTTP status ${res.status}`,
          authConfigured: true,
          latencyMs
        };
      }

      return {
        ok: true,
        status: 'CONNECTED',
        message: 'Connected to Remotive Remote Jobs API successfully.',
        authConfigured: true,
        latencyMs
      };
    } catch (err: any) {
      return {
        ok: false,
        status: 'ERROR',
        message: `Remotive API connection failed: ${err.message || 'Network timeout'}`,
        authConfigured: true
      };
    }
  }

  public async fetchJobs(options?: FetchOptions): Promise<FetchResult> {
    try {
      const limit = Math.min(options?.limit || 25, 50);
      const url = new URL(this.baseUrl);
      url.searchParams.set('limit', String(limit));

      if (options?.keyword) {
        url.searchParams.set('search', options.keyword);
      }

      const res = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DANASI-Opportunity-Hub/2.5 (+https://danasi.rw)'
        },
        signal: AbortSignal.timeout(12000)
      });

      if (!res.ok) {
        return {
          success: false,
          sourceId: this.id,
          sourceName: this.name,
          jobs: [],
          errorMessage: `Remotive API HTTP error ${res.status}: ${res.statusText}`
        };
      }

      const data = await res.json();
      const rawJobs = Array.isArray(data.jobs) ? data.jobs : [];
      const normalizedJobs: NormalizedJob[] = [];

      for (const item of rawJobs) {
        const norm = this.normalizeJob(item);
        if (norm) {
          normalizedJobs.push(norm);
        }
      }

      return {
        success: true,
        sourceId: this.id,
        sourceName: this.name,
        jobs: normalizedJobs,
        totalAvailable: data['total-job-count'] || normalizedJobs.length
      };
    } catch (err: any) {
      return {
        success: false,
        sourceId: this.id,
        sourceName: this.name,
        jobs: [],
        errorMessage: err.message || 'Remotive fetch operation failed'
      };
    }
  }

  public async searchJobs(query: string, options?: FetchOptions): Promise<FetchResult> {
    return this.fetchJobs({ ...options, keyword: query });
  }

  public normalizeJob(raw: any): NormalizedJob | null {
    if (!raw || !raw.id || !raw.title || !raw.url) return null;

    const validatedUrl = this.sanitizeUrl(raw.url);
    if (!validatedUrl) return null;

    const cleanDesc = this.cleanHtml(raw.description || '');
    const cleanTitle = this.cleanHtml(raw.title);
    const employer = this.cleanHtml(raw.company_name || 'Global Tech Partner');
    const location = this.cleanHtml(raw.candidate_required_location || 'Worldwide');

    const country = location.toLowerCase().includes('worldwide') || location.toLowerCase().includes('anywhere')
      ? 'Worldwide'
      : location;

    const categorySlug = this.mapCategory(raw.category, cleanTitle, 'remote');
    const employmentType = this.normalizeEmploymentType(raw.job_type);
    const expLevel = this.normalizeExperienceLevel(`${cleanTitle} ${cleanDesc}`);
    const eduLevel = this.normalizeEducationRequirement(cleanDesc);

    // Extract basic responsibilities or split paragraphs
    const paragraphs = cleanDesc.split(/\.\s+/).filter((p) => p.length > 20 && p.length < 250);
    const responsibilities = paragraphs.slice(0, 4).map((p) => (p.endsWith('.') ? p : `${p}.`));

    // Application deadline defaults to 30 days from publication or 45 days ahead
    let deadline = '';
    if (raw.publication_date) {
      const pub = new Date(raw.publication_date);
      if (!isNaN(pub.getTime())) {
        const d = new Date(pub.getTime() + 45 * 24 * 60 * 60 * 1000);
        deadline = d.toISOString().split('T')[0];
      }
    }
    if (!deadline) {
      const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      deadline = d.toISOString().split('T')[0];
    }

    const skills = Array.isArray(raw.tags) && raw.tags.length > 0
      ? raw.tags.map((t: any) => String(t).trim()).slice(0, 8)
      : ['Remote Collaboration', 'English Communication', 'Technical Execution'];

    return {
      externalJobId: String(raw.id),
      title: cleanTitle,
      employerName: employer,
      employerWebsite: this.sanitizeUrl(raw.company_url || '') || undefined,
      employerLogo: this.sanitizeUrl(raw.company_logo || '') || undefined,
      description: cleanDesc.slice(0, 4000),
      responsibilities: responsibilities.length > 0 ? responsibilities : ['Execute core deliverables for global remote team.', 'Maintain asynchronous communication with international stakeholders.'],
      applicationRequirements: ['Demonstrated experience in specified role.', 'Fluent written and verbal English communication.', 'Reliable internet connection for remote work.'],
      country,
      city: 'Remote',
      categorySlug,
      employmentType,
      workplaceArrangement: 'remote',
      salaryRange: raw.salary ? this.cleanHtml(raw.salary) : undefined,
      educationRequirement: eduLevel,
      experienceLevel: expLevel,
      requiredSkills: skills,
      deadline,
      originalApplicationUrl: validatedUrl,
      sourceName: 'Remotive',
      sourceUrl: 'https://remotive.com/remote-jobs',
      sourceAttribution: this.attribution,
      sourcePublishedAt: raw.publication_date || new Date().toISOString(),
      status: 'VERIFIED'
    };
  }

  public getSourceMetadata(): Partial<JobSourceConfig> {
    return {
      id: this.id,
      name: this.name,
      description: 'Global remote tech, marketing, and design opportunities directly from Remotive.',
      type: 'PUBLIC_FEED',
      website: this.website,
      attribution: this.attribution,
      termsUrl: 'https://remotive.com/remote-jobs/api',
      requiresAuth: false,
      authConfigured: true,
      syncIntervalHours: 6
    };
  }
}
