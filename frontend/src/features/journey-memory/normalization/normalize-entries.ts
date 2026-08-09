import type { JourneyMemoryEntry, JourneyMemorySource, JourneyMemoryThemeInput } from '../types';
import { stableId, stableStringify, uniqueSorted } from '../utils';

const themeAliases: Readonly<Record<string, string>> = {
  'theme.context.relationship': 'theme.context.love',
  'theme.context.relationships': 'theme.context.love',
  'theme.context.work-study': 'theme.context.work',
  'theme.practical.choice': 'theme.practical.decision',
};

export function canonicalThemeId(semanticId: string) {
  const cardMatch = semanticId.match(/^theme\.card\.([^.]+(?:-[^.]+)*)\.position\./u);
  if (cardMatch?.[1]) return `theme.card.${cardMatch[1]}`;
  const contextMatch = semanticId.match(/^theme\.spread\.[^.]+\.([^.]+)$/u);
  if (contextMatch?.[1]) return `theme.context.${contextMatch[1]}`;
  const canonical = semanticId
    .replace(/^theme\.practical\./u, 'theme.practical.')
    .replace(/\.position\.[^.]+$/u, '');
  return themeAliases[canonical] ?? canonical;
}

function normalizeTheme(theme: JourneyMemoryThemeInput): JourneyMemoryThemeInput {
  return {
    cardIds: uniqueSorted(theme.cardIds),
    numberValues: uniqueSorted(theme.numberValues),
    role: theme.role,
    semanticId: canonicalThemeId(theme.semanticId),
    sourceIds: uniqueSorted(theme.sourceIds),
  };
}

export function normalizeJourneyMemoryEntry(source: JourneyMemorySource): JourneyMemoryEntry {
  if (!source.id.trim()) throw new Error('Journey memory source requires an ID.');
  if (Number.isNaN(Date.parse(source.createdAt)))
    throw new Error('Journey memory source requires an ISO timestamp.');
  const themes = [...source.themes]
    .map(normalizeTheme)
    .filter(
      (theme, index, items) =>
        items.findIndex((candidate) => candidate.semanticId === theme.semanticId) === index,
    );
  const leading = themes.find((theme) => theme.role === 'leading') ?? themes[0] ?? null;
  return {
    ...source,
    cards: [...source.cards].sort(
      (left, right) =>
        left.positionId.localeCompare(right.positionId) || left.id.localeCompare(right.id),
    ),
    id: stableId('journey-entry', source.id),
    interpretationFingerprint:
      source.interpretationFingerprint ??
      stableId('journey-interpretation', {
        cards: source.cards,
        engineVersions: source.engineVersions,
        practicalFocuses: source.practicalFocuses.map((focus) => focus.semanticId),
        themes,
      }),
    leadingTheme: leading?.semanticId ?? null,
    numbers: [...source.numbers].sort(
      (left, right) =>
        left.systemVersion.localeCompare(right.systemVersion) ||
        left.calculationId.localeCompare(right.calculationId),
    ),
    practicalFocuses: [...source.practicalFocuses]
      .map((focus) => ({ ...focus, sourceIds: uniqueSorted(focus.sourceIds) }))
      .sort((left, right) => left.semanticId.localeCompare(right.semanticId)),
    quoteSources: [...source.quoteSources].sort(
      (left, right) =>
        (left.strength === right.strength ? 0 : left.strength === 'primary' ? -1 : 1) ||
        left.id.localeCompare(right.id),
    ),
    reflections: [...source.reflections].sort((left, right) =>
      left.semanticId.localeCompare(right.semanticId),
    ),
    sourceReferences: [...source.sourceReferences].sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
    supportingThemes: themes
      .filter((theme) => theme.semanticId !== leading?.semanticId)
      .map((theme) => theme.semanticId),
    themes,
  };
}

export function normalizeJourneyMemoryEntries(
  sources: readonly JourneyMemorySource[],
): readonly JourneyMemoryEntry[] {
  const ordered = [...sources].sort(
    (left, right) =>
      left.createdAt.localeCompare(right.createdAt) ||
      left.id.localeCompare(right.id) ||
      stableStringify(left).localeCompare(stableStringify(right)),
  );
  const unique = new Map<string, JourneyMemorySource>();
  ordered.forEach((source) => {
    if (!unique.has(source.id)) unique.set(source.id, source);
  });
  return [...unique.values()].map(normalizeJourneyMemoryEntry);
}
