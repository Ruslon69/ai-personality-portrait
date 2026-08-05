import { interpretationFixtures } from '@features/expert-interpretation/fixtures';
import { localExpertInterpretationProvider } from '@features/expert-interpretation';

import { adaptExpertInterpretationToTarotPresentation } from './expert-interpretation-adapter';

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
  return {
    assertionCount,
    errors,
    fixtureCount: interpretationFixtures.length,
    valid: errors.length === 0,
  };
}
