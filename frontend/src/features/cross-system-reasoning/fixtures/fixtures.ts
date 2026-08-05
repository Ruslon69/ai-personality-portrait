import { composeInterpretationThemes } from '@features/expert-interpretation/composition';
import { buildInterpretationContext } from '@features/expert-interpretation/context';
import { normalizeInterpretationEvidence } from '@features/expert-interpretation/evidence';
import { resolveInterpretationConnections } from '@features/expert-interpretation/rules';
import type {
  InterpretationNumerologyInput,
  InterpretationPsychologicalAnswer,
  InterpretationRequest,
  InterpretationTarotCardInput,
} from '@features/expert-interpretation';
import { EXPERT_INTERPRETATION_VERSIONS } from '@features/expert-interpretation/constants/versions';
import { buildJourneyMemorySnapshot, type JourneyMemorySource } from '@features/journey-memory';
import type { CrossSystemExclusionReason, CrossSystemInput } from '../types';

export type CrossSystemFixture = {
  expected: {
    contrast?: boolean;
    journeyTrend?: string;
    minimumLinks?: number;
    rejectedReason?: CrossSystemExclusionReason;
  };
  id: string;
  input: CrossSystemInput;
};

const generatedAt = '2026-08-05T10:00:00.000Z';

function card(
  id: string,
  number: number,
  positionId: string,
  themes: readonly string[],
  options: Partial<InterpretationTarotCardInput> = {},
): InterpretationTarotCardInput {
  const arcana = options.arcana ?? (id.startsWith('major-') ? 'major' : 'minor');
  return {
    arcana,
    baseThemeIds: themes,
    id,
    number,
    orientation: options.orientation ?? 'upright',
    positionId,
    ...(arcana === 'minor' ? { suit: options.suit ?? 'wands' } : {}),
  };
}

function numerology(
  values: Partial<Record<InterpretationNumerologyInput['numbers'][number]['id'], number>>,
) {
  const entries = Object.entries(values) as readonly [
    InterpretationNumerologyInput['numbers'][number]['id'],
    number,
  ][];
  return {
    masterNumbers: entries
      .map(([, value]) => value)
      .filter((value) => [11, 22, 33].includes(value)),
    numbers: entries.map(([id, value]) => ({
      id,
      sourceDigits: String(value).split('').map(Number),
      value,
    })),
    system: 'pythagorean-date-v1' as const,
  };
}

function request(input: {
  cards?: readonly InterpretationTarotCardInput[];
  interests?: readonly string[];
  numerology?: InterpretationNumerologyInput;
  period?: InterpretationRequest['tarot']['period'];
  psychology?: readonly InterpretationPsychologicalAnswer[];
  seed: string;
  topic?: InterpretationRequest['tarot']['topic'];
  zodiac?: InterpretationRequest['zodiac'];
}): InterpretationRequest {
  const cards = input.cards ?? [card('major-magician', 1, 'current', ['action', 'focus'])];
  return {
    generatedAt,
    interests: input.interests ?? [],
    locale: 'ru',
    ...(input.numerology ? { numerology: input.numerology } : {}),
    psychologyAnswers: input.psychology ?? [],
    seed: input.seed,
    tarot: {
      cards,
      deckTheme: 'cosmic-minimal',
      leadingCardId: cards[0]?.id ?? '',
      ...(input.period ? { period: input.period } : {}),
      spreadId: input.topic ?? input.period ?? 'generic',
      ...(input.topic ? { topic: input.topic } : {}),
    },
    ...(input.zodiac ? { zodiac: input.zodiac } : {}),
  };
}

