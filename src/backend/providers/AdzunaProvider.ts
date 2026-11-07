/**
 * DANASI OPPORTUNITY HUB — Adzuna Provider Adapter
 * Founder: NDAYIZEYE Samuel
 * 
 * Connects to the Adzuna Global Job Search Engine API.
 * Documentation: https://developer.adzuna.com/
 */

import { BaseProvider } from './BaseProvider.ts';
import { JobProviderAdapter, FetchOptions, FetchResult, HealthCheckResult } from './types.ts';
import { NormalizedJob, JobSourceConfig } from '../../types/index.ts';

export class AdzunaProvider extends BaseProvider implements JobProviderAdapter {
  public readonly id = 'adzuna';
  public readonly name = 'Adzuna API';
  public readonly website = 'https://www.adzuna.com';
  public readonly attribution = 'Jobs indexed via Adzuna Global Employment Engine';
  private readonly baseUrl = 'https://api.adzuna.com/v1/api/jobs';

  private getCredentials(): { appId: string; appKey: string } | null {
    const appId = process.env.ADZUNA_APP_ID?.trim();
    const appKey = process.env.ADZUNA_APP_KEY?.trim();
    if (!appId || !appKey) return null;
    return { appId, appKey };
  }

  public async checkHealth(): Promise<HealthCheckResult> {
    const creds = this.getCredentials();
    if (!creds) {
      return {
        ok: false,
        status: 'CONFIGURATION_REQUIRED',
        message: 'Adzuna credentials missing. Set ADZUNA_APP_ID and ADZUNA_APP_KEY in environment to activate.',
        authConfigured: false
      };
    }

    const start = Date.now();
    try {
      const url = `${this.baseUrl}/gb/search/1?app_id=${encodeURIComponent(creds.appId)}&app_key=${encodeURIComponent(creds.appKey)}&results_per_page=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'DANASI-Opportunity-Hub/2.5 (+https://danasi.rw)' },
        signal: AbortSignal.timeout(8000)
      });
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        return {
          ok: false,
          status: 'ERROR',
          message: `Adzuna API returned status ${res.status}: Check APP_ID/APP_KEY validity.`,
          authConfigured: true,
          latencyMs
        };
      }

      return {
        ok: true,
        status: 'CONNECTED',
        message: 'Adzuna API authenticated and responding normally.',
        authConfigured: true,
        latencyMs
      };
    } catch (err: any) {
      return {
        ok: false,
        status: 'ERROR',
        message: `Adzuna connection check failed: ${err.message || 'Network timeout'}`,
        authConfigured: true
      };
    }
  }

  public async fetchJobs(options?: FetchOptions): Promise<FetchResult> {
    const creds = this.getCredentials();
    if (!creds) {
      return {
        success: false,
        sourceId: this.id,
        sourceName: this.name,
        jobs: [],
        errorMessage: 'CONFIGURATION_REQUIRED: Adzuna requires ADZUNA_APP_ID and ADZUNA_APP_KEY.'
      };
    }

    try {
      const country = (options?.country || 'gb').toLowerCase();
      const page = options?.page || 1;
      const count = Math.min(options?.limit || 20, 50);

      const url = new URL(`${this.baseUrl}/${country}/search/${page}`);
      url.searchParams.set('app_id', creds.appId);
      url.searchParams.set('app_key', creds.appKey);
      url.searchParams.set('results_per_page', String(count));

      if (options?.keyword) {
        url.searchParams.set('what', options.keyword);
      }

      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json', 'User-Agent': 'DANASI-Opportunity-Hub/2.5 (+https://danasi.rw)' },
        signal: AbortSignal.timeout(12000)
      });

      if (!res.ok) {
        return {
          success: false,
          sourceId: this.id,
          sourceName: this.name,
          jobs: [],
          errorMessage: `Adzuna API returned status ${res.status}`
        };
      }

      const data = await res.json();
      const rawResults = Array.isArray(data.results) ? data.results : [];
      const normalizedJobs: NormalizedJob[] = [];

      for (const item of rawResults) {
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
        totalAvailable: data.count || normalizedJobs.length
      };
    } catch (err: any) {
      return {
        success: false,
        sourceId: this.id,
        sourceName: this.name,
        jobs: [],
        errorMessage: err.message || 'Adzuna fetch failed'
      };
    }
  }

  public async searchJobs(query: string, options?: FetchOptions): Promise<FetchResult> {
    return this.fetchJobs({ ...options, keyword: query });
  }

  public normalizeJob(raw: any): NormalizedJob | null {
    if (!raw || !raw.id || !raw.title || !raw.redirect_url) return null;

    const validatedUrl = this.sanitizeUrl(raw.redirect_url);
    if (!validatedUrl) return null;

    const cleanTitle = this.cleanHtml(raw.title);
    const cleanDesc = this.cleanHtml(raw.description || '');
    const employer = this.cleanHtml(raw.company?.display_name || 'Verified Adzuna Partner');
    const location = this.cleanHtml(raw.location?.display_name || 'International');

    const country = location.includes(',') ? location.split(',').pop()?.trim() || 'Worldwide' : location;
    const city = location.includes(',') ? location.split(',')[0].trim() : 'Metropolitan';

    const categorySlug = this.mapCategory(raw.category?.tag, cleanTitle, location);
    const employmentType = this.normalizeEmploymentType(raw.contract_time);
    const expLevel = this.normalizeExperienceLevel(`${cleanTitle} ${cleanDesc}`);
    const eduLevel = this.normalizeEducationRequirement(cleanDesc);

    // Salary formatting
    let salaryRange: string | undefined;
    if (raw.salary_min && raw.salary_max) {
      salaryRange = `£${Math.round(raw.salary_min).toLocaleString()} - £${Math.round(raw.salary_max).toLocaleString()} / year`;
    } else if (raw.salary_min) {
      salaryRange = `From £${Math.round(raw.salary_min).toLocaleString()} / year`;
    }

    const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      externalJobId: String(raw.id),
      title: cleanTitle,
      employerName: employer,
      description: cleanDesc.slice(0, 4000),
      responsibilities: ['Fulfill role objectives under verified employer mandate.', 'Adhere to institutional compliance and execution standards.'],
      applicationRequirements: ['Demonstrated vocational or academic credentials.', 'Submission of CV and supporting dossier via official career link.'],
      country,
      city,
      categorySlug,
      employmentType,
      workplaceArrangement: cleanTitle.toLowerCase().includes('remote') ? 'remote' : 'on-site',
      salaryMin: raw.salary_min ? Math.round(raw.salary_min) : undefined,
      salaryMax: raw.salary_max ? Math.round(raw.salary_max) : undefined,
      salaryCurrency: 'GBP',
      salaryRange,
      educationRequirement: eduLevel,
      experienceLevel: expLevel,
      requiredSkills: ['Institutional Delivery', 'Professional Competence'],
      deadline,
      originalApplicationUrl: validatedUrl,
      sourceName: 'Adzuna',
      sourceUrl: 'https://www.adzuna.com',
      sourceAttribution: this.attribution,
      sourcePublishedAt: raw.created || new Date().toISOString(),
      status: 'PENDING_REVIEW' // Adzuna imported jobs undergo moderation
    };
  }

  public getSourceMetadata(): Partial<JobSourceConfig> {
    const creds = this.getCredentials();
    return {
      id: this.id,
      name: this.name,
      description: 'Global multi-country search index with salary normalization.',
      type: 'API',
      website: this.website,
      attribution: this.attribution,
      termsUrl: 'https://developer.adzuna.com/overview',
      requiresAuth: true,
      authConfigured: Boolean(creds),
      syncIntervalHours: 6
    };
  }
}
