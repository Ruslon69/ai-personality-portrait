import type { QuestionnaireQuestion, QuestionnaireResponses } from '../types';

export function updateSelectedOption(
  responses: QuestionnaireResponses,
  question: QuestionnaireQuestion,
  optionId: string,
): QuestionnaireResponses {
  const currentOptionIds = responses[question.id]?.optionIds ?? [];
  const isSelected = currentOptionIds.includes(optionId);
  const optionIds =
    question.type === 'single'
      ? [optionId]
      : isSelected
        ? currentOptionIds.filter((currentOptionId) => currentOptionId !== optionId)
        : question.maxSelections && currentOptionIds.length >= question.maxSelections
          ? currentOptionIds
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
