/**
 * DANASI OPPORTUNITY HUB — Automated Synchronization Engine
 * Founder: NDAYIZEYE Samuel
 * 
 * Manages scheduled and manual job aggregation, rate limiting,
 * exponential backoff retry, duplicate prevention, and persistent audit logging.
 */

import { db } from '../db.ts';
import { getProvider, getAllProviders } from '../providers/index.ts';
import { JobSyncRun, JobSourceConfig } from '../../types/index.ts';

class SyncManager {
  private activeLocks = new Set<string>();
  private schedulerInterval: NodeJS.Timeout | null = null;
  private readonly defaultLimitPerSync = 30;

  /**
   * Executes synchronization for a single provider.
   */
  public async syncProvider(
    sourceId: string,
    initiatedBy = 'SYSTEM_SCHEDULER',
    trigger: 'MANUAL' | 'SCHEDULED' = 'MANUAL'
  ): Promise<JobSyncRun> {
    // 1. Concurrency lock
    if (this.activeLocks.has(sourceId)) {
      throw new Error(`Synchronization for provider "${sourceId}" is already running.`);
    }

    this.activeLocks.add(sourceId);
    const startTime = Date.now();
    let currentRun: JobSyncRun | null = null;

    try {
      const sourceConfig = await db.getJobSourceById(sourceId);
      if (!sourceConfig) {
        throw new Error(`Data source "${sourceId}" not found in registry.`);
      }

      if (!sourceConfig.enabled && trigger === 'SCHEDULED') {
        throw new Error(`Provider "${sourceConfig.name}" is disabled.`);
      }

      const adapter = getProvider(sourceId);
      if (!adapter) {
        throw new Error(`Adapter for provider "${sourceId}" is not loaded.`);
      }

      // Mark source status as SYNCING
      await db.updateJobSource(sourceId, { status: 'SYNCING' });

      // Create Run Record
      currentRun = await db.recordSyncRun({
        sourceId,
        sourceName: sourceConfig.name,
        trigger,
        status: 'RUNNING',
        jobsFetched: 0,
        jobsNormalized: 0,
        jobsImported: 0,
        duplicatesSkipped: 0,
        errorsCount: 0,
        logSummary: `Sync initiated by ${initiatedBy} (${trigger}).`,
        initiatedBy
      });

      await db.addSourceLog({
        sourceId,
        syncRunId: currentRun.id,
        level: 'INFO',
        message: `Starting ${trigger} synchronization for ${sourceConfig.name}...`
      });

      // Health check first
      const health = await adapter.checkHealth();
      if (!health.ok && health.status === 'CONFIGURATION_REQUIRED') {
        const errorMsg = health.message;
        await db.updateJobSource(sourceId, {
          status: 'CONFIGURATION_REQUIRED',
          errorMessage: errorMsg
        });

        await db.updateSyncRun(currentRun.id, {
          status: 'FAILED',
          finishedAt: new Date().toISOString(),
          durationMs: Date.now() - startTime,
          errorsCount: 1,
          logSummary: `Sync halted: ${errorMsg}`
        });

        await db.addSourceLog({
          sourceId,
          syncRunId: currentRun.id,
          level: 'WARN',
          message: errorMsg
        });

        return (await db.getSyncRuns(1))[0];
      }

      // Fetch with exponential backoff retry (up to 2 retries)
      let fetchResult = null;
      let attempts = 0;
      let lastErr = '';

      while (attempts < 2) {
        attempts++;
        try {
          fetchResult = await adapter.fetchJobs({ limit: this.defaultLimitPerSync });
          if (fetchResult.success) break;
          lastErr = fetchResult.errorMessage || 'Unknown fetch error';
        } catch (err: any) {
          lastErr = err.message || 'Network exception';
        }
        if (attempts < 2) {
          await new Promise((res) => setTimeout(res, 1500 * attempts));
        }
      }

      if (!fetchResult || !fetchResult.success) {
        throw new Error(lastErr || 'Failed to fetch jobs from provider after retries.');
      }

      const rawCount = fetchResult.jobs.length;
      await db.addSourceLog({
        sourceId,
        syncRunId: currentRun.id,
        level: 'INFO',
        message: `Fetched ${rawCount} opportunities. Processing duplicate check and normalization...`,
        metadata: { totalAvailable: fetchResult.totalAvailable }
      });

      // Ingest and duplicate screen into Firestore
      const { importedCount, duplicatesCount, errorsCount } = await db.importNormalizedJobs(
        fetchResult.jobs,
        sourceId,
        currentRun.id
      );

      const durationMs = Date.now() - startTime;
      const finalStatus = errorsCount > 0 ? (importedCount > 0 ? 'PARTIAL' : 'FAILED') : 'SUCCESS';
      const summary = `Completed in ${durationMs}ms: ${importedCount} imported, ${duplicatesCount} duplicates skipped, ${errorsCount} errors.`;

      // Update Run
      await db.updateSyncRun(currentRun.id, {
        status: finalStatus,
        finishedAt: new Date().toISOString(),
        durationMs,
        jobsFetched: rawCount,
        jobsNormalized: rawCount,
        jobsImported: importedCount,
        duplicatesSkipped: duplicatesCount,
        errorsCount,
        logSummary: summary
      });

      // Update Source
      const nextSyncHours = sourceConfig.syncIntervalHours || 6;
      const nextSyncDate = new Date(Date.now() + nextSyncHours * 60 * 60 * 1000).toISOString();

      await db.updateJobSource(sourceId, {
        status: 'CONNECTED',
        errorMessage: '',
        nextSyncAt: nextSyncDate
      });

      await db.addSourceLog({
        sourceId,
        syncRunId: currentRun.id,
        level: 'INFO',
        message: summary,
        metadata: { importedCount, duplicatesCount, errorsCount }
      });

      const updatedRuns = await db.getSyncRuns(1);
      return updatedRuns[0];
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const errorMsg = err.message || 'Unexpected synchronization error.';

      await db.updateJobSource(sourceId, {
        status: 'ERROR',
        errorMessage: errorMsg
      });

      if (currentRun) {
        await db.updateSyncRun(currentRun.id, {
          status: 'FAILED',
          finishedAt: new Date().toISOString(),
          durationMs,
          errorsCount: 1,
          logSummary: `Error: ${errorMsg}`
        });
      }

      await db.addSourceLog({
        sourceId,
        syncRunId: currentRun?.id,
        level: 'ERROR',
        message: `Synchronization failed: ${errorMsg}`
      });

      throw err;
    } finally {
      this.activeLocks.delete(sourceId);
    }
  }

