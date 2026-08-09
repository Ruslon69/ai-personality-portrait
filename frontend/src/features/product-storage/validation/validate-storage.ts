import { validateInterpretationResult } from '@features/expert-interpretation/validation';
import { validateJourneyMemorySnapshot } from '@features/journey-memory/validation';
import { validateReadingContinuityContext } from '@features/journey-memory/continuity';
import { validateCrossSystemResult } from '@features/cross-system-reasoning/validation';
import { validateNarrativeComposition } from '@features/narrative-composition/validation';

import { PRODUCT_STORAGE_VERSIONS } from '../constants';
import type {
  ProductStorageData,
  ProductStorageSection,
  ProductStorageValidationError,
} from '../types';
import { isIsoTimestamp, isJsonValue, isRecord } from '../utils';

function error(
  errors: ProductStorageValidationError[],
  section: ProductStorageSection,
  code: string,
  path: string,
  message: string,
  recoverable = true,
) {
  errors.push({ code, message, path, recoverable, section, severity: 'error' });
}

function requireVersion(
  value: unknown,
  expected: string,
  section: ProductStorageSection,
  errors: ProductStorageValidationError[],
) {
  if (!isRecord(value) || value.schemaVersion !== expected) {
    error(
      errors,
      section,
      'invalid-section-version',
      `$.data.${section}.schemaVersion`,
      `Expected ${expected}.`,
    );
    return false;
  }
  return true;
}

function validateReadingRecords(value: unknown, errors: ProductStorageValidationError[]) {
  if (!Array.isArray(value)) {
    error(
      errors,
      'tarotReadings',
      'invalid-readings',
      '$.data.tarotReadings.data',
      'Readings must be an array.',
    );
    return;
  }
  const ids = new Set<string>();
  value.forEach((item, index) => {
    if (!isRecord(item) || !isRecord(item.reading) || typeof item.reading.id !== 'string') {
      error(
        errors,
        'tarotReadings',
        'invalid-reading',
        `$.data.tarotReadings.data.${index}`,
        'Reading requires a stable id.',
      );
      return;
    }
    if (ids.has(item.reading.id))
      error(
        errors,
        'tarotReadings',
        'duplicate-reading-id',
        `$.data.tarotReadings.data.${index}.reading.id`,
        `Duplicate reading ${item.reading.id}.`,
      );
    ids.add(item.reading.id);
    validateTarotReadingValue(item.reading, `$.data.tarotReadings.data.${index}.reading`, errors);
    if (!isIsoTimestamp(item.savedAt))
      error(
        errors,
        'tarotReadings',
        'invalid-timestamp',
        `$.data.tarotReadings.data.${index}.savedAt`,
        'Saved timestamp must be ISO-compatible.',
      );
  });
}

