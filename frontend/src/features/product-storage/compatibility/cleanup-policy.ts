import { LEGACY_STORAGE_KEYS } from '../constants';
import type { ProductStorageCleanupPlan, ProductStorageEnvelope } from '../types';
import { validateProductStorageEnvelope } from '../validation';

export function createLegacyCleanupPlan(input: {
  backupValid: boolean;
  envelope: ProductStorageEnvelope | null;
  exportReady: boolean;
  successfulBootstraps: number;
  unsupportedDataDetected: boolean;
}): ProductStorageCleanupPlan {
  const blockers: string[] = [];
  if (!input.envelope || !validateProductStorageEnvelope(input.envelope).valid)
    blockers.push('validated-envelope-required');
  if (!input.envelope?.checksum) blockers.push('checksum-required');
  if (!input.envelope?.migrationHistory.length) blockers.push('migration-history-required');
  if (!input.backupValid) blockers.push('valid-backup-required');
  if (input.successfulBootstraps < 3) blockers.push('minimum-successful-bootstraps');
  if (!input.exportReady) blockers.push('export-readiness-required');
  if (input.unsupportedDataDetected) blockers.push('unsupported-data-present');
  return {
    blockers,
    eligible: blockers.length === 0,
    keys: [...new Set(Object.values(LEGACY_STORAGE_KEYS).flat())],
    minimumSuccessfulBootstraps: 3,
    prerequisites: [
      'validated-envelope',
      'valid-backup',
      'export-ready',
      'migration-history-present',
      'no-unsupported-data',
    ],
    requiresUserConfirmation: true,
  };
}
