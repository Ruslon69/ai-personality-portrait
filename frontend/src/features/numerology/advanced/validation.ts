import { MASTER_NUMBER_POLICY } from './constants';
import { compareIsoDates, parseIsoDate, previousDay } from './date-utils';
import { baseReduction } from './reduction';
import { serializeAdvancedNumerologyProfile } from './serialization';
import type {
  AdvancedNumerologyProfile,
  AdvancedNumerologyValidationCode,
  AdvancedNumerologyValidationError,
  ChallengeResult,
  LifeCycleResult,
  PinnacleResult,
} from './types';

function issue(
  errors: AdvancedNumerologyValidationError[],
  code: AdvancedNumerologyValidationCode,
  path: string,
  message: string,
) {
  errors.push({ code, message, path });
}

function validatePeriods(
  periods: readonly (LifeCycleResult | PinnacleResult)[],
  name: string,
  errors: AdvancedNumerologyValidationError[],
) {
  periods.forEach((period, index) => {
    const path = `${name}[${index}]`;
    if (!parseIsoDate(period.startDate) || (period.endDate && !parseIsoDate(period.endDate)))
      issue(errors, 'invalid-age-boundary', path, 'Period boundaries must be ISO dates.');
    if (period.endAge !== null && period.endAge < period.startAge)
      issue(errors, 'invalid-age-boundary', path, 'Period end age precedes start age.');
    if (period.endDate && compareIsoDates(period.startDate, period.endDate) > 0)
      issue(errors, 'invalid-age-boundary', path, 'Period end date precedes start date.');
    const next = periods[index + 1];
    if (next && period.endDate) {
      if (previousDay(next.startDate) !== period.endDate)
        issue(errors, 'period-gap', path, 'Periods must meet on consecutive dates.');
      if (compareIsoDates(next.startDate, period.endDate) <= 0)
        issue(errors, 'period-overlap', path, 'Periods overlap.');
    }
  });
  if (periods.filter((item) => item.status === 'current').length !== 1)
    issue(errors, 'invalid-current-period', name, 'Exactly one current period is required.');
}

function validateTrace(
  value: ChallengeResult | LifeCycleResult | PinnacleResult,
  path: string,
  errors: AdvancedNumerologyValidationError[],
) {
  const trace = value.calculationTrace;
  const result = 'result' in value ? value.result : value.value;
  if (
    trace.finalValue !== result ||
    !trace.operations.length ||
    trace.intermediateValues.some((item) => !Number.isFinite(item)) ||
    trace.operations.some((operation) => !Number.isFinite(operation.result))
  )
    issue(
      errors,
      'invalid-trace',
      `${path}.calculationTrace`,
      'Calculation trace is inconsistent.',
    );
  if (MASTER_NUMBER_POLICY[trace.calculationType] !== trace.policy)
    issue(
      errors,
      'invalid-master-policy',
      `${path}.calculationTrace.policy`,
      'Calculation trace does not follow the policy matrix.',
    );
}