function journeySource(input: {
  cardId?: string;
  createdAt: string;
  id: string;
  practical?: JourneyMemorySource['practicalFocuses'][number]['category'];
  system?: string;
  theme: string;
}): JourneyMemorySource {
  const cardId = input.cardId ?? 'major-magician';
  const practical = input.practical ?? 'decision';
  return {
    bookmarked: false,
    cards: [
      {
        arcana: 'major',
        id: cardId,
        number: 1,
        orientation: 'upright',
        positionId: 'current',
        reversedMode: null,
        suit: null,
      },
    ],
    createdAt: input.createdAt,
    engineVersions: {
      expertInterpretation: 'expert-interpretation-v1',
      numerology: input.system ?? 'pythagorean-date-v1',
    },
    headline: `Fixture ${input.id}`,
    id: input.id,
    kind: 'tarot-reading',
    locale: 'ru',
    numbers: [
      {
        calculationId: 'personal-year',
        systemVersion: input.system ?? 'pythagorean-date-v1',
        value: input.id.endsWith('b') ? 2 : 1,
      },
    ],
    period: 'week',
    practicalFocuses: [
      {
        category: practical,
        semanticId: `practical.${practical}`,
        sourceIds: ['tarot-position'],
        text: `Fixture practical ${practical}`,
      },
    ],
    quoteSources: [],
    readingType: 'week',
    reflections: [],
    sourceReferences: [{ id: input.id, kind: 'reading', source: 'journey' }],
    spreadId: 'week',
    themes: [
      {
        cardIds: [cardId],
        numberValues: [1],
        role: 'leading',
        semanticId: input.theme,
        sourceIds: ['tarot-card'],
      },
    ],
    topic: null,
    zodiac: null,
  };
}

function journeySnapshot(input: {
  incompatible?: boolean;
  practical?: JourneyMemorySource['practicalFocuses'][number]['category'];
  repeatedCard?: boolean;
  theme: string;
  trend: 'emerging' | 'fading' | 'intensifying' | 'resolved';
}) {
  const themeEntries = input.trend === 'intensifying' ? 3 : 2;
  const missed = input.trend === 'resolved' ? 3 : input.trend === 'fading' ? 1 : 0;
  const sources: JourneyMemorySource[] = Array.from({ length: themeEntries }, (_, index) =>
    journeySource({
      cardId: input.repeatedCard ? 'major-magician' : `major-${index ? 'chariot' : 'magician'}`,
      createdAt: `2026-0${index + 1}-01T10:00:00.000Z`,
      id: `journey-theme-${index}${index === 1 ? 'b' : 'a'}`,
      practical: input.practical,
      system: input.incompatible && index === 1 ? 'future-system-v2' : undefined,
      theme: input.theme,
    }),
  );
  Array.from({ length: missed }, (_, index) => index).forEach((index) =>
    sources.push(
      journeySource({
        createdAt: `2026-0${themeEntries + index + 1}-01T10:00:00.000Z`,
        id: `journey-missed-${index}`,
        theme: `theme.other.${index}`,
      }),
    ),
  );
  return buildJourneyMemorySnapshot({ generatedAt, locale: 'ru', sources });
}

export function createCrossSystemInput(
  interpretationRequest: InterpretationRequest,
  journeyMemory: CrossSystemInput['journeyMemory'] = null,
): CrossSystemInput {
  const context = buildInterpretationContext(interpretationRequest);
  const evidence = normalizeInterpretationEvidence(context);
  const connections = resolveInterpretationConnections(context, evidence);
  const composition = composeInterpretationThemes(context, evidence, connections);
  return {
    composition,
    connections,
    context,
    evidence,
    journeyMemory,
    sourceEngineVersions: EXPERT_INTERPRETATION_VERSIONS,
  };
}

