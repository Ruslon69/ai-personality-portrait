import type { TarotArcana, TarotOrientation, TarotSuit } from '../../tarot/types';

export type AuthorKnowledgeSystemKind =
  'compatibility' | 'lenormand' | 'natal-astrology' | 'numerology' | 'oracle' | 'runes' | 'tarot';

export type TarotKnowledgeSpreadContext =
  'career' | 'day' | 'decision' | 'generic' | 'love' | 'money' | 'month' | 'week' | 'year';

export type TarotSemanticTagId =
  | 'action'
  | 'adaptation'
  | 'attachment'
  | 'balance'
  | 'boundaries'
  | 'change'
  | 'choice'
  | 'clarity'
  | 'communication'
  | 'completion'
  | 'conflict'
  | 'connection'
  | 'courage'
  | 'creativity'
  | 'decision'
  | 'discipline'
  | 'emotion'
  | 'energy'
  | 'focus'
  | 'freedom'
  | 'growth'
  | 'intuition'
  | 'integration'
  | 'leadership'
  | 'learning'
  | 'material'
  | 'momentum'
  | 'money'
  | 'opportunity'
  | 'pause'
  | 'patience'
  | 'planning'
  | 'reciprocity'
  | 'recovery'
  | 'reflection'
  | 'relationship'
  | 'release'
  | 'resource'
  | 'responsibility'
  | 'rest'
  | 'risk'
  | 'stability'
  | 'support'
  | 'tempo'
  | 'transition'
  | 'tradition'
  | 'truth'
  | 'uncertainty'
  | 'vision'
  | 'work';

export type TarotSemanticProcess =
  | 'amplify'
  | 'balance'
  | 'begin'
  | 'build'
  | 'challenge'
  | 'choose'
  | 'communicate'
  | 'complete'
  | 'connect'
  | 'cultivate'
  | 'defer'
  | 'define'
  | 'direct'
  | 'discern'
  | 'endure'
  | 'examine'
  | 'expand'
  | 'focus'
  | 'ground'
  | 'illuminate'
  | 'imagine'
  | 'integrate'
  | 'internalize'
  | 'negotiate'
  | 'observe'
  | 'obstruct'
  | 'open'
  | 'overstate'
  | 'pause'
  | 'protect'
  | 'question'
  | 'recover'
  | 'release'
  | 'revisit'
  | 'revise'
  | 'share'
  | 'simplify'
  | 'suppress'
  | 'test'
  | 'transform'
  | 'verify';

export type TarotSemanticPolarity = 'integrative' | 'neutral' | 'supportive' | 'tensional';
export type TarotSemanticWeight = 'contextual' | 'core' | 'supporting';

export type TarotSemanticConcept = {
  id: string;
  object: TarotSemanticTagId;
  polarity: TarotSemanticPolarity;
  process: TarotSemanticProcess;
  qualifier?: TarotSemanticTagId;
  subject: TarotSemanticTagId;
  weight: TarotSemanticWeight;
};

export type TarotArchetypeId =
  | 'builder'
  | 'creator'
  | 'dreamer'
  | 'explorer'
  | 'guardian'
  | 'guide'
  | 'hermit'
  | 'leader'
  | 'mediator'
  | 'messenger'
  | 'protector'
  | 'reformer'
  | 'steward'
  | 'student'
  | 'visionary'
  | 'witness';

export type TarotSymbolicMotifId =
  | 'bridge'
  | 'circle'
  | 'crossroad'
  | 'door'
  | 'fire'
  | 'lantern'
  | 'mirror'
  | 'mountain'
  | 'river'
  | 'seed'
  | 'storm'
  | 'sunrise'
  | 'thread'
  | 'threshold'
  | 'well'
  | 'window';

export type TarotArchetype = {
  challengeTags: readonly TarotSemanticTagId[];
  giftTags: readonly TarotSemanticTagId[];
  id: TarotArchetypeId;
  motifIds: readonly TarotSymbolicMotifId[];
  process: TarotSemanticProcess;
  roleTags: readonly TarotSemanticTagId[];
};

export type TarotSymbolicMotif = {
  id: TarotSymbolicMotifId;
  process: TarotSemanticProcess;
  shadowTags: readonly TarotSemanticTagId[];
  themeTags: readonly TarotSemanticTagId[];
};

export type TarotSemanticTag = {
  group: 'domain' | 'dynamic' | 'focus' | 'quality';
  id: TarotSemanticTagId;
};

export type TarotReversedFacet =
  | 'blocked-energy'
  | 'delay'
  | 'false-certainty'
  | 'inner-expression'
  | 'overcompensation'
  | 'reassessment'
  | 'suppressed-potential'
  | 'unfinished-lesson';

export type TarotReversedPhilosophy = {
  facets: Readonly<Record<TarotReversedFacet, TarotSemanticConcept>>;
  integration: TarotSemanticConcept;
  primaryFacet: TarotReversedFacet;
};

