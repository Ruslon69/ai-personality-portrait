import {
  deserializeInterpretationResult,
  serializeInterpretationResult,
} from '../../features/expert-interpretation/model/serialization';
import { localExpertInterpretationProvider } from '../../features/expert-interpretation/providers';
import { interpretationFixtures } from '../../features/expert-interpretation/fixtures/fixtures';
import { buildJourneyMemorySnapshot } from '../../features/journey-memory/model';
import { journeyMemoryFixtures } from '../../features/journey-memory/fixtures/fixtures';
import {
  deserializeJourneyMemorySnapshot,
  serializeJourneyMemorySnapshot,
} from '../../features/journey-memory/serialization';
import {
  buildProductStorageExport,
  parseProductStorageImport,
} from '../../features/product-storage/export-import';
import { createFullStorageFixtureEnvelope } from '../../features/product-storage/fixtures/fixtures';
import {
  parseProductStorageEnvelope,
  serializeProductStorageEnvelope,
  withEnvelopeChecksum,
} from '../../features/product-storage/serialization';
import { QualityAssertions } from '../assertions';
import { negativeQualityFixtures } from '../fixtures/negative-fixtures';

function jsonSafe(value: unknown): boolean {
  const seen = new Set<object>();
  const visit = (current: unknown): boolean => {
    if (current === undefined || typeof current === 'function') return false;
    if (typeof current === 'number' && !Number.isFinite(current)) return false;
    if (!current || typeof current !== 'object') return true;
    if (seen.has(current)) return false;
    seen.add(current);
    const valid = Array.isArray(current)
      ? current.every(visit)
      : Object.values(current as Record<string, unknown>).every(visit);
    seen.delete(current);
    return valid;
  };
  return visit(value);
}

export function hasDuplicateStableIds(ids: readonly string[]) {
  return new Set(ids).size !== ids.length;
}

export function hasUnresolvedTemplate(text: string) {
  return /\{\{?[^{}]+\}\}?/.test(text);
}

export function runSerializationGate() {
  const assertions = new QualityAssertions();
  const interpretationFixture = interpretationFixtures[0];
  if (!interpretationFixture) throw new Error('Interpretation serialization fixture is missing.');
  const interpretation = localExpertInterpretationProvider.interpret(
    interpretationFixture.request,
  ).result;
  const interpretationJson = serializeInterpretationResult(interpretation);
  const restoredInterpretation = deserializeInterpretationResult(interpretationJson);
  assertions.assert(JSON.stringify(restoredInterpretation) === interpretationJson, {
    code: 'interpretation-round-trip',
    message: 'InterpretationResult changed during JSON round-trip.',
  });
  assertions.assert(jsonSafe(interpretation), {
    code: 'interpretation-json-safety',
    message: 'InterpretationResult contains a non-JSON-safe value.',
  });

  const journeyFixture = journeyMemoryFixtures[0];
  if (!journeyFixture) throw new Error('Journey serialization fixture is missing.');
  const snapshot = buildJourneyMemorySnapshot({
    generatedAt: journeyFixture.generatedAt,
    locale: 'ru',
    sources: journeyFixture.sources,
  });
  const snapshotJson = serializeJourneyMemorySnapshot(snapshot);
  const restoredSnapshot = deserializeJourneyMemorySnapshot(snapshotJson);
  assertions.assert(JSON.stringify(restoredSnapshot) === snapshotJson, {
    code: 'journey-memory-round-trip',
    message: 'JourneyMemorySnapshot changed during JSON round-trip.',
  });
  assertions.assert(jsonSafe(snapshot), {
    code: 'journey-memory-json-safety',
    message: 'JourneyMemorySnapshot contains a non-JSON-safe value.',
  });

  const envelope = createFullStorageFixtureEnvelope();
  const serializedEnvelope = serializeProductStorageEnvelope(envelope);
  assertions.assert(serializedEnvelope.status === 'success', {
    code: 'envelope-serialization',
    message: 'ProductStorageEnvelope serialization failed.',
  });
  if (serializedEnvelope.status === 'success') {
    const restored = parseProductStorageEnvelope(serializedEnvelope.json);
    assertions.assert(restored.status === 'success' && restored.envelope.checksum.length > 0, {
      code: 'envelope-round-trip',
      message: 'ProductStorageEnvelope failed checksum-preserving round-trip.',
    });
    const broken = JSON.parse(serializedEnvelope.json) as { checksum: string };
    broken.checksum = 'broken-checksum';
    assertions.assert(
      parseProductStorageEnvelope(JSON.stringify(broken)).status === 'checksum-error',
      {
        code: 'negative-checksum-not-detected',
        message: 'Controlled broken checksum was not rejected.',
      },
    );
  }
  assertions.assert(jsonSafe(envelope), {
    code: 'envelope-json-safety',
    message: 'ProductStorageEnvelope contains a non-JSON-safe value.',
  });
  const exportOne = buildProductStorageExport(envelope, {
    exportedAt: '2026-08-05T12:00:00.000Z',
    scope: 'full',
  });
  const exportTwo = buildProductStorageExport(envelope, {
    exportedAt: '2026-08-05T12:00:00.000Z',
    scope: 'full',
  });
  assertions.assert(exportOne.json === exportTwo.json, {
    code: 'export-ordering-nondeterministic',
    message: 'Canonical export ordering changed for identical input.',
  });
  const preview = parseProductStorageImport(exportOne.json, withEnvelopeChecksum(envelope), {
    mode: 'preview',
    now: '2026-08-05T12:00:00.000Z',
    productVersion: 'quality-gates',
  });
  assertions.assert(jsonSafe(preview) && JSON.parse(JSON.stringify(preview)).status === 'preview', {
    code: 'import-preview-serialization',
    message: 'Import preview is not safely serializable.',
  });
  assertions.assert(hasUnresolvedTemplate(negativeQualityFixtures.unresolvedTemplate), {
    code: 'negative-template-not-detected',
    message: 'Controlled unresolved localization variable was not detected.',
  });
  assertions.assert(hasDuplicateStableIds(negativeQualityFixtures.duplicateJourneyEntryIds), {
    code: 'negative-journey-duplicate-not-detected',
    message: 'Controlled duplicate Journey entry was not detected.',
  });
  const future = {
    ...withEnvelopeChecksum(envelope),
    schemaVersion: negativeQualityFixtures.futureSchema,
  };
  assertions.assert(
    parseProductStorageEnvelope(JSON.stringify(future)).status === 'unsupported-version',
    {
      code: 'negative-future-schema-not-detected',
      message: 'Controlled unsupported future schema was not rejected.',
    },
  );
  return assertions.result();
}