function validateTarotReadingValue(
  reading: Record<string, unknown>,
  path: string,
  errors: ProductStorageValidationError[],
) {
  if (
    typeof reading.id !== 'string' ||
    typeof reading.spreadId !== 'string' ||
    !isIsoTimestamp(reading.createdAt) ||
    !Array.isArray(reading.selections) ||
    !isRecord(reading.context)
  ) {
    error(errors, 'tarotReadings', 'invalid-reading-shape', path, 'Tarot reading is incomplete.');
    return;
  }
  const positions = new Set<string>();
  reading.selections.forEach((selection, index) => {
    if (
      !isRecord(selection) ||
      typeof selection.cardId !== 'string' ||
      typeof selection.positionId !== 'string' ||
      (selection.orientation !== 'upright' && selection.orientation !== 'reversed')
    )
      error(
        errors,
        'tarotReadings',
        'invalid-card-selection',
        `${path}.selections.${index}`,
        'Card selection is invalid.',
      );
    else if (positions.has(selection.positionId))
      error(
        errors,
        'tarotReadings',
        'duplicate-position',
        `${path}.selections.${index}.positionId`,
        'Spread position is assigned more than once.',
      );
    else positions.add(selection.positionId);
  });
  if (isRecord(reading.expertInterpretation)) {
    try {
      const report = validateInterpretationResult(reading.expertInterpretation as never);
      report.errors.forEach((item) =>
        error(
          errors,
          'tarotReadings',
          `interpretation-${item.code}`,
          `${path}.expertInterpretation.${item.path}`,
          item.message,
        ),
      );
    } catch {
      error(
        errors,
        'tarotReadings',
        'invalid-interpretation',
        `${path}.expertInterpretation`,
        'Expert interpretation could not be validated.',
      );
    }
  }
  if (reading.crossSystemReasoning !== undefined) {
    try {
      const report = validateCrossSystemResult(reading.crossSystemReasoning as never);
      report.errors.forEach((item) =>
        error(
          errors,
          'tarotReadings',
          `reasoning-${item.code}`,
          `${path}.crossSystemReasoning.${item.path}`,
          item.message,
        ),
      );
    } catch {
      error(
        errors,
        'tarotReadings',
        'invalid-reasoning',
        `${path}.crossSystemReasoning`,
        'Cross-system result could not be validated.',
      );
    }
  }
  if (reading.narrative !== undefined) {
    try {
      const report = validateNarrativeComposition(reading.narrative as never);
      report.errors.forEach((item) =>
        error(
          errors,
          'tarotReadings',
          `narrative-${item.code}`,
          `${path}.narrative.${item.path}`,
          item.message,
        ),
      );
    } catch {
      error(
        errors,
        'tarotReadings',
        'invalid-narrative',
        `${path}.narrative`,
        'Narrative result could not be validated.',
      );
    }
  }
  if (reading.continuity !== undefined) {
    try {
      const report = validateReadingContinuityContext(reading.continuity as never);
      report.errors.forEach((item) =>
        error(
          errors,
          'tarotReadings',
          `continuity-${item.code}`,
          `${path}.continuity.${item.path}`,
          item.message,
        ),
      );
    } catch {
      error(
        errors,
        'tarotReadings',
        'invalid-continuity',
        `${path}.continuity`,
        'Continuity context could not be validated.',
      );
    }
  }
  if (
    reading.reasoningVersions !== undefined &&
    (!isRecord(reading.reasoningVersions) ||
      [
        'authorContent',
        'calculationSystem',
        'crossSystemReasoning',
        'expertInterpretation',
        'journeyMemory',
        'narrative',
        'numerologyKnowledge',
        'readingContinuity',
        'status',
        'tarotKnowledge',
      ].some(
        (key) => typeof (reading.reasoningVersions as Record<string, unknown>)[key] !== 'string',
      ))
  )
    error(
      errors,
      'tarotReadings',
      'invalid-engine-lineage',
      `${path}.reasoningVersions`,
      'Reading engine lineage is incomplete.',
    );
  if (
    isRecord(reading.reasoningVersions) &&
    !['current', 'legacy', 'mixed'].includes(String(reading.reasoningVersions.status))
  )
    error(
      errors,
      'tarotReadings',
      'invalid-lineage-status',
      `${path}.reasoningVersions.status`,
      'Reading lineage status is invalid.',
    );
  if (
    isRecord(reading.reasoningVersions) &&
    reading.reasoningVersions.status === 'current' &&
    (!isRecord(reading.expertInterpretation) ||
      !isRecord(reading.crossSystemReasoning) ||
      !isRecord(reading.narrative))
  )
    error(
      errors,
      'tarotReadings',
      'incomplete-current-reading',
      path,
      'Current-lineage reading requires interpretation, reasoning, and narrative results.',
    );
}

function validateJourney(value: unknown, errors: ProductStorageValidationError[]) {
  if (
    !isRecord(value) ||
    typeof value.identity !== 'string' ||
    !Array.isArray(value.readings) ||
    !isRecord(value.dailyCards)
  ) {
    error(
      errors,
      'journey',
      'invalid-journey',
      '$.data.journey.data',
      'Journey state has an invalid shape.',
    );
    return;
  }
  const ids = new Set<string>();
  value.readings.forEach((record, index) => {
    if (!isRecord(record) || !isRecord(record.reading) || typeof record.reading.id !== 'string') {
      error(
        errors,
        'journey',
        'invalid-journey-reading',
        `$.data.journey.data.readings.${index}`,
        'Journey reading requires an id.',
      );
      return;
    }
    if (ids.has(record.reading.id))
      error(
        errors,
        'journey',
        'duplicate-reading-id',
        `$.data.journey.data.readings.${index}`,
        `Duplicate journey reading ${record.reading.id}.`,
      );
    ids.add(record.reading.id);
  });
}

