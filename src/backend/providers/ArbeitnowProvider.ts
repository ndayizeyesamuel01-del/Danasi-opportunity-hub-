/**
 * DANASI OPPORTUNITY HUB — Arbeitnow Provider Adapter
 * Founder: NDAYIZEYE Samuel
 * 
 * Connects to the Arbeitnow Job Board API.
 * Documentation: https://www.arbeitnow.com/blog/job-board-api
 */

import { BaseProvider } from './BaseProvider.ts';
import { JobProviderAdapter, FetchOptions, FetchResult, HealthCheckResult } from './types.ts';
import { NormalizedJob, JobSourceConfig } from '../../types/index.ts';

export class ArbeitnowProvider extends BaseProvider implements JobProviderAdapter {
  public readonly id = 'arbeitnow';
  public readonly name = 'Arbeitnow API';
  public readonly website = 'https://www.arbeitnow.com';
  public readonly attribution = 'European & Global opportunities provided via Arbeitnow API';
  private readonly baseUrl = 'https://www.arbeitnow.com/api/job-board-api';

  public async checkHealth(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const res = await fetch(this.baseUrl, {
        headers: { 'User-Agent': 'DANASI-Opportunity-Hub/2.5 (+https://danasi.rw)' },
        signal: AbortSignal.timeout(8000)
      });
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        return {
          ok: false,
          status: 'ERROR',
          message: `Arbeitnow API returned HTTP ${res.status}`,
          authConfigured: true,
          latencyMs
        };
      }

      return {
        ok: true,
        status: 'CONNECTED',
        message: 'Connected to Arbeitnow Job Board API successfully.',
        authConfigured: true,
        latencyMs
      };
    } catch (err: any) {
      return {
        ok: false,
        status: 'ERROR',
        message: `Arbeitnow API connection failed: ${err.message || 'Network timeout'}`,
        authConfigured: true
      };
    }
  }

  public async fetchJobs(options?: FetchOptions): Promise<FetchResult> {
    try {
      const page = options?.page || 1;
      const url = `${this.baseUrl}?page=${page}`;

      const res = await fetch(url, {
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
          errorMessage: `Arbeitnow API returned status ${res.status}: ${res.statusText}`
        };
      }

      const data = await res.json();
      const rawJobs = Array.isArray(data.data) ? data.data : [];
      const normalizedJobs: NormalizedJob[] = [];
      const limit = options?.limit || 25;

      for (const item of rawJobs.slice(0, limit)) {
        // Keyword filter if provided
        if (options?.keyword) {
          const q = options.keyword.toLowerCase();
          const match =
            item.title?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.company_name?.toLowerCase().includes(q);
          if (!match) continue;
        }

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
        totalAvailable: data?.meta?.total || normalizedJobs.length
      };
    } catch (err: any) {
      return {
        success: false,
        sourceId: this.id,
        sourceName: this.name,
        jobs: [],
        errorMessage: err.message || 'Arbeitnow fetch operation failed'
      };
    }
  }

  public async searchJobs(query: string, options?: FetchOptions): Promise<FetchResult> {
    return this.fetchJobs({ ...options, keyword: query });
  }

  public normalizeJob(raw: any): NormalizedJob | null {
    if (!raw || !raw.slug || !raw.title || !raw.url) return null;

    const validatedUrl = this.sanitizeUrl(raw.url);
    if (!validatedUrl) return null;

    const cleanTitle = this.cleanHtml(raw.title);
    const cleanDesc = this.cleanHtml(raw.description || '');
    const employer = this.cleanHtml(raw.company_name || 'European Tech Partner');
    const location = this.cleanHtml(raw.location || 'Germany / Europe');

    const isRemote = Boolean(raw.remote);
    const workplaceArrangement = isRemote ? 'remote' : this.normalizeWorkplace(location, isRemote);
    const categorySlug = this.mapCategory(undefined, cleanTitle, location);
    const employmentType = this.normalizeEmploymentType(Array.isArray(raw.job_types) ? raw.job_types[0] : undefined);
    const expLevel = this.normalizeExperienceLevel(`${cleanTitle} ${cleanDesc}`);
    const eduLevel = this.normalizeEducationRequirement(cleanDesc);

    // Extract sentences for responsibilities
    const sentences = cleanDesc.split(/\.\s+/).filter((s) => s.length > 25 && s.length < 220);
    const responsibilities = sentences.slice(0, 4).map((s) => (s.endsWith('.') ? s : `${s}.`));

    // Deadline 45 days ahead
    const deadline = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const skills = Array.isArray(raw.tags) && raw.tags.length > 0
      ? raw.tags.map((t: any) => String(t).trim()).slice(0, 8)
      : ['Professional Communication', 'Project Management', 'Technical Competence'];

    return {
      externalJobId: String(raw.slug),
      title: cleanTitle,
      employerName: employer,
      description: cleanDesc.slice(0, 4000),
      responsibilities: responsibilities.length > 0 ? responsibilities : ['Lead execution of institutional and commercial deliverables.', 'Collaborate with interdisciplinary European teams.'],
      applicationRequirements: ['Relevant academic or professional background in the field.', 'Demonstrated track record of team collaboration.', 'Valid application materials submitted via original portal.'],
      country: isRemote ? 'Worldwide' : location.includes(',') ? location.split(',')[1].trim() : 'Europe',
      city: isRemote ? 'Remote' : location.includes(',') ? location.split(',')[0].trim() : location,
      categorySlug,
      employmentType,
      workplaceArrangement,
      educationRequirement: eduLevel,
      experienceLevel: expLevel,
      requiredSkills: skills,
      deadline,
      originalApplicationUrl: validatedUrl,
      sourceName: 'Arbeitnow',
      sourceUrl: 'https://www.arbeitnow.com',
      sourceAttribution: this.attribution,
      sourcePublishedAt: raw.created_at ? new Date(raw.created_at * 1000).toISOString() : new Date().toISOString(),
      status: 'VERIFIED'
    };
  }

  public getSourceMetadata(): Partial<JobSourceConfig> {
    return {
      id: this.id,
      name: this.name,
      description: 'European, visa-sponsored, and global remote opportunities from Arbeitnow.',
      type: 'PUBLIC_FEED',
      website: this.website,
      attribution: this.attribution,
      termsUrl: 'https://www.arbeitnow.com/blog/job-board-api',
      requiresAuth: false,
      authConfigured: true,
      syncIntervalHours: 6
    };
  }
}
