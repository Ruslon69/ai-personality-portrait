import type { BirthDateFormValue, BirthDateValidationResult } from '../types';
import { getAgeOnDate, isAfterDate, parseDateInput, toCalendarDate } from '../utils';

/**
 * Temporary protective default while the launch markets and their legal age
 * requirements remain under review.
 */
export const DEFAULT_MINIMUM_AGE_YEARS = 18;

type ValidateBirthDateOptions = {
  minimumAgeYears?: number;
  referenceDate?: Date;
};

export function validateBirthDate(
  value: BirthDateFormValue,
  {
    minimumAgeYears = DEFAULT_MINIMUM_AGE_YEARS,
    referenceDate = new Date(),
  }: ValidateBirthDateOptions = {},
): BirthDateValidationResult {
  if (value.skipBirthDate) {
    return { error: null, valid: true };
  }

  if (!value.birthDate) {
    return { error: 'required', valid: false };
  }

  const parsedBirthDate = parseDateInput(value.birthDate);

  if (!parsedBirthDate) {
    return { error: 'invalid', valid: false };
  }

  if (isAfterDate(parsedBirthDate, toCalendarDate(referenceDate))) {
    return { error: 'future', valid: false };
  }

  if (getAgeOnDate(parsedBirthDate, referenceDate) < minimumAgeYears) {
    return { error: 'minimum-age', valid: false };
  }

  return { error: null, valid: true };
}