export type TarotSpreadModifier = {
  context: TarotKnowledgeSpreadContext;
  emphasis: TarotSemanticConcept;
  reflectionTags: readonly TarotSemanticTagId[];
};

export type TarotActionConcept = {
  id: string;
  object: TarotSemanticTagId;
  scale: 'micro' | 'small';
  supportingTag: TarotSemanticTagId;
  verb: TarotSemanticProcess;
};

export type TarotPracticalLayer = {
  avoidToday: TarotActionConcept;
  bestQuestion: TarotActionConcept;
  payAttention: TarotActionConcept;
  smallAction: TarotActionConcept;
  smallExperiment: TarotActionConcept;
};

export type TarotReflectionStem =
  | 'what-already-changed'
  | 'what-needs-a-boundary'
  | 'what-needs-a-pause'
  | 'what-remains-unfinished'
  | 'what-support-is-nearby'
  | 'where-is-the-choice'
  | 'where-is-the-resistance'
  | 'which-step-is-testable';

export type TarotReflectionConcept = {
  focusTags: readonly TarotSemanticTagId[];
  id: string;
  orientation: TarotOrientation | 'both';
  spreadContexts: readonly TarotKnowledgeSpreadContext[];
  stem: TarotReflectionStem;
  themeTags: readonly TarotSemanticTagId[];
};

export type TarotCardKnowledge = {
  archetypeIds: readonly TarotArchetypeId[];
  careerMeaning: TarotSemanticConcept;
  challenge: TarotSemanticConcept;
  coreEnergy: TarotSemanticConcept;
  decisionMaking: TarotSemanticConcept;
  energyToday: TarotSemanticConcept;
  gift: TarotSemanticConcept;
  growthDirection: TarotSemanticConcept;
  identity: {
    arcana: TarotArcana;
    cardId: string;
    number: number;
    rankId: string;
    signature: string;
    suit?: TarotSuit;
  };
  keywords: readonly string[];
  lightExpression: TarotSemanticConcept;
  misconception: TarotSemanticConcept;
  moneyMeaning: TarotSemanticConcept;
  opportunity: TarotSemanticConcept;
  personalDevelopment: TarotSemanticConcept;
  practical: TarotPracticalLayer;
  reflections: readonly TarotReflectionConcept[];
  relationshipMeaning: TarotSemanticConcept;
  reversed: TarotReversedPhilosophy;
  shadowExpression: TarotSemanticConcept;
  spreadContexts: Readonly<Record<TarotKnowledgeSpreadContext, TarotSpreadModifier>>;
  symbolicMotifIds: readonly TarotSymbolicMotifId[];
  tagIds: readonly TarotSemanticTagId[];
  typicalObstacle: TarotSemanticConcept;
  warning: TarotSemanticConcept;
};

export type TarotKnowledgeRelationKind =
  | 'balances'
  | 'closes'
  | 'contrasts'
  | 'intensifies'
  | 'mirrors'
  | 'opens'
  | 'redirects'
  | 'reinforces'
  | 'softens'
  | 'transforms';

export type TarotKnowledgeRelation = {
  id: string;
  kind: TarotKnowledgeRelationKind;
  reasonTags: readonly TarotSemanticTagId[];
  sourceCardId: string;
  targetCardId: string;
};

export type AuthorKnowledgeBaseMetadata = {
  cardCount: number;
  schemaVersion: 'author-knowledge-schema-v1';
  system: AuthorKnowledgeSystemKind;
  version: 'author-tarot-knowledge-v1';
};

export type AuthorKnowledgeBase<TEntry, TRelation> = {
  entries: readonly TEntry[];
  metadata: AuthorKnowledgeBaseMetadata;
  relations: readonly TRelation[];
};

export type AuthorTarotKnowledgeBase = AuthorKnowledgeBase<
  TarotCardKnowledge,
  TarotKnowledgeRelation
> & {
  archetypes: readonly TarotArchetype[];
  motifs: readonly TarotSymbolicMotif[];
  tags: readonly TarotSemanticTag[];
};

export type ResolvedTarotKnowledge = {
  cardId: string;
  concepts: readonly TarotSemanticConcept[];
  orientation: TarotOrientation;
  reflection: TarotReflectionConcept;
  spread: TarotKnowledgeSpreadContext;
  spreadModifier: TarotSpreadModifier;
};

export type TarotKnowledgeValidationError = {
  code:
    | 'broken-reference'
    | 'cycle'
    | 'duplicate-id'
    | 'empty-field'
    | 'invalid-count'
    | 'invalid-enum'
    | 'non-serializable'
    | 'repetition';
  message: string;
  path: string;
};

export type TarotKnowledgeValidationResult = {
  errors: readonly TarotKnowledgeValidationError[];
  valid: boolean;
};
