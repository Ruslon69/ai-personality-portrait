import type { Locale } from '@shared/i18n';
import type {
  NarrativeComposition,
  NarrativeValidationReport,
} from '@features/narrative-composition';

export type InterpretationSource =
  | 'tarot-card'
  | 'tarot-position'
  | 'tarot-connection'
  | 'numerology'
  | 'zodiac'
  | 'psychological-context'
  | 'interest';

export type InterpretationConnectionKind =
  | 'reinforcement'
  | 'contrast'
  | 'progression'
  | 'blockage'
  | 'opportunity'
  | 'unresolved-tension'
  | 'practical-direction';

export type InterpretationConfidenceLevel = 'high' | 'medium' | 'low' | 'interpretive';
export type InterpretationUncertainty =
  | 'direct-input'
  | 'deterministic-calculation'
  | 'contextual-inference'
  | 'symbolic-interpretation'
  | 'limited-context';
export type InterpretationPolarity = 'supportive' | 'challenging' | 'neutral' | 'mixed';
export type InterpretationStrength = 'primary' | 'secondary' | 'contextual';
export type InterpretationReliability = 'direct' | 'deterministic' | 'contextual' | 'symbolic';
export type InterpretationSectionKind =
  | 'leading-theme'
  | 'supporting-theme'
  | 'tension'
  | 'period-context'
  | 'practical-focus'
  | 'symbolic-lens';

export type JsonPrimitive = boolean | number | string | null;
export type InterpretationValue = JsonPrimitive | readonly JsonPrimitive[];

export type InterpretationConfidence = {
  level: InterpretationConfidenceLevel;
  uncertainty: InterpretationUncertainty;
};

export type InterpretationReference = {
  id: string;
  kind: 'card' | 'context' | 'number' | 'position';
};

export type InterpretationEvidence = {
  id: string;
  polarity: InterpretationPolarity;
  provenance: string;
  reference?: InterpretationReference;
  reliability: InterpretationReliability;
  scope: 'calculation' | 'context' | 'personalization' | 'spread' | 'symbolic';
  semanticType: string;
  source: InterpretationSource;
  strength: InterpretationStrength;
  value: InterpretationValue;
};

export type InterpretationSignal = InterpretationEvidence & {
  tags: readonly string[];
};

export type InterpretationConnection = {
  cardIds: readonly string[];
  evidenceIds: readonly string[];
  id: string;
  kind: InterpretationConnectionKind;
  numberValues: readonly number[];
  semanticId: string;
  source: 'numerology' | 'tarot-connection';
  strength: InterpretationStrength;
};

export type InterpretationTension = {
  connectionIds: readonly string[];
  evidenceIds: readonly string[];
  id: string;
  semanticId: string;
};

export type InterpretationTheme = {
  connectionIds: readonly string[];
  evidenceIds: readonly string[];
  id: string;
  kind: 'card' | 'context' | 'period' | 'practical' | 'symbolic';
  priority: number;
  relatedCards: readonly string[];
  relatedContext: readonly string[];
  relatedNumbers: readonly number[];
  role: 'leading' | 'supporting';
  semanticId: string;
  sources: readonly InterpretationSource[];
  tensionIds: readonly string[];
};

export type InterpretationMessagePart = {
  key: string;
  params: Readonly<Record<string, JsonPrimitive>>;
};

export type InterpretationWording = {
  connectionConcept: InterpretationMessagePart;
  headlineConcept: InterpretationMessagePart;
  locale: Locale;
  openingConcept: InterpretationMessagePart;
  practicalConcept: InterpretationMessagePart;
  reflectionConcept: InterpretationMessagePart;
  uncertaintyConcept: InterpretationMessagePart;
};

export type AuthorialVoiceContract = {
  address: 'second-person-singular';
  allowedProductTerms: readonly string[];
  forbiddenTerms: readonly string[];
  principles: readonly (
    | 'atmospheric'
    | 'calm'
    | 'confident'
    | 'gender-neutral'
    | 'modern'
    | 'respectful'
    | 'uncertainty-aware'
  )[];
  version: 'authorial-voice-v1';
};

export type ContentBlockKind =
  | 'card-position-meaning'
  | 'contextual-meaning'
  | 'card-connections'
  | 'numerology-connection'
  | 'psychological-context'
  | 'practical-focus'
  | 'reflection-question'
  | 'uncertainty-note';

