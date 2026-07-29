import type {
  QuestionnaireAction,
  QuestionnaireQuestion,
  QuestionnaireResponses,
  QuestionnaireState,
} from '../types';

export function createQuestionnaireState(
  responses: QuestionnaireResponses = {},
): QuestionnaireState {
  return {
    currentIndex: 0,
    responses,
  };
}

export function updateSelectedOption(
  responses: QuestionnaireResponses,
  question: QuestionnaireQuestion,
  optionId: string,
): QuestionnaireResponses {
  const currentOptionIds = responses[question.id]?.optionIds ?? [];
  const optionIds =
    question.type === 'single'
      ? [optionId]
      : currentOptionIds.includes(optionId)
        ? currentOptionIds.filter((currentOptionId) => currentOptionId !== optionId)
        : [...currentOptionIds, optionId];

  return {
    ...responses,
    [question.id]: {
      optionIds,
      skipped: false,
    },
  };
}

export function markQuestionSkipped(
  responses: QuestionnaireResponses,
  questionId: string,
): QuestionnaireResponses {
  return {
    ...responses,
    [questionId]: {
      optionIds: [],
      skipped: true,
    },
  };
}

export function canContinueQuestion(
  question: QuestionnaireQuestion,
  responses: QuestionnaireResponses,
) {
  return (responses[question.id]?.optionIds.length ?? 0) > 0;
}

export function questionnaireReducer(
  state: QuestionnaireState,
  action: QuestionnaireAction,
): QuestionnaireState {
  switch (action.type) {
    case 'select-option':
      return {
        ...state,
        responses: updateSelectedOption(state.responses, action.question, action.optionId),
      };
    case 'skip-question':
      return {
        ...state,
        responses: markQuestionSkipped(state.responses, action.questionId),
      };
    case 'next-question':
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
      };
    case 'previous-question':
      return {
        ...state,
        currentIndex: Math.max(0, state.currentIndex - 1),
      };
  }
}

export function validateQuestionnaire(questions: readonly QuestionnaireQuestion[]) {
  const questionIds = new Set<string>();

  for (const question of questions) {
    if (questionIds.has(question.id)) {
      return false;
    }

    if (question.required && question.allowSkip) {
      return false;
    }

    if (question.options.length < 2) {
      return false;
    }

    const optionIds = new Set(question.options.map((option) => option.id));
    if (optionIds.size !== question.options.length) {
      return false;
    }

    questionIds.add(question.id);
  }

  return questions.length > 0;
}
