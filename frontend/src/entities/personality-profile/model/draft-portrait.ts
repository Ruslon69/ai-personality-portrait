export type DraftQuestionResponse = {
  optionIds: string[];
  skipped: boolean;
};

export type DraftQuestionnaireResponses = Record<string, DraftQuestionResponse>;

export type DraftVoiceSelection =
  | { status: 'pending' }
  | { status: 'skipped' }
  | {
      averageSignalLevel: number | null;
      durationMs: number;
      mimeType: string;
      status: 'included';
    };

export type DraftBirthDateSelection =
  { status: 'pending' } | { status: 'skipped' } | { status: 'included'; value: string };

export type DraftInterpretationLayers = {
  astrology: boolean;
  numerology: boolean;
  zodiac: boolean;
};

export type DraftPortrait = {
  answers: DraftQuestionnaireResponses;
  birthDate: DraftBirthDateSelection;
  interests: readonly string[];
  interpretationLayers: DraftInterpretationLayers;
  voice: DraftVoiceSelection;
};

export function createEmptyDraftPortrait(): DraftPortrait {
  return {
    answers: {},
    birthDate: { status: 'pending' },
    interests: [],
    interpretationLayers: {
      astrology: false,
      numerology: false,
      zodiac: false,
    },
    voice: { status: 'pending' },
  };
}
