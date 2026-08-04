import {
  createEmptyDraftPortrait,
  type DraftPortrait,
  type DraftQuestionnaireResponses,
  type DraftVoiceSelection,
  type PersonalityProfile,
} from '@entities/personality-profile';

import { createStore } from '../createStore';

export type DraftPortraitState = {
  currentProfile: PersonalityProfile | null;
  draft: DraftPortrait;
  profiles: readonly PersonalityProfile[];
};

const initialDraftPortraitState: DraftPortraitState = {
  currentProfile: null,
  draft: createEmptyDraftPortrait(),
  profiles: [],
};

export const draftPortraitStore = createStore(initialDraftPortraitState);

export const draftPortraitActions = {
  resetDraft() {
    draftPortraitStore.setState({ draft: createEmptyDraftPortrait() });
  },
  saveProfile(profile: PersonalityProfile) {
    draftPortraitStore.setState((state) => ({
      currentProfile: profile,
      profiles: [profile, ...state.profiles.filter((item) => item.id !== profile.id)],
    }));
  },
  selectProfile(profileId: string) {
    draftPortraitStore.setState((state) => ({
      currentProfile:
        state.profiles.find((profile) => profile.id === profileId) ?? state.currentProfile,
    }));
  },
  setBirthDate(value: string) {
    draftPortraitStore.setState((state) => ({
      draft: {
        ...state.draft,
        birthDate: value ? { status: 'included', value } : { status: 'pending' },
        interpretationLayers: {
          ...state.draft.interpretationLayers,
          astrology: Boolean(value),
          numerology: Boolean(value),
          zodiac: Boolean(value),
        },
      },
    }));
  },
  skipBirthDate() {
    draftPortraitStore.setState((state) => ({
      draft: {
        ...state.draft,
        birthDate: { status: 'skipped' },
        interpretationLayers: {
          ...state.draft.interpretationLayers,
          astrology: false,
          numerology: false,
          zodiac: false,
        },
      },
    }));
  },
  setQuestionnaireResponses(answers: DraftQuestionnaireResponses) {
    draftPortraitStore.setState((state) => ({
      draft: {
        ...state.draft,
        answers,
      },
    }));
  },
  setInterests(interests: readonly string[]) {
    draftPortraitStore.setState((state) => ({
      draft: {
        ...state.draft,
        interests: [...interests],
      },
    }));
  },
  setInterpretationLayer(layer: keyof DraftPortrait['interpretationLayers'], enabled: boolean) {
    draftPortraitStore.setState((state) => ({
      draft: {
        ...state.draft,
        interpretationLayers: {
          ...state.draft.interpretationLayers,
          [layer]: enabled,
        },
      },
    }));
  },
  setVoice(voice: DraftVoiceSelection) {
    draftPortraitStore.setState((state) => ({
      draft: {
        ...state.draft,
        voice,
      },
    }));
  },
};
