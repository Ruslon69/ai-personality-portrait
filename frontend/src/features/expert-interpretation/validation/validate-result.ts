import {
  EXPERT_INTERPRETATION_VERSIONS,
  INTERPRETATION_CONFIDENCE_LEVELS,
  INTERPRETATION_CONNECTION_KINDS,
  INTERPRETATION_POLARITIES,
  INTERPRETATION_RELIABILITIES,
  INTERPRETATION_SECTION_KINDS,
  INTERPRETATION_SOURCES,
  INTERPRETATION_STRENGTHS,
  INTERPRETATION_UNCERTAINTIES,
} from '../constants';
import type {
  InterpretationResult,
  InterpretationValidationCode,
  InterpretationValidationError,
  InterpretationValidationReport,
} from '../types';
import { countWords } from '../content/grammar';
import { classifyUnsafeClaims, MIN_CONTENT_QUALITY_SCORE } from '../content';

function issue(
  errors: InterpretationValidationError[],
  code: InterpretationValidationCode,
  path: string,
  message: string,
) {
  errors.push({ code, message, path });
}

function scanSerializable(
  value: unknown,
  path: string,
  errors: InterpretationValidationError[],
  seen: Set<unknown>,
) {
  if (value === undefined) {
    issue(errors, 'undefined-value', path, 'Undefined is not JSON serializable.');
    return;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    issue(errors, 'non-finite-number', path, 'Numbers must be finite.');
    return;
  }
  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') {
    issue(errors, 'serialization-error', path, `Unsupported value type: ${typeof value}.`);
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (seen.has(value)) {
    issue(errors, 'serialization-error', path, 'Circular references are not supported.');
    return;
  }
  seen.add(value);
  const prototype = Object.getPrototypeOf(value) as object | null;
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    issue(errors, 'serialization-error', path, 'Only plain JSON objects are supported.');
    seen.delete(value);
    return;
  }
  Object.entries(value).forEach(([key, item]) =>
    scanSerializable(item, `${path}.${key}`, errors, seen),
  );
  seen.delete(value);
}

function validateUniqueIds(result: InterpretationResult, errors: InterpretationValidationError[]) {
  const seen = new Map<string, string>();
  const collections = [
    ['evidence', result.evidence],
    ['connections', result.connections],
    ['themes', result.themes],
    ['tensions', result.tensions],
    ['sections', result.sections],
    ['recommendations', result.recommendations],
  ] as const;
  collections.forEach(([name, items]) => {
    items.forEach((item, index) => {
      const path = `result.${name}.${index}.id`;
      if (!item.id.trim()) issue(errors, 'empty-field', path, 'ID cannot be empty.');
      const existing = seen.get(item.id);
      if (existing) issue(errors, 'duplicate-id', path, `ID already exists at ${existing}.`);
      else seen.set(item.id, path);
    });
  });
}

function validateVersions(result: InterpretationResult, errors: InterpretationValidationError[]) {
  Object.entries(EXPERT_INTERPRETATION_VERSIONS).forEach(([key, expected]) => {
    const actual = result.metadata.versions[key as keyof typeof EXPERT_INTERPRETATION_VERSIONS];
    if (actual !== expected) {
      issue(errors, 'invalid-version', `result.metadata.versions.${key}`, `Expected ${expected}.`);
    }
  });
}

