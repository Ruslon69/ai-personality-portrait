import type {
  JourneyMemoryCard,
  JourneyMemorySource,
  JourneyMilestoneType,
  JourneyPatternRelation,
  JourneyRecommendationCategory,
  JourneyThemeTrend,
} from '../types';

export type JourneyMemoryFixture = {
  expected: {
    entryCount: number;
    milestone?: JourneyMilestoneType;
    numberCompatibility?: 'compatible' | 'incompatible' | 'separate-lineage';
    patternRelation?: JourneyPatternRelation;
    recurringTheme?: string;
    trend?: JourneyThemeTrend;
    yearCount?: number;
  };
  generatedAt: string;
  id: string;
  sources: readonly JourneyMemorySource[];
};

const generatedAt = '2026-12-31T12:00:00.000Z';

function card(id: string, options: Partial<JourneyMemoryCard> = {}): JourneyMemoryCard {
  return {
    arcana: options.arcana ?? 'major',
    id,
    number: options.number ?? 17,
    orientation: options.orientation ?? 'upright',
    positionId: options.positionId ?? 'main',
    reversedMode:
      options.reversedMode ?? (options.orientation === 'reversed' ? 'reassessment' : null),
    suit: options.suit ?? null,
  };
}

function source(
  id: string,
  createdAt: string,
  options: {
    bookmarked?: boolean;
    calculationSystem?: string;
    cards?: readonly JourneyMemoryCard[];
    engineVersion?: string;
    headline?: string;
    number?: number;
    numberId?: string;
    period?: JourneyMemorySource['period'];
    practical?: JourneyRecommendationCategory;
    spreadId?: string;
    supportingThemes?: readonly string[];
    theme?: string;
    topic?: JourneyMemorySource['topic'];
  } = {},
): JourneyMemorySource {
  const theme = options.theme ?? `theme.card.${options.cards?.[0]?.id ?? 'major-star'}`;
  const cards = options.cards ?? [card('major-star')];
  const practical = options.practical ?? 'experimentation';
  const number = options.number ?? 5;
  const numberId = options.numberId ?? 'personal-year';
  return {
    bookmarked: options.bookmarked ?? false,
    cards,
    createdAt,
    engineVersions: {
      expertInterpretation: options.engineVersion ?? 'expert-interpretation-v1',
      numerology: options.calculationSystem ?? 'pythagorean-date-v1',
    },
    headline: options.headline ?? `Reading ${id}`,
    id,
    kind: 'tarot-reading',
    locale: 'ru',
    numbers: [
      {
        calculationId: numberId,
        systemVersion: options.calculationSystem ?? 'pythagorean-date-v1',
        value: number,
      },
    ],
    period: options.period ?? 'week',
    practicalFocuses: [
      {
        category: practical,
        semanticId: `practical.${practical}`,
        sourceIds: ['tarot-card'],
        text: `Practical focus ${practical}`,
      },
    ],
    quoteSources: [
      {
        id: `quote:${id}`,
        kind: 'authored-section',
        strength: 'primary',
        text: `A stable quote candidate for ${id}`,
      },
    ],
    readingType: options.spreadId ?? 'week',
    reflections: [
      {
        semanticId: `reflection.${theme}`,
        sourceIds: ['tarot-card'],
        text: `Reflection for ${theme}`,
      },
    ],
    sourceReferences: [
      { id: `reading:${id}`, kind: 'reading', source: 'journey' },
      { id: `theme:${theme}`, kind: 'theme', source: 'tarot-card' },
    ],
    spreadId: options.spreadId ?? 'week',
    themes: [
      {
        cardIds: cards.map((item) => item.id),
        numberValues: [number],
        role: 'leading',
        semanticId: theme,
        sourceIds: ['tarot-card'],
      },
      ...(options.supportingThemes ?? []).map((semanticId) => ({
        cardIds: [] as readonly string[],
        numberValues: [] as readonly number[],
        role: 'supporting' as const,
        semanticId,
        sourceIds: ['tarot-position' as const],
      })),
    ],
    topic: options.topic ?? null,
    zodiac: null,
  };
}

const repeatedTheme = 'theme.context.decision';
const distinct = (count: number, start = 1) =>
  Array.from({ length: count }, (_, index) =>
    source(
      `distinct-${start + index}`,
      `2026-${String(start + index).padStart(2, '0')}-01T10:00:00.000Z`,
      { theme: `theme.unique.${start + index}` },
    ),
  );

