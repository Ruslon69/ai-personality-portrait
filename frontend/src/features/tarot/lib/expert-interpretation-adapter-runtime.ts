import { interpretationFixtures } from '@features/expert-interpretation/fixtures';
import { localExpertInterpretationProvider } from '@features/expert-interpretation';

import { adaptExpertInterpretationToTarotPresentation } from './expert-interpretation-adapter';
import {
  countPresentationWords,
  createTarotResultCopyPresentation,
} from './tarot-result-presentation';

export type ExpertInterpretationAdapterRuntimeReport = {
  assertionCount: number;
  errors: readonly string[];
  fixtureCount: number;
  valid: boolean;
};

export function runExpertInterpretationAdapterRuntimeSuite(): ExpertInterpretationAdapterRuntimeReport {
  const errors: string[] = [];
  let assertionCount = 0;
  const assert = (condition: boolean, message: string) => {
    assertionCount += 1;
    if (!condition) errors.push(message);
  };
  interpretationFixtures.forEach((fixture) => {
    const result = localExpertInterpretationProvider.interpret(fixture.request).result;
    const selections = fixture.request.tarot.cards.map((card) => ({
      cardId: card.id,
      orientation: card.orientation,
      positionId: card.positionId,
    }));
    const presentation = adaptExpertInterpretationToTarotPresentation(result, selections);
    assert(Boolean(presentation.headline.trim()), `${fixture.id}: adapted headline is empty.`);
    assert(Boolean(presentation.summary.trim()), `${fixture.id}: adapted summary is empty.`);
    assert(
      Boolean(presentation.practicalFocus.trim()),
      `${fixture.id}: adapted practical focus is empty.`,
    );
    assert(
      presentation.interpretations.length === selections.length,
      `${fixture.id}: adapter changed the interpretation count.`,
    );
    assert(
      presentation.interpretations.every(
        (interpretation, index) =>
          interpretation.cardId === selections[index]?.cardId &&
          interpretation.positionId === selections[index]?.positionId &&
          interpretation.meaningInPosition.trim() &&
          interpretation.practicalTheme.trim() &&
          interpretation.reflectionQuestion.trim() &&
          interpretation.uncertainty.trim(),
      ),
      `${fixture.id}: adapter lost a required presentation field.`,
    );
  });
  const headlineCases = [
    {
      card: 'Отшельник',
      locale: 'ru' as const,
      long: 'Сейчас особенно важно освободить место для нового направления и не торопить следующий ответ',
      maximum: 9,
      minimum: 4,
      theme: 'спокойное движение',
    },
    {
      card: 'The Hermit',
      locale: 'en' as const,
      long: 'This moment asks you to make space for a new direction without rushing the next answer',
      maximum: 10,
      minimum: 4,
      theme: 'calm movement',
    },
    {
      card: 'Відлюдник',
      locale: 'uk' as const,
      long: 'Зараз особливо важливо звільнити місце для нового напряму й не квапити наступну відповідь',
      maximum: 9,
      minimum: 4,
      theme: 'спокійний рух',
    },
  ];
  headlineCases.forEach((headlineCase) => {
    const input = {
      authoredHeadlines: [headlineCase.long],
      leadingCardName: headlineCase.card,
      leadingTheme: headlineCase.theme,
      locale: headlineCase.locale,
      supportingCandidates: ['Context remains available below.'],
    };
    const first = createTarotResultCopyPresentation(input);
    const second = createTarotResultCopyPresentation(input);
    const wordCount = countPresentationWords(first.headline);
    assert(
      wordCount >= headlineCase.minimum && wordCount <= headlineCase.maximum,
      `${headlineCase.locale}: long authored headline did not meet the presentation constraint.`,
    );
    assert(
      first.supportingLine === headlineCase.long,
      `${headlineCase.locale}: the original authored meaning was not preserved in supporting copy.`,
    );
    assert(
      JSON.stringify(first) === JSON.stringify(second),
      `${headlineCase.locale}: headline presentation is not deterministic.`,
    );
    assert(
      !first.headline.includes('…') && !first.headline.includes('...'),
      `${headlineCase.locale}: headline presentation used truncation.`,
    );
  });
  const changedTheme = createTarotResultCopyPresentation({
    authoredHeadlines: [headlineCases[0]!.long],
    leadingCardName: 'Маг',
    leadingTheme: 'ясное действие',
    locale: 'ru',
    supportingCandidates: [],
  });
  const originalTheme = createTarotResultCopyPresentation({
    authoredHeadlines: [headlineCases[0]!.long],
    leadingCardName: headlineCases[0]!.card,
    leadingTheme: headlineCases[0]!.theme,
    locale: 'ru',
    supportingCandidates: [],
  });
  assert(
    changedTheme.headline !== originalTheme.headline,
    'Different semantic input did not change the constrained headline.',
  );
  return {
    assertionCount,
    errors,
    fixtureCount: interpretationFixtures.length,
    valid: errors.length === 0,
  };
}
