export type NarrativeMode = 'deep' | 'journey' | 'short' | 'standard';

export type NarrativeChapterKind =
  | 'opening'
  | 'current-situation'
  | 'hidden-dynamic'
  | 'main-turning-point'
  | 'practical-direction'
  | 'reflection'
  | 'closing-thought';

export type NarrativeTransitionKind =
  'completion' | 'consequence' | 'continuation' | 'contrast' | 'deepening' | 'question' | 'shift';

export type NarrativeEmotionalPhase =
  'agency' | 'calm' | 'clarity' | 'deepening' | 'integration' | 'reflection' | 'tension';

export type NarrativeSourceKind =
  | 'connection'
  | 'cross-system'
  | 'evidence'
  | 'journey-memory'
  | 'numerology-knowledge'
  | 'recommendation'
  | 'tarot-knowledge'
  | 'tension'
  | 'theme';

export type NarrativeBlockRole =
  | 'closure'
  | 'conflict'
  | 'current'
  | 'lead'
  | 'practical'
  | 'reflection'
  | 'softener'
  | 'support'
  | 'turning-point';

export type NarrativePriorityFactor =
  | 'current-period'
  | 'leading-card'
  | 'major-arcana'
  | 'numerology-resonance'
  | 'practical-action'
  | 'psychological-context'
  | 'reflection'
  | 'repeated-symbol'
  | 'spread-position'
  | 'strong-connection'
  | 'tension';

export type NarrativePolarity = 'integrative' | 'neutral' | 'supportive' | 'tensional';

export type NarrativeCandidate = {
  basePriority: number;
  cardIds: readonly string[];
  evidenceIds: readonly string[];
  id: string;
  mergedFromIds: readonly string[];
  numberValues: readonly number[];
  polarity: NarrativePolarity;
  priorityFactors: readonly NarrativePriorityFactor[];
  roles: readonly NarrativeBlockRole[];
  semanticId: string;
  sourceId: string;
  sourceKind: NarrativeSourceKind;
  tags: readonly string[];
};

export type NarrativeRelationInput = {
  cardIds: readonly string[];
  id: string;
  kind:
    | 'balance'
    | 'blockage'
    | 'contrast'
    | 'opportunity'
    | 'progression'
    | 'reinforcement'
    | 'tension'
    | 'transformation';
  semanticId: string;
  strength: 'contextual' | 'primary' | 'secondary';
};

export type NarrativeMemoryContext = {
  emergingThemeIds: readonly string[];
  recurringThemeIds: readonly string[];
  resolvedThemeIds: readonly string[];
  transitionIds: readonly string[];
};

export type NarrativeCompositionRequest = {
  candidates: readonly NarrativeCandidate[];
  fingerprint: string;
  leadingSemanticId: string;
  memory?: NarrativeMemoryContext;
  mode: NarrativeMode;
  reasoning?: {
    journeyContinuityId: string | null;
    leadingLinkId: string | null;
    mainContrastId: string | null;
    rejectedLinkIds: readonly string[];
    supportingLinkIds: readonly string[];
  };
  relations: readonly NarrativeRelationInput[];
};

export type NarrativeTransition = {
  fromChapterId: string;
  id: string;
  kind: NarrativeTransitionKind;
  relationId?: string;
  toChapterId: string;
};

export type NarrativeChapter = {
  blockIds: readonly string[];
  emotionalPhase: NarrativeEmotionalPhase;
  emphasisTags: readonly string[];
  id: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  kind: NarrativeChapterKind;
  ordinal: number;
  purpose: NarrativeBlockRole;
};

export type NarrativeConflict = {
  id: string;
  kind: 'blockage' | 'contrast' | 'tension';
  poleBlockIds: readonly string[];
  relationIds: readonly string[];
  resolutionBlockId: string;
  strength: 'primary' | 'secondary';
};

export type NarrativeFlow = {
  amplifiedBlockIds: readonly string[];
  closingBlockId: string;
  leadingBlockId: string;
  primaryConflictId: string | null;
  secondaryBlockIds: readonly string[];
  softenedBlockIds: readonly string[];
};

export type NarrativeVoiceProfile = {
  address: 'second-person-singular';
  cadence: 'measured';
  certainty: 'uncertainty-aware';
  id: 'authorial-voice-v1';
  register: 'calm-modern';
};

export type NarrativeQualityReport = {
  abruptTransitionCount: number;
  duplicateAdviceCount: number;
  duplicateClosingCount: number;
  emptyChapterCount: number;
  removedRepetitionCount: number;
  valid: boolean;
};

export type NarrativeComposition = {
  blocks: readonly NarrativeCandidate[];
  chapters: readonly NarrativeChapter[];
  conflict: NarrativeConflict | null;
  eliminatedBlockIds: readonly string[];
  emotionalCurve: readonly NarrativeEmotionalPhase[];
  flow: NarrativeFlow;
  id: string;
  metadata: {
    composerVersion: 'narrative-composer-v1';
    graphFingerprint: string;
    sourceFingerprint: string;
    transitionVersion: 'narrative-transitions-v1';
  };
  mode: NarrativeMode;
  quality: NarrativeQualityReport;
  transitions: readonly NarrativeTransition[];
  voice: NarrativeVoiceProfile;
};

export type NarrativeValidationCode =
  | 'abrupt-transition'
  | 'broken-reference'
  | 'duplicate-advice'
  | 'duplicate-closing'
  | 'duplicate-id'
  | 'empty-chapter'
  | 'incomplete-story'
  | 'invalid-curve'
  | 'invalid-enum'
  | 'invalid-pacing'
  | 'invalid-version'
  | 'non-serializable'
  | 'semantic-repetition';

export type NarrativeValidationError = {
  code: NarrativeValidationCode;
  message: string;
  path: string;
};

export type NarrativeValidationReport = {
  errors: readonly NarrativeValidationError[];
  valid: boolean;
};

export interface NarrativeComposer {
  compose(request: NarrativeCompositionRequest): NarrativeComposition;
  validate(composition: NarrativeComposition): NarrativeValidationReport;
}
