import { deserializeInterpretationResult, serializeInterpretationResult } from '../model';
import { LocalExpertInterpretationProvider } from '../providers';
import type { InterpretationProvider, InterpretationResult } from '../types';
import { stableStringify } from '../utils';
import { interpretationFixtures } from './fixtures';

export type RuntimeSuiteReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  valid: boolean;
};

export function runExpertInterpretationFixtureSuite(): RuntimeSuiteReport {
  const errors: string[] = [];
  let assertionCount = 0;
  const assert = (condition: boolean, message: string) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };
  const provider: InterpretationProvider = new LocalExpertInterpretationProvider();
  const interchangeableProvider: InterpretationProvider = new LocalExpertInterpretationProvider();
  const results = new Map<string, InterpretationResult>();

  interpretationFixtures.forEach((fixture) => {
    const first = provider.interpret(fixture.request);
    const second = provider.interpret(fixture.request);
    results.set(fixture.id, first.result);
    assert(first.validation.valid, `${fixture.id}: validator rejected result.`);
    assert(
      stableStringify(first.result) === stableStringify(second.result),
      `${fixture.id}: identical input was not deterministic.`,
    );
    assert(
      stableStringify(first.result) ===
        stableStringify(interchangeableProvider.interpret(fixture.request).result),
      `${fixture.id}: provider interchange changed the domain contract.`,
    );
    assert(
      first.result.sections.length >= fixture.expected.minimumSections,
      `${fixture.id}: too few sections.`,
    );
    assert(
      first.result.sections.length <= 7,
      `${fixture.id}: more than seven themes were composed.`,
    );
    fixture.expected.sources.forEach((source) =>
      assert(
        first.result.evidence.some((item) => item.source === source),
        `${fixture.id}: expected source ${source} is missing.`,
      ),
    );
    fixture.expected.connectionKinds?.forEach((kind) =>
      assert(
        first.result.connections.some((item) => item.kind === kind),
        `${fixture.id}: expected connection ${kind} is missing.`,
      ),
    );
    assert(
      first.result.metadata.sourceAvailability.numerology === fixture.expected.hasNumerology,
      `${fixture.id}: numerology availability is incorrect.`,
    );
    fixture.expected.masterNumbers?.forEach((value) =>
      assert(
        first.result.connections.some(
          (item) => item.semanticId === `numerology.master-number.${value}`,
        ),
        `${fixture.id}: master number ${value} was not preserved.`,
      ),
    );
    const serialized = serializeInterpretationResult(first.result);
    const restored = deserializeInterpretationResult(serialized);
    assert(
      stableStringify(restored) === stableStringify(first.result),
      `${fixture.id}: JSON round-trip changed the result.`,
    );
    assert(
      new Set(first.result.themes.map((theme) => theme.semanticId)).size ===
        first.result.themes.length,
      `${fixture.id}: duplicate themes were generated.`,
    );
    assert(
      first.result.sections.every(
        (section) =>
          section.titleKey &&
          section.summary.key &&
          section.details.length &&
          section.evidence.length,
      ),
      `${fixture.id}: a required section field is empty.`,
    );
    assert(
      first.result.sections.every(
        (section) =>
          section.confidence.level !== 'high' ||
          !section.sources.some((source) =>
            ['numerology', 'tarot-card', 'zodiac'].includes(source),
          ),
      ),
      `${fixture.id}: symbolic confidence was overstated.`,
    );
    assert(
      first.result.metadata.versions.engine === 'expert-interpretation-v1' &&
        first.result.metadata.versions.tarot === 'tarot-rules-v1' &&
        first.result.metadata.versions.numerologyCalculation === 'pythagorean-date-v1',
      `${fixture.id}: engine versions are incomplete.`,
    );
    assert(
      first.result.sections
        .flatMap((section) => section.relatedCards)
        .every((cardId) => first.result.metadata.cardIds.includes(cardId)),
      `${fixture.id}: related cards were not preserved.`,
    );
  });

  const week = results.get('week-spread');
  const month = results.get('month-spread');
  assert(
    Boolean(week && month && stableStringify(week.themes) !== stableStringify(month.themes)),
    'Different spreads generated the same themes.',
  );
  const workFixture = interpretationFixtures.find((fixture) => fixture.id === 'work-study-spread');
  if (workFixture) {
    const moneyContext = {
      ...workFixture.request,
      tarot: { ...workFixture.request.tarot, topic: 'money' as const },
    };
    assert(
      stableStringify(provider.interpret(workFixture.request).result.themes) !==
        stableStringify(provider.interpret(moneyContext).result.themes),
      'Changing the topic did not change interpretation focus.',
    );
    const otherDeck = {
      ...workFixture.request,
      tarot: { ...workFixture.request.tarot, deckTheme: 'midnight-geometry' },
    };
    assert(
      stableStringify(provider.interpret(workFixture.request).result) ===
        stableStringify(provider.interpret(otherDeck).result),
      'Deck theme changed interpretation semantics.',
    );
  }
  const minimal = results.get('minimal-skipped-optional');
  assert(
    Boolean(
      minimal &&
      !minimal.metadata.sourceAvailability.numerology &&
      !minimal.metadata.sourceAvailability.zodiac &&
      !minimal.metadata.sourceAvailability.psychologicalContext &&
      !minimal.evidence.some((item) =>
        ['numerology', 'psychological-context', 'zodiac'].includes(item.source),
      ),
    ),
    'Skipped sources were invented.',
  );
  const reversed = results.get('reversed-heavy');
  assert(
    Boolean(reversed?.connections.some((item) => item.kind === 'blockage')),
    'Reversed orientation did not affect connection semantics.',
  );
  const validationBase = results.get('card-day-with-date');
  if (validationBase) {
    const overstated = {
      ...validationBase,
      sections: validationBase.sections.map((section, index) =>
        index === 0
          ? {
              ...section,
              confidence: { level: 'high' as const, uncertainty: 'direct-input' as const },
            }
          : section,
      ),
    };
    assert(
      provider
        .validateResult(overstated)
        .errors.some((error) => error.code === 'invalid-confidence'),
      'Validator accepted overstated symbolic confidence.',
    );
    const missingTitle = {
      ...validationBase,
      sections: validationBase.sections.map((section, index) =>
        index === 0 ? { ...section, titleKey: '' } : section,
      ),
    };
    assert(
      provider.validateResult(missingTitle).errors.some((error) => error.code === 'empty-field'),
      'Validator accepted an empty required field.',
    );
    const nonFinite = {
      ...validationBase,
      metadata: { ...validationBase.metadata, numberValues: [Infinity] },
    };
    assert(
      provider.validateResult(nonFinite).errors.some((error) => error.code === 'non-finite-number'),
      'Validator accepted a non-finite number.',
    );
    const wrongVersion = {
      ...validationBase,
      metadata: {
        ...validationBase.metadata,
        versions: { ...validationBase.metadata.versions, wording: 'wording-v0' as 'wording-v1' },
      },
    };
    assert(
      provider
        .validateResult(wrongVersion)
        .errors.some((error) => error.code === 'invalid-version'),
      'Validator accepted an unknown engine version.',
    );
  }

  return {
    assertionCount,
    errors,
    fixtureCount: interpretationFixtures.length,
    valid: errors.length === 0,
  };
}