export type AuthorInterpretationBlock = {
  evidenceIds: readonly string[];
  id: string;
  kind: ContentBlockKind;
  sourceIds: readonly InterpretationSource[];
  text: string;
};

export type AuthorInterpretationSection = {
  blocks: readonly AuthorInterpretationBlock[];
  closing?: string;
  headline: string;
  id: string;
  opening?: string;
  sectionId: string;
};

export type ContentQualityIssueKind =
  | 'banned-claim'
  | 'duplicate-headline'
  | 'duplicate-practical-focus'
  | 'mixed-locale'
  | 'repeated-card-name'
  | 'repeated-opening'
  | 'repeated-phrase'
  | 'semantic-duplicate';

export type ContentQualityIssue = {
  kind: ContentQualityIssueKind;
  message: string;
  path: string;
};

export type ContentQualityScore = {
  claimSafety: number;
  completeness: number;
  localizationCompleteness: number;
  overall: number;
  repetition: number;
  sectionBalance: number;
  sourceGrounding: number;
  specificity: number;
};

export type ContentQualityReport = {
  issues: readonly ContentQualityIssue[];
  mergedSectionIds: readonly string[];
  replacements: readonly string[];
  score: ContentQualityScore;
  threshold: number;
  valid: boolean;
};

export type AuthorInterpretationContent = {
  closing: string;
  headline: string;
  locale: Locale;
  narrativeStrategy: string;
  opening: string;
  quality: ContentQualityReport;
  sections: readonly AuthorInterpretationSection[];
  version: 'author-content-v1';
};

export type InterpretationRecommendation = {
  contextIds: readonly string[];
  evidenceIds: readonly string[];
  id: string;
  practicalFocus: InterpretationMessagePart;
  relatedThemeId: string;
  sources: readonly InterpretationSource[];
};

export type InterpretationSection = {
  confidence: InterpretationConfidence;
  details: readonly InterpretationMessagePart[];
  evidence: readonly string[];
  id: string;
  kind: InterpretationSectionKind;
  practicalFocus: InterpretationMessagePart;
  reflectionQuestion?: InterpretationMessagePart;
  relatedCards: readonly string[];
  relatedContext: readonly string[];
  relatedNumbers: readonly number[];
  sources: readonly InterpretationSource[];
  summary: InterpretationMessagePart;
  titleKey: string;
  uncertaintyNote: InterpretationMessagePart;
};

export type InterpretationSourceAvailability = {
  interests: boolean;
  numerology: boolean;
  psychologicalContext: boolean;
  tarot: boolean;
  zodiac: boolean;
};

export type InterpretationEngineVersions = {
  content: 'author-content-v1';
  engine: 'expert-interpretation-v1';
  numerology: 'numerology-rules-v1';
  numerologyCalculation: 'pythagorean-date-v1';
  tarot: 'tarot-rules-v1';
  wording: 'wording-v1';
};

export type InterpretationMetadata = {
  cardIds: readonly string[];
  deterministicSeed: string;
  generatedAt: string;
  locale: Locale;
  numberValues: readonly number[];
  requestFingerprint: string;
  sourceAvailability: InterpretationSourceAvailability;
  versions: InterpretationEngineVersions;
};

export type InterpretationResult = {
  connections: readonly InterpretationConnection[];
  content: AuthorInterpretationContent;
  evidence: readonly InterpretationEvidence[];
  id: string;
  leadingThemeId: string;
  metadata: InterpretationMetadata;
  recommendations: readonly InterpretationRecommendation[];
  sections: readonly InterpretationSection[];
  tensions: readonly InterpretationTension[];
  themes: readonly InterpretationTheme[];
};

export type InterpretationTarotCardInput = {
  arcana: 'major' | 'minor';
  baseThemeIds: readonly string[];
  id: string;
  number: number;
  orientation: 'reversed' | 'upright';
  positionId: string;
  suit?: 'cups' | 'pentacles' | 'swords' | 'wands';
};

export type InterpretationTarotInput = {
  cards: readonly InterpretationTarotCardInput[];
  deckTheme: string;
  leadingCardId: string;
  period?: 'day' | 'month' | 'week' | 'year';
  spreadId: string;
  topic?: 'decision' | 'love' | 'money' | 'open' | 'work';
};

