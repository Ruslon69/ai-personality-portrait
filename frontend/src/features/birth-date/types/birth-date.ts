export type BirthDateFormValue = {
  birthDate: string;
  skipBirthDate: boolean;
};

export type BirthDateValidationError = 'required' | 'invalid' | 'future' | 'minimum-age';

export type BirthDateValidationResult =
  { error: null; valid: true } | { error: BirthDateValidationError; valid: false };

export type BirthDateSubmission = BirthDateFormValue & {
  minimumAgeYears: number;
};
