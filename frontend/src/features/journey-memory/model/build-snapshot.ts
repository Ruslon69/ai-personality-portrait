import { createJourneyChaptersV1 } from '../chaptering';
import { normalizeJourneyMemoryEntries } from '../normalization';
import {
  findJourneyCardPatterns,
  findJourneyNumberPatterns,
  findJourneyRecommendationPatterns,
  recurringJourneyThemes,
} from '../recurrence';
import { createJourneyMilestones } from '../summaries';
import { trackJourneyThemes } from '../theme-tracking';
import { createJourneyTransitions } from '../transitions';
import type { JourneyMemorySnapshot, JourneyMemorySource } from '../types';
import { stableHash, stableStringify } from '../utils';
import { validateJourneyMemorySnapshot } from '../validation';
import { createJourneyYearSummaries } from '../yearbook';
import { JOURNEY_MEMORY_VERSIONS } from './versions';

export function buildJourneyMemorySnapshot(input: {
  generatedAt: string;
  includeYearSummaries?: boolean;
  locale: JourneyMemorySnapshot['metadata']['locale'];
  sources: readonly JourneyMemorySource[];
}): JourneyMemorySnapshot {
  if (Number.isNaN(Date.parse(input.generatedAt)))
    throw new Error('Journey snapshot requires an externally supplied ISO timestamp.');
  const entries = normalizeJourneyMemoryEntries(input.sources);
  const trends = trackJourneyThemes(entries);
  const recurringThemes = recurringJourneyThemes(trends);
  const cardPatterns = findJourneyCardPatterns(entries);
  const numberPatterns = findJourneyNumberPatterns(entries);
  const recommendationPatterns = findJourneyRecommendationPatterns(entries);
  const transitions = createJourneyTransitions(entries);
  const milestones = createJourneyMilestones({
    cardPatterns,
    entries,
    numberPatterns,
    themes: trends,
  });
  const chapters = createJourneyChaptersV1({ entries, milestones, recurringThemes, transitions });
  const yearSummaries =
    input.includeYearSummaries === false
      ? []
      : createJourneyYearSummaries({
          cardPatterns,
          chapters,
          entries,
          numberPatterns,
          recommendationPatterns,
          themes: trends,
          transitions,
        });
  const provisional: JourneyMemorySnapshot = {
    cardPatterns,
    chapters,
    entries,
    metadata: {
      entryFingerprint: stableHash(stableStringify(entries)),
      generatedAt: input.generatedAt,
      locale: input.locale,
      versions: JOURNEY_MEMORY_VERSIONS,
    },
    milestones,
    numberPatterns,
    recommendationPatterns,
    recurringThemes,
    transitions,
    trends,
    validation: { errors: [], valid: true },
    yearSummaries,
  };
  const validation = validateJourneyMemorySnapshot(provisional);
  return { ...provisional, validation };
}
