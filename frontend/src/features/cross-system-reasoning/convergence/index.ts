import { CROSS_SYSTEM_DISPLAY_THRESHOLD } from '../constants';
import { createCrossSystemLink } from '../model/create-link';
import type { CrossSystemConvergence, CrossSystemSignal, CrossSystemSource } from '../types';
import { uniqueSorted } from '../utils';

function systemFamily(source: CrossSystemSource): string {
  if (source.kind.startsWith('tarot-')) return 'tarot';
  if (source.kind.startsWith('numerology-')) return 'numerology';
  return source.kind;
}

function score(signals: readonly CrossSystemSignal[], sourceFamilies: readonly string[]) {
  const reliabilityScore = signals.reduce(
    (total, signal) =>
      total +
      ({ contextual: 13, deterministic: 20, direct: 24, symbolic: 10 }[signal.reliability] ?? 0),
    0,
  );
  return Math.min(100, 24 + reliabilityScore + sourceFamilies.length * 7);
}

export function resolveCrossSystemConvergences(input: {
  signals: readonly CrossSystemSignal[];
  sources: readonly CrossSystemSource[];
}): readonly CrossSystemConvergence[] {
  const byTheme = new Map<string, CrossSystemSignal[]>();
  input.signals.forEach((signal) =>
    signal.themeIds.forEach((theme) => byTheme.set(theme, [...(byTheme.get(theme) ?? []), signal])),
  );
  return [...byTheme.entries()]
    .flatMap(([themeId, themeSignals]) => {
      const independent = [
        ...new Map(themeSignals.map((signal) => [signal.independentGroup, signal])).values(),
      ];
      const sourceFamilies = uniqueSorted(
        independent.map((signal) => {
          const source = input.sources.find((item) => item.id === signal.sourceId);
          return source ? systemFamily(source) : 'unknown';
        }),
      );
      if (independent.length < 2) return [];
      const meaningfulFamilies = sourceFamilies.filter((family) => family !== 'interest');
      const zodiacLed = meaningfulFamilies.length === 1 && meaningfulFamilies[0] === 'zodiac';
      const crossSystem = meaningfulFamilies.length >= 2;
      const missingProvenance = independent.some(
        (signal) => !signal.provenance || !signal.evidenceReferences.length,
      );
      const priority = score(independent, meaningfulFamilies);
      const displayEligible =
        crossSystem &&
        !zodiacLed &&
        !missingProvenance &&
        priority >= CROSS_SYSTEM_DISPLAY_THRESHOLD;
      const journey = meaningfulFamilies.includes('journey-memory');
      const symbolicOnly = independent.every((signal) => signal.reliability === 'symbolic');
      const base = createCrossSystemLink({
        direction: independent.some((signal) => signal.direction === 'intensifies')
          ? 'intensifies'
          : 'reinforces',
        displayEligible,
        exclusionReason: displayEligible
          ? null
          : zodiacLed
            ? 'zodiac-led-conclusion'
            : missingProvenance
              ? 'missing-provenance'
              : !crossSystem
                ? 'dependent-sources'
                : symbolicOnly
                  ? 'symbolic-only-weak'
                  : 'threshold-not-met',
        priority,
        semanticType: journey ? 'journey-continuity' : 'contextual-convergence',
        signals: independent,
        sources: input.sources,
        strength: priority >= 82 ? 'primary' : displayEligible ? 'secondary' : 'weak',
        themeId,
        uncertainty: symbolicOnly ? 'symbolic-interpretation' : 'contextual-inference',
      });
      return [
        {
          ...base,
          independentSourceCount: meaningfulFamilies.length,
          semanticOverlap: [themeId],
          semanticType: journey ? 'journey-continuity' : 'contextual-convergence',
          sourceIndependenceVerified: crossSystem,
        } satisfies CrossSystemConvergence,
      ];
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}
