import { CROSS_SYSTEM_VERSIONS } from '../constants';
import { resolveCrossSystemConflicts } from '../conflicts';
import { resolveCrossSystemContrasts } from '../contrast';
import { resolveCrossSystemConvergences } from '../convergence';
import { createCrossSystemLink } from '../model/create-link';
import { collectCrossSystemThemes, normalizeCrossSystemInput } from '../normalization';
import { prioritizeCrossSystemLinks } from '../prioritization';
import { resolveCrossSystemResonances } from '../resonance';
import type { CrossSystemInput, CrossSystemLink, CrossSystemResult } from '../types';
import { crossSystemStableId, stableCrossSystemStringify } from '../utils';

function incompatibleLineageLinks(input: {
  normalized: ReturnType<typeof normalizeCrossSystemInput>;
}): readonly CrossSystemLink[] {
  return input.normalized.signals
    .filter((signal) => signal.semanticType === 'journey.incompatible-number-lineage')
    .map((signal) =>
      createCrossSystemLink({
        direction: 'frames',
        displayEligible: false,
        exclusionReason: 'incompatible-lineage',
        priority: 0,
        semanticType: 'structural-echo',
        signals: [signal],
        sources: input.normalized.sources,
        strength: 'weak',
        themeId: 'incompatible-lineage',
        uncertainty: 'insufficient-context',
      }),
    );
}

export function composeCrossSystemResult(input: CrossSystemInput): CrossSystemResult {
  const normalized = normalizeCrossSystemInput(input);
  const resonances = resolveCrossSystemResonances({
    reasoningInput: input,
    signals: normalized.signals,
    sources: normalized.sources,
  });
  const convergences = resolveCrossSystemConvergences(normalized);
  const contrasts = resolveCrossSystemContrasts(normalized);
  const candidates = [
    ...resonances,
    ...convergences,
    ...contrasts,
    ...incompatibleLineageLinks({ normalized }),
  ];
  const conflictResolution = resolveCrossSystemConflicts({
    contrasts,
    links: candidates,
    signals: normalized.signals,
  });
  const priority = prioritizeCrossSystemLinks({
    contrasts,
    links: conflictResolution.links,
    sources: normalized.sources,
  });
  const inputFingerprint = crossSystemStableId('cross-input', {
    composition: input.composition,
    connections: input.connections,
    continuityContext: input.continuityContext ?? null,
    context: input.context,
    journeyMemory: input.journeyMemory,
    sourceEngineVersions: input.sourceEngineVersions,
  });
  const links = conflictResolution.links;
  const contrastById = new Map(contrasts.map((item) => [item.id, item]));
  const convergenceById = new Map(convergences.map((item) => [item.id, item]));
  const resonanceById = new Map(resonances.map((item) => [item.id, item]));
  const result: CrossSystemResult = {
    conflicts: conflictResolution.conflicts,
    contrasts: links.flatMap((link) => {
      const contrast = contrastById.get(link.id);
      return contrast ? [{ ...contrast, ...link, semanticType: contrast.semanticType }] : [];
    }),
    convergences: links.flatMap((link) => {
      const convergence = convergenceById.get(link.id);
      return convergence
        ? [{ ...convergence, ...link, semanticType: convergence.semanticType }]
        : [];
    }),
    links,
    metadata: {
      generatedAt: input.context.metadata.generatedAt,
      inputFingerprint,
      sourceEngineVersions: Object.fromEntries(
        Object.entries(input.sourceEngineVersions).sort(([left], [right]) =>
          left.localeCompare(right),
        ),
      ),
      versions: CROSS_SYSTEM_VERSIONS,
    },
    priority,
    rejectedLinks: links.filter((link) => !link.displayEligible),
    resonances: links.flatMap((link) => {
      const resonance = resonanceById.get(link.id);
      return resonance ? [{ ...resonance, ...link, semanticType: resonance.semanticType }] : [];
    }),
    signals: normalized.signals,
    sources: normalized.sources,
    themes: collectCrossSystemThemes(normalized.signals),
  };
  stableCrossSystemStringify(result);
  return result;
}