function validateDraft(value: unknown, errors: ProductStorageValidationError[]) {
  if (!isRecord(value) || !isRecord(value.draft) || !Array.isArray(value.profiles)) {
    error(
      errors,
      'draftPortrait',
      'invalid-draft',
      '$.data.draftPortrait.data',
      'Draft section has an invalid shape.',
    );
    return;
  }
  const draft = value.draft;
  if (
    !isRecord(draft.answers) ||
    !Array.isArray(draft.interests) ||
    !isRecord(draft.birthDate) ||
    !isRecord(draft.voice)
  )
    error(
      errors,
      'draftPortrait',
      'invalid-draft-fields',
      '$.data.draftPortrait.data.draft',
      'Draft fields are incomplete.',
    );
  if (Object.keys(draft).some((key) => /audio|blob|microphone|rawVoice/i.test(key)))
    error(
      errors,
      'draftPortrait',
      'privacy-boundary',
      '$.data.draftPortrait.data.draft',
      'Raw voice or audio data is not permitted.',
    );
  const profileIds = new Set<string>();
  value.profiles.forEach((profile, index) => {
    if (!isRecord(profile) || typeof profile.id !== 'string')
      error(
        errors,
        'draftPortrait',
        'invalid-profile',
        `$.data.draftPortrait.data.profiles.${index}`,
        'Saved profile requires an id.',
      );
    else if (profileIds.has(profile.id))
      error(
        errors,
        'draftPortrait',
        'duplicate-profile-id',
        `$.data.draftPortrait.data.profiles.${index}.id`,
        `Duplicate profile ${profile.id}.`,
      );
    else profileIds.add(profile.id);
  });
}

function validateTarotSession(value: unknown, errors: ProductStorageValidationError[]) {
  if (
    !isRecord(value) ||
    typeof value.seed !== 'string' ||
    typeof value.spreadId !== 'string' ||
    !Array.isArray(value.selections) ||
    !Array.isArray(value.answers) ||
    !['automatic', 'manual'].includes(String(value.selectionMode))
  )
    error(
      errors,
      'tarotSession',
      'invalid-tarot-session',
      '$.data.tarotSession.data',
      'Tarot session has an invalid shape.',
    );
}

function validateNumerology(value: unknown, errors: ProductStorageValidationError[]) {
  if (!isRecord(value) || typeof value.birthDate !== 'string' || !('profile' in value))
    error(
      errors,
      'numerology',
      'invalid-numerology',
      '$.data.numerology.data',
      'Numerology section has an invalid shape.',
    );
  else if (value.profile !== null) {
    if (!isRecord(value.profile) || value.profile.system !== 'pythagorean-date-v1')
      error(
        errors,
        'numerology',
        'invalid-numerology-system',
        '$.data.numerology.data.profile.system',
        'Numerology must use pythagorean-date-v1.',
      );
    else {
      const profile: Record<string, unknown> = value.profile;
      ['lifePath', 'birthday', 'attitude', 'personalYear', 'personalMonth', 'personalDay'].forEach(
        (key) => {
          const calculation = profile[key];
          if (
            !isRecord(calculation) ||
            typeof calculation.value !== 'number' ||
            !Number.isFinite(calculation.value)
          )
            error(
              errors,
              'numerology',
              'invalid-calculation',
              `$.data.numerology.data.profile.${key}`,
              'Numerology calculation is invalid.',
            );
        },
      );
    }
  }
}