export function validateAdvancedNumerologyProfile(profile: AdvancedNumerologyProfile) {
  const errors: AdvancedNumerologyValidationError[] = [];
  if (!parseIsoDate(profile.calculationMetadata.birthDate))
    issue(errors, 'invalid-birth-date', 'calculationMetadata.birthDate', 'Birth date is invalid.');
  if (!parseIsoDate(profile.calculationMetadata.referenceDate))
    issue(
      errors,
      'invalid-reference-date',
      'calculationMetadata.referenceDate',
      'Reference date is invalid.',
    );
  if (profile.calculationMetadata.calculationSystem !== 'pythagorean-date-cycles-v1')
    issue(errors, 'invalid-version', 'calculationMetadata', 'Calculation system is unsupported.');
  const versions = profile.calculationMetadata.formulaVersions;
  if (
    versions.challenge !== 'challenge-formulas-v1' ||
    versions.dateDecomposition !== 'date-decomposition-v1' ||
    versions.lifeCycle !== 'life-cycle-formulas-v1' ||
    versions.pinnacle !== 'pinnacle-formulas-v1' ||
    versions.pinnacleBoundaries !== 'pinnacle-age-boundaries-v1' ||
    versions.transition !== 'transition-window-v1' ||
    profile.calculationMetadata.masterPolicyVersion !== 'master-number-policy-v1'
  )
    issue(
      errors,
      'invalid-version',
      'calculationMetadata.formulaVersions',
      'Formula version is unsupported.',
    );
  if (
    profile.existingCanonicalProfile.system !== 'pythagorean-date-v1' ||
    (profile.existingCanonicalProfile.lifePath.value !==
      baseReduction(
        profile.calculationMetadata.birthDate
          .replaceAll('-', '')
          .split('')
          .reduce((sum, digit) => sum + Number(digit), 0),
      ) &&
      ![11, 22, 33].includes(profile.existingCanonicalProfile.lifePath.value))
  )
    issue(
      errors,
      'invalid-version',
      'existingCanonicalProfile',
      'Canonical profile is incompatible.',
    );
  if (profile.pinnacles.length !== 4)
    issue(errors, 'invalid-age-boundary', 'pinnacles', 'Four Pinnacles are required.');
  if (profile.challenges.length !== 4)
    issue(errors, 'invalid-challenge', 'challenges', 'Four Challenges are required.');
  if (profile.lifeCycles.length !== 3)
    issue(errors, 'invalid-age-boundary', 'lifeCycles', 'Three Life Cycles are required.');
  validatePeriods(profile.pinnacles, 'pinnacles', errors);
  validatePeriods(profile.lifeCycles, 'lifeCycles', errors);
  profile.pinnacles.forEach((value, index) => validateTrace(value, `pinnacles[${index}]`, errors));
  profile.challenges.forEach((value, index) => {
    validateTrace(value, `challenges[${index}]`, errors);
    if (!Number.isInteger(value.result) || value.result < 0 || value.result > 8)
      issue(
        errors,
        'invalid-challenge',
        `challenges[${index}].result`,
        'Challenge is outside 0–8.',
      );
  });
  profile.lifeCycles.forEach((value, index) =>
    validateTrace(value, `lifeCycles[${index}]`, errors),
  );
  [...profile.pinnacles, ...profile.lifeCycles].forEach((period, index) => {
    const value = 'result' in period ? period.result : period.value;
    const expectedMaster = [11, 22, 33].includes(value) ? value : null;
    if (period.preservedMasterNumber !== expectedMaster)
      issue(
        errors,
        'invalid-master-policy',
        `longTermPeriods[${index}].preservedMasterNumber`,
        'Preserved master marker is inconsistent with the final value.',
      );
  });
  if (profile.currentPinnacle.status !== 'current' || profile.currentLifeCycle.status !== 'current')
    issue(
      errors,
      'invalid-current-period',
      'currentPinnacle',
      'Current period reference is stale.',
    );
  if (profile.currentChallenge.ordinal !== profile.currentPinnacle.ordinal)
    issue(errors, 'invalid-current-period', 'currentChallenge', 'Current Challenge is misaligned.');
  [profile.transitions.pinnacle, profile.transitions.lifeCycle].forEach((transition, index) => {
    const expected = transition.monthsUntilTransition ?? -1;
    if (
      transition.formulaVersion !== 'transition-window-v1' ||
      transition.transitionWindowMonths !== 6 ||
      transition.calculationTrace.calculationType !== 'transition' ||
      transition.calculationTrace.policy !== 'not-applicable' ||
      transition.calculationTrace.finalValue !== expected
    )
      issue(
        errors,
        'invalid-trace',
        `transitions[${index}]`,
        'Transition trace or window is inconsistent.',
      );
  });
  profile.karmicDebts.forEach((debt, index) => {
    if (
      ![13, 14, 16, 19].includes(debt.debtNumber) ||
      debt.rawStep !== debt.debtNumber ||
      debt.reducedValue !== baseReduction(debt.rawStep) ||
      !debt.provenance.operationId ||
      !/^(attitude|birthday|date-component|life-path|pinnacle)\./u.test(
        debt.provenance.operationId,
      ) ||
      debt.provenance.calculationSystem !== 'pythagorean-date-cycles-v1'
    )
      issue(
        errors,
        'invalid-karmic-provenance',
        `karmicDebts[${index}]`,
        'Karmic debt lacks an eligible unreduced step.',
      );
  });
  Object.entries(MASTER_NUMBER_POLICY).forEach(([type, policy]) => {
    if (!policy)
      issue(errors, 'invalid-master-policy', `masterPolicy.${type}`, 'Master policy is undefined.');
  });
  try {
    const serialized = serializeAdvancedNumerologyProfile(profile);
    if (serializeAdvancedNumerologyProfile(JSON.parse(serialized)) !== serialized)
      issue(errors, 'non-serializable', '$', 'Serialization round-trip is unstable.');
  } catch (error) {
    issue(
      errors,
      'non-serializable',
      '$',
      error instanceof Error ? error.message : 'Serialization failed.',
    );
  }
  return { errors, valid: errors.length === 0 };
}
