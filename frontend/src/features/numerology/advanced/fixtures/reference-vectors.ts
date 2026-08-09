import type { AdvancedNumerologyReferenceVector } from '../types';

export const ADVANCED_NUMEROLOGY_REFERENCE_VECTORS: readonly AdvancedNumerologyReferenceVector[] = [
  {
    birthDate: '1990-01-01',
    expected: {
      challenges: [0, 0, 0, 0],
      decomposition: [1, 1, 1],
      lifeCycles: [1, 1, 1],
      lifePath: 3,
      pinnacles: [2, 2, 4, 2],
    },
    id: 'reference.basic-three',
    referenceDate: '2026-08-09',
  },
  {
    birthDate: '1985-07-13',
    expected: {
      challenges: [3, 1, 2, 2],
      decomposition: [7, 4, 5],
      lifeCycles: [7, 4, 5],
      lifePath: 7,
      pinnacles: [11, 9, 2, 3],
    },
    id: 'reference.karmic-thirteen',
    referenceDate: '2026-08-09',
  },
  {
    birthDate: '2000-02-29',
    expected: {
      challenges: [0, 0, 0, 0],
      decomposition: [2, 11, 2],
      lifeCycles: [2, 11, 2],
      lifePath: 6,
      pinnacles: [4, 4, 8, 4],
    },
    id: 'reference.leap-master-day',
    referenceDate: '2032-02-29',
  },
  {
    birthDate: '1980-11-11',
    expected: {
      challenges: [0, 7, 7, 7],
      decomposition: [11, 11, 9],
      lifeCycles: [11, 11, 9],
      lifePath: 22,
      pinnacles: [22, 2, 6, 2],
    },
    id: 'reference.master-twenty-two',
    referenceDate: '2026-08-09',
  },
  {
    birthDate: '1977-12-31',
    expected: {
      challenges: [1, 2, 1, 3],
      decomposition: [3, 4, 6],
      lifeCycles: [3, 4, 6],
      lifePath: 4,
      pinnacles: [7, 1, 8, 9],
    },
    id: 'reference.year-end',
    referenceDate: '2026-12-31',
  },
  {
    birthDate: '2004-11-22',
    expected: {
      challenges: [2, 2, 0, 4],
      decomposition: [11, 22, 6],
      lifeCycles: [11, 22, 6],
      lifePath: 3,
      pinnacles: [33, 1, 7, 8],
    },
    id: 'reference.master-thirty-three-pinnacle',
    referenceDate: '2026-11-22',
  },
  {
    birthDate: '1999-09-09',
    expected: {
      challenges: [0, 8, 8, 8],
      decomposition: [9, 9, 1],
      lifeCycles: [9, 9, 1],
      lifePath: 1,
      pinnacles: [9, 1, 1, 1],
    },
    id: 'reference.life-path-one',
    referenceDate: '2034-09-09',
  },
  {
    birthDate: '1966-06-16',
    expected: {
      challenges: [1, 3, 2, 2],
      decomposition: [6, 7, 22],
      lifeCycles: [6, 7, 22],
      lifePath: 8,
      pinnacles: [4, 11, 6, 1],
    },
    id: 'reference.master-year-component',
    referenceDate: '2026-08-09',
  },
  {
    birthDate: '1992-04-14',
    expected: {
      challenges: [1, 2, 1, 1],
      decomposition: [4, 5, 3],
      lifeCycles: [4, 5, 3],
      lifePath: 3,
      pinnacles: [9, 8, 8, 7],
    },
    id: 'reference.karmic-fourteen',
    referenceDate: '2026-08-09',
  },
  {
    birthDate: '1975-05-19',
    expected: {
      challenges: [4, 3, 1, 1],
      decomposition: [5, 1, 22],
      lifeCycles: [5, 1, 22],
      lifePath: 1,
      pinnacles: [6, 5, 11, 9],
    },
    id: 'reference.karmic-nineteen',
    referenceDate: '2026-08-09',
  },
];

function independentReduce(value: number, preserveMaster: boolean) {
  let current = Math.abs(value);
  while (current > 9 && !(preserveMaster && [11, 22, 33].includes(current)))
    current = String(current)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0);
  return current;
}

export function independentlyCalculateReferenceVector(birthDate: string) {
  const [year, month, day] = birthDate.split('-').map(Number) as [number, number, number];
  const monthValue = independentReduce(month, true);
  const dayValue = independentReduce(day, true);
  const yearValue = independentReduce(year, true);
  const lifePath = independentReduce(
    birthDate
      .replaceAll('-', '')
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0),
    true,
  );
  const first = independentReduce(monthValue + dayValue, true);
  const second = independentReduce(dayValue + yearValue, true);
  const third = independentReduce(first + second, true);
  const fourth = independentReduce(monthValue + yearValue, true);
  const baseMonth = independentReduce(monthValue, false);
  const baseDay = independentReduce(dayValue, false);
  const baseYear = independentReduce(yearValue, false);
  const firstChallenge = Math.abs(baseDay - baseMonth);
  const secondChallenge = Math.abs(baseDay - baseYear);
  return {
    challenges: [
      firstChallenge,
      secondChallenge,
      Math.abs(firstChallenge - secondChallenge),
      Math.abs(baseMonth - baseYear),
    ] as const,
    decomposition: [monthValue, dayValue, yearValue] as const,
    lifeCycles: [monthValue, dayValue, yearValue] as const,
    lifePath,
    pinnacles: [first, second, third, fourth] as const,
  };
}
