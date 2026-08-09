import type { InterpretationSource } from '@features/expert-interpretation';
import type {
  TarotArcana,
  TarotOrientation,
  TarotPeriod,
  TarotSuit,
  TarotTopic,
} from '@features/tarot';
import type { Locale } from '@shared/i18n';

export type JourneyMemoryEntryKind = 'personality-profile' | 'tarot-reading';
export type JourneyMemorySignalSource = InterpretationSource | 'personality-profile';
export type JourneyThemeTrend =
  'emerging' | 'fading' | 'intensifying' | 'isolated' | 'recurring' | 'resolved' | 'stable';
export type JourneyPatternRelation =
  'contrast' | 'interruption' | 'progression' | 'recurrence' | 'unresolved-sequence';
export type JourneyRecommendationCategory =
  | 'boundaries'
  | 'completion'
  | 'conversation'
  | 'decision'
  | 'experimentation'
  | 'pause'
  | 'planning'
  | 'recovery'
  | 'support-seeking';
export type JourneyTransitionType =
  | 'card-pattern-shifted'
  | 'life-cycle-transition'
  | 'numerology-period-changed'
  | 'pinnacle-transition'
  | 'practical-focus-changed'
  | 'same-theme-new-expression'
  | 'theme-intensified'
  | 'theme-weakened'
  | 'topic-changed'
  | 'unresolved-theme-returned';
export type JourneyTransitionConfidence = 'direct' | 'structural' | 'contextual';
export type JourneyChapterTitleCategory =
  | 'beginning'
  | 'boundary'
  | 'choice'
  | 'completion'
  | 'growth'
  | 'inner-focus'
  | 'money'
  | 'new-cycle'
  | 'pause'
  | 'relationship'
  | 'return'
  | 'transition'
  | 'work';
export type JourneyMilestoneType =
  | 'first-bookmarked-chapter'
  | 'first-master-number'
  | 'first-month-completed'
  | 'first-life-cycle-transition'
  | 'first-pinnacle-transition'
  | 'first-reading'
  | 'first-recurring-theme'
  | 'first-repeated-card'
  | 'first-resolved-theme'
  | 'first-year-transition'
  | 'return-after-long-pause'
  | 'tenth-reading';

export type JourneyMemorySourceReference = {
  id: string;
  kind: 'authored-section' | 'card' | 'number' | 'profile' | 'reading' | 'theme';
  source: JourneyMemorySignalSource | 'journey';
};

export type JourneyMemoryCard = {
  arcana: TarotArcana;
  id: string;
  number: number;
  orientation: TarotOrientation;
  positionId: string;
  reversedMode: string | null;
  suit: TarotSuit | null;
};

export type JourneyMemoryNumber = {
  calculationId: string;
  systemVersion: string;
  value: number;
};

export type JourneyMemoryThemeInput = {
  cardIds: readonly string[];
  numberValues: readonly number[];
  role: 'leading' | 'supporting';
  semanticId: string;
  sourceIds: readonly JourneyMemorySignalSource[];
};

export type JourneyMemoryPracticalFocus = {
  category: JourneyRecommendationCategory;
  semanticId: string;
  sourceIds: readonly JourneyMemorySignalSource[];
  text: string;
};

export type JourneyMemoryReflection = {
  semanticId: string;
  sourceIds: readonly JourneyMemorySignalSource[];
  text: string;
};

export type JourneyMemoryQuoteSource = {
  id: string;
  kind: 'authored-section' | 'practical-focus' | 'reflection' | 'transition';
  strength: 'primary' | 'secondary';
  text: string;
};

export type JourneyMemorySource = {
  bookmarked: boolean;
  cards: readonly JourneyMemoryCard[];
  createdAt: string;
  engineVersions: Readonly<Record<string, string>>;
  headline: string;
  id: string;
  interpretationFingerprint?: string;
  kind: JourneyMemoryEntryKind;
  locale: Locale;
  numbers: readonly JourneyMemoryNumber[];
  period: TarotPeriod | null;
  practicalFocuses: readonly JourneyMemoryPracticalFocus[];
  quoteSources: readonly JourneyMemoryQuoteSource[];
  readingType: string;
  reflections: readonly JourneyMemoryReflection[];
  sourceReferences: readonly JourneyMemorySourceReference[];
  spreadId: string | null;
  themes: readonly JourneyMemoryThemeInput[];
  topic: TarotTopic | null;
  zodiac: {
    element: string;
    modality: string;
    signId: string;
  } | null;
};