export const journeyMemoryFixtures: readonly JourneyMemoryFixture[] = [
  { id: 'empty-journey', generatedAt, sources: [], expected: { entryCount: 0, yearCount: 0 } },
  {
    id: 'one-reading',
    generatedAt,
    sources: [source('one', '2026-01-01T10:00:00.000Z')],
    expected: { entryCount: 1, milestone: 'first-reading', yearCount: 1 },
  },
  {
    id: 'two-unrelated',
    generatedAt,
    sources: [
      source('unrelated-a', '2026-01-01T10:00:00.000Z', { theme: 'theme.a' }),
      source('unrelated-b', '2026-01-08T10:00:00.000Z', { theme: 'theme.b' }),
    ],
    expected: { entryCount: 2 },
  },
  {
    id: 'repeated-theme',
    generatedAt,
    sources: [
      source('repeat-a', '2026-01-01T10:00:00.000Z', { theme: repeatedTheme }),
      source('repeat-b', '2026-01-08T10:00:00.000Z', {
        spreadId: 'decision',
        theme: repeatedTheme,
      }),
    ],
    expected: { entryCount: 2, recurringTheme: repeatedTheme, trend: 'emerging' },
  },
  {
    id: 'intensifying-theme',
    generatedAt,
    sources: [
      source('intense-a', '2026-01-01T10:00:00.000Z', { theme: repeatedTheme }),
      source('intense-b', '2026-01-08T10:00:00.000Z', { theme: repeatedTheme }),
      source('intense-c', '2026-01-15T10:00:00.000Z', { theme: repeatedTheme }),
    ],
    expected: { entryCount: 3, recurringTheme: repeatedTheme, trend: 'intensifying' },
  },
  {
    id: 'fading-theme',
    generatedAt,
    sources: [
      source('fade-a', '2026-01-01T10:00:00.000Z', { theme: repeatedTheme }),
      source('fade-b', '2026-01-08T10:00:00.000Z', { theme: repeatedTheme }),
      source('fade-c', '2026-01-15T10:00:00.000Z', { theme: 'theme.other' }),
    ],
    expected: { entryCount: 3, recurringTheme: repeatedTheme, trend: 'fading' },
  },
  {
    id: 'resolved-theme',
    generatedAt,
    sources: [
      source('resolve-a', '2026-01-01T10:00:00.000Z', { theme: repeatedTheme }),
      source('resolve-b', '2026-01-08T10:00:00.000Z', { theme: repeatedTheme }),
      source('resolve-c', '2026-01-15T10:00:00.000Z', { theme: 'theme.c' }),
      source('resolve-d', '2026-01-22T10:00:00.000Z', { theme: 'theme.d' }),
      source('resolve-e', '2026-01-29T10:00:00.000Z', { theme: 'theme.e' }),
    ],
    expected: {
      entryCount: 5,
      recurringTheme: repeatedTheme,
      trend: 'resolved',
      milestone: 'first-resolved-theme',
    },
  },
  {
    id: 'repeated-major-arcana',
    generatedAt,
    sources: [
      source('major-a', '2026-01-01T10:00:00.000Z', {
        cards: [card('major-hermit', { number: 9 })],
      }),
      source('major-b', '2026-02-01T10:00:00.000Z', {
        cards: [card('major-hermit', { number: 9, positionId: 'support' })],
      }),
    ],
    expected: { entryCount: 2, patternRelation: 'progression', milestone: 'first-repeated-card' },
  },
  {
    id: 'repeated-suit',
    generatedAt,
    sources: [
      source('suit-a', '2026-01-01T10:00:00.000Z', {
        cards: [card('cups-two', { arcana: 'minor', number: 2, suit: 'cups' })],
      }),
      source('suit-b', '2026-01-08T10:00:00.000Z', {
        cards: [card('cups-six', { arcana: 'minor', number: 6, suit: 'cups' })],
      }),
    ],
    expected: { entryCount: 2, patternRelation: 'recurrence' },
  },
  {
    id: 'reversed-pattern',
    generatedAt,
    sources: [
      source('reverse-a', '2026-01-01T10:00:00.000Z', {
        cards: [card('major-moon', { orientation: 'reversed', reversedMode: 'reassessment' })],
      }),
      source('reverse-b', '2026-01-08T10:00:00.000Z', {
        cards: [card('major-hermit', { orientation: 'reversed', reversedMode: 'reassessment' })],
      }),
    ],
    expected: { entryCount: 2, patternRelation: 'unresolved-sequence' },
  },
  ...([11, 22, 33] as const).map((number) => ({
    id: `master-number-${number}`,
    generatedAt,
    sources: [
      source(`master-${number}`, '2026-02-01T10:00:00.000Z', { number, numberId: 'life-path' }),
    ],
    expected: {
      entryCount: 1,
      milestone: 'first-master-number' as const,
      numberCompatibility: 'compatible' as const,
    },
  })),
  {
    id: 'personal-year-transition',
    generatedAt,
    sources: [
      source('year-a', '2026-01-01T10:00:00.000Z', { number: 4 }),
      source('year-b', '2027-01-01T10:00:00.000Z', { number: 5 }),
    ],
    expected: {
      entryCount: 2,
      milestone: 'first-year-transition',
      numberCompatibility: 'compatible',
      yearCount: 2,
    },
  },
  {
    id: 'same-month-focus',
    generatedAt,
    sources: [
      source('month-a', '2026-03-01T10:00:00.000Z', { practical: 'planning' }),
      source('month-b', '2026-03-20T10:00:00.000Z', { practical: 'planning' }),
    ],
    expected: { entryCount: 2 },
  },
  {
    id: 'bookmarked-chapter',
    generatedAt,
    sources: [source('bookmark', '2026-04-01T10:00:00.000Z', { bookmarked: true })],
    expected: { entryCount: 1, milestone: 'first-bookmarked-chapter' },
  },
  {
    id: 'ten-readings',
    generatedAt,
    sources: distinct(10),
    expected: { entryCount: 10, milestone: 'tenth-reading' },
  },
  {
    id: 'long-pause-return',
    generatedAt,
    sources: [
      source('pause-a', '2026-01-01T10:00:00.000Z'),
      source('pause-b', '2026-04-15T10:00:00.000Z', { theme: 'theme.return' }),
    ],
    expected: { entryCount: 2, milestone: 'return-after-long-pause' },
  },
  {
    id: 'multiple-spreads-same-theme',
    generatedAt,
    sources: [
      source('spread-a', '2026-01-01T10:00:00.000Z', { spreadId: 'week', theme: repeatedTheme }),
      source('spread-b', '2026-02-01T10:00:00.000Z', {
        spreadId: 'love',
        theme: repeatedTheme,
        topic: 'love',
      }),
    ],
    expected: { entryCount: 2, recurringTheme: repeatedTheme },
  },
  {
    id: 'same-headline-different-theme',
    generatedAt,
    sources: [
      source('headline-a', '2026-01-01T10:00:00.000Z', {
        headline: 'Same headline',
        theme: 'theme.alpha',
      }),
      source('headline-b', '2026-01-08T10:00:00.000Z', {
        headline: 'Same headline',
        theme: 'theme.beta',
      }),
    ],
    expected: { entryCount: 2 },
  },
  {
    id: 'duplicate-serialized-entry',
    generatedAt,
    sources: (() => {
      const duplicate = source('duplicate', '2026-01-01T10:00:00.000Z');
      return [duplicate, { ...duplicate }];
    })(),
    expected: { entryCount: 1 },
  },
  {
    id: 'different-engine-versions',
    generatedAt,
    sources: [
      source('version-a', '2026-01-01T10:00:00.000Z', {
        calculationSystem: 'pythagorean-date-v1',
        engineVersion: 'expert-interpretation-v1',
      }),
      source('version-b', '2026-02-01T10:00:00.000Z', {
        calculationSystem: 'pythagorean-date-v2',
        engineVersion: 'expert-interpretation-v2',
      }),
    ],
    expected: { entryCount: 2, numberCompatibility: 'separate-lineage' },
  },
  {
    id: 'multi-year-journey',
    generatedAt,
    sources: [
      source('multi-2025', '2025-12-15T10:00:00.000Z'),
      source('multi-2026', '2026-06-15T10:00:00.000Z', { theme: 'theme.mid' }),
      source('multi-2027', '2027-01-15T10:00:00.000Z', { theme: 'theme.next' }),
    ],
    expected: { entryCount: 3, yearCount: 3 },
  },
  {
    id: 'minimal-skipped-optional',
    generatedAt,
    sources: [
      {
        ...source('minimal', '2026-05-01T10:00:00.000Z'),
        cards: [],
        numbers: [],
        practicalFocuses: [],
        reflections: [],
        zodiac: null,
      },
    ],
    expected: { entryCount: 1 },
  },
];
