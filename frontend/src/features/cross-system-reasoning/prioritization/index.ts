import { CROSS_SYSTEM_SOURCE_PRIORITY } from '../constants';
import type {
  CrossSystemContrast,
  CrossSystemLink,
  CrossSystemPriority,
  CrossSystemSource,
} from '../types';

function effectivePriority(link: CrossSystemLink, sources: readonly CrossSystemSource[]) {
  const sourceWeight = Math.max(
    ...link.sourceIds.map((id) => {
      const source = sources.find((item) => item.id === id);
      return source ? CROSS_SYSTEM_SOURCE_PRIORITY[source.kind] : 0;
    }),
    0,
  );
  return link.priority * 2 + sourceWeight;
}

function isZodiacOnly(link: CrossSystemLink, sources: readonly CrossSystemSource[]) {
  return link.sourceIds.every(
    (id) => sources.find((source) => source.id === id)?.kind === 'zodiac',
  );
}

function involvesZodiac(link: CrossSystemLink, sources: readonly CrossSystemSource[]) {
  return link.sourceIds.some((id) => sources.find((source) => source.id === id)?.kind === 'zodiac');
}

export function prioritizeCrossSystemLinks(input: {
  contrasts: readonly CrossSystemContrast[];
  links: readonly CrossSystemLink[];
  sources: readonly CrossSystemSource[];
}): CrossSystemPriority {
  const eligible = input.links
    .filter((link) => link.displayEligible && !isZodiacOnly(link, input.sources))
    .sort(
      (left, right) =>
        effectivePriority(right, input.sources) - effectivePriority(left, input.sources) ||
        left.id.localeCompare(right.id),
    );
  const nonContrast = eligible.filter(
    (link) =>
      !['modality-contrast', 'symbolic-tension', 'thematic-contrast'].includes(link.semanticType) &&
      !involvesZodiac(link, input.sources),
  );
  const leading = nonContrast[0] ?? null;
  const usedThemes = new Set(leading ? [leading.themeId] : []);
  const supporting: string[] = [];
  nonContrast.slice(1).forEach((link) => {
    if (supporting.length >= 3 || usedThemes.has(link.themeId)) return;
    supporting.push(link.id);
    usedThemes.add(link.themeId);
  });
  const mainContrast = input.contrasts
    .filter((contrast) => contrast.displayEligible)
    .sort((left, right) => right.priority - left.priority || left.id.localeCompare(right.id))[0];
  const journey = eligible.find((link) => link.semanticType === 'journey-continuity');
  return {
    journeyContinuityId: journey?.id ?? null,
    leadingLinkId: leading?.id ?? null,
    mainContrastId: mainContrast?.id ?? null,
    rejectedLinkIds: input.links
      .filter((link) => !link.displayEligible)
      .map((link) => link.id)
      .sort(),
    supportingLinkIds: supporting,
  };
}
