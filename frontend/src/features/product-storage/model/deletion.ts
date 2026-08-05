import { withEnvelopeChecksum } from '../serialization';
import type {
  DeletionTarget,
  ProductStorageDeletionPlan,
  ProductStorageEnvelope,
  ProductStorageSection,
} from '../types';

const targetSections: Record<DeletionTarget, readonly ProductStorageSection[]> = {
  'all-personal-data': [
    'draftPortrait',
    'tarotSession',
    'tarotReadings',
    'numerology',
    'journey',
    'journeyMemory',
    'completionState',
  ],
  'draft-portrait': ['draftPortrait'],
  journey: ['journey', 'journeyMemory'],
  numerology: ['numerology'],
  'tarot-readings': ['tarotReadings', 'journeyMemory'],
};

export function createProductStorageDeletionPlan(
  target: DeletionTarget,
): ProductStorageDeletionPlan {
  const sectionsAffected = targetSections[target];
  return {
    backupBehavior: 'replace-after-successful-write',
    dependentReferences:
      target === 'tarot-readings'
        ? ['Journey reading records', 'Journey Memory entries and chapters']
        : target === 'journey'
          ? ['Journey Memory snapshot']
          : [],
    orphanHandling:
      target === 'tarot-readings'
        ? [
            'Rebuild Journey Memory after deletion',
            'Remove Journey records that reference deleted readings',
          ]
        : ['Remove only explicitly affected sections'],
    revisionChange: 1,
    sectionsAffected,
    target,
  };
}

export function applyProductStorageDeletionPlan(
  envelope: ProductStorageEnvelope,
  plan: ProductStorageDeletionPlan,
  now: string,
) {
  const data = { ...envelope.data };
  plan.sectionsAffected.forEach((section) => {
    if (section !== 'envelope' && section !== 'preferences') delete data[section];
  });
  if (plan.target === 'tarot-readings' && data.journey)
    data.journey = { ...data.journey, data: { ...data.journey.data, readings: [] } };
  return withEnvelopeChecksum({
    ...envelope,
    data,
    revision: envelope.revision + 1,
    updatedAt: now,
  });
}
