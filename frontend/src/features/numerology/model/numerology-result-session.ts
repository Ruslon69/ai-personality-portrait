import type { Locale } from '@shared/i18n';

import { createNumerologyProfile, isValidNumerologyDate } from '../lib/numerology-engine';
import type { NumerologyProfile } from '../types';

export type NumerologyResultSession = {
  persisted: boolean;
  profile: NumerologyProfile;
  referenceDate: Date;
};

/** Calculation ownership is independent of optional date persistence. */
export function createNumerologyResultSession(dependencies: {
  read: () => string;
  write: (date: string) => boolean;
}) {
  let current: NumerologyResultSession | null = null;
  function persist(date: string) {
    try {
      return dependencies.write(date);
    } catch {
      return false;
    }
  }
  return {
    peek() {
      return current;
    },
    get(locale: Locale, referenceDate = new Date()) {
      if (current) return current;
      let date: string;
      try {
        date = dependencies.read();
      } catch {
        return null;
      }
      if (!isValidNumerologyDate(date, referenceDate)) return null;
      current = {
        persisted: true,
        profile: createNumerologyProfile(date, locale, referenceDate),
        referenceDate,
      };
      return current;
    },
    date() {
      if (current) return current.profile.birthDate;
      try {
        return dependencies.read();
      } catch {
        return '';
      }
    },
    submit(date: string, locale: Locale, referenceDate = new Date()) {
      if (!isValidNumerologyDate(date, referenceDate)) return null;
      const profile = createNumerologyProfile(date, locale, referenceDate);
      current = { persisted: false, profile, referenceDate };
      current = { ...current, persisted: persist(date) };
      return current;
    },
    retry() {
      if (!current) return null;
      current = { ...current, persisted: persist(current.profile.birthDate) };
      return current;
    },
  };
}
