import type { JourneyState } from '@features/journey';

export function removeTarotReadingFromJourney(
  state: JourneyState,
  readingId: string,
): JourneyState {
  return {
    ...state,
    readings: state.readings.filter((record) => record.reading.id !== readingId),
  };
}
