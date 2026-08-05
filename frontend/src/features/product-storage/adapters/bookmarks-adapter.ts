import type { JourneyState } from '@features/journey/types';

export type JourneyBookmarks = Readonly<Record<string, boolean>>;

export function bookmarksFromJourney(state: JourneyState): JourneyBookmarks {
  return Object.fromEntries(state.readings.map((record) => [record.reading.id, record.favorite]));
}

export function applyBookmarksToJourney(
  state: JourneyState,
  bookmarks: JourneyBookmarks,
): JourneyState {
  return {
    ...state,
    readings: state.readings.map((record) => ({
      ...record,
      favorite: bookmarks[record.reading.id] ?? record.favorite,
    })),
  };
}