function validateEvidence(result: InterpretationResult, errors: InterpretationValidationError[]) {
  result.evidence.forEach((evidence, index) => {
    const path = `result.evidence.${index}`;
    if (!INTERPRETATION_SOURCES.includes(evidence.source))
      issue(errors, 'invalid-source', `${path}.source`, 'Unsupported evidence source.');
    if (!INTERPRETATION_POLARITIES.includes(evidence.polarity))
      issue(errors, 'invalid-enum', `${path}.polarity`, 'Unsupported polarity.');
    if (!INTERPRETATION_STRENGTHS.includes(evidence.strength))
      issue(errors, 'invalid-enum', `${path}.strength`, 'Unsupported strength.');
    if (!INTERPRETATION_RELIABILITIES.includes(evidence.reliability))
      issue(errors, 'invalid-enum', `${path}.reliability`, 'Unsupported reliability.');
    if (!evidence.provenance.trim())
      issue(errors, 'invalid-provenance', `${path}.provenance`, 'Provenance is required.');
    if (!evidence.semanticType.trim())
      issue(errors, 'empty-field', `${path}.semanticType`, 'Semantic type is required.');
    if (
      evidence.reference?.kind === 'card' &&
      !result.metadata.cardIds.includes(evidence.reference.id)
    )
      issue(errors, 'invalid-card-reference', `${path}.reference`, 'Unknown card reference.');
    if (
      evidence.reference?.kind === 'number' &&
      typeof evidence.value === 'number' &&
      !result.metadata.numberValues.includes(evidence.value)
    )
      issue(errors, 'invalid-number-reference', `${path}.reference`, 'Unknown number reference.');
  });
  const availability = result.metadata.sourceAvailability;
  const expectedAvailability = {
    interest: availability.interests,
    numerology: availability.numerology,
    'psychological-context': availability.psychologicalContext,
    'tarot-card': availability.tarot,
    zodiac: availability.zodiac,
  } as const;
  Object.entries(expectedAvailability).forEach(([source, available]) => {
    const present = result.evidence.some((item) => item.source === source);
    if (present !== available)
      issue(
        errors,
        'invalid-source',
        `result.metadata.sourceAvailability.${source}`,
        `Availability does not match ${source} evidence.`,
      );
  });
}

function validateConnections(
  result: InterpretationResult,
  errors: InterpretationValidationError[],
) {
  const evidenceIds = new Set(result.evidence.map((item) => item.id));
  result.connections.forEach((connection, index) => {
    const path = `result.connections.${index}`;
    if (!INTERPRETATION_CONNECTION_KINDS.includes(connection.kind))
      issue(errors, 'invalid-enum', `${path}.kind`, 'Unsupported connection kind.');
    connection.cardIds.forEach((cardId) => {
      if (!result.metadata.cardIds.includes(cardId))
        issue(errors, 'invalid-card-reference', `${path}.cardIds`, `Unknown card: ${cardId}.`);
    });
    connection.numberValues.forEach((value) => {
      if (!result.metadata.numberValues.includes(value))
        issue(
          errors,
          'invalid-number-reference',
          `${path}.numberValues`,
          `Unknown number: ${value}.`,
        );
    });
    connection.evidenceIds.forEach((id) => {
      if (!evidenceIds.has(id))
        issue(errors, 'invalid-source', `${path}.evidenceIds`, `Unknown evidence: ${id}.`);
    });
  });
}

function validateSections(result: InterpretationResult, errors: InterpretationValidationError[]) {
  const evidenceById = new Map(result.evidence.map((item) => [item.id, item]));
  const themeIds = new Set(result.themes.map((item) => item.id));
  if (!result.sections.length)
    issue(errors, 'empty-field', 'result.sections', 'At least one section is required.');
  if (!themeIds.has(result.leadingThemeId))
    issue(errors, 'empty-field', 'result.leadingThemeId', 'Leading theme must exist.');
  result.sections.forEach((section, index) => {
    const path = `result.sections.${index}`;
    if (!INTERPRETATION_SECTION_KINDS.includes(section.kind))
      issue(errors, 'invalid-enum', `${path}.kind`, 'Unsupported section kind.');
    if (!INTERPRETATION_CONFIDENCE_LEVELS.includes(section.confidence.level))
      issue(errors, 'invalid-enum', `${path}.confidence.level`, 'Unsupported confidence.');
    if (!INTERPRETATION_UNCERTAINTIES.includes(section.confidence.uncertainty))
      issue(errors, 'invalid-enum', `${path}.confidence.uncertainty`, 'Unsupported uncertainty.');
    if (!section.titleKey.trim() || !section.summary.key.trim() || !section.details.length)
      issue(errors, 'empty-field', path, 'Section title, summary and details are required.');
    const sectionEvidence = section.evidence.map((id) => evidenceById.get(id)).filter(Boolean);
    section.evidence.forEach((id) => {
      if (!evidenceById.has(id))
        issue(errors, 'invalid-source', `${path}.evidence`, `Unknown evidence: ${id}.`);
    });
    section.sources.forEach((source) => {
      if (!sectionEvidence.some((item) => item?.source === source))
        issue(errors, 'invalid-source', `${path}.sources`, `Source ${source} has no evidence.`);
    });
    if (
      section.confidence.level === 'high' &&
      (section.confidence.uncertainty !== 'direct-input' ||
        section.sources.some((source) => ['numerology', 'tarot-card', 'zodiac'].includes(source)))
    )
      issue(
        errors,
        'invalid-confidence',
        `${path}.confidence`,
        'High confidence is reserved for direct structural facts.',
      );
    section.relatedCards.forEach((cardId) => {
      if (!result.metadata.cardIds.includes(cardId))
        issue(errors, 'invalid-card-reference', `${path}.relatedCards`, `Unknown card: ${cardId}.`);
    });
    section.relatedNumbers.forEach((value) => {
      if (!result.metadata.numberValues.includes(value))
        issue(
          errors,
          'invalid-number-reference',
          `${path}.relatedNumbers`,
          `Unknown number: ${value}.`,
        );
    });
  });
}

