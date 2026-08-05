import { LocalNarrativeComposer } from '../providers';
import { narrativeMemoryContextFromSnapshot } from '../adapters';
import { deserializeNarrativeComposition, serializeNarrativeComposition } from '../serialization';
import { NARRATIVE_CHAPTER_ORDER, NARRATIVE_EMOTIONAL_CURVE } from '../constants';
import type { NarrativeComposition } from '../types';
import { stableNarrativeStringify } from '../utils';
import { validateNarrativeComposition } from '../validation';
import { narrativeCompositionFixtures } from './fixtures';

export type NarrativeRuntimeSuiteReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  valid: boolean;
};

export function runNarrativeCompositionFixtureSuite(): NarrativeRuntimeSuiteReport {
  const errors: string[] = [];
  let assertionCount = 0;
  const assert = (condition: boolean, message: string) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };
  const composer = new LocalNarrativeComposer();
  const interchangeable = new LocalNarrativeComposer();
  const results = new Map<string, NarrativeComposition>();
  narrativeCompositionFixtures.forEach((fixture) => {
    const first = composer.compose(fixture.request);
    const second = composer.compose(fixture.request);
    results.set(fixture.id, first);
    assert(composer.validate(first).valid, `${fixture.id}: narrative validation failed.`);
    assert(
      stableNarrativeStringify(first) === stableNarrativeStringify(second),
      `${fixture.id}: composition is not deterministic.`,
    );
    assert(
      stableNarrativeStringify(first) ===
        stableNarrativeStringify(interchangeable.compose(fixture.request)),
      `${fixture.id}: composer interchange changed the contract.`,
    );
    assert(first.chapters.length === 7, `${fixture.id}: story is incomplete.`);
    assert(
      first.chapters.every((chapter, index) => chapter.kind === NARRATIVE_CHAPTER_ORDER[index]),
      `${fixture.id}: chapter flow is invalid.`,
    );
    assert(
      stableNarrativeStringify(first.emotionalCurve) ===
        stableNarrativeStringify(NARRATIVE_EMOTIONAL_CURVE),
      `${fixture.id}: emotional curve changed.`,
    );
    assert(first.transitions.length === 6, `${fixture.id}: transitions are incomplete.`);
    assert(
      first.chapters.every((chapter) => chapter.blockIds.length > 0),
      `${fixture.id}: an empty chapter was generated.`,
    );
    assert(
      new Set(first.chapters.flatMap((chapter) => chapter.blockIds)).size ===
        first.chapters.flatMap((chapter) => chapter.blockIds).length,
      `${fixture.id}: a semantic block was repeated.`,
    );
    assert(
      first.chapters.find((chapter) => chapter.kind === 'practical-direction')?.blockIds.length ===
        1,
      `${fixture.id}: practical pacing contains multiple actions.`,
    );
    assert(
      first.chapters.find((chapter) => chapter.kind === 'reflection')?.blockIds.length === 1,
      `${fixture.id}: reflection pacing contains multiple questions.`,
    );
    assert(Boolean(first.conflict), `${fixture.id}: semantic contrast was not composed.`);
    assert(
      first.transitions[2]?.kind === 'contrast',
      `${fixture.id}: conflict transition was not expressed.`,
    );
    assert(
      first.voice.id === 'authorial-voice-v1' && first.voice.cadence === 'measured',
      `${fixture.id}: authorial voice changed.`,
    );
    const serialized = serializeNarrativeComposition(first);
    assert(
      serialized === serializeNarrativeComposition(deserializeNarrativeComposition(serialized)),
      `${fixture.id}: serialization round-trip is unstable.`,
    );
  });

  const modes = [...results.values()];
  assert(
    new Set(modes.map((result) => result.metadata.graphFingerprint)).size === 2,
    'Story modes do not share one semantic graph, or Journey memory did not extend it.',
  );
  const short = results.get('narrative-short');
  const deep = results.get('narrative-deep');
  assert(
    Boolean(
      short &&
      deep &&
      deep.chapters.flatMap((chapter) => chapter.blockIds).length >
        short.chapters.flatMap((chapter) => chapter.blockIds).length,
    ),
    'Deep mode does not provide deeper pacing than Short mode.',
  );
  assert(
    Boolean(short?.eliminatedBlockIds.includes('block:duplicate-inner-guidance')),
    'Cross-module semantic repetition was not eliminated.',
  );
  const memory = narrativeMemoryContextFromSnapshot({
    recurringThemes: [
      { currentTrend: 'emerging', themeId: 'theme.emerging' },
      { currentTrend: 'recurring', themeId: 'theme.recurring' },
      { currentTrend: 'resolved', themeId: 'theme.resolved' },
    ],
    transitions: [{ id: 'transition.previous.current' }],
  });
  assert(
    memory.emergingThemeIds[0] === 'theme.emerging' &&
      memory.recurringThemeIds[0] === 'theme.recurring' &&
      memory.resolvedThemeIds[0] === 'theme.resolved' &&
      memory.transitionIds[0] === 'transition.previous.current',
    'Journey Memory adapter lost trend semantics.',
  );

  if (short) {
    const emptyChapter = {
      ...short,
      chapters: short.chapters.map((chapter, index) =>
        index === 0 ? { ...chapter, blockIds: [] } : chapter,
      ),
    };
    assert(
      validateNarrativeComposition(emptyChapter).errors.some(
        (item) => item.code === 'empty-chapter',
      ),
      'Validator accepted an empty chapter.',
    );
    const abrupt = { ...short, transitions: short.transitions.slice(1) };
    assert(
      validateNarrativeComposition(abrupt).errors.some((item) => item.code === 'abrupt-transition'),
      'Validator accepted an abrupt transition.',
    );
    const repeated = {
      ...short,
      chapters: short.chapters.map((chapter, index) =>
        index === 1 ? { ...chapter, blockIds: [short.chapters[0].blockIds[0]] } : chapter,
      ),
    };
    assert(
      validateNarrativeComposition(repeated).errors.some(
        (item) => item.code === 'semantic-repetition',
      ),
      'Validator accepted a repeated narrative block.',
    );
  }

  return {
    assertionCount,
    errors,
    fixtureCount: narrativeCompositionFixtures.length,
    valid: errors.length === 0,
  };
}
