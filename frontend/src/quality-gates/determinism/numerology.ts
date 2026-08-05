import {
  createNumerologyProfile,
  isValidNumerologyDate,
  MASTER_NUMBERS,
  NUMEROLOGY_SYSTEM,
  reduceNumerology,
} from '../../features/numerology/lib/numerology-engine';
import { createZodiacProfile } from '../../features/numerology/lib/zodiac';
import { QualityAssertions } from '../assertions';
import { negativeQualityFixtures } from '../fixtures/negative-fixtures';
import { QUALITY_BASELINE } from '../fixtures/baseline';

const referenceDate = new Date('2026-08-05T12:00:00.000Z');

function traceResult(steps: readonly string[]) {
  const final = steps.at(-1)?.split('=').at(-1)?.trim();
  return Number(final);
}

export function preservesMasterNumber(input: number, output: number) {
  return !MASTER_NUMBERS.includes(input as 11 | 22 | 33) || input === output;
}

export function runNumerologyRegressionGate() {
  const assertions = new QualityAssertions();
  assertions.assert(NUMEROLOGY_SYSTEM === QUALITY_BASELINE.moduleVersions.numerologyCalculation, {
    code: 'numerology-system-version',
    message: 'Numerology must use the approved pythagorean-date-v1 calculation system.',
  });
  MASTER_NUMBERS.forEach((number) => {
    const reduced = reduceNumerology([number]);
    assertions.assert(reduced.value === number, {
      actual: reduced.value,
      code: `master-number-${number}`,
      expected: number,
      message: `Master number ${number} was reduced unexpectedly.`,
    });
  });
  const invalidDates = ['', 'not-a-date', '2026-02-30', '2026-13-01', '2027-01-01', '2010-01-01'];
  invalidDates.forEach((date) =>
    assertions.assert(!isValidNumerologyDate(date, referenceDate), {
      code: 'invalid-date-accepted',
      message: `Invalid or underage date was accepted: ${date || '<empty>'}.`,
    }),
  );
  ['1990-01-01', '1988-02-29', '2000-08-05'].forEach((date) =>
    assertions.assert(isValidNumerologyDate(date, referenceDate), {
      code: 'valid-date-rejected',
      message: `Valid date was rejected: ${date}.`,
    }),
  );
  const profile = createNumerologyProfile('1990-01-01', 'ru', referenceDate);
  const duplicate = createNumerologyProfile('1990-01-01', 'ru', referenceDate);
  assertions.assert(JSON.stringify(profile) === JSON.stringify(duplicate), {
    code: 'numerology-nondeterministic',
    message: 'Identical date, locale, and reference date changed the profile.',
  });
  const expected = {
    attitude: 2,
    birthday: 1,
    lifePath: 3,
    personalDay: 7,
    personalMonth: 11,
    personalYear: 3,
  };
  Object.entries(expected).forEach(([key, value]) =>
    assertions.assert(profile[key as keyof typeof expected].value === value, {
      actual: profile[key as keyof typeof expected].value,
      code: `numerology-${key}`,
      expected: value,
      message: `${key} calculation changed for the fixed regression date.`,
    }),
  );
  [
    profile.lifePath,
    profile.birthday,
    profile.attitude,
    profile.personalYear,
    profile.personalMonth,
    profile.personalDay,
  ].forEach((calculation) =>
    assertions.assert(traceResult(calculation.steps) === calculation.value, {
      code: 'numerology-trace-mismatch',
      message: `${calculation.id} trace does not end with its calculated value.`,
    }),
  );

  const boundaries = [
    ['2000-01-19', 'capricorn', 'earth', 'cardinal'],
    ['2000-01-20', 'aquarius', 'air', 'fixed'],
    ['2000-02-18', 'aquarius', 'air', 'fixed'],
    ['2000-02-19', 'pisces', 'water', 'mutable'],
    ['2000-03-20', 'pisces', 'water', 'mutable'],
    ['2000-03-21', 'aries', 'fire', 'cardinal'],
    ['2000-04-19', 'aries', 'fire', 'cardinal'],
    ['2000-04-20', 'taurus', 'earth', 'fixed'],
    ['2000-05-20', 'taurus', 'earth', 'fixed'],
    ['2000-05-21', 'gemini', 'air', 'mutable'],
    ['2000-06-20', 'gemini', 'air', 'mutable'],
    ['2000-06-21', 'cancer', 'water', 'cardinal'],
    ['2000-07-22', 'cancer', 'water', 'cardinal'],
    ['2000-07-23', 'leo', 'fire', 'fixed'],
    ['2000-08-22', 'leo', 'fire', 'fixed'],
    ['2000-08-23', 'virgo', 'earth', 'mutable'],
    ['2000-09-22', 'virgo', 'earth', 'mutable'],
    ['2000-09-23', 'libra', 'air', 'cardinal'],
    ['2000-10-22', 'libra', 'air', 'cardinal'],
    ['2000-10-23', 'scorpio', 'water', 'fixed'],
    ['2000-11-21', 'scorpio', 'water', 'fixed'],
    ['2000-11-22', 'sagittarius', 'fire', 'mutable'],
    ['2000-12-21', 'sagittarius', 'fire', 'mutable'],
    ['2000-12-22', 'capricorn', 'earth', 'cardinal'],
  ] as const;
  boundaries.forEach(([date, signId, element, modality]) => {
    const zodiac = createZodiacProfile(date, 'en');
    assertions.assert(
      zodiac.signId === signId && zodiac.element === element && zodiac.modality === modality,
      {
        code: 'zodiac-boundary',
        message: `${date} produced an unexpected Zodiac boundary profile.`,
      },
    );
    assertions.assert(
      !('moon' in zodiac) &&
        !('ascendant' in zodiac) &&
        !('houses' in zodiac) &&
        !('planets' in zodiac),
      {
        code: 'unsupported-zodiac-calculation',
        message: 'Zodiac profile contains unsupported natal-chart fields.',
      },
    );
  });
  assertions.assert(
    !preservesMasterNumber(
      negativeQualityFixtures.invalidMasterReduction.input,
      negativeQualityFixtures.invalidMasterReduction.output,
    ),
    {
      code: 'negative-master-reduction-not-detected',
      message: 'Controlled invalid master-number reduction was not detected.',
    },
  );
  return assertions.result({
    moduleVersions: { numerologyCalculation: NUMEROLOGY_SYSTEM },
  });
}