function validatePreferences(value: unknown, errors: ProductStorageValidationError[]) {
  if (!isRecord(value)) {
    error(
      errors,
      'preferences',
      'invalid-preferences',
      '$.data.preferences.data',
      'Preferences must be an object.',
    );
    return;
  }
  if (value.locale !== undefined && !['en', 'ru', 'uk'].includes(String(value.locale)))
    error(
      errors,
      'preferences',
      'invalid-locale',
      '$.data.preferences.data.locale',
      'Unsupported locale.',
    );
  if (value.theme !== undefined && !['dark', 'light', 'system'].includes(String(value.theme)))
    error(
      errors,
      'preferences',
      'invalid-theme',
      '$.data.preferences.data.theme',
      'Unsupported theme.',
    );
}

const prohibitedPersistentKeys = [
  /audioBlob/i,
  /rawAudio/i,
  /rawMicrophone/i,
  /microphoneData/i,
  /paymentDetails/i,
  /apiKey/i,
  /authToken/i,
  /accessToken/i,
  /refreshToken/i,
];

function scanPrivacyBoundary(
  value: unknown,
  path: string,
  errors: ProductStorageValidationError[],
  seen = new Set<object>(),
) {
  if (!value || typeof value !== 'object') return;
  if (seen.has(value)) return;
  seen.add(value);
  Object.entries(value).forEach(([key, child]) => {
    const childPath = `${path}.${key}`;
    if (prohibitedPersistentKeys.some((pattern) => pattern.test(key)))
      error(
        errors,
        'envelope',
        'privacy-boundary',
        childPath,
        'Raw media, credentials, payment data, and secrets are not permitted in product storage.',
        false,
      );
    else scanPrivacyBoundary(child, childPath, errors, seen);
  });
  seen.delete(value);
}

function validateCrossReferences(
  data: Record<string, unknown>,
  errors: ProductStorageValidationError[],
) {
  const journey = isRecord(data.journey) && isRecord(data.journey.data) ? data.journey.data : null;
  const tarot =
    isRecord(data.tarotReadings) && Array.isArray(data.tarotReadings.data)
      ? data.tarotReadings.data
      : null;
  if (journey && Array.isArray(journey.readings) && tarot) {
    const tarotIds = new Set(
      tarot.flatMap((record) =>
        isRecord(record) && isRecord(record.reading) && typeof record.reading.id === 'string'
          ? [record.reading.id]
          : [],
      ),
    );
    journey.readings.forEach((record, index) => {
      if (
        isRecord(record) &&
        isRecord(record.reading) &&
        typeof record.reading.id === 'string' &&
        !tarotIds.has(record.reading.id)
      )
        error(
          errors,
          'journey',
          'missing-reading-reference',
          `$.data.journey.data.readings.${index}.reading.id`,
          `Journey references missing Tarot reading ${record.reading.id}.`,
        );
    });
  }
  const memoryEntries =
    isRecord(data.journeyMemory) &&
    isRecord(data.journeyMemory.data) &&
    Array.isArray(data.journeyMemory.data.entries)
      ? data.journeyMemory.data.entries
      : null;
  if (journey && Array.isArray(journey.readings) && memoryEntries) {
    const journeyIds = new Set(
      journey.readings.flatMap((record) =>
        isRecord(record) && isRecord(record.reading) && typeof record.reading.id === 'string'
          ? [record.reading.id]
          : [],
      ),
    );
    memoryEntries.forEach((entry, index) => {
      const readingReference =
        isRecord(entry) && Array.isArray(entry.sourceReferences)
          ? entry.sourceReferences.find(
              (reference) =>
                isRecord(reference) &&
                reference.kind === 'reading' &&
                typeof reference.id === 'string',
            )
          : undefined;
      const readingId =
        isRecord(readingReference) && typeof readingReference.id === 'string'
          ? readingReference.id.replace(/^reading:/, '')
          : null;
      if (isRecord(entry) && entry.kind === 'tarot-reading' && readingId === null)
        error(
          errors,
          'journeyMemory',
          'missing-reading-reference',
          `$.data.journeyMemory.data.entries.${index}.sourceReferences`,
          'Tarot Journey Memory entry requires a reading provenance reference.',
        );
      if (
        isRecord(entry) &&
        entry.kind === 'tarot-reading' &&
        readingId !== null &&
        !journeyIds.has(readingId)
      )
        error(
          errors,
          'journeyMemory',
          'missing-journey-entry-reference',
          `$.data.journeyMemory.data.entries.${index}.id`,
          `Journey Memory references missing Journey reading ${readingId}.`,
        );
    });
  }
}

