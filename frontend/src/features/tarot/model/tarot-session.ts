import { createStore } from '@store';
import { LEGACY_STORAGE_KEYS } from '@features/product-storage/constants';

import type {
  TarotCardSelection,
  TarotDeckTheme,
  TarotPsychologyAnswer,
  TarotReading,
  TarotSelectionMode,
} from '../types';
import { tarotCardById, tarotContextQuestions, tarotSpreadById } from '../data';
import { isRenderableTarotReading } from '../lib/tarot-reading-guard';

const THEME_KEY = LEGACY_STORAGE_KEYS.tarotDeckTheme[0];
const SESSION_KEY = LEGACY_STORAGE_KEYS.tarotSessionSeed[0];
const STATE_KEY = LEGACY_STORAGE_KEYS.tarotState[0];

export type TarotSessionState = {
  answers: readonly TarotPsychologyAnswer[];
  birthDate: string;
  deckTheme: TarotDeckTheme;
  inProgress: boolean;
  reading: TarotReading | null;
  revealedCount: number;
  reshuffled: boolean;
  seed: string;
  selections: readonly TarotCardSelection[];
  selectionMode: TarotSelectionMode;
  spreadId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readBrowserStorage(kind: 'localStorage' | 'sessionStorage', key: string) {
  if (typeof window === 'undefined') return null;
  try {
    return window[kind].getItem(key);
  } catch {
    return null;
  }
}

function writeBrowserStorage(kind: 'localStorage' | 'sessionStorage', key: string, value: string) {
  if (typeof window === 'undefined') return false;
  try {
    window[kind].setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function readTheme(): TarotDeckTheme {
  const saved = readBrowserStorage('localStorage', THEME_KEY);
  return saved === 'deep-water' || saved === 'midnight-geometry' || saved === 'solar-lines'
    ? saved
    : 'cosmic-minimal';
}

function createSeed() {
  return window.crypto?.randomUUID?.() ?? `session-${Date.now().toString(36)}`;
}

function readSeed() {
  if (typeof window === 'undefined') return 'tarot-session';
  const existing = readBrowserStorage('sessionStorage', SESSION_KEY);
  if (existing) return existing;
  const created = createSeed();
  writeBrowserStorage('sessionStorage', SESSION_KEY, created);
  return created;
}

const defaultState: TarotSessionState = {
  answers: [],
  birthDate: '',
  deckTheme: readTheme(),
  inProgress: false,
  reading: null,
  revealedCount: 0,
  reshuffled: false,
  seed: readSeed(),
  selections: [],
  selectionMode: 'automatic',
  spreadId: 'day',
};

function normalizeAnswers(value: unknown): readonly TarotPsychologyAnswer[] {
  if (!Array.isArray(value)) return [];
  return tarotContextQuestions.flatMap((question) => {
    const answer = value.find(
      (candidate) => isRecord(candidate) && candidate.questionId === question.id,
    );
    if (
      !isRecord(answer) ||
      typeof answer.optionId !== 'string' ||
      !question.options.some((option) => option.id === answer.optionId)
    )
      return [];
    return [{ optionId: answer.optionId, questionId: question.id }];
  });
}

function normalizeSelections(value: unknown, spreadId: string): readonly TarotCardSelection[] {
  const spread = tarotSpreadById.get(spreadId);
  if (!spread || !Array.isArray(value) || value.length !== spread.positions.length) return [];
  const cardIds = new Set<string>();
  const selections: TarotCardSelection[] = [];
  for (const [index, selection] of value.entries()) {
    const position = spread.positions[index];
    if (
      !position ||
      !isRecord(selection) ||
      typeof selection.cardId !== 'string' ||
      !tarotCardById.has(selection.cardId) ||
      cardIds.has(selection.cardId) ||
      selection.positionId !== position.id ||
      (selection.orientation !== 'upright' && selection.orientation !== 'reversed')
    )
      return [];
    cardIds.add(selection.cardId);
    selections.push({
      cardId: selection.cardId,
      orientation: selection.orientation,
      positionId: selection.positionId,
    });
  }
  return selections.length === spread.positions.length ? selections : [];
}

export function normalizeTarotSessionState(
  saved: unknown,
  fallback: TarotSessionState = defaultState,
): TarotSessionState {
  if (!isRecord(saved)) return fallback;
  const spreadId =
    typeof saved.spreadId === 'string' && tarotSpreadById.has(saved.spreadId)
      ? saved.spreadId
      : fallback.spreadId;
  const selections = normalizeSelections(saved.selections, spreadId);
  const reading = isRenderableTarotReading(saved.reading) ? saved.reading : null;
  const revealedCount =
    Number.isInteger(saved.revealedCount) &&
    Number(saved.revealedCount) >= 0 &&
    Number(saved.revealedCount) <= selections.length
      ? Number(saved.revealedCount)
      : 0;
  return {
    answers: normalizeAnswers(saved.answers),
    birthDate: typeof saved.birthDate === 'string' ? saved.birthDate : '',
    deckTheme: readTheme(),
    inProgress: saved.inProgress === true && !reading,
    reading,
    reshuffled: saved.reshuffled === true,
    revealedCount,
    seed: typeof saved.seed === 'string' && saved.seed ? saved.seed : fallback.seed,
    selections,
    selectionMode: saved.selectionMode === 'manual' ? 'manual' : 'automatic',
    spreadId,
  };
}

function readState(): TarotSessionState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const saved: unknown = JSON.parse(readBrowserStorage('sessionStorage', STATE_KEY) ?? '');
    return normalizeTarotSessionState(saved);
  } catch {
    return defaultState;
  }
}

const initialState = readState();

export const tarotSessionStore = createStore(initialState);

if (typeof window !== 'undefined') {
  tarotSessionStore.subscribe(() => {
    writeBrowserStorage('sessionStorage', STATE_KEY, JSON.stringify(tarotSessionStore.getState()));
  });
}

export const tarotSessionActions = {
  chooseSpread(spreadId: string) {
    tarotSessionStore.setState({
      inProgress: true,
      reading: null,
      reshuffled: false,
      revealedCount: 0,
      selections: [],
      spreadId,
    });
  },
  reset() {
    const seed = typeof window === 'undefined' ? initialState.seed : createSeed();
    writeBrowserStorage('sessionStorage', SESSION_KEY, seed);
    tarotSessionStore.setState({
      ...initialState,
      inProgress: false,
      reading: null,
      reshuffled: false,
      revealedCount: 0,
      seed,
      selections: [],
    });
  },
  saveAnswers(answers: readonly TarotPsychologyAnswer[]) {
    tarotSessionStore.setState({ answers, inProgress: true });
  },
  saveBirthDate(birthDate: string) {
    tarotSessionStore.setState({ birthDate, inProgress: true });
  },
  saveReading(reading: TarotReading) {
    tarotSessionStore.setState({ inProgress: false, reading });
  },
  saveRevealProgress(revealedCount: number) {
    const state = tarotSessionStore.getState();
    const safeCount = Math.max(0, Math.min(Math.trunc(revealedCount), state.selections.length));
    if (safeCount === state.revealedCount) return;
    tarotSessionStore.setState({ revealedCount: safeCount });
  },
  saveSelections(selections: readonly TarotCardSelection[]) {
    tarotSessionStore.setState({ inProgress: true, revealedCount: 0, selections });
  },
  setDeckTheme(deckTheme: TarotDeckTheme) {
    tarotSessionStore.setState({ deckTheme });
    writeBrowserStorage('localStorage', THEME_KEY, deckTheme);
  },
  setSelectionMode(selectionMode: TarotSelectionMode) {
    tarotSessionStore.setState({ revealedCount: 0, selectionMode, selections: [] });
  },
  reshuffleOnce() {
    const state = tarotSessionStore.getState();
    if (state.reshuffled) return;
    tarotSessionStore.setState({
      reshuffled: true,
      revealedCount: 0,
      seed: `${state.seed}:reshuffled`,
      selections: [],
    });
  },
};