  /**
   * Runs synchronization across all enabled providers sequentially.
   */
  public async syncAllActive(initiatedBy = 'SYSTEM_SCHEDULER', trigger: 'MANUAL' | 'SCHEDULED' = 'MANUAL'): Promise<JobSyncRun[]> {
    const sources = await db.getJobSources();
    const enabled = sources.filter((s) => s.enabled);
    const results: JobSyncRun[] = [];

    for (const src of enabled) {
      try {
        const run = await this.syncProvider(src.id, initiatedBy, trigger);
        results.push(run);
      } catch (err: any) {
        console.error(`[SyncManager] Provider ${src.id} sync failed:`, err.message);
      }
    }

    return results;
  }

  /**
   * Initializes background schedule checking every 30 minutes.
   */
  public startScheduler(): void {
    if (this.schedulerInterval) return;

    console.log('[SyncManager] Initializing background job synchronization scheduler...');

    // Perform initial check 15 seconds after boot
    setTimeout(() => {
      this.checkScheduledRuns().catch((err) => console.error('[SyncManager] Scheduler check error:', err));
    }, 15000);

    // Periodic check every 30 minutes
    this.schedulerInterval = setInterval(() => {
      this.checkScheduledRuns().catch((err) => console.error('[SyncManager] Periodic scheduler error:', err));
    }, 30 * 60 * 1000);
  }

  public stopScheduler(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }

  private async checkScheduledRuns(): Promise<void> {
    try {
      const sources = await db.getJobSources();
      const now = new Date();

      for (const src of sources) {
        if (!src.enabled) continue;
        if (this.activeLocks.has(src.id)) continue;

        let shouldSync = false;
        if (!src.lastSyncAt) {
          shouldSync = true;
        } else if (src.nextSyncAt && new Date(src.nextSyncAt) <= now) {
          shouldSync = true;
        } else if (!src.nextSyncAt) {
          const hoursSince = (now.getTime() - new Date(src.lastSyncAt).getTime()) / (1000 * 60 * 60);
          if (hoursSince >= src.syncIntervalHours) {
            shouldSync = true;
          }
        }

        if (shouldSync) {
          console.log(`[SyncManager] Running scheduled sync for provider "${src.name}"...`);
          await this.syncProvider(src.id, 'AUTOMATED_SCHEDULER', 'SCHEDULED');
        }
      }
    } catch (err: any) {
      console.error('[SyncManager] checkScheduledRuns error:', err);
    }
  }
}

export const syncManager = new SyncManager();
