import type { JourneyMemoryEntry } from '../types';
import { stableHash, stableStringify } from '../utils';

export function createJourneyMemoryEntryFingerprint(
  entries: readonly JourneyMemoryEntry[],
): string {
  return stableHash(
    stableStringify(
      entries.map((entry) => ({
        bookmarked: entry.bookmarked,
        cards: entry.cards.map((card) => ({
          id: card.id,
          orientation: card.orientation,
          positionId: card.positionId,
        })),
        engineVersions: entry.engineVersions,
        id: entry.id,
        interpretationFingerprint: entry.interpretationFingerprint,
        numbers: entry.numbers.map((number) => ({
          calculationId: number.calculationId,
          systemVersion: number.systemVersion,
          value: number.value,
        })),
        practicalFocuses: entry.practicalFocuses.map((focus) => ({
          category: focus.category,
          semanticId: focus.semanticId,
        })),
        themes: entry.themes.map((theme) => ({
          role: theme.role,
          semanticId: theme.semanticId,
        })),
      })),
    ),
  );
}
