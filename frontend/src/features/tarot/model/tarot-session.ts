import { createStore } from '@store';
import { LEGACY_STORAGE_KEYS } from '@features/product-storage/constants';

import type {
  TarotCardSelection,
  TarotDeckTheme,
  TarotPsychologyAnswer,
  TarotReading,
  TarotSelectionMode,
} from '../types';

const THEME_KEY = LEGACY_STORAGE_KEYS.tarotDeckTheme[0];
const SESSION_KEY = LEGACY_STORAGE_KEYS.tarotSessionSeed[0];
const STATE_KEY = LEGACY_STORAGE_KEYS.tarotState[0];

type TarotSessionState = {
  answers: readonly TarotPsychologyAnswer[];
  birthDate: string;
  deckTheme: TarotDeckTheme;
  reading: TarotReading | null;
  reshuffled: boolean;
  seed: string;
  selections: readonly TarotCardSelection[];
  selectionMode: TarotSelectionMode;
  spreadId: string;
};

function readTheme(): TarotDeckTheme {
  if (typeof window === 'undefined') return 'cosmic-minimal';
  const saved = window.localStorage.getItem(THEME_KEY);
  return saved === 'deep-water' || saved === 'midnight-geometry' || saved === 'solar-lines'
    ? saved
    : 'cosmic-minimal';
}

function createSeed() {
  return window.crypto?.randomUUID?.() ?? `session-${Date.now().toString(36)}`;
}

function readSeed() {
  if (typeof window === 'undefined') return 'tarot-session';
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = createSeed();
  window.sessionStorage.setItem(SESSION_KEY, created);
  return created;
}

const defaultState: TarotSessionState = {
  answers: [],
  birthDate: '',
  deckTheme: readTheme(),
  reading: null,
  reshuffled: false,
  seed: readSeed(),
  selections: [],
  selectionMode: 'automatic',
  spreadId: 'day',
};

function readState(): TarotSessionState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const saved = JSON.parse(
      window.sessionStorage.getItem(STATE_KEY) ?? '',
    ) as Partial<TarotSessionState>;
    return { ...defaultState, ...saved, deckTheme: readTheme(), seed: saved.seed ?? readSeed() };
  } catch {
    return defaultState;
  }
}

const initialState = readState();

export const tarotSessionStore = createStore(initialState);

if (typeof window !== 'undefined') {
  tarotSessionStore.subscribe(() => {
    window.sessionStorage.setItem(STATE_KEY, JSON.stringify(tarotSessionStore.getState()));
  });
}

export const tarotSessionActions = {
  chooseSpread(spreadId: string) {
    tarotSessionStore.setState({ reading: null, reshuffled: false, selections: [], spreadId });
  },
  reset() {
    const seed = typeof window === 'undefined' ? initialState.seed : createSeed();
    if (typeof window !== 'undefined') window.sessionStorage.setItem(SESSION_KEY, seed);
    tarotSessionStore.setState({
      ...initialState,
      reading: null,
      reshuffled: false,
      seed,
      selections: [],
    });
  },
  saveAnswers(answers: readonly TarotPsychologyAnswer[]) {
    tarotSessionStore.setState({ answers });
  },
  saveBirthDate(birthDate: string) {
    tarotSessionStore.setState({ birthDate });
  },
  saveReading(reading: TarotReading) {
    tarotSessionStore.setState({ reading });
  },
  saveSelections(selections: readonly TarotCardSelection[]) {
    tarotSessionStore.setState({ selections });
  },
  setDeckTheme(deckTheme: TarotDeckTheme) {
    tarotSessionStore.setState({ deckTheme });
    if (typeof window !== 'undefined') window.localStorage.setItem(THEME_KEY, deckTheme);
  },
  setSelectionMode(selectionMode: TarotSelectionMode) {
    tarotSessionStore.setState({ selectionMode, selections: [] });
  },
  reshuffleOnce() {
    const state = tarotSessionStore.getState();
    if (state.reshuffled) return;
    tarotSessionStore.setState({
      reshuffled: true,
      seed: `${state.seed}:reshuffled`,
      selections: [],
    });
  },
};