const magician = card('major-magician', 1, 'current', ['action', 'focus']);
const hanged = card('major-hanged-man', 12, 'advice', ['pause', 'reflection'], {
  orientation: 'reversed',
});
const fool = card('major-fool', 0, 'current', ['freedom', 'change']);
const emperor = card('major-emperor', 4, 'support', ['structure', 'stability']);
const lovers = card('major-lovers', 6, 'current', ['connection', 'decision']);
const minorCards = [
  card('wands-ace', 1, 'current', ['action', 'movement'], { arcana: 'minor', suit: 'wands' }),
  card('cups-two', 2, 'hidden', ['connection', 'reflection'], { arcana: 'minor', suit: 'cups' }),
  card('swords-three', 3, 'obstacle', ['clarity', 'uncertainty'], {
    arcana: 'minor',
    suit: 'swords',
  }),
];
const pausePsychology = [
  { optionId: 'pause', questionId: 'decision-style' },
  { optionId: 'wait', questionId: 'uncertainty' },
] as const;
const actionPsychology = [
  { optionId: 'test', questionId: 'decision-style' },
  { optionId: 'move', questionId: 'uncertainty' },
] as const;

function fixture(
  id: string,
  interpretationRequest: InterpretationRequest,
  expected: CrossSystemFixture['expected'] = {},
  journey: CrossSystemInput['journeyMemory'] = null,
): CrossSystemFixture {
  return { expected, id, input: createCrossSystemInput(interpretationRequest, journey) };
}

const fullNumerology = numerology({
  birthday: 5,
  'first-impression': 6,
  'life-path': 1,
  'personal-day': 3,
  'personal-month': 8,
  'personal-year': 4,
});

