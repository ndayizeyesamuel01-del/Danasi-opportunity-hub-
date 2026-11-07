/**
 * DANASI OPPORTUNITY HUB — Provider Adapter Architecture Types
 * Founder: NDAYIZEYE Samuel
 */

import { NormalizedJob, JobSourceConfig } from '../../types/index.ts';

export interface FetchOptions {
  limit?: number;
  keyword?: string;
  country?: string;
  page?: number;
}

export interface FetchResult {
  success: boolean;
  sourceId: string;
  sourceName: string;
  jobs: NormalizedJob[];
  totalAvailable?: number;
  errorMessage?: string;
  quotaWarning?: string;
}

export interface HealthCheckResult {
  ok: boolean;
  status: 'CONNECTED' | 'CONFIGURATION_REQUIRED' | 'ERROR';
  message: string;
  authConfigured: boolean;
  latencyMs?: number;
}

export interface JobProviderAdapter {
  readonly id: string;
  readonly name: string;
  readonly website: string;
  readonly attribution: string;

  checkHealth(): Promise<HealthCheckResult>;
  fetchJobs(options?: FetchOptions): Promise<FetchResult>;
  searchJobs(query: string, options?: FetchOptions): Promise<FetchResult>;
  normalizeJob(raw: any): NormalizedJob | null;
  getSourceMetadata(): Partial<JobSourceConfig>;
}