export type JourneyMemoryEntry = Omit<JourneyMemorySource, 'interpretationFingerprint'> & {
  interpretationFingerprint: string;
  leadingTheme: string | null;
  supportingThemes: readonly string[];
};

export type JourneyThemeOccurrence = {
  cardIds: readonly string[];
  entryId: string;
  occurredAt: string;
  numberValues: readonly number[];
  sourceIds: readonly JourneyMemorySignalSource[];
  spreadId: string | null;
  themeId: string;
  topic: TarotTopic | null;
};

export type JourneyRecurringTheme = {
  consecutiveCount: number;
  currentTrend: JourneyThemeTrend;
  firstSeenAt: string;
  lastSeenAt: string;
  occurrenceCount: number;
  occurrences: readonly JourneyThemeOccurrence[];
  recencyWeight: number;
  relatedCards: readonly string[];
  relatedNumbers: readonly number[];
  relatedTopics: readonly TarotTopic[];
  sourceDiversity: number;
  spreadDiversity: number;
  themeId: string;
};

export type JourneyCardPattern = {
  cardIds: readonly string[];
  entryIds: readonly string[];
  id: string;
  occurrenceCount: number;
  patternType:
    'card-position' | 'court-role' | 'major-arcana' | 'repeated-card' | 'reversed-mode' | 'suit';
  relation: JourneyPatternRelation;
  semanticId: string;
};

export type JourneyNumberPattern = {
  calculationIds: readonly string[];
  compatibility: 'compatible' | 'incompatible' | 'separate-lineage';
  entryIds: readonly string[];
  id: string;
  kind:
    | 'card-number-resonance'
    | 'karmic-debt'
    | 'long-term-period-transition'
    | 'master-number'
    | 'number-theme-link'
    | 'period-repetition'
    | 'personal-year-transition'
    | 'repeating-challenge'
    | 'repeated-number';
  systemVersions: readonly string[];
  values: readonly number[];
};

export type JourneyRecommendationPattern = {
  category: JourneyRecommendationCategory;
  entryIds: readonly string[];
  id: string;
  occurrenceCount: number;
  semanticIds: readonly string[];
};

export type JourneyTransition = {
  confidence: JourneyTransitionConfidence;
  evidence: readonly JourneyMemorySourceReference[];
  fromEntryId: string;
  id: string;
  semanticSummary: {
    key: string;
    params: Readonly<Record<string, string | number>>;
  };
  toEntryId: string;
  type: JourneyTransitionType;
};

export type JourneyChapterTitle = {
  category: JourneyChapterTitleCategory;
  key: string;
  params: Readonly<Record<string, string | number>>;
};

export type JourneyChapter = {
  bookmarked: boolean;
  dateRange: { from: string; to: string };
  id: string;
  leadingTheme: string | null;
  linkedEntryIds: readonly string[];
  milestoneType: JourneyMilestoneType | null;
  ordinal: number;
  quoteCandidate: JourneyMemoryQuoteSource | null;
  representativeCard: string | null;
  representativeNumber: number | null;
  subtitleConcept: JourneyChapterTitle;
  supportingThemes: readonly string[];
  titleConcept: JourneyChapterTitle;
};

export type JourneyMilestone = {
  entryIds: readonly string[];
  id: string;
  occurredAt: string;
  semanticSummary: { key: string; params: Readonly<Record<string, string | number>> };
  type: JourneyMilestoneType;
};

export type JourneyYearSummary = {
  bookmarkedCount: number;
  chapterCount: number;
  emergingThemes: readonly string[];
  engineVersions: Readonly<Record<string, string>>;
  entryCount: number;
  fadingThemes: readonly string[];
  firstEntryDate: string;
  keyPracticalFocuses: readonly JourneyRecommendationCategory[];
  lastEntryDate: string;
  mostRecurringThemes: readonly string[];
  repeatedCards: readonly string[];
  repeatedNumbers: readonly number[];
  representativeQuote: JourneyMemoryQuoteSource | null;
  strongestTransitions: readonly string[];
  year: number;
};

