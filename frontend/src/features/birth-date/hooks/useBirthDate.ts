import { useMemo, useState } from 'react';

import type { BirthDateFormValue, BirthDateSubmission } from '../types';
import { toDateInputValue } from '../utils';
import { DEFAULT_MINIMUM_AGE_YEARS, validateBirthDate } from '../validation';

type UseBirthDateOptions = {
  minimumAgeYears?: number;
  onChange: (value: BirthDateFormValue) => void;
  onSubmit: (value: BirthDateSubmission) => void;
  value: BirthDateFormValue;
};

export function useBirthDate({
  minimumAgeYears = DEFAULT_MINIMUM_AGE_YEARS,
  onChange,
  onSubmit,
  value,
}: UseBirthDateOptions) {
  const [isTouched, setTouched] = useState(false);
  const [hasSubmitted, setSubmitted] = useState(false);
  const today = useMemo(() => new Date(), []);
  const validation = validateBirthDate(value, { minimumAgeYears, referenceDate: today });
  const visibleError = isTouched || hasSubmitted ? validation.error : null;

  const updateValue = (nextValue: BirthDateFormValue) => {
    onChange(nextValue);
  };

  const setBirthDate = (birthDate: string) => {
    setTouched(true);
    updateValue({ ...value, birthDate });
  };

  const setSkipBirthDate = (skipBirthDate: boolean) => {
    setTouched(true);
    updateValue({ ...value, skipBirthDate });
  };

  const submit = () => {
    setSubmitted(true);

    if (!validation.valid) {
      return false;
    }

    onSubmit({ ...value, minimumAgeYears });
    return true;
  };

  return {
    canSubmit: validation.valid,
    markTouched: () => setTouched(true),
    maxDate: toDateInputValue(today),
    minimumAgeYears,
    setBirthDate,
    setSkipBirthDate,
    submit,
    value,
    visibleError,
  };
}
