import type { AdvancedNumerologyFixture } from '../types';
import { ADVANCED_NUMEROLOGY_REFERENCE_VECTORS } from './reference-vectors';

const scenarioFixtures: readonly AdvancedNumerologyFixture[] = [
  ['life-path-1', '1999-09-09', '2026-08-09', 1],
  ['life-path-2', '1980-01-01', '2026-08-09', 2],
  ['life-path-3', '1990-01-01', '2026-08-09', 3],
  ['life-path-4', '1990-01-29', '2026-08-09', 4],
  ['life-path-5', '1990-01-03', '2026-08-09', 5],
  ['life-path-6', '1990-01-04', '2026-08-09', 6],
  ['life-path-7', '1985-07-13', '2026-08-09', 7],
  ['life-path-8', '1966-06-16', '2026-08-09', 8],
  ['life-path-9', '1990-01-07', '2026-08-09', 9],
  ['master-11', '1991-01-08', '2026-08-09', 11],
  ['master-22', '1980-11-11', '2026-08-09', 22],
  ['master-33', '1987-03-14', '2026-08-09', 33],
].map(([id, birthDate, referenceDate, lifePath]) => ({
  birthDate: String(birthDate),
  expected: { challengeCount: 4, lifePath: Number(lifePath) },
  id: String(id),
  locale: 'en',
  referenceDate: String(referenceDate),
}));

const boundaryFixtures: readonly AdvancedNumerologyFixture[] = [
  {
    birthDate: '1990-01-01',
    expected: { challengeCount: 4, currentPinnacleOrdinal: 1 },
    id: 'current-first-pinnacle',
    locale: 'ru',
    referenceDate: '2020-01-01',
  },
  {
    birthDate: '1990-01-01',
    expected: { challengeCount: 4, currentPinnacleOrdinal: 2 },
    id: 'current-second-pinnacle',
    locale: 'uk',
    referenceDate: '2024-01-01',
  },
  {
    birthDate: '1990-01-01',
    expected: { challengeCount: 4, currentPinnacleOrdinal: 3 },
    id: 'current-third-pinnacle',
    locale: 'en',
    referenceDate: '2033-01-01',
  },
  {
    birthDate: '1990-01-01',
    expected: { challengeCount: 4, currentPinnacleOrdinal: 4 },
    id: 'current-fourth-pinnacle',
    locale: 'ru',
    referenceDate: '2042-01-01',
  },
  {
    birthDate: '2000-02-29',
    expected: { challengeCount: 4 },
    id: 'leap-day-clamped-boundary',
    locale: 'en',
    referenceDate: '2032-02-28',
  },
  {
    birthDate: '1990-01-01',
    expected: { challengeCount: 4 },
    id: 'six-months-before-transition',
    locale: 'en',
    referenceDate: '2023-07-01',
  },
  {
    birthDate: '1990-01-01',
    expected: { challengeCount: 4 },
    id: 'six-months-after-transition',
    locale: 'en',
    referenceDate: '2024-07-01',
  },
  {
    birthDate: '2010-12-31',
    expected: { challengeCount: 4 },
    id: 'young-reference',
    locale: 'uk',
    referenceDate: '2026-08-09',
  },
  {
    birthDate: '1930-01-01',
    expected: { challengeCount: 4, currentLifeCycleOrdinal: 3 },
    id: 'older-reference',
    locale: 'ru',
    referenceDate: '2026-08-09',
  },
];

const generatedCoverage: readonly AdvancedNumerologyFixture[] = Array.from(
  { length: 40 },
  (_, index) => {
    const year = 1940 + index;
    const month = (index % 12) + 1;
    const day = (index % 27) + 1;
    return {
      birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      expected: { challengeCount: 4 as const },
      id: `coverage-${String(index + 1).padStart(2, '0')}`,
      locale: (['ru', 'en', 'uk'] as const)[index % 3]!,
      referenceDate: '2026-08-09',
    };
  },
);

export const advancedNumerologyFixtures: readonly AdvancedNumerologyFixture[] = [
  ...scenarioFixtures,
  ...boundaryFixtures,
  ...ADVANCED_NUMEROLOGY_REFERENCE_VECTORS.map((vector, index) => ({
    birthDate: vector.birthDate,
    expected: { challengeCount: 4 as const, lifePath: vector.expected.lifePath },
    id: `vector-fixture-${index + 1}`,
    locale: (['ru', 'en', 'uk'] as const)[index % 3]!,
    referenceDate: vector.referenceDate,
  })),
  ...generatedCoverage,
];
