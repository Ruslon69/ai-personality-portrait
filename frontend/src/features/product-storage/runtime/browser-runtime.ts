import { appConfig } from '@shared/config';
import { logger } from '@shared/lib/logger';
import type { NumerologyProfile } from '@features/numerology/types';

import { journeyStorageAdapter } from '../adapters';
import { createBrowserProductStorageLegacyBridge } from '../compatibility';
import { LEGACY_STORAGE_KEYS } from '../constants';
import { createBrowserProductStorageRepository } from '../repositories';
import { ProductStorageService } from '../service';
import type { ProductStorageEventTarget } from '../types';
import { createProductStorageDiagnosticSink } from './diagnostics';
import { resolveProductStorageFeatureFlag } from './feature-flag';

let service: ProductStorageService | null = null;
let activationStarted = false;

function browserEventTarget(): ProductStorageEventTarget | null {
  if (typeof window === 'undefined') return null;
  return {
    addEventListener(type, listener) {
      window.addEventListener(type, listener as (event: StorageEvent) => void);
    },
    removeEventListener(type, listener) {
      window.removeEventListener(type, listener as (event: StorageEvent) => void);
    },
  };
}

function storedLocale(legacy: ReturnType<typeof createBrowserProductStorageLegacyBridge>) {
  const value = legacy.readValues(LEGACY_STORAGE_KEYS.locale)[LEGACY_STORAGE_KEYS.locale[0]];
  return value === 'en' || value === 'uk' ? value : 'ru';
}

function createRuntimeService() {
  const legacy = createBrowserProductStorageLegacyBridge();
  const buildEnvironment = import.meta.env.PROD
    ? appConfig.environment === 'staging'
      ? 'staging'
      : 'production'
    : appConfig.environment;
  return new ProductStorageService({
    diagnostics: createProductStorageDiagnosticSink(logger),
    eventTarget: browserEventTarget(),
    featureFlag: resolveProductStorageFeatureFlag({
      environment: buildEnvironment,
      rawValue: import.meta.env.VITE_PRODUCT_STORAGE_V2,
    }),
    legacy,
    locale: storedLocale(legacy),
    mode: 'envelope-primary',
    now: () => new Date().toISOString(),
    productVersion: appConfig.version,
    repository: createBrowserProductStorageRepository(),
  });
}

export function getProductStorageService() {
  service ??= createRuntimeService();
  return service;
}

export function initializeProductStorageRuntime() {
  const runtime = getProductStorageService();
  if (!activationStarted) {
    activationStarted = true;
    runtime.bootstrap();
  }
  return runtime.getActivationResult();
}

export function readJourneyStateFromProductStorage() {
  const runtime = getProductStorageService();
  initializeProductStorageRuntime();
  const envelopeState = journeyStorageAdapter.fromEnvelope(
    runtime.getSection('journey') ?? undefined,
  );
  if (envelopeState) return envelopeState;
  const legacy = runtime.readLegacyValues(LEGACY_STORAGE_KEYS.journey);
  return journeyStorageAdapter.legacyFallback(legacy[LEGACY_STORAGE_KEYS.journey[0]] ?? null);
}

export function persistJourneyStateToProductStorage(
  state: Parameters<typeof journeyStorageAdapter.toEnvelopeSection>[0],
) {
  const section = journeyStorageAdapter.toEnvelopeSection(state);
  return section
    ? getProductStorageService().updateSection('journey', section)
    : {
        envelopeWritten: false,
        errors: ['journey-adapter-failed'],
        legacyWritten: false,
        revision: null,
        status: 'failed' as const,
        warnings: [],
      };
}

export function readNumerologyBirthDateFromProductStorage() {
  const runtime = getProductStorageService();
  initializeProductStorageRuntime();
  const section = runtime.getSection('numerology');
  if (section) return section.data.birthDate;
  return (
    runtime.readLegacyValues(LEGACY_STORAGE_KEYS.numerologyBirthDate)[
      LEGACY_STORAGE_KEYS.numerologyBirthDate[0]
    ] ?? ''
  );
}

export function persistNumerologyBirthDateToProductStorage(value: string) {
  const runtime = getProductStorageService();
  initializeProductStorageRuntime();
  const current = runtime.getSection('numerology');
  return runtime.updateSection('numerology', {
    data: {
      birthDate: value,
      profile: current?.data.birthDate === value ? current.data.profile : null,
    },
    schemaVersion: 'numerology-storage-v1',
  });
}

export function persistNumerologyProfileToProductStorage(profile: NumerologyProfile) {
  const runtime = getProductStorageService();
  initializeProductStorageRuntime();
  return runtime.updateSection('numerology', {
    data: { birthDate: profile.birthDate, profile },
    schemaVersion: 'numerology-storage-v1',
  });
}

export function disposeProductStorageRuntime() {
  service?.dispose();
  service = null;
  activationStarted = false;
}
