export type NumerologyKnowledgeSystem =
  | 'compatibility'
  | 'destiny-number'
  | 'expression-number'
  | 'key2'
  | 'maturity-number'
  | 'name-numerology'
  | 'pythagorean-date-v1'
  | 'soul-number';

export type NumerologyActiveValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;
export type NumerologyMasterValue = 11 | 22 | 33;
export type NumerologyKarmicValue = 13 | 14 | 16 | 19;

export type NumerologyKnowledgeRole =
  'attitude' | 'birthday' | 'life-path' | 'personal-day' | 'personal-month' | 'personal-year';

export type NumerologySemanticTagId =
  | 'adaptation'
  | 'analysis'
  | 'authority'
  | 'autonomy'
  | 'balance'
  | 'boundaries'
  | 'care'
  | 'change'
  | 'clarity'
  | 'collaboration'
  | 'communication'
  | 'completion'
  | 'connection'
  | 'creativity'
  | 'decision'
  | 'discipline'
  | 'expression'
  | 'focus'
  | 'freedom'
  | 'growth'
  | 'influence'
  | 'initiative'
  | 'intuition'
  | 'learning'
  | 'manifestation'
  | 'mentoring'
  | 'movement'
  | 'observation'
  | 'opportunity'
  | 'patience'
  | 'planning'
  | 'practicality'
  | 'reciprocity'
  | 'reflection'
  | 'release'
  | 'resource'
  | 'responsibility'
  | 'service'
  | 'stability'
  | 'structure'
  | 'support'
  | 'transition'
  | 'trust'
  | 'truth'
  | 'uncertainty'
  | 'vision';

export type NumerologySemanticProcess =
  | 'analyze'
  | 'architect'
  | 'balance'
  | 'build'
  | 'clarify'
  | 'complete'
  | 'connect'
  | 'cultivate'
  | 'direct'
  | 'express'
  | 'explore'
  | 'focus'
  | 'ground'
  | 'illuminate'
  | 'initiate'
  | 'integrate'
  | 'mediate'
  | 'mentor'
  | 'observe'
  | 'organize'
  | 'question'
  | 'refine'
  | 'release'
  | 'sustain'
  | 'test'
  | 'translate';

export type NumerologySemanticConcept = {
  id: string;
  object: NumerologySemanticTagId;
  polarity: 'integrative' | 'neutral' | 'supportive' | 'tensional';
  process: NumerologySemanticProcess;
  qualifier?: NumerologySemanticTagId;
  subject: NumerologySemanticTagId;
  weight: 'contextual' | 'core' | 'supporting';
};

export type NumerologyArchetypeId =
  | 'analyst'
  | 'builder'
  | 'connector'
  | 'creator'
  | 'explorer'
  | 'guardian'
  | 'mediator'
  | 'mentor'
  | 'teacher'
  | 'visionary';

export type NumerologyMotifId =
  | 'anchor-grid'
  | 'ascending-steps'
  | 'calibration-mark'
  | 'compass-rose'
  | 'echo-ring'
  | 'gatefold'
  | 'key'
  | 'open-hand'
  | 'prism'
  | 'spiral'
  | 'tree'
  | 'woven-path';

export type NumerologyArchetype = {
  challengeTags: readonly NumerologySemanticTagId[];
  giftTags: readonly NumerologySemanticTagId[];
  id: NumerologyArchetypeId;
  motifIds: readonly NumerologyMotifId[];
  process: NumerologySemanticProcess;
  roleTags: readonly NumerologySemanticTagId[];
};

export type NumerologyMotif = {
  id: NumerologyMotifId;
  process: NumerologySemanticProcess;
  tensionTags: readonly NumerologySemanticTagId[];
  themeTags: readonly NumerologySemanticTagId[];
};

export type NumerologyNarrativePurpose =
  'challenge' | 'closing' | 'growth' | 'meaning' | 'opening' | 'practice' | 'reflection';

export type NumerologyNarrativeFragment = {
  conceptIds: readonly string[];
  id: string;
  process: NumerologySemanticProcess;
  purpose: NumerologyNarrativePurpose;
  tags: readonly NumerologySemanticTagId[];
};

export type NumerologyRoleKnowledge = {
  challenge: NumerologySemanticConcept;
  commonPattern: NumerologySemanticConcept;
  coreMeaning: NumerologySemanticConcept;
  energy: NumerologySemanticConcept;
  growth: NumerologySemanticConcept;
  identity: {
    role: NumerologyKnowledgeRole;
    signature: string;
    value: NumerologyActiveValue;
  };
  innerLesson: NumerologySemanticConcept;
  opportunity: NumerologySemanticConcept;
  practicalAdvice: NumerologySemanticConcept;
  reflection: NumerologySemanticConcept;
  strength: NumerologySemanticConcept;
  warning: NumerologySemanticConcept;
};

export type PersonalYearRhythm =
  'consolidation' | 'expansion' | 'foundation' | 'integration' | 'reorientation' | 'resolution';

export type PersonalYearPhilosophy = {
  amplified: NumerologySemanticConcept;
  bestDirection: NumerologySemanticConcept;
  complexity: NumerologySemanticConcept;
  mainTheme: NumerologySemanticConcept;
  rhythm: PersonalYearRhythm;
  typicalLesson: NumerologySemanticConcept;
  typicalMistake: NumerologySemanticConcept;
};