export function validateProductStorageSection(
  section: ProductStorageSection,
  value: unknown,
): readonly ProductStorageValidationError[] {
  const errors: ProductStorageValidationError[] = [];
  if (section === 'envelope') return errors;
  const versions: Partial<Record<ProductStorageSection, string>> = {
    completionState: 'completion-storage-v1',
    draftPortrait: PRODUCT_STORAGE_VERSIONS.draft,
    journey: PRODUCT_STORAGE_VERSIONS.journey,
    journeyMemory: 'journey-memory-v1',
    numerology: PRODUCT_STORAGE_VERSIONS.numerology,
    preferences: 'preferences-storage-v1',
    tarotReadings: PRODUCT_STORAGE_VERSIONS.tarot,
    tarotSession: 'tarot-session-storage-v1',
  };
  if (!requireVersion(value, versions[section] ?? '', section, errors) || !isRecord(value))
    return errors;
  if (section === 'preferences') validatePreferences(value.data, errors);
  if (section === 'draftPortrait') validateDraft(value.data, errors);
  if (section === 'tarotSession') validateTarotSession(value.data, errors);
  if (section === 'tarotReadings') validateReadingRecords(value.data, errors);
  if (section === 'numerology') validateNumerology(value.data, errors);
  if (section === 'journey') validateJourney(value.data, errors);
  if (
    section === 'completionState' &&
    (!isRecord(value.data) || !Array.isArray(value.data.completedStages))
  )
    error(
      errors,
      section,
      'invalid-completion-state',
      '$.data.completionState.data',
      'Completion state must contain completedStages.',
    );
  if (section === 'journeyMemory') {
    try {
      const result = validateJourneyMemorySnapshot(value.data as never);
      result.errors.forEach((item) =>
        error(errors, section, item.code, `$.data.journeyMemory.data.${item.path}`, item.message),
      );
    } catch {
      error(
        errors,
        section,
        'invalid-journey-memory',
        '$.data.journeyMemory.data',
        'Journey Memory data could not be validated.',
      );
    }
  }
  return errors;
}

