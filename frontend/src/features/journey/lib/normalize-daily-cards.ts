import { tarotCardById } from '@features/tarot/data';

import type { JourneyDailyCard, JourneyState } from '../types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Recover only Daily Card entries; never rewrite saved reading snapshots. */
export function normalizeDailyCards(value: unknown): JourneyState['dailyCards'] {
  if (!isRecord(value)) return {};
  const cards: Record<string, JourneyDailyCard> = {};
  Object.entries(value).forEach(([dateKey, card]) => {
    if (
      !/^\d{4}-\d{2}-\d{2}$/u.test(dateKey) ||
      Number.isNaN(Date.parse(`${dateKey}T12:00:00Z`)) ||
      new Date(`${dateKey}T12:00:00Z`).toISOString().slice(0, 10) !== dateKey ||
      !isRecord(card) ||
      card.dateKey !== dateKey ||
      !isRecord(card.selection) ||
      typeof card.selection.cardId !== 'string' ||
      !tarotCardById.has(card.selection.cardId) ||
      !['upright', 'reversed'].includes(String(card.selection.orientation)) ||
      card.selection.positionId !== 'daily-focus'
    )
      return;
    cards[dateKey] = {
      dateKey,
      openedAt:
        typeof card.openedAt === 'string' && !Number.isNaN(Date.parse(card.openedAt))
          ? card.openedAt
          : null,
      selection: {
        cardId: card.selection.cardId,
        orientation: card.selection.orientation as JourneyDailyCard['selection']['orientation'],
        positionId: 'daily-focus',
      },
    };
  });
  return cards;
}
