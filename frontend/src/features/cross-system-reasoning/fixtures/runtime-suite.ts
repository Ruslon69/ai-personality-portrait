import {
  createNarrativeCompositionRequest,
  LocalNarrativeComposer,
} from '@features/narrative-composition';
import { LocalCrossSystemReasoningProvider } from '../providers';
import { deserializeCrossSystemResult, serializeCrossSystemResult } from '../serialization';
import type { CrossSystemResult } from '../types';
import { stableCrossSystemStringify } from '../utils';
import { crossSystemFixtures } from './fixtures';

export type CrossSystemRuntimeSuiteReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  valid: boolean;
};

export function runCrossSystemReasoningFixtureSuite(): CrossSystemRuntimeSuiteReport {
  const errors: string[] = [];
  let assertionCount = 0;
  const assert = (condition: boolean, message: string) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };
  const provider = new LocalCrossSystemReasoningProvider();
  const interchangeable = new LocalCrossSystemReasoningProvider();
  const results = new Map<string, CrossSystemResult>();

  assert(crossSystemFixtures.length >= 40, 'Fewer than 40 cross-system fixtures are registered.');
  crossSystemFixtures.forEach((fixture) => {
    const first = provider.reason(fixture.input);
    const second = provider.reason(fixture.input);
    results.set(fixture.id, first);
    const validation = provider.validate(first);
    assert(
      validation.valid,
      `${fixture.id}: validator rejected result: ${validation.errors[0]?.code}.`,
    );
    assert(
      stableCrossSystemStringify(first) === stableCrossSystemStringify(second),
      `${fixture.id}: identical input changed result.`,
    );
    assert(
      stableCrossSystemStringify(first) ===
        stableCrossSystemStringify(interchangeable.reason(fixture.input)),
      `${fixture.id}: provider interchangeability failed.`,
    );
    assert(
      first.metadata.versions.engine === 'cross-system-reasoning-v1',
      `${fixture.id}: engine version missing.`,
    );
    assert(
      first.metadata.versions.resonance === 'resonance-rules-v1',
      `${fixture.id}: resonance version missing.`,
    );
    assert(
      first.metadata.versions.convergence === 'convergence-rules-v1',
      `${fixture.id}: convergence version missing.`,
    );
    assert(
      first.metadata.versions.contrast === 'contrast-rules-v1',
      `${fixture.id}: contrast version missing.`,
    );
    assert(
      first.metadata.versions.sourceHierarchy === 'source-hierarchy-v1',
      `${fixture.id}: hierarchy version missing.`,
    );
    assert(
      new Set(first.sources.map((item) => item.id)).size === first.sources.length,
      `${fixture.id}: duplicate sources.`,
    );
    assert(
      new Set(first.signals.map((item) => item.id)).size === first.signals.length,
      `${fixture.id}: duplicate signals.`,
    );
    assert(
      new Set(first.links.map((item) => item.id)).size === first.links.length,
      `${fixture.id}: duplicate links.`,
    );
    assert(
      first.signals.every((signal) => signal.provenance),
      `${fixture.id}: signal provenance missing.`,
    );
    assert(
      first.signals.every((signal) => {
        const tier = first.sources.find((source) => source.id === signal.sourceId)?.tier;
        if (signal.semanticType.startsWith('tarot.card.')) return tier === 1;
        if (signal.semanticType.startsWith('tarot.meaning.')) return tier === 4;
        if (signal.semanticType.startsWith('numerology.calculated.')) return tier === 1;
        if (signal.semanticType.startsWith('number.')) return tier === 4;
        if (signal.semanticType.startsWith('psychology.answer.')) return tier === 1;
        if (
          signal.semanticType.startsWith('decision.') ||
          signal.semanticType.startsWith('uncertainty.') ||
          signal.semanticType.startsWith('change.')
        )
          return tier === 3;
        return true;
      }),
      `${fixture.id}: source hierarchy was not preserved.`,
    );
    assert(
      first.links.every((link) => link.explanation.relationConcept),
      `${fixture.id}: explanation missing.`,
    );
    assert(
      first.links.every((link) => link.sourceIds.length > 0),
      `${fixture.id}: ungrounded link.`,
    );
    assert(
      first.rejectedLinks.every((link) => !link.displayEligible),
      `${fixture.id}: rejected link displayed.`,
    );
    assert(
      first.links.every(
        (link) => link.reliability !== 'symbolic' || link.uncertainty === 'symbolic-interpretation',
      ),
      `${fixture.id}: symbolic confidence inflated.`,
    );
    const leading = first.links.find((link) => link.id === first.priority.leadingLinkId);
    assert(
      !leading ||
        !leading.sourceIds.some(
          (id) => first.sources.find((source) => source.id === id)?.kind === 'zodiac',
        ),
      `${fixture.id}: Zodiac became a leading source.`,
    );
    assert(
      first.convergences.every(
        (link) =>
          !link.displayEligible ||
          (link.sourceIndependenceVerified && link.independentSourceCount >= 2),
      ),
      `${fixture.id}: dependent signals created convergence.`,
    );
    assert(
      new Set(
        [first.priority.leadingLinkId, ...first.priority.supportingLinkIds]
          .filter((id): id is string => id !== null)
          .map((id) => first.links.find((link) => link.id === id)?.themeId),
      ).size ===
        [first.priority.leadingLinkId, ...first.priority.supportingLinkIds].filter(
          (id): id is string => id !== null,
        ).length,
      `${fixture.id}: practical priorities repeat a theme.`,
    );
    if (validation.valid) {
      const serialized = serializeCrossSystemResult(first);
      const restored = deserializeCrossSystemResult(serialized);
      assert(restored.status === 'success', `${fixture.id}: deserialization failed.`);
      assert(
        restored.status === 'success' &&
          stableCrossSystemStringify(restored.result) === stableCrossSystemStringify(first),
        `${fixture.id}: JSON round-trip changed result.`,
      );
    } else {
      assert(false, `${fixture.id}: serialization skipped for invalid result.`);
      assert(false, `${fixture.id}: round-trip skipped for invalid result.`);
    }
    if (fixture.expected.minimumLinks !== undefined)
      assert(
        first.links.filter((link) => link.displayEligible).length >= fixture.expected.minimumLinks,
        `${fixture.id}: too few displayable links.`,
      );
    if (fixture.expected.contrast)
      assert(
        first.contrasts.some((item) => item.displayEligible),
        `${fixture.id}: contrast was flattened.`,
      );
    if (fixture.expected.rejectedReason)
      assert(
        first.rejectedLinks.some(
          (link) => link.exclusionReason === fixture.expected.rejectedReason,
        ),
        `${fixture.id}: expected rejection ${fixture.expected.rejectedReason} missing.`,
      );
    if (fixture.expected.journeyTrend)
      assert(
        first.signals.some(
          (signal) => signal.semanticType === `journey.${fixture.expected.journeyTrend}`,
        ),
        `${fixture.id}: Journey trend was not preserved.`,
      );
  });

  const topicLove = results.get('different-topic-love');
  const topicMoney = results.get('different-topic-money');
  assert(
    Boolean(
      topicLove &&
      topicMoney &&
      stableCrossSystemStringify(topicLove.priority) !==
        stableCrossSystemStringify(topicMoney.priority),
    ),
    'Different topic did not change cross-system priority.',
  );
  const periodOne = results.get('different-period-one');
  const periodFour = results.get('different-period-four');
  assert(
    Boolean(
      periodOne &&
      periodFour &&
      stableCrossSystemStringify(periodOne.resonances) !==
        stableCrossSystemStringify(periodFour.resonances),
    ),
    'Different personal period did not change resonance.',
  );
  const journey = results.get('journey-mode-integration');
  assert(Boolean(journey?.priority.journeyContinuityId), 'Journey continuity was not prioritized.');
  const dependent = results.get('duplicate-dependent-signals');
  assert(
    Boolean(
      dependent?.convergences.every(
        (item) => !item.displayEligible || item.sourceIndependenceVerified,
      ),
    ),
    'Dependent Tarot signals produced artificial convergence.',
  );
  const incompatible = results.get('incompatible-engine-versions');
  assert(
    Boolean(
      incompatible?.conflicts.some(
        (conflict) =>
          conflict.kind === 'incompatible-sources' && conflict.resolution === 'separate-lineage',
      ),
    ),
    'Incompatible versions were not separated.',
  );

  const narrativeFixture = crossSystemFixtures.find((fixture) => fixture.id === 'full-context');
  if (narrativeFixture) {
    const reasoning = provider.reason(narrativeFixture.input);
    const composer = new LocalNarrativeComposer();
    const narrative = composer.compose(
      createNarrativeCompositionRequest({
        composition: narrativeFixture.input.composition,
        connections: narrativeFixture.input.connections,
        context: narrativeFixture.input.context,
        evidence: narrativeFixture.input.evidence,
        fingerprint: reasoning.metadata.inputFingerprint,
        mode: 'journey',
        reasoning,
      }),
    );
    assert(composer.validate(narrative).valid, 'Reasoning narrative integration is invalid.');
    assert(
      narrative.blocks.some((block) => block.sourceKind === 'cross-system'),
      'Narrative omitted cross-system inputs.',
    );
    assert(
      narrative.chapters.some((chapter) => chapter.kind === 'main-turning-point'),
      'Reasoning did not reach Main Turning Point.',
    );
    assert(
      narrative.chapters.some((chapter) => chapter.kind === 'practical-direction'),
      'Reasoning did not reach Practical Direction.',
    );
  }

  const validationBase = results.get('full-context');
  if (validationBase && validationBase.links[0]) {
    const duplicate = {
      ...validationBase,
      links: [...validationBase.links, validationBase.links[0]],
    };
    assert(
      provider.validate(duplicate).errors.some((error) => error.code === 'duplicate-id'),
      'Validator accepted duplicate link IDs.',
    );
    const emptyExplanation = {
      ...validationBase,
      links: validationBase.links.map((link, index) =>
        index === 0 ? { ...link, explanation: { ...link.explanation, relationConcept: '' } } : link,
      ),
    };
    assert(
      provider
        .validate(emptyExplanation)
        .errors.some((error) => error.code === 'empty-explanation'),
      'Validator accepted an empty explanation.',
    );
    const wrongVersion = {
      ...validationBase,
      metadata: {
        ...validationBase.metadata,
        versions: {
          ...validationBase.metadata.versions,
          engine: 'cross-system-reasoning-v0' as 'cross-system-reasoning-v1',
        },
      },
    };
    assert(
      provider.validate(wrongVersion).errors.some((error) => error.code === 'invalid-version'),
      'Validator accepted an unknown engine version.',
    );
  }

  return {
    assertionCount,
    errors,
    fixtureCount: crossSystemFixtures.length,
    valid: errors.length === 0,
  };
}
