import type {
  CrossSystemConflict,
  CrossSystemContrast,
  CrossSystemLink,
  CrossSystemSignal,
} from '../types';
import { crossSystemStableId, uniqueSorted } from '../utils';

export function resolveCrossSystemConflicts(input: {
  contrasts: readonly CrossSystemContrast[];
  links: readonly CrossSystemLink[];
  signals: readonly CrossSystemSignal[];
}): {
  conflicts: readonly CrossSystemConflict[];
  links: readonly CrossSystemLink[];
} {
  const retained = new Map<string, CrossSystemLink>();
  const resolvedLinks: CrossSystemLink[] = [];
  input.links
    .slice()
    .sort((left, right) => right.priority - left.priority || left.id.localeCompare(right.id))
    .forEach((link) => {
      const signature = `${link.semanticType}:${link.themeId}:${link.sourceIds.join('|')}`;
      const previous = retained.get(signature);
      if (!previous) {
        retained.set(signature, link);
        resolvedLinks.push(link);
        return;
      }
      resolvedLinks.push({
        ...link,
        displayEligible: false,
        exclusionReason: 'duplicate-link',
      });
    });

  const conflicts: CrossSystemConflict[] = input.contrasts.map((contrast) => ({
    evidenceReferences: contrast.evidenceReferences,
    id: crossSystemStableId('cross-conflict', { kind: 'healthy-contrast', linkId: contrast.id }),
    kind: 'healthy-contrast',
    linkIds: [contrast.id],
    resolution: 'preserve-contrast',
    semanticSummary: `cross-system.conflict.healthy.${contrast.themeId}`,
  }));
  resolvedLinks
    .filter((link) => !link.displayEligible)
    .forEach((link) => {
      const kind: CrossSystemConflict['kind'] =
        link.exclusionReason === 'incompatible-lineage'
          ? 'incompatible-sources'
          : link.exclusionReason === 'duplicate-link'
            ? 'duplicate-signal'
            : link.exclusionReason === 'artificial-connection'
              ? 'artificial-connection'
              : 'insufficient-context';
      conflicts.push({
        evidenceReferences: link.evidenceReferences,
        id: crossSystemStableId('cross-conflict', { kind, linkId: link.id }),
        kind,
        linkIds: [link.id],
        resolution: kind === 'incompatible-sources' ? 'separate-lineage' : 'exclude',
        semanticSummary: `cross-system.conflict.${kind}.${link.themeId}`,
      });
    });

  const incompatible = input.signals.filter(
    (signal) => signal.semanticType === 'journey.incompatible-number-lineage',
  );
  incompatible.forEach((signal) => {
    conflicts.push({
      evidenceReferences: signal.evidenceReferences,
      id: crossSystemStableId('cross-conflict', {
        kind: 'incompatible-sources',
        signalId: signal.id,
      }),
      kind: 'incompatible-sources',
      linkIds: [],
      resolution: 'separate-lineage',
      semanticSummary: 'cross-system.conflict.incompatible-number-lineage',
    });
  });
  return {
    conflicts: [...new Map(conflicts.map((conflict) => [conflict.id, conflict])).values()].sort(
      (left, right) => left.id.localeCompare(right.id),
    ),
    links: resolvedLinks.sort((left, right) => left.id.localeCompare(right.id)),
  };
}

export function conflictEvidenceIds(conflicts: readonly CrossSystemConflict[]): readonly string[] {
  return uniqueSorted(conflicts.flatMap((conflict) => conflict.evidenceReferences));
}
