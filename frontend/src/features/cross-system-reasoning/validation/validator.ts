import { CROSS_SYSTEM_VERSIONS } from '../constants';
import type {
  CrossSystemLink,
  CrossSystemResult,
  CrossSystemValidationError,
  CrossSystemValidationReport,
} from '../types';
import { stableCrossSystemStringify } from '../utils';

function issue(
  errors: CrossSystemValidationError[],
  code: CrossSystemValidationError['code'],
  path: string,
  message: string,
) {
  errors.push({ code, message, path });
}

function duplicates(values: readonly string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

function validateLink(
  link: CrossSystemLink,
  index: number,
  sourceIds: ReadonlySet<string>,
  errors: CrossSystemValidationError[],
) {
  const path = `links[${index}]`;
  if (!link.id || !link.semanticType || !link.themeId)
    issue(errors, 'invalid-enum', path, 'Link identity and semantic fields are required.');
  link.sourceIds.forEach((id) => {
    if (!sourceIds.has(id))
      issue(errors, 'broken-reference', `${path}.sourceIds`, `Unknown source ${id}.`);
  });
  if (
    !link.explanation.relationConcept ||
    !link.explanation.limitationConcept ||
    !link.explanation.practicalConcept
  )
    issue(
      errors,
      'empty-explanation',
      `${path}.explanation`,
      'Explanation concepts cannot be empty.',
    );
  if (!link.explanation.sourceConcepts.length)
    issue(
      errors,
      'empty-explanation',
      `${path}.explanation.sourceConcepts`,
      'Source explanation is required.',
    );
  if (link.displayEligible && link.exclusionReason)
    issue(errors, 'rejected-link-displayed', path, 'Excluded link cannot be display eligible.');
  if (!link.displayEligible && !link.exclusionReason)
    issue(
      errors,
      'invalid-enum',
      `${path}.exclusionReason`,
      'Rejected link needs an exclusion reason.',
    );
  if (link.reliability === 'symbolic' && link.uncertainty !== 'symbolic-interpretation')
    issue(
      errors,
      'invalid-confidence',
      `${path}.uncertainty`,
      'Symbolic link confidence was inflated.',
    );
  if (!link.evidenceReferences.length && link.displayEligible)
    issue(
      errors,
      'missing-provenance',
      `${path}.evidenceReferences`,
      'Displayable link needs provenance.',
    );
  if (link.engineVersions.engine !== CROSS_SYSTEM_VERSIONS.engine)
    issue(errors, 'invalid-version', `${path}.engineVersions`, 'Unknown link engine version.');
}

export function validateCrossSystemResult(result: CrossSystemResult): CrossSystemValidationReport {
  const errors: CrossSystemValidationError[] = [];
  const collections = [
    ['source', result.sources.map((item) => item.id)],
    ['signal', result.signals.map((item) => item.id)],
    ['theme', result.themes.map((item) => item.id)],
    ['link', result.links.map((item) => item.id)],
    ['conflict', result.conflicts.map((item) => item.id)],
  ] as const;
  collections.forEach(([kind, ids]) =>
    duplicates(ids).forEach((id) =>
      issue(errors, 'duplicate-id', `${kind}s`, `Duplicate ${kind} id ${id}.`),
    ),
  );
  if (result.metadata.versions.engine !== CROSS_SYSTEM_VERSIONS.engine)
    issue(errors, 'invalid-version', 'metadata.versions.engine', 'Unknown reasoning version.');
  if (!result.metadata.inputFingerprint || !result.metadata.generatedAt)
    issue(errors, 'invalid-enum', 'metadata', 'Metadata fingerprint and timestamp are required.');

  const sourceIds = new Set(result.sources.map((item) => item.id));
  const signalIds = new Set(result.signals.map((item) => item.id));
  result.signals.forEach((signal, index) => {
    if (!sourceIds.has(signal.sourceId))
      issue(
        errors,
        'broken-reference',
        `signals[${index}].sourceId`,
        `Unknown source ${signal.sourceId}.`,
      );
    if (!signal.provenance)
      issue(
        errors,
        'missing-provenance',
        `signals[${index}].provenance`,
        'Signal provenance is required.',
      );
    if (!signal.themeIds.length)
      issue(
        errors,
        'invalid-enum',
        `signals[${index}].themeIds`,
        'Signal requires a semantic theme.',
      );
  });
  result.themes.forEach((theme, index) =>
    theme.signalIds.forEach((id) => {
      if (!signalIds.has(id))
        issue(errors, 'broken-reference', `themes[${index}].signalIds`, `Unknown signal ${id}.`);
    }),
  );
  result.links.forEach((link, index) => validateLink(link, index, sourceIds, errors));

  const linkIds = new Set(result.links.map((item) => item.id));
  [
    result.priority.leadingLinkId,
    result.priority.mainContrastId,
    result.priority.journeyContinuityId,
    ...result.priority.supportingLinkIds,
    ...result.priority.rejectedLinkIds,
  ]
    .filter((id): id is string => id !== null)
    .forEach((id) => {
      if (!linkIds.has(id))
        issue(errors, 'broken-reference', 'priority', `Unknown priority link ${id}.`);
    });
  const leading = result.links.find((link) => link.id === result.priority.leadingLinkId);
  if (
    leading &&
    leading.sourceIds.every(
      (id) => result.sources.find((source) => source.id === id)?.kind === 'zodiac',
    )
  )
    issue(
      errors,
      'zodiac-led-conclusion',
      'priority.leadingLinkId',
      'Zodiac cannot lead reasoning.',
    );
  if (result.rejectedLinks.some((link) => link.displayEligible))
    issue(
      errors,
      'rejected-link-displayed',
      'rejectedLinks',
      'Rejected output contains displayable link.',
    );
  if (
    result.links.some(
      (link) =>
        link.displayEligible &&
        link.sourceIds.length === 1 &&
        result.sources.find((source) => source.id === link.sourceIds[0])?.tier === 4,
    )
  )
    issue(errors, 'unsupported-confirmation', 'links', 'A symbolic source cannot confirm itself.');
  if (
    result.conflicts.some((conflict) => conflict.kind === 'incompatible-sources') &&
    result.links.some((link) => link.displayEligible && link.themeId === 'incompatible-lineage')
  )
    issue(errors, 'incompatible-lineage', 'links', 'Incompatible lineages were mixed.');

  try {
    const serialized = stableCrossSystemStringify(result);
    const restored = JSON.parse(serialized) as unknown;
    if (stableCrossSystemStringify(restored) !== serialized)
      issue(errors, 'non-serializable', '$', 'Serialization round-trip was not stable.');
  } catch (error) {
    issue(
      errors,
      'non-serializable',
      '$',
      error instanceof Error ? error.message : 'Result is not serializable.',
    );
  }
  return { errors, valid: errors.length === 0 };
}
