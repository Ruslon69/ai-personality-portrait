import type { Logger } from '@shared/lib/logger';

import type { ProductStorageDiagnosticEvent, ProductStorageDiagnosticSink } from '../types';

export function createProductStorageDiagnosticSink(logger: Logger): ProductStorageDiagnosticSink {
  return {
    emit(event: ProductStorageDiagnosticEvent) {
      const metadata = {
        code: event.code,
        ...(event.migrationId ? { migrationId: event.migrationId } : {}),
        ...(event.recoveryStrategy ? { recoveryStrategy: event.recoveryStrategy } : {}),
        ...(event.revision !== undefined ? { revision: event.revision } : {}),
        ...(event.schemaVersion ? { schemaVersion: event.schemaVersion } : {}),
        ...(event.section ? { section: event.section } : {}),
      };
      if (event.status === 'error') logger.error('Product storage status', metadata);
      else if (event.status === 'warning') logger.warn('Product storage status', metadata);
      else logger.info('Product storage status', metadata);
    },
  };
}

export const silentProductStorageDiagnostics: ProductStorageDiagnosticSink = {
  emit() {
    // Intentionally silent for tests and environments without a logger.
  },
};