export type JourneyMemoryVersions = {
  chapterEngine: 'chapter-engine-v1';
  engine: 'journey-memory-v1';
  themeTracking: 'theme-tracking-v1';
  yearSummary: 'year-summary-v1';
};

export type JourneyMemoryMetadata = {
  entryFingerprint: string;
  generatedAt: string;
  locale: Locale;
  versions: JourneyMemoryVersions;
};

export type JourneyMemoryValidationCode =
  | 'duplicate-id'
  | 'duplicate-entry-inclusion'
  | 'inconsistent-milestone'
  | 'inconsistent-year-summary'
  | 'invalid-chronology'
  | 'invalid-reference'
  | 'invalid-trend'
  | 'invalid-version'
  | 'non-finite-number'
  | 'serialization-error'
  | 'undefined-value';

export type JourneyMemoryValidationError = {
  code: JourneyMemoryValidationCode;
  message: string;
  path: string;
};

export type JourneyMemorySnapshot = {
  cardPatterns: readonly JourneyCardPattern[];
  chapters: readonly JourneyChapter[];
  entries: readonly JourneyMemoryEntry[];
  metadata: JourneyMemoryMetadata;
  milestones: readonly JourneyMilestone[];
  numberPatterns: readonly JourneyNumberPattern[];
  recommendationPatterns: readonly JourneyRecommendationPattern[];
  recurringThemes: readonly JourneyRecurringTheme[];
  trends: readonly JourneyRecurringTheme[];
  transitions: readonly JourneyTransition[];
  validation: {
    errors: readonly JourneyMemoryValidationError[];
    valid: boolean;
  };
  yearSummaries: readonly JourneyYearSummary[];
};

export type ReadingContinuityEntry = {
  cardIds: readonly string[];
  createdAt: string;
  id: string;
  leadingTheme: string | null;
  numberValues: readonly number[];
  practicalFocusIds: readonly string[];
  relevance: number;
  spreadId: string | null;
  supportingThemes: readonly string[];
  topic: TarotTopic | null;
};

export type ReadingContinuityTheme = {
  occurrenceCount: number;
  relatedCardIds: readonly string[];
  relatedEntryIds: readonly string[];
  relatedNumberValues: readonly number[];
  themeId: string;
  trend: JourneyThemeTrend;
};

export type ReadingContinuityCardPattern = {
  cardIds: readonly string[];
  entryIds: readonly string[];
  id: string;
  relation: JourneyPatternRelation;
  semanticId: string;
};

export type ReadingContinuityNumberPattern = {
  compatibility: JourneyNumberPattern['compatibility'];
  entryIds: readonly string[];
  id: string;
  values: readonly number[];
};

export type ReadingContinuityPracticalFocus = {
  category: JourneyRecommendationCategory;
  entryIds: readonly string[];
  id: string;
  semanticIds: readonly string[];
};

export type ReadingContinuityContext = {
  continuityVersion: 'reading-continuity-v1';
  emergingThemes: readonly ReadingContinuityTheme[];
  fadingThemes: readonly ReadingContinuityTheme[];
  journeySnapshotVersion: string;
  lastRelatedReading: ReadingContinuityEntry | null;
  memoryFingerprint: string;
  previousRelevantEntries: readonly ReadingContinuityEntry[];
  recentTransitions: readonly JourneyTransition[];
  recurringThemes: readonly ReadingContinuityTheme[];
  repeatedCards: readonly ReadingContinuityCardPattern[];
  repeatedNumbers: readonly ReadingContinuityNumberPattern[];
  repeatedPracticalFocuses: readonly ReadingContinuityPracticalFocus[];
  resolvedThemes: readonly ReadingContinuityTheme[];
};

export type ReadingContinuityQuery = {
  cardIds: readonly string[];
  currentReadingId?: string;
  numberValues: readonly number[];
  sourceEngineVersions: Readonly<Record<string, string>>;
  spreadId: string;
  themeIds: readonly string[];
  topic: TarotTopic | null;
};

export interface JourneyMemoryProvider {
  getSnapshot(): JourneyMemorySnapshot | null;
}
