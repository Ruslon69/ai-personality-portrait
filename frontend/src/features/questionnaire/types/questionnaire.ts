import type {
  DraftQuestionnaireResponses,
  DraftQuestionResponse,
} from '@entities/personality-profile';

export type QuestionType = 'single' | 'multiple';
export type QuestionPresentation = 'cards' | 'binary' | 'ranked' | 'branch' | 'multiple';

export type QuestionOption = {
  id: string;
  label: string;
};

export type QuestionnaireQuestion = {
  allowSkip: boolean;
  category: string;
  description?: string;
  id: string;
  maxSelections?: number;
  options: readonly QuestionOption[];
  presentation: QuestionPresentation;
  required: boolean;
  title: string;
  type: QuestionType;
};

export type QuestionResponse = DraftQuestionResponse;
export type QuestionnaireResponses = DraftQuestionnaireResponses;