export type InterpretationTarotCardContext = InterpretationTarotCardInput & {
  neighbouringCardIds: readonly string[];
};

export type InterpretationTarotContext = Omit<InterpretationTarotInput, 'cards'> & {
  cards: readonly InterpretationTarotCardContext[];
};

export type InterpretationNumerologyNumberInput = {
  id:
    | 'birthday'
    | 'first-impression'
    | 'life-path'
    | 'personal-day'
    | 'personal-month'
    | 'personal-year';
  sourceDigits: readonly number[];
  value: number;
};

export type InterpretationNumerologyInput = {
  masterNumbers: readonly number[];
  numbers: readonly InterpretationNumerologyNumberInput[];
  system: 'pythagorean-date-v1';
};

export type InterpretationZodiacInput = {
  element: 'air' | 'earth' | 'fire' | 'water';
  modality: 'cardinal' | 'fixed' | 'mutable';
  signId: string;
};

export type InterpretationPsychologicalAnswer = {
  optionId: string;
  questionId: string;
};

export type InterpretationPsychologicalContext = {
  answers: readonly InterpretationPsychologicalAnswer[];
  currentConcern: string | null;
  currentEmotionalContext: string | null;
  derivedContextualTendencies: readonly string[];
  desiredReadingFocus: string | null;
};

export type InterpretationContext = {
  interests: {
    custom: string | null;
    selected: readonly string[];
  };
  locale: Locale;
  metadata: {
    deterministicSeed: string;
    generatedAt: string;
    sourceAvailability: InterpretationSourceAvailability;
  };
  numerology: InterpretationNumerologyInput | null;
  psychology: InterpretationPsychologicalContext;
  tarot: InterpretationTarotContext;
  zodiac: InterpretationZodiacInput | null;
};

export type InterpretationRequest = {
  customInterest?: string;
  generatedAt: string;
  interests?: readonly string[];
  locale: Locale;
  numerology?: InterpretationNumerologyInput;
  psychologyAnswers?: readonly InterpretationPsychologicalAnswer[];
  seed: string;
  tarot: InterpretationTarotInput;
  zodiac?: InterpretationZodiacInput;
};

export type InterpretationValidationCode =
  | 'banned-claim'
  | 'duplicate-id'
  | 'empty-field'
  | 'invalid-card-reference'
  | 'invalid-confidence'
  | 'invalid-enum'
  | 'invalid-number-reference'
  | 'invalid-provenance'
  | 'invalid-source'
  | 'invalid-version'
  | 'invalid-content'
  | 'low-content-quality'
  | 'mixed-locale'
  | 'non-finite-number'
  | 'serialization-error'
  | 'undefined-value';

export type InterpretationValidationError = {
  code: InterpretationValidationCode;
  message: string;
  path: string;
};

export type InterpretationValidationReport = {
  errors: readonly InterpretationValidationError[];
  valid: boolean;
};

export type InterpretationResponse = {
  narrative: NarrativeComposition;
  narrativeValidation: NarrativeValidationReport;
  result: InterpretationResult;
  validation: InterpretationValidationReport;
};

export type ThemeComposition = {
  leadingThemeId: string;
  recommendations: readonly InterpretationRecommendation[];
  tensions: readonly InterpretationTension[];
  themes: readonly InterpretationTheme[];
};

export interface InterpretationProvider {
  buildContext(request: InterpretationRequest): InterpretationContext;
  collectEvidence(context: InterpretationContext): readonly InterpretationSignal[];
  resolveConnections(
    context: InterpretationContext,
    evidence: readonly InterpretationSignal[],
  ): readonly InterpretationConnection[];
  composeThemes(
    context: InterpretationContext,
    evidence: readonly InterpretationSignal[],
    connections: readonly InterpretationConnection[],
  ): ThemeComposition;
  composeNarrative(
    context: InterpretationContext,
    evidence: readonly InterpretationSignal[],
    connections: readonly InterpretationConnection[],
    composition: ThemeComposition,
    fingerprint: string,
  ): NarrativeComposition;
  generateInterpretation(
    context: InterpretationContext,
    evidence: readonly InterpretationSignal[],
    connections: readonly InterpretationConnection[],
    composition: ThemeComposition,
  ): InterpretationResult;
  validateResult(result: InterpretationResult): InterpretationValidationReport;
  interpret(request: InterpretationRequest): InterpretationResponse;
}
