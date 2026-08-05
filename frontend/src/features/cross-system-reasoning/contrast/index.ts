import { CROSS_SYSTEM_CONTRAST_PAIRS } from '../constants';
import { createCrossSystemLink } from '../model/create-link';
import type { CrossSystemContrast, CrossSystemSignal, CrossSystemSource } from '../types';

function family(sourceId: string, sources: readonly CrossSystemSource[]) {
  const kind = sources.find((source) => source.id === sourceId)?.kind ?? 'unknown';
  if (kind.startsWith('tarot-')) return 'tarot';
  if (kind.startsWith('numerology-')) return 'numerology';
  return kind;
}

export function resolveCrossSystemContrasts(input: {
  signals: readonly CrossSystemSignal[];
  sources: readonly CrossSystemSource[];
}): readonly CrossSystemContrast[] {
  return CROSS_SYSTEM_CONTRAST_PAIRS.flatMap(([leftTheme, rightTheme]) => {
    const left = input.signals.find((signal) => signal.themeIds.includes(leftTheme));
    const right = input.signals.find(
      (signal) =>
        signal.themeIds.includes(rightTheme) &&
        signal.independentGroup !== left?.independentGroup &&
        family(signal.sourceId, input.sources) !== family(left?.sourceId ?? '', input.sources),
    );
    if (!left || !right) return [];
    const zodiac = [left, right].some(
      (signal) => input.sources.find((source) => source.id === signal.sourceId)?.kind === 'zodiac',
    );
    const symbolicOnly = [left, right].every((signal) => signal.reliability === 'symbolic');
    const base = createCrossSystemLink({
      direction: 'contrasts',
      displayEligible: true,
      integrationThemeId: 'balance',
      priority: zodiac ? 62 : 78,
      semanticType: zodiac ? 'modality-contrast' : 'thematic-contrast',
      signals: [left, right],
      sources: input.sources,
      strength: zodiac ? 'contextual' : 'secondary',
      themeId: `${leftTheme}:${rightTheme}`,
      uncertainty: zodiac || symbolicOnly ? 'symbolic-interpretation' : 'contextual-inference',
    });
    return [
      {
        ...base,
        contexts: [left.semanticType, right.semanticType],
        integrationThemeId: 'balance',
        poles: [leftTheme, rightTheme],
        semanticType: zodiac ? 'modality-contrast' : 'thematic-contrast',
      } satisfies CrossSystemContrast,
    ];
  }).sort((left, right) => left.id.localeCompare(right.id));
}