export type PersonalMonthModifier = {
  emphasis: NumerologySemanticConcept;
  practicalFocus: NumerologySemanticConcept;
  relationToYear: 'contrasts' | 'grounds' | 'opens' | 'redirects' | 'reinforces';
  tempo: 'measured' | 'mobile' | 'reflective' | 'steady';
  value: NumerologyActiveValue;
};

export type PersonalDayMicroContext = {
  actionScale: 'micro' | 'small';
  attention: NumerologySemanticConcept;
  boundary: NumerologySemanticConcept;
  tempo: 'pause' | 'respond' | 'review' | 'step';
  value: NumerologyActiveValue;
};

export type NumerologyMasterPhilosophy = {
  baseResonance: 2 | 4 | 6;
  gift: NumerologySemanticConcept;
  integration: NumerologySemanticConcept;
  practice: NumerologySemanticConcept;
  preservedValue: NumerologyMasterValue;
  strain: NumerologySemanticConcept;
};

export type NumerologyNumberKnowledge = {
  archetypeIds: readonly NumerologyArchetypeId[];
  career: NumerologySemanticConcept;
  decisionStyle: NumerologySemanticConcept;
  identity: {
    isMaster: boolean;
    signature: string;
    value: NumerologyActiveValue;
  };
  keywords: readonly string[];
  masterPhilosophy?: NumerologyMasterPhilosophy;
  money: NumerologySemanticConcept;
  motifIds: readonly NumerologyMotifId[];
  narrativeFragments: readonly NumerologyNarrativeFragment[];
  personalDay: PersonalDayMicroContext;
  personalMonth: PersonalMonthModifier;
  personalYear: PersonalYearPhilosophy;
  relationships: NumerologySemanticConcept;
  roleModels: Readonly<Record<NumerologyKnowledgeRole, NumerologyRoleKnowledge>>;
  tagIds: readonly NumerologySemanticTagId[];
};

export type NumerologyKarmicKnowledge = {
  activeByDefault: false;
  challenge: NumerologySemanticConcept;
  integration: NumerologySemanticConcept;
  lesson: NumerologySemanticConcept;
  value: NumerologyKarmicValue;
};

export type NumerologyLifeCycleKind = 'challenge' | 'life-cycle' | 'peak-period' | 'pinnacle';

export type NumerologyLifeCycleKnowledgeContract = {
  calculationImplemented: boolean;
  calculationSystem: 'pythagorean-date-cycles-v1' | null;
  contextRoles: readonly ('foundation' | 'lesson' | 'peak' | 'transition')[];
  kind: NumerologyLifeCycleKind;
  requiredInputs: readonly ('birth-date' | 'calculation-system-version')[];
  semanticFields: readonly ('theme' | 'challenge' | 'growth' | 'rhythm' | 'integration')[];
};

export type ResolvedAdvancedNumerologyKnowledge = {
  contract: NumerologyLifeCycleKnowledgeContract;
  number: NumerologyNumberKnowledge;
};

export type FutureNumerologyModuleContract = {
  calculationImplemented: false;
  id:
    | 'compatibility'
    | 'destiny-number'
    | 'expression-number'
    | 'key2'
    | 'maturity-number'
    | 'name-numerology'
    | 'soul-number';
  requiredInputs: readonly ('birth-date' | 'full-name' | 'other-profile')[];
  semanticOutput: readonly ('challenge' | 'core' | 'growth' | 'practice' | 'relation')[];
};

export type NumerologyTarotResonance = {
  cardIds: readonly string[];
  id: string;
  kind: 'balances' | 'grounds' | 'mirrors' | 'opens' | 'supports';
  reasonTags: readonly NumerologySemanticTagId[];
  value: NumerologyActiveValue;
};

export type AuthorNumerologyKnowledgeBase = {
  archetypes: readonly NumerologyArchetype[];
  entries: readonly NumerologyNumberKnowledge[];
  futureModules: readonly FutureNumerologyModuleContract[];
  karmicLessons: readonly NumerologyKarmicKnowledge[];
  lifeCycleContracts: readonly NumerologyLifeCycleKnowledgeContract[];
  metadata: {
    calculationSystem: 'pythagorean-date-v1';
    schemaVersion: 'author-numerology-schema-v1';
    version: 'author-numerology-knowledge-v1';
  };
  motifs: readonly NumerologyMotif[];
  tarotResonances: readonly NumerologyTarotResonance[];
};

export type ResolvedNumerologyKnowledge = {
  narrativeFragments: readonly NumerologyNarrativeFragment[];
  number: NumerologyNumberKnowledge;
  role: NumerologyRoleKnowledge;
};

export type ResolvedPersonalMonthContext = {
  month: PersonalMonthModifier;
  relation: PersonalMonthModifier['relationToYear'];
  year: PersonalYearPhilosophy;
};

export type NumerologyKnowledgeValidationError = {
  code:
    | 'broken-reference'
    | 'duplicate-id'
    | 'empty-field'
    | 'invalid-count'
    | 'invalid-enum'
    | 'invalid-master'
    | 'non-serializable'
    | 'repetition';
  message: string;
  path: string;
};

export type NumerologyKnowledgeValidationResult = {
  errors: readonly NumerologyKnowledgeValidationError[];
  valid: boolean;
};
