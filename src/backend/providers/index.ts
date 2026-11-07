/**
 * DANASI OPPORTUNITY HUB — Provider Adapter Registry
 * Founder: NDAYIZEYE Samuel
 */

import { JobProviderAdapter } from './types.ts';
import { RemotiveProvider } from './RemotiveProvider.ts';
import { ArbeitnowProvider } from './ArbeitnowProvider.ts';
import { AdzunaProvider } from './AdzunaProvider.ts';
import { MifotraProvider } from './MifotraProvider.ts';
import { UnitedNationsProvider } from './UnitedNationsProvider.ts';

export * from './types.ts';
export * from './BaseProvider.ts';
export * from './RemotiveProvider.ts';
export * from './ArbeitnowProvider.ts';
export * from './AdzunaProvider.ts';
export * from './MifotraProvider.ts';
export * from './UnitedNationsProvider.ts';

const providersMap: Map<string, JobProviderAdapter> = new Map();

export function getProvider(id: string): JobProviderAdapter | undefined {
  if (providersMap.size === 0) {
    initProviders();
  }
  return providersMap.get(id);
}

export function getAllProviders(): JobProviderAdapter[] {
  if (providersMap.size === 0) {
    initProviders();
  }
  return Array.from(providersMap.values());
}

export function getAllProviderIds(): string[] {
  return ['remotive', 'arbeitnow', 'adzuna', 'mifotra', 'united_nations'];
}

function initProviders(): void {
  const remotive = new RemotiveProvider();
  const arbeitnow = new ArbeitnowProvider();
  const adzuna = new AdzunaProvider();
  const mifotra = new MifotraProvider();
  const un = new UnitedNationsProvider();

  providersMap.set(remotive.id, remotive);
  providersMap.set(arbeitnow.id, arbeitnow);
  providersMap.set(adzuna.id, adzuna);
  providersMap.set(mifotra.id, mifotra);
  providersMap.set(un.id, un);
}