function validateComposition(
  result: InterpretationResult,
  errors: InterpretationValidationError[],
) {
  const evidenceIds = new Set(result.evidence.map((item) => item.id));
  const connectionIds = new Set(result.connections.map((item) => item.id));
  const tensionIds = new Set(result.tensions.map((item) => item.id));
  const themeIds = new Set(result.themes.map((item) => item.id));
  const semanticThemeIds = new Set<string>();
  result.themes.forEach((theme, index) => {
    const path = `result.themes.${index}`;
    if (semanticThemeIds.has(theme.semanticId))
      issue(errors, 'duplicate-id', `${path}.semanticId`, 'Theme semantic IDs must be unique.');
    semanticThemeIds.add(theme.semanticId);
    theme.evidenceIds.forEach((id) => {
      if (!evidenceIds.has(id))
        issue(errors, 'invalid-source', `${path}.evidenceIds`, `Unknown evidence: ${id}.`);
    });
    theme.connectionIds.forEach((id) => {
      if (!connectionIds.has(id))
        issue(errors, 'invalid-source', `${path}.connectionIds`, `Unknown connection: ${id}.`);
    });
    theme.tensionIds.forEach((id) => {
      if (!tensionIds.has(id))
        issue(errors, 'invalid-source', `${path}.tensionIds`, `Unknown tension: ${id}.`);
    });
  });
  result.tensions.forEach((tension, index) => {
    tension.connectionIds.forEach((id) => {
      if (!connectionIds.has(id))
        issue(
          errors,
          'invalid-source',
          `result.tensions.${index}.connectionIds`,
          `Unknown connection: ${id}.`,
        );
    });
  });
  result.recommendations.forEach((recommendation, index) => {
    if (!themeIds.has(recommendation.relatedThemeId))
      issue(
        errors,
        'invalid-source',
        `result.recommendations.${index}.relatedThemeId`,
        'Recommendation must reference an existing theme.',
      );
  });
}

function contentTexts(result: InterpretationResult) {
  return [
    ['result.content.headline', result.content.headline],
    ['result.content.opening', result.content.opening],
    ['result.content.closing', result.content.closing],
    ...result.content.sections.flatMap((section, sectionIndex) => [
      [`result.content.sections.${sectionIndex}.headline`, section.headline] as const,
      ...section.blocks.map(
        (block, blockIndex) =>
          [
            `result.content.sections.${sectionIndex}.blocks.${blockIndex}.text`,
            block.text,
          ] as const,
      ),
    ]),
  ] as const;
}

