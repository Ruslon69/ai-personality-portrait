import { useMemo, useState } from 'react';

import { useI18n } from '@shared/i18n';
import { draftPortraitActions, useDraftPortraitState } from '@store';

import { getPortraitQuestions } from '../data';
import type { QuestionnaireResponses } from '../types';
import { InterestStep } from './InterestStep';
import { Questionnaire } from './Questionnaire';

type DraftPortraitQuestionnaireProps = {
  onComplete: () => void;
};

export function DraftPortraitQuestionnaire({ onComplete }: DraftPortraitQuestionnaireProps) {
  const { draft } = useDraftPortraitState();
  const { locale } = useI18n();
  const questions = useMemo(() => getPortraitQuestions(locale), [locale]);
  const [stage, setStage] = useState<'questions' | 'interests'>('questions');
  const [returnToLastQuestion, setReturnToLastQuestion] = useState(false);

  const completeQuestionnaire = (responses: QuestionnaireResponses) => {
    draftPortraitActions.setQuestionnaireResponses(responses);
    setReturnToLastQuestion(true);
    setStage('interests');
  };

  if (stage === 'interests') {
    return (
      <InterestStep
        initialInterests={draft.interests}
        locale={locale}
        onBack={() => setStage('questions')}
        onComplete={(interests) => {
          draftPortraitActions.setInterests(interests);
          onComplete();
        }}
      />
    );
  }

  return (
    <Questionnaire
      initialIndex={returnToLastQuestion ? questions.length - 1 : 0}
      onComplete={completeQuestionnaire}
      onResponsesChange={draftPortraitActions.setQuestionnaireResponses}
      questions={questions}
      responses={draft.answers}
    />
  );
}
