export type QuestionType = 'single' | 'multiple';

export type QuestionOption = {
  id: string;
  label: string;
};

export type QuestionnaireQuestion = {
  allowSkip: boolean;
  description?: string;
  id: string;
  options: readonly QuestionOption[];
  required: boolean;
  title: string;
  type: QuestionType;
};

export type QuestionResponse = {
  optionIds: string[];
  skipped: boolean;
};

export type QuestionnaireResponses = Record<string, QuestionResponse>;

export type QuestionnaireState = {
  currentIndex: number;
  responses: QuestionnaireResponses;
};

export type QuestionnaireAction =
  | {
      optionId: string;
      question: QuestionnaireQuestion;
      type: 'select-option';
    }
  | {
      questionId: string;
      type: 'skip-question';
    }
  | {
      type: 'next-question';
    }
  | {
      type: 'previous-question';
    };