function validateAuthorContent(
  result: InterpretationResult,
  errors: InterpretationValidationError[],
) {
  const content = result.content;
  const evidenceById = new Map(result.evidence.map((item) => [item.id, item]));
  if (content.version !== 'author-content-v1' || content.locale !== result.metadata.locale)
    issue(
      errors,
      'invalid-content',
      'result.content',
      'Content version and locale must match result metadata.',
    );
  const headlineWords = countWords(content.headline);
  if (headlineWords < 5 || headlineWords > 12 || /[.?]$/u.test(content.headline))
    issue(
      errors,
      'invalid-content',
      'result.content.headline',
      'Headline must contain 5–12 words and have no final period or question mark.',
    );
  if (!content.opening.trim() || !content.closing.trim() || !content.sections.length)
    issue(
      errors,
      'empty-field',
      'result.content',
      'Content requires opening, closing and sections.',
    );

  const contentIds = new Set<string>();
  const sectionHeadlines = new Set<string>();
  content.sections.forEach((section, sectionIndex) => {
    const path = `result.content.sections.${sectionIndex}`;
    [section.id, ...section.blocks.map((block) => block.id)].forEach((id) => {
      if (contentIds.has(id)) issue(errors, 'duplicate-id', path, `Duplicate content ID: ${id}.`);
      contentIds.add(id);
    });
    const headlineKey = section.headline.toLocaleLowerCase().trim();
    if (sectionHeadlines.has(headlineKey))
      issue(errors, 'invalid-content', `${path}.headline`, 'Section headlines must be distinct.');
    sectionHeadlines.add(headlineKey);
    if (!section.headline.trim() || !section.blocks.length)
      issue(errors, 'empty-field', path, 'Content section cannot be empty.');
    section.blocks.forEach((block, blockIndex) => {
      const blockPath = `${path}.blocks.${blockIndex}`;
      if (!block.text.trim() || !block.evidenceIds.length || !block.sourceIds.length)
        issue(errors, 'empty-field', blockPath, 'Content block must be grounded and non-empty.');
      const blockEvidence = block.evidenceIds
        .map((id) => evidenceById.get(id))
        .filter((value) => value !== undefined);
      block.evidenceIds.forEach((id) => {
        if (!evidenceById.has(id))
          issue(errors, 'invalid-source', `${blockPath}.evidenceIds`, `Unknown evidence: ${id}.`);
      });
      block.sourceIds.forEach((source) => {
        if (!blockEvidence.some((item) => item.source === source))
          issue(
            errors,
            'invalid-source',
            `${blockPath}.sourceIds`,
            `Source ${source} has no supporting evidence.`,
          );
      });
    });
  });

  contentTexts(result).forEach(([path, text]) => {
    classifyUnsafeClaims(text).forEach((claim) =>
      issue(errors, 'banned-claim', path, `Forbidden claim category: ${claim.category}.`),
    );
  });
  const joined = contentTexts(result)
    .map(([, text]) => text)
    .join(' ');
  const mixedLocale =
    content.locale === 'en'
      ? /[А-Яа-яЁёІіЇїЄєҐґ]/u.test(joined)
      : !/[А-Яа-яЁёІіЇїЄєҐґ]/u.test(joined);
  if (mixedLocale)
    issue(errors, 'mixed-locale', 'result.content', 'Content does not match its declared locale.');
  if (
    !content.quality.valid ||
    content.quality.threshold !== MIN_CONTENT_QUALITY_SCORE ||
    content.quality.score.overall < MIN_CONTENT_QUALITY_SCORE
  )
    issue(
      errors,
      'low-content-quality',
      'result.content.quality',
      'Author content did not meet the internal quality threshold.',
    );
}

export function validateInterpretationResult(
  result: InterpretationResult,
): InterpretationValidationReport {
  const errors: InterpretationValidationError[] = [];
  scanSerializable(result, 'result', errors, new Set());
  if (!result.id?.trim()) issue(errors, 'empty-field', 'result.id', 'Result ID is required.');
  if (!result.metadata?.generatedAt || Number.isNaN(Date.parse(result.metadata.generatedAt)))
    issue(errors, 'empty-field', 'result.metadata.generatedAt', 'A valid timestamp is required.');
  validateUniqueIds(result, errors);
  validateVersions(result, errors);
  validateEvidence(result, errors);
  validateConnections(result, errors);
  validateComposition(result, errors);
  validateSections(result, errors);
  validateAuthorContent(result, errors);
  try {
    const serialized = JSON.stringify(result);
    if (JSON.stringify(JSON.parse(serialized)) !== serialized)
      issue(errors, 'serialization-error', 'result', 'JSON round-trip is not stable.');
  } catch {
    issue(errors, 'serialization-error', 'result', 'Result cannot be serialized.');
  }
  return { errors, valid: errors.length === 0 };
}
