import {
  draftPortraitStorageAdapter,
  tarotSessionStorageAdapter,
} from '../../features/product-storage/adapters';
import { buildProductStorageExport } from '../../features/product-storage/export-import';
import { createFullStorageFixtureEnvelope } from '../../features/product-storage/fixtures/fixtures';
import { createProductStorageDiagnosticSink } from '../../features/product-storage/runtime/diagnostics';
import { serializeProductStorageEnvelope } from '../../features/product-storage/serialization';
import type { Logger } from '../../shared/lib/logger/logger.types';
import { QualityAssertions } from '../assertions';

const forbiddenPersonalFields =
  /audioBlob|rawAudio|microphoneData|voiceBlob|apiKey|authToken|paymentDetails|birthDate|readingText|answers|interpretationContent/i;

export function runPrivacyGate() {
  const assertions = new QualityAssertions();
  const envelope = createFullStorageFixtureEnvelope();
  const serialized = serializeProductStorageEnvelope(envelope);
  assertions.assert(serialized.status === 'success', {
    code: 'privacy-envelope-serialization',
    message: 'Privacy fixture envelope could not be serialized.',
  });
  if (serialized.status === 'success')
    assertions.assert(
      !/audioBlob|rawAudio|microphoneData|voiceBlob|apiKey|authToken|paymentDetails/i.test(
        serialized.json,
      ),
      {
        code: 'private-field-in-envelope',
        message: 'Persistent envelope contains a forbidden media, credential, or payment field.',
      },
    );
  const exported = buildProductStorageExport(envelope, {
    exportedAt: '2026-08-05T12:00:00.000Z',
    scope: 'full',
  });
  assertions.assert(
    !/tarot-session-storage-v1|draft-storage-v1|audioBlob|rawAudio|microphoneData/i.test(
      exported.json,
    ),
    {
      code: 'temporary-data-in-export',
      message: 'Export contains Draft Portrait, temporary Tarot state, or raw voice data.',
    },
  );
  assertions.assert(
    draftPortraitStorageAdapter.toEnvelopeSection({
      currentProfile: null,
      draft: envelope.data.draftPortrait!.data.draft,
      profiles: envelope.data.draftPortrait!.data.profiles,
    }) === null,
    {
      code: 'draft-persistence-boundary',
      message: 'Draft Portrait adapter no longer enforces the volatile storage decision.',
    },
  );
  assertions.assert(
    tarotSessionStorageAdapter.toEnvelopeSection(envelope.data.tarotSession!.data) === null,
    {
      code: 'tarot-session-persistence-boundary',
      message: 'Temporary Tarot session adapter attempted persistent storage.',
    },
  );
  const captured: readonly unknown[][] = [];
  const mutableCaptured = captured as unknown[][];
  const logger: Logger = {
    debug: (...args) => mutableCaptured.push(args),
    error: (...args) => mutableCaptured.push(args),
    info: (...args) => mutableCaptured.push(args),
    warn: (...args) => mutableCaptured.push(args),
  };
  createProductStorageDiagnosticSink(logger).emit({
    code: 'quality-diagnostic',
    revision: 2,
    schemaVersion: 'product-storage-v2',
    section: 'journey',
    status: 'info',
  });
  assertions.assert(!forbiddenPersonalFields.test(JSON.stringify(captured)), {
    code: 'personal-diagnostic-content',
    message: 'Structured storage diagnostics exposed personal content.',
  });
  return assertions.result();
}