export const crossSystemFixtures: readonly CrossSystemFixture[] = [
  fixture('tarot-only', request({ cards: [magician], seed: 'tarot-only' })),
  fixture(
    'tarot-life-path',
    request({ cards: [magician], numerology: numerology({ 'life-path': 1 }), seed: 'life-path' }),
    { minimumLinks: 1 },
  ),
  fixture(
    'tarot-personal-year',
    request({
      cards: [emperor],
      numerology: numerology({ 'personal-year': 4 }),
      seed: 'personal-year',
    }),
    { minimumLinks: 1 },
  ),
  fixture(
    'tarot-master-11',
    request({
      cards: [card('major-justice', 11, 'current', ['clarity', 'balance'])],
      numerology: numerology({ 'life-path': 11 }),
      seed: 'master-11',
    }),
    { minimumLinks: 1 },
  ),
  fixture(
    'tarot-master-22',
    request({
      cards: [card('major-world', 21, 'current', ['completion', 'structure'])],
      numerology: numerology({ 'life-path': 22 }),
      seed: 'master-22',
    }),
    { minimumLinks: 1 },
  ),
  fixture(
    'tarot-master-33',
    request({
      cards: [card('major-temperance', 14, 'current', ['balance', 'support'])],
      numerology: numerology({ 'life-path': 33 }),
      seed: 'master-33',
    }),
    { minimumLinks: 1 },
  ),
  fixture(
    'tarot-psychological-convergence',
    request({ cards: [hanged], psychology: pausePsychology, seed: 'psych-convergence' }),
    { minimumLinks: 1 },
  ),
  fixture(
    'tarot-psychological-contrast',
    request({ cards: [magician], psychology: pausePsychology, seed: 'psych-contrast' }),
    { contrast: true },
  ),
  fixture(
    'tarot-interests-only',
    request({ cards: [magician], interests: ['technology'], seed: 'interests' }),
  ),
  fixture(
    'tarot-zodiac-only',
    request({
      cards: [magician],
      seed: 'zodiac',
      zodiac: { element: 'fire', modality: 'cardinal', signId: 'aries' },
    }),
  ),
  fixture(
    'full-context',
    request({
      cards: [magician, hanged, emperor],
      interests: ['learning'],
      numerology: fullNumerology,
      psychology: pausePsychology,
      seed: 'full',
      topic: 'decision',
      zodiac: { element: 'earth', modality: 'fixed', signId: 'taurus' },
    }),
    { contrast: true, minimumLinks: 2 },
    journeySnapshot({ theme: 'theme.context.action', trend: 'emerging' }),
  ),
  fixture(
    'no-birth-date',
    request({ cards: [magician], psychology: actionPsychology, seed: 'no-birth' }),
  ),
  fixture(
    'no-psychology',
    request({ cards: [emperor], numerology: fullNumerology, seed: 'no-psychology' }),
    { minimumLinks: 1 },
  ),
  fixture(
    'no-journey-history',
    request({ cards: [magician], numerology: fullNumerology, seed: 'no-journey' }),
    { minimumLinks: 1 },
  ),
  fixture(
    'journey-recurring-theme',
    request({ cards: [magician], seed: 'journey-recurring' }),
    { journeyTrend: 'emerging', minimumLinks: 1 },
    journeySnapshot({ theme: 'theme.context.action', trend: 'emerging' }),
  ),
  fixture(
    'journey-emerging-theme',
    request({ cards: [magician], seed: 'journey-emerging' }),
    { journeyTrend: 'emerging', minimumLinks: 1 },
    journeySnapshot({ theme: 'theme.context.action', trend: 'emerging' }),
  ),
  fixture(
    'journey-fading-theme',
    request({ cards: [magician], seed: 'journey-fading' }),
    { journeyTrend: 'fading', minimumLinks: 1 },
    journeySnapshot({ theme: 'theme.context.action', trend: 'fading' }),
  ),
  fixture(
    'journey-resolved-theme',
    request({ cards: [magician], seed: 'journey-resolved' }),
    { journeyTrend: 'resolved', minimumLinks: 1 },
    journeySnapshot({ theme: 'theme.context.action', trend: 'resolved' }),
  ),
  fixture(
    'journey-repeated-card',
    request({ cards: [magician], seed: 'journey-card' }),
    { minimumLinks: 1 },
    journeySnapshot({ repeatedCard: true, theme: 'theme.context.action', trend: 'emerging' }),
  ),
  fixture(
    'journey-repeated-practical-focus',
    request({ cards: [magician], seed: 'journey-practical' }),
    { minimumLinks: 1 },
    journeySnapshot({ practical: 'decision', theme: 'theme.context.action', trend: 'emerging' }),
  ),
  fixture(
    'movement-pause-contrast',
    request({ cards: [magician], psychology: pausePsychology, seed: 'movement-pause' }),
    { contrast: true },
  ),
  fixture(
    'freedom-structure-contrast',
    request({
      cards: [fool],
      numerology: numerology({ 'personal-year': 4 }),
      seed: 'freedom-structure',
    }),
    { contrast: true },
  ),
  fixture(
    'connection-boundaries-contrast',
    request({
      cards: [lovers],
      psychology: [{ optionId: 'space', questionId: 'change-response' }],
      seed: 'connection-boundaries',
    }),
    { contrast: true },
  ),
  fixture(
    'action-reassessment-contrast',
    request({ cards: [hanged], psychology: actionPsychology, seed: 'action-reassessment' }),
    { contrast: true },
  ),
  fixture(
    'duplicate-dependent-signals',
    request({
      cards: [magician, card('major-chariot', 7, 'support', ['action', 'movement'])],
      seed: 'dependent',
    }),
    { rejectedReason: 'dependent-sources' },
  ),
  fixture(
    'artificial-number-coincidence',
    request({
      cards: [hanged],
      numerology: numerology({ 'life-path': 3 }),
      seed: 'artificial-number',
    }),
    { rejectedReason: 'artificial-connection' },
  ),
  fixture(
    'weak-zodiac-connection',
    request({
      cards: [fool],
      seed: 'weak-zodiac',
      zodiac: { element: 'water', modality: 'fixed', signId: 'scorpio' },
    }),
  ),
  fixture(
    'incompatible-engine-versions',
    request({ cards: [magician], seed: 'incompatible' }),
    { rejectedReason: 'incompatible-lineage' },
    journeySnapshot({ incompatible: true, theme: 'theme.context.action', trend: 'emerging' }),
  ),
  {
    id: 'missing-provenance',
    expected: { rejectedReason: 'missing-provenance' },
    input: {
      ...createCrossSystemInput(
        request({
          cards: [magician],
          numerology: numerology({ 'life-path': 1 }),
          seed: 'missing-provenance',
        }),
      ),
      evidence: [],
    },
  },
  fixture(
    'reversed-heavy-spread',
    request({
      cards: [magician, hanged, { ...emperor, orientation: 'reversed' }],
      numerology: fullNumerology,
      seed: 'reversed-heavy',
      period: 'week',
    }),
    { contrast: true },
  ),
  fixture(
    'major-heavy-spread',
    request({
      cards: [magician, hanged, emperor, fool, lovers],
      numerology: fullNumerology,
      seed: 'major-heavy',
      period: 'month',
    }),
    { minimumLinks: 2 },
  ),
  fixture(
    'minor-heavy-spread',
    request({
      cards: minorCards,
      numerology: numerology({ 'personal-year': 3 }),
      seed: 'minor-heavy',
      period: 'week',
    }),
  ),
  fixture(
    'love-spread',
    request({
      cards: [lovers, emperor, hanged],
      numerology: numerology({ 'life-path': 6 }),
      seed: 'love',
      topic: 'love',
    }),
    { minimumLinks: 1 },
  ),
  fixture(
    'money-spread',
    request({
      cards: [emperor, magician],
      numerology: numerology({ 'personal-year': 8 }),
      seed: 'money',
      topic: 'money',
    }),
    { minimumLinks: 1 },
  ),
  fixture(
    'decision-spread',
    request({
      cards: [magician, hanged],
      numerology: numerology({ 'personal-year': 1 }),
      seed: 'decision',
      topic: 'decision',
    }),
    { minimumLinks: 1 },
  ),
  fixture(
    'week-spread',
    request({
      cards: [magician, hanged, emperor],
      numerology: fullNumerology,
      period: 'week',
      seed: 'week',
    }),
    { minimumLinks: 2 },
  ),
  fixture(
    'month-spread',
    request({
      cards: [emperor, hanged, magician],
      numerology: fullNumerology,
      period: 'month',
      seed: 'month',
    }),
    { minimumLinks: 2 },
  ),
  fixture(
    'year-spread',
    request({
      cards: [fool, emperor, lovers],
      numerology: fullNumerology,
      period: 'year',
      seed: 'year',
    }),
    { minimumLinks: 2 },
  ),
  fixture(
    'same-input-determinism',
    request({
      cards: [magician, emperor],
      numerology: fullNumerology,
      psychology: actionPsychology,
      seed: 'determinism',
    }),
    { minimumLinks: 1 },
  ),
  fixture(
    'different-topic-love',
    request({
      cards: [lovers, emperor],
      numerology: numerology({ 'life-path': 6 }),
      seed: 'topic-base',
      topic: 'love',
    }),
    { minimumLinks: 1 },
  ),
  fixture(
    'different-topic-money',
    request({
      cards: [lovers, emperor],
      numerology: numerology({ 'life-path': 6 }),
      seed: 'topic-base',
      topic: 'money',
    }),
    { minimumLinks: 1 },
  ),
  fixture(
    'different-period-one',
    request({
      cards: [magician, emperor],
      numerology: numerology({ 'personal-year': 1 }),
      seed: 'period-base',
      period: 'year',
    }),
    { minimumLinks: 1 },
  ),
  fixture(
    'different-period-four',
    request({
      cards: [magician, emperor],
      numerology: numerology({ 'personal-year': 4 }),
      seed: 'period-base',
      period: 'year',
    }),
    { minimumLinks: 1 },
  ),
  fixture(
    'journey-mode-integration',
    request({ cards: [magician, hanged], numerology: fullNumerology, seed: 'journey-mode' }),
    { journeyTrend: 'intensifying', minimumLinks: 1 },
    journeySnapshot({ theme: 'theme.context.action', trend: 'intensifying' }),
  ),
];
