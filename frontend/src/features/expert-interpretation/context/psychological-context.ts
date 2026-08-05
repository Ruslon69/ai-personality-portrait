import type {
  InterpretationPsychologicalAnswer,
  InterpretationPsychologicalContext,
} from '../types';
import { uniqueSorted } from '../utils';

const tendencyByAnswer: Readonly<Record<string, string>> = {
  'decision-style:facts': 'decision.evidence-led',
  'decision-style:talk': 'decision.dialogue-supported',
  'decision-style:test': 'decision.iterative',
  'decision-style:pause': 'decision.reflective',
  'uncertainty:map': 'uncertainty.maps-options',
  'uncertainty:move': 'uncertainty.learns-through-action',
  'uncertainty:wait': 'uncertainty.waits-for-signal',
  'uncertainty:context': 'uncertainty.checks-urgency',
  'change-response:anchor': 'change.keeps-anchor',
  'change-response:space': 'change.needs-space',
  'change-response:new-route': 'change.reframes-quickly',
  'change-response:support': 'change.uses-dialogue',
};

function optionFor(answers: readonly InterpretationPsychologicalAnswer[], questionId: string) {
  return answers.find((answer) => answer.questionId === questionId)?.optionId ?? null;
}

export function derivePsychologicalContext(
  answers: readonly InterpretationPsychologicalAnswer[],
): InterpretationPsychologicalContext {
  const stableAnswers = [...answers].sort((left, right) =>
    `${left.questionId}:${left.optionId}`.localeCompare(`${right.questionId}:${right.optionId}`),
  );
  return {
    answers: stableAnswers,
    currentConcern: optionFor(stableAnswers, 'current-focus'),
    currentEmotionalContext: optionFor(stableAnswers, 'period-state'),
    derivedContextualTendencies: uniqueSorted(
      stableAnswers.flatMap((answer) => {
        const tendency = tendencyByAnswer[`${answer.questionId}:${answer.optionId}`];
        return tendency ? [tendency] : [];
      }),
    ),
    desiredReadingFocus: optionFor(stableAnswers, 'reading-intent'),
  };
}
