export const TAROT_HISTORY_LIMIT_OPTIONS = [25, 50, 75, 100] as const;

export type TarotHistoryLimit = (typeof TAROT_HISTORY_LIMIT_OPTIONS)[number];

export type TarotPreferences = {
  allowReversedCards: boolean;
  confirmNewReading: boolean;
  historyLimit: TarotHistoryLimit;
  revealAnimations: boolean;
};

export const DEFAULT_TAROT_PREFERENCES: Readonly<TarotPreferences> = {
  allowReversedCards: true,
  confirmNewReading: true,
  historyLimit: 75,
  revealAnimations: true,
};

export function isTarotHistoryLimit(value: unknown): value is TarotHistoryLimit {
  return TAROT_HISTORY_LIMIT_OPTIONS.includes(value as TarotHistoryLimit);
}

export function normalizeTarotPreferences(value: unknown): TarotPreferences {
  if (!value || typeof value !== 'object') return { ...DEFAULT_TAROT_PREFERENCES };
  const candidate = value as Partial<TarotPreferences>;
  return {
    allowReversedCards:
      typeof candidate.allowReversedCards === 'boolean'
        ? candidate.allowReversedCards
        : DEFAULT_TAROT_PREFERENCES.allowReversedCards,
    confirmNewReading:
      typeof candidate.confirmNewReading === 'boolean'
        ? candidate.confirmNewReading
        : DEFAULT_TAROT_PREFERENCES.confirmNewReading,
    historyLimit: isTarotHistoryLimit(candidate.historyLimit)
      ? candidate.historyLimit
      : DEFAULT_TAROT_PREFERENCES.historyLimit,
    revealAnimations:
      typeof candidate.revealAnimations === 'boolean'
        ? candidate.revealAnimations
        : DEFAULT_TAROT_PREFERENCES.revealAnimations,
  };
}
