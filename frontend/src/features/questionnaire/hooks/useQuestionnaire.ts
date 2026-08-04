import { useCallback, useState } from 'react';

import type { QuestionnaireQuestion, QuestionnaireResponses } from '../types';
import { canContinueQuestion, markQuestionSkipped, updateSelectedOption } from '../utils';

type UseQuestionnaireOptions = {
  initialIndex?: number;
  onComplete: (responses: QuestionnaireResponses) => void;
  onResponsesChange: (responses: QuestionnaireResponses) => void;
  questions: readonly QuestionnaireQuestion[];
  responses: QuestionnaireResponses;
};

export function useQuestionnaire({
  onComplete,
  onResponsesChange,
  questions,
  responses,
  initialIndex = 0,
}: UseQuestionnaireOptions) {
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.min(Math.max(0, initialIndex), Math.max(0, questions.length - 1)),
  );
  const currentQuestion = questions[currentIndex];

  const selectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) {
        return;
      }

      onResponsesChange(updateSelectedOption(responses, currentQuestion, optionId));
    },
    [currentQuestion, onResponsesChange, responses],
  );

  const continueQuestionnaire = useCallback(() => {
    if (!currentQuestion || !canContinueQuestion(currentQuestion, responses)) {
      return;
    }

    if (currentIndex === questions.length - 1) {
      onComplete(responses);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }, [currentIndex, currentQuestion, onComplete, questions.length, responses]);

  const skipQuestion = useCallback(() => {
    if (!currentQuestion || currentQuestion.required || !currentQuestion.allowSkip) {
      return;
    }

    const nextResponses = markQuestionSkipped(responses, currentQuestion.id);
    onResponsesChange(nextResponses);

    if (currentIndex === questions.length - 1) {
      onComplete(nextResponses);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }, [currentIndex, currentQuestion, onComplete, onResponsesChange, questions.length, responses]);

  const previousQuestion = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }, []);

  return {
    canContinue: currentQuestion ? canContinueQuestion(currentQuestion, responses) : false,
    currentIndex,
    currentQuestion,
    currentResponse: currentQuestion ? responses[currentQuestion.id] : undefined,
    isFirstQuestion: currentIndex === 0,
    isLastQuestion: currentIndex === questions.length - 1,
    progressValue: currentIndex + 1,
    responses,
    continueQuestionnaire,
    previousQuestion,
    selectOption,
    skipQuestion,
  };
}
