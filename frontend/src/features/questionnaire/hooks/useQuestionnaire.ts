import { useCallback, useEffect, useReducer } from 'react';

import type { QuestionnaireQuestion, QuestionnaireResponses } from '../types';
import {
  canContinueQuestion,
  createQuestionnaireState,
  markQuestionSkipped,
  questionnaireReducer,
} from '../utils';

type UseQuestionnaireOptions = {
  initialResponses?: QuestionnaireResponses;
  onComplete: (responses: QuestionnaireResponses) => void;
  onResponsesChange?: (responses: QuestionnaireResponses) => void;
  questions: readonly QuestionnaireQuestion[];
};

const emptyResponses: QuestionnaireResponses = {};

export function useQuestionnaire({
  initialResponses = emptyResponses,
  onComplete,
  onResponsesChange,
  questions,
}: UseQuestionnaireOptions) {
  const [state, dispatch] = useReducer(
    questionnaireReducer,
    initialResponses,
    createQuestionnaireState,
  );
  const currentQuestion = questions[state.currentIndex];

  useEffect(() => {
    onResponsesChange?.(state.responses);
  }, [onResponsesChange, state.responses]);

  const selectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) {
        return;
      }

      dispatch({
        optionId,
        question: currentQuestion,
        type: 'select-option',
      });
    },
    [currentQuestion],
  );

  const continueQuestionnaire = useCallback(() => {
    if (!currentQuestion || !canContinueQuestion(currentQuestion, state.responses)) {
      return;
    }

    if (state.currentIndex === questions.length - 1) {
      onComplete(state.responses);
      return;
    }

    dispatch({ type: 'next-question' });
  }, [currentQuestion, onComplete, questions.length, state.currentIndex, state.responses]);

  const skipQuestion = useCallback(() => {
    if (!currentQuestion || currentQuestion.required || !currentQuestion.allowSkip) {
      return;
    }

    const nextResponses = markQuestionSkipped(state.responses, currentQuestion.id);
    dispatch({ questionId: currentQuestion.id, type: 'skip-question' });

    if (state.currentIndex === questions.length - 1) {
      onComplete(nextResponses);
      return;
    }

    dispatch({ type: 'next-question' });
  }, [currentQuestion, onComplete, questions.length, state.currentIndex, state.responses]);

  const previousQuestion = useCallback(() => {
    dispatch({ type: 'previous-question' });
  }, []);

  return {
    canContinue: currentQuestion ? canContinueQuestion(currentQuestion, state.responses) : false,
    currentIndex: state.currentIndex,
    currentQuestion,
    currentResponse: currentQuestion ? state.responses[currentQuestion.id] : undefined,
    isFirstQuestion: state.currentIndex === 0,
    isLastQuestion: state.currentIndex === questions.length - 1,
    progressValue: state.currentIndex + 1,
    responses: state.responses,
    continueQuestionnaire,
    previousQuestion,
    selectOption,
    skipQuestion,
  };
}
