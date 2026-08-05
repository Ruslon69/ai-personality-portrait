import type {
  InterpretationNumerologyInput,
  InterpretationPsychologicalAnswer,
  InterpretationRequest,
  InterpretationTarotCardInput,
  InterpretationTarotInput,
} from '../types';

export type InterpretationFixture = {
  expected: {
    connectionKinds?: readonly string[];
    hasNumerology: boolean;
    masterNumbers?: readonly number[];
    minimumSections: number;
    sources: readonly string[];
  };
  id: string;
  request: InterpretationRequest;
};

const generatedAt = '2026-08-04T10:00:00.000Z';

const psychologyAnswers: readonly InterpretationPsychologicalAnswer[] = [
  { optionId: 'test', questionId: 'decision-style' },
  { optionId: 'map', questionId: 'uncertainty' },
  { optionId: 'work', questionId: 'current-focus' },
  { optionId: 'anchor', questionId: 'change-response' },
  { optionId: 'clarity', questionId: 'reading-intent' },
  { optionId: 'building', questionId: 'period-state' },
];

function card(
  id: string,
  number: number,
  positionId: string,
  options: Partial<InterpretationTarotCardInput> = {},
): InterpretationTarotCardInput {
  const arcana = options.arcana ?? (id.startsWith('major-') ? 'major' : 'minor');
  return {
    arcana,
    baseThemeIds: options.baseThemeIds ?? [`card-theme:${id}`],
    id,
    number,
    orientation: options.orientation ?? 'upright',
    positionId,
    ...(arcana === 'minor' ? { suit: options.suit ?? 'wands' } : {}),
  };
}

function numerology(lifePath: number, birthday = 5): InterpretationNumerologyInput {
  const values = [lifePath, birthday, 6, 8, 3, 11];
  const ids = [
    'life-path',
    'birthday',
    'first-impression',
    'personal-year',
    'personal-month',
    'personal-day',
  ] as const;
  return {
    masterNumbers: values.filter((value) => [11, 22, 33].includes(value)),
    numbers: ids.map((id, index) => ({
      id,
      sourceDigits: String(values[index] ?? 1)
        .split('')
        .map(Number),
      value: values[index] ?? 1,
    })),
    system: 'pythagorean-date-v1',
  };
}

function tarot(
  spreadId: string,
  cards: readonly InterpretationTarotCardInput[],
  period?: InterpretationTarotInput['period'],
  topic?: InterpretationTarotInput['topic'],
): InterpretationTarotInput {
  return {
    cards,
    deckTheme: 'cosmic-minimal',
    leadingCardId: cards[0]?.id ?? '',
    ...(period ? { period } : {}),
    spreadId,
    ...(topic ? { topic } : {}),
  };
}

function request(
  id: string,
  tarotInput: InterpretationTarotInput,
  options: {
    interests?: readonly string[];
    numerology?: InterpretationNumerologyInput;
    psychology?: readonly InterpretationPsychologicalAnswer[];
    zodiac?: InterpretationRequest['zodiac'];
  } = {},
): InterpretationRequest {
  return {
    generatedAt,
    interests: options.interests ?? ['technology', 'learning'],
    locale: 'ru',
    ...(options.numerology ? { numerology: options.numerology } : {}),
    psychologyAnswers: options.psychology ?? psychologyAnswers,
    seed: `fixture:${id}`,
    tarot: tarotInput,
    ...(options.zodiac ? { zodiac: options.zodiac } : {}),
  };
}

const zodiac = { element: 'air', modality: 'fixed', signId: 'aquarius' } as const;
const weekCards = [
  card('major-magician', 1, 'week-start'),
  card('wands-three', 3, 'week-tone', { suit: 'wands' }),
  card('cups-five', 5, 'week-obstacle', { orientation: 'reversed', suit: 'cups' }),
  card('major-strength', 8, 'week-support'),
  card('pentacles-king', 14, 'week-outcome', { suit: 'pentacles' }),
];
const fiveTopicCards = (prefix: string) => [
  card('major-justice', 11, `${prefix}-now`),
  card('swords-two', 2, `${prefix}-strength`, { suit: 'swords' }),
  card('cups-seven', 7, `${prefix}-obstacle`, { orientation: 'reversed', suit: 'cups' }),
  card('pentacles-ace', 1, `${prefix}-opportunity`, { suit: 'pentacles' }),
  card('wands-knight', 12, `${prefix}-step`, { suit: 'wands' }),
];

const allUprightCards = [
  card('major-chariot', 7, 'week-start'),
  card('wands-six', 6, 'week-tone', { suit: 'wands' }),
  card('pentacles-four', 4, 'week-obstacle', { suit: 'pentacles' }),
  card('cups-queen', 13, 'week-support', { suit: 'cups' }),
  card('major-world', 21, 'week-outcome'),
];