export function validateProductStorageEnvelope(envelope: unknown): {
  errors: readonly ProductStorageValidationError[];
  valid: boolean;
} {
  const errors: ProductStorageValidationError[] = [];
  if (!isRecord(envelope)) {
    error(errors, 'envelope', 'invalid-envelope', '$', 'Envelope must be an object.', false);
    return { errors, valid: false };
  }
  if (envelope.schemaVersion !== PRODUCT_STORAGE_VERSIONS.product)
    error(
      errors,
      'envelope',
      'invalid-schema-version',
      '$.schemaVersion',
      'Unsupported product storage schema.',
      false,
    );
  if (!Number.isSafeInteger(envelope.revision) || Number(envelope.revision) < 0)
    error(
      errors,
      'envelope',
      'invalid-revision',
      '$.revision',
      'Revision must be a non-negative safe integer.',
      false,
    );
  if (!isIsoTimestamp(envelope.createdAt) || !isIsoTimestamp(envelope.updatedAt))
    error(
      errors,
      'envelope',
      'invalid-timestamp',
      '$.createdAt',
      'Envelope timestamps must be ISO-compatible.',
      false,
    );
  else if (Date.parse(String(envelope.updatedAt)) < Date.parse(String(envelope.createdAt)))
    error(
      errors,
      'envelope',
      'invalid-timestamp-order',
      '$.updatedAt',
      'Updated timestamp cannot precede creation.',
      false,
    );
  if (typeof envelope.productVersion !== 'string' || envelope.productVersion.length === 0)
    error(
      errors,
      'envelope',
      'invalid-product-version',
      '$.productVersion',
      'Product version is required.',
      false,
    );
  if (typeof envelope.checksum !== 'string' || envelope.checksum.length === 0)
    error(errors, 'envelope', 'invalid-checksum', '$.checksum', 'Checksum is required.', false);
  if (!['en', 'ru', 'uk'].includes(String(envelope.locale)))
    error(errors, 'envelope', 'invalid-locale', '$.locale', 'Envelope locale is invalid.', false);
  if (!isRecord(envelope.data))
    error(errors, 'envelope', 'invalid-data', '$.data', 'Envelope data must be an object.', false);
  else {
    Object.entries(envelope.data).forEach(([section, value]) => {
      if (
        ![
          'preferences',
          'draftPortrait',
          'tarotSession',
          'tarotReadings',
          'numerology',
          'journey',
          'journeyMemory',
          'completionState',
        ].includes(section)
      )
        error(
          errors,
          'envelope',
          'unknown-section',
          `$.data.${section}`,
          'Unknown storage section.',
        );
      else errors.push(...validateProductStorageSection(section as ProductStorageSection, value));
    });
    validateCrossReferences(envelope.data, errors);
  }
  if (!isRecord(envelope.engineVersions))
    error(
      errors,
      'envelope',
      'invalid-engine-versions',
      '$.engineVersions',
      'Engine versions must be an object.',
      false,
    );
  else
    Object.entries(envelope.engineVersions).forEach(([key, value]) => {
      if (!key || typeof value !== 'string' || value.length === 0)
        error(
          errors,
          'envelope',
          'invalid-engine-version',
          `$.engineVersions.${key}`,
          'Engine version values must be non-empty strings.',
          false,
        );
    });
  if (!Array.isArray(envelope.migrationHistory))
    error(
      errors,
      'envelope',
      'invalid-migration-history',
      '$.migrationHistory',
      'Migration history must be an array.',
      false,
    );
  else {
    const ids = new Set<string>();
    envelope.migrationHistory.forEach((item, index) => {
      if (!isRecord(item) || typeof item.id !== 'string' || !isIsoTimestamp(item.completedAt))
        error(
          errors,
          'envelope',
          'invalid-migration-entry',
          `$.migrationHistory.${index}`,
          'Migration entry is invalid.',
        );
      else if (ids.has(item.id))
        error(
          errors,
          'envelope',
          'duplicate-migration-id',
          `$.migrationHistory.${index}.id`,
          'Migration ids must be unique.',
        );
      else {
        ids.add(item.id);
        if (
          typeof item.fromVersion !== 'string' ||
          typeof item.toVersion !== 'string' ||
          !Array.isArray(item.sections) ||
          !Array.isArray(item.warnings)
        )
          error(
            errors,
            'envelope',
            'invalid-migration-entry',
            `$.migrationHistory.${index}`,
            'Migration entry details are invalid.',
          );
      }
    });
  }
  if (
    !isRecord(envelope.recoveryMetadata) ||
    !Array.isArray(envelope.recoveryMetadata.isolatedSections)
  )
    error(
      errors,
      'envelope',
      'invalid-recovery-metadata',
      '$.recoveryMetadata',
      'Recovery metadata is invalid.',
      false,
    );
  if (!isJsonValue(envelope))
    error(
      errors,
      'envelope',
      'non-serializable',
      '$',
      'Envelope must contain only finite JSON-safe values.',
      false,
    );
  scanPrivacyBoundary(envelope, '$', errors);
  return { errors, valid: errors.every((item) => item.severity !== 'error') };
}

export function salvageProductStorageData(data: unknown) {
  const validData: ProductStorageData = {};
  const errors: ProductStorageValidationError[] = [];
  if (!isRecord(data)) return { errors, validData };
  for (const [section, value] of Object.entries(data)) {
    if (
      ![
        'preferences',
        'draftPortrait',
        'tarotSession',
        'tarotReadings',
        'numerology',
        'journey',
        'journeyMemory',
        'completionState',
      ].includes(section)
    )
      continue;
    const sectionErrors = validateProductStorageSection(section as ProductStorageSection, value);
    errors.push(...sectionErrors);
    if (sectionErrors.length === 0) Object.assign(validData, { [section]: value });
  }
  return { errors, validData };
}
