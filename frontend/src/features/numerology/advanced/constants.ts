import type {
  AdvancedNumerologyCalculationType,
  NumerologyKarmicDebtNumber,
  NumerologyMasterHandling,
  NumerologyMasterNumber,
} from './types';

export const ADVANCED_NUMEROLOGY_SYSTEM = 'pythagorean-date-cycles-v1' as const;
export const ADVANCED_NUMEROLOGY_VERSIONS = {
  challenge: 'challenge-formulas-v1',
  dateDecomposition: 'date-decomposition-v1',
  engine: ADVANCED_NUMEROLOGY_SYSTEM,
  lifeCycle: 'life-cycle-formulas-v1',
  masterPolicy: 'master-number-policy-v1',
  pinnacle: 'pinnacle-formulas-v1',
  pinnacleBoundaries: 'pinnacle-age-boundaries-v1',
  transition: 'transition-window-v1',
} as const;

export const ADVANCED_MASTER_NUMBERS: readonly NumerologyMasterNumber[] = [11, 22, 33];
export const KARMIC_DEBT_NUMBERS: readonly NumerologyKarmicDebtNumber[] = [13, 14, 16, 19];

export const MASTER_NUMBER_POLICY: Readonly<
  Record<AdvancedNumerologyCalculationType, NumerologyMasterHandling>
> = {
  attitude: 'preserve',
  birthday: 'preserve',
  challenge: 'reduce',
  'date-component': 'preserve-with-base',
  'karmic-debt': 'not-applicable',
  'life-cycle': 'preserve-with-base',
  'life-path': 'preserve',
  'personal-day': 'preserve',
  'personal-month': 'preserve',
  'personal-year': 'preserve',
  pinnacle: 'preserve-with-base',
  transition: 'not-applicable',
};

export const TRANSITION_WINDOW_MONTHS = 6 as const;