const mixedCards = allUprightCards.map((item, index) => ({
  ...item,
  orientation: index % 2 ? ('reversed' as const) : ('upright' as const),
}));

const localizedRequest = (
  id: string,
  locale: InterpretationRequest['locale'],
  tarotInput: InterpretationTarotInput,
  options: Parameters<typeof request>[2] = {},
): InterpretationRequest => ({ ...request(id, tarotInput, options), locale });

export const interpretationFixtures: readonly InterpretationFixture[] = [
  {
    id: 'card-day-without-date',
    request: request('day-no-date', tarot('day', [card('major-hermit', 9, 'day-energy')], 'day')),
    expected: { hasNumerology: false, minimumSections: 3, sources: ['tarot-card'] },
  },
  {
    id: 'card-day-with-date',
    request: request('day-date', tarot('day', [card('major-star', 17, 'day-energy')], 'day'), {
      numerology: numerology(7),
      zodiac,
    }),
    expected: {
      hasNumerology: true,
      minimumSections: 3,
      sources: ['numerology', 'tarot-card', 'zodiac'],
    },
  },
  {
    id: 'week-spread',
    request: request('week', tarot('week', weekCards, 'week'), { numerology: numerology(8) }),
    expected: {
      connectionKinds: ['contrast', 'progression'],
      hasNumerology: true,
      minimumSections: 5,
      sources: ['tarot-card'],
    },
  },
  {
    id: 'month-spread',
    request: request(
      'month',
      tarot(
        'month',
        [
          card('major-wheel', 10, 'month-theme'),
          card('cups-two', 2, 'month-relations', { suit: 'cups' }),
          card('pentacles-eight', 8, 'month-work', { suit: 'pentacles' }),
          card('swords-four', 4, 'month-inner', { suit: 'swords' }),
          card('major-temperance', 14, 'month-advice'),
          card('wands-six', 6, 'month-outcome', { suit: 'wands' }),
        ],
        'month',
      ),
      { numerology: numerology(6) },
    ),
    expected: { hasNumerology: true, minimumSections: 6, sources: ['tarot-card'] },
  },
  {
    id: 'love-spread',
    request: request('love', tarot('love', fiveTopicCards('love'), undefined, 'love'), {
      numerology: numerology(6),
    }),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['psychological-context'] },
  },
  {
    id: 'work-study-spread',
    request: request('work', tarot('work', fiveTopicCards('work'), undefined, 'work'), {
      interests: ['technology', 'learning'],
      numerology: numerology(4),
    }),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['interest', 'tarot-card'] },
  },
  {
    id: 'money-spread',
    request: request('money', tarot('money', fiveTopicCards('money'), undefined, 'money'), {
      numerology: numerology(8),
    }),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['tarot-card'] },
  },
  {
    id: 'decision-spread',
    request: request(
      'decision',
      tarot('decision', fiveTopicCards('decision'), undefined, 'decision'),
      { numerology: numerology(5) },
    ),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['tarot-card'] },
  },
  {
    id: 'master-number-11',
    request: request('master-11', tarot('day', [card('major-justice', 11, 'day-energy')], 'day'), {
      numerology: numerology(11),
    }),
    expected: {
      hasNumerology: true,
      masterNumbers: [11],
      minimumSections: 3,
      sources: ['numerology'],
    },
  },
  {
    id: 'master-number-22',
    request: request('master-22', tarot('day', [card('major-emperor', 4, 'day-energy')], 'day'), {
      numerology: numerology(22),
    }),
    expected: {
      hasNumerology: true,
      masterNumbers: [22],
      minimumSections: 3,
      sources: ['numerology'],
    },
  },
  {
    id: 'reversed-heavy',
    request: request(
      'reversed-heavy',
      tarot(
        'week',
        weekCards.map((item) => ({ ...item, orientation: 'reversed' as const })),
        'week',
      ),
      { numerology: numerology(9) },
    ),
    expected: {
      connectionKinds: ['blockage'],
      hasNumerology: true,
      minimumSections: 5,
      sources: ['tarot-card'],
    },
  },
  {
    id: 'minimal-skipped-optional',
    request: request(
      'minimal',
      tarot('day', [card('cups-ace', 1, 'day-energy', { suit: 'cups' })], 'day'),
      { interests: [], psychology: [] },
    ),
    expected: { hasNumerology: false, minimumSections: 3, sources: ['tarot-card'] },
  },
  {
    id: 'master-number-33',
    request: request('master-33', tarot('day', [card('major-empress', 3, 'day-energy')], 'day'), {
      numerology: numerology(33),
    }),
    expected: {
      hasNumerology: true,
      masterNumbers: [33],
      minimumSections: 3,
      sources: ['numerology'],
    },
  },
  {
    id: 'upright-heavy-week',
    request: request('upright-heavy', tarot('week', allUprightCards, 'week'), {
      numerology: numerology(4),
    }),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['tarot-card'] },
  },
  {
    id: 'mixed-orientations-week',
    request: request('mixed-orientations', tarot('week', mixedCards, 'week'), {
      numerology: numerology(5),
    }),
    expected: {
      connectionKinds: ['unresolved-tension'],
      hasNumerology: true,
      minimumSections: 5,
      sources: ['tarot-card'],
    },
  },
  {
    id: 'major-heavy-month',
    request: request(
      'major-heavy',
      tarot(
        'month',
        [
          card('major-fool', 0, 'month-theme'),
          card('major-emperor', 4, 'month-relations'),
          card('major-hermit', 9, 'month-work'),
          card('major-wheel', 10, 'month-inner'),
          card('major-temperance', 14, 'month-advice'),
          card('major-world', 21, 'month-outcome'),
        ],
        'month',
      ),
      { numerology: numerology(9) },
    ),
    expected: {
      connectionKinds: ['reinforcement'],
      hasNumerology: true,
      minimumSections: 6,
      sources: ['tarot-card'],
    },
  },
  {
    id: 'minor-heavy-month',
    request: request(
      'minor-heavy',
      tarot(
        'month',
        [
          card('cups-ace', 1, 'month-theme', { suit: 'cups' }),
          card('cups-two', 2, 'month-relations', { suit: 'cups' }),
          card('pentacles-eight', 8, 'month-work', { suit: 'pentacles' }),
          card('swords-four', 4, 'month-inner', { suit: 'swords' }),
          card('wands-three', 3, 'month-advice', { suit: 'wands' }),
          card('wands-six', 6, 'month-outcome', { suit: 'wands' }),
        ],
        'month',
      ),
      { numerology: numerology(6) },
    ),
    expected: { hasNumerology: true, minimumSections: 6, sources: ['tarot-card'] },
  },
  {
    id: 'same-suit-sequence',
    request: request(
      'same-suit',
      tarot(
        'week',
        [
          card('cups-ace', 1, 'week-start', { suit: 'cups' }),
          card('cups-three', 3, 'week-tone', { suit: 'cups' }),
          card('cups-five', 5, 'week-obstacle', { suit: 'cups' }),
          card('cups-six', 6, 'week-support', { suit: 'cups' }),
          card('cups-nine', 9, 'week-outcome', { suit: 'cups' }),
        ],
        'week',
      ),
    ),
    expected: {
      connectionKinds: ['reinforcement'],
      hasNumerology: false,
      minimumSections: 5,
      sources: ['tarot-card'],
    },
  },
  {
    id: 'conflicting-suits',
    request: request(
      'suit-conflict',
      tarot(
        'week',
        [
          card('cups-two', 2, 'week-start', { suit: 'cups' }),
          card('wands-two', 2, 'week-tone', { suit: 'wands' }),
          card('pentacles-five', 5, 'week-obstacle', { suit: 'pentacles' }),
          card('swords-five', 5, 'week-support', { suit: 'swords' }),
          card('cups-eight', 8, 'week-outcome', { suit: 'cups' }),
        ],
        'week',
      ),
    ),
    expected: {
      connectionKinds: ['contrast'],
      hasNumerology: false,
      minimumSections: 5,
      sources: ['tarot-card'],
    },
  },
  {
    id: 'court-card-combination',
    request: request(
      'court-cards',
      tarot(
        'love',
        [
          card('cups-page', 11, 'love-you', { suit: 'cups' }),
          card('swords-knight', 12, 'love-dynamic', { suit: 'swords' }),
          card('wands-queen', 13, 'love-link', { suit: 'wands' }),
          card('pentacles-king', 14, 'love-tension', { suit: 'pentacles' }),
          card('major-lovers', 6, 'love-advice'),
        ],
        undefined,
        'love',
      ),
    ),
    expected: {
      connectionKinds: ['opportunity'],
      hasNumerology: false,
      minimumSections: 5,
      sources: ['tarot-card'],
    },
  },
  {
    id: 'compact-year-spread',
    request: request(
      'compact-year',
      tarot(
        'year',
        [
          card('major-emperor', 4, 'year-foundation'),
          card('cups-three', 3, 'year-quarter-one', { suit: 'cups' }),
          card('swords-six', 6, 'year-quarter-two', { suit: 'swords' }),
          card('wands-eight', 8, 'year-quarter-three', { suit: 'wands' }),
          card('pentacles-nine', 9, 'year-quarter-four', { suit: 'pentacles' }),
          card('major-world', 21, 'year-integration'),
        ],
        'year',
      ),
      { numerology: numerology(8) },
    ),
    expected: { hasNumerology: true, minimumSections: 6, sources: ['numerology', 'tarot-card'] },
  },
  {
    id: 'english-card-day',
    request: localizedRequest(
      'en-day',
      'en',
      tarot('day', [card('major-star', 17, 'day-energy')], 'day'),
      { numerology: numerology(7) },
    ),
    expected: { hasNumerology: true, minimumSections: 3, sources: ['tarot-card'] },
  },
  {
    id: 'english-work-spread',
    request: localizedRequest(
      'en-work',
      'en',
      tarot('work', fiveTopicCards('work'), undefined, 'work'),
      { interests: ['technology'], numerology: numerology(4) },
    ),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['interest', 'tarot-card'] },
  },
  {
    id: 'english-money-sensitive',
    request: localizedRequest(
      'en-money',
      'en',
      tarot('money', fiveTopicCards('money'), undefined, 'money'),
      { numerology: numerology(8) },
    ),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['psychological-context'] },
  },
  {
    id: 'ukrainian-card-day',
    request: localizedRequest(
      'uk-day',
      'uk',
      tarot('day', [card('major-hermit', 9, 'day-energy')], 'day'),
      { numerology: numerology(9) },
    ),
    expected: { hasNumerology: true, minimumSections: 3, sources: ['tarot-card'] },
  },
  {
    id: 'ukrainian-love-sensitive',
    request: localizedRequest(
      'uk-love',
      'uk',
      tarot('love', fiveTopicCards('love'), undefined, 'love'),
      { numerology: numerology(6) },
    ),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['psychological-context'] },
  },
  {
    id: 'ukrainian-decision-spread',
    request: localizedRequest(
      'uk-decision',
      'uk',
      tarot('decision', fiveTopicCards('decision'), undefined, 'decision'),
      { interests: ['travel'], numerology: numerology(5) },
    ),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['interest', 'tarot-card'] },
  },
  {
    id: 'no-psychology-context',
    request: request('no-psychology', tarot('week', weekCards, 'week'), {
      psychology: [],
      numerology: numerology(3),
    }),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['tarot-card'] },
  },
  {
    id: 'no-interests',
    request: request(
      'no-interests',
      tarot('decision', fiveTopicCards('decision'), undefined, 'decision'),
      { interests: [], numerology: numerology(2) },
    ),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['psychological-context'] },
  },
  {
    id: 'long-russian-content',
    request: {
      ...request(
        'long-ru',
        tarot(
          'month',
          [
            card('major-high-priestess', 2, 'month-theme'),
            card('cups-queen', 13, 'month-relations', { suit: 'cups' }),
            card('pentacles-king', 14, 'month-work', { suit: 'pentacles' }),
            card('swords-nine', 9, 'month-inner', { orientation: 'reversed', suit: 'swords' }),
            card('major-temperance', 14, 'month-advice'),
            card('major-world', 21, 'month-outcome'),
          ],
          'month',
        ),
        { interests: ['creativity'], numerology: numerology(11), zodiac },
      ),
      customInterest: 'исследование сложных систем',
    },
    expected: {
      hasNumerology: true,
      masterNumbers: [11],
      minimumSections: 6,
      sources: ['interest', 'zodiac'],
    },
  },
  {
    id: 'sensitive-love-context',
    request: request('sensitive-love', tarot('love', fiveTopicCards('love'), undefined, 'love'), {
      psychology: psychologyAnswers.map((item) =>
        item.questionId === 'current-focus' ? { ...item, optionId: 'relationships' } : item,
      ),
      numerology: numerology(6),
    }),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['psychological-context'] },
  },
  {
    id: 'sensitive-money-context',
    request: request(
      'sensitive-money',
      tarot('money', fiveTopicCards('money'), undefined, 'money'),
      {
        psychology: psychologyAnswers.map((item) =>
          item.questionId === 'current-focus' ? { ...item, optionId: 'money' } : item,
        ),
        numerology: numerology(8),
      },
    ),
    expected: { hasNumerology: true, minimumSections: 5, sources: ['psychological-context'] },
  },
  {
    id: 'full-five-card-result',
    request: request('full-five', tarot('decision', mixedCards, undefined, 'decision'), {
      interests: ['music'],
      numerology: numerology(22),
      zodiac,
    }),
    expected: {
      hasNumerology: true,
      masterNumbers: [22],
      minimumSections: 5,
      sources: ['interest', 'numerology', 'psychological-context', 'tarot-card', 'zodiac'],
    },
  },
];
