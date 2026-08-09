import type {
  InterpretationConnection,
  InterpretationContext,
  InterpretationSignal,
  ThemeComposition,
} from '@features/expert-interpretation';
import type { JourneyMemorySnapshot } from '@features/journey-memory';
import type { ReadingContinuityContext } from '@features/journey-memory';

export type CrossSystemSourceKind =
  | 'interest'
  | 'journey-memory'
  | 'numerology-advanced'
  | 'numerology-core'
  | 'numerology-period'
  | 'psychological-context'
  | 'tarot-card'
  | 'tarot-connection'
  | 'tarot-position'
  | 'zodiac';

export type CrossSystemSourceTier = 1 | 2 | 3 | 4;
export type CrossSystemReliability = 'contextual' | 'deterministic' | 'direct' | 'symbolic';
export type CrossSystemStrength = 'contextual' | 'primary' | 'secondary' | 'weak';
export type CrossSystemUncertainty =
  | 'contextual-inference'
  | 'deterministic-structure'
  | 'direct-input'
  | 'insufficient-context'
  | 'symbolic-interpretation';
export type CrossSystemDirection =
  'balances' | 'contrasts' | 'frames' | 'intensifies' | 'redirects' | 'reinforces' | 'softens';
export type CrossSystemLinkSemanticType =
  | 'contextual-convergence'
  | 'direct-resonance'
  | 'elemental-emphasis'
  | 'journey-continuity'
  | 'modality-contrast'
  | 'period-resonance'
  | 'psychological-parallel'
  | 'structural-echo'
  | 'symbolic-support'
  | 'symbolic-tension'
  | 'thematic-contrast'
  | 'thematic-resonance';
export type CrossSystemExclusionReason =
  | 'artificial-connection'
  | 'dependent-sources'
  | 'duplicate-link'
  | 'incompatible-lineage'
  | 'insufficient-context'
  | 'missing-provenance'
  | 'symbolic-only-weak'
  | 'threshold-not-met'
  | 'zodiac-led-conclusion';

export type CrossSystemEntityReference = {
  id: string;
  kind: 'answer' | 'card' | 'interest' | 'number' | 'position' | 'theme' | 'zodiac';
};

export type CrossSystemSource = {
  engineVersions: Readonly<Record<string, string>>;
  id: string;
  kind: CrossSystemSourceKind;
  lineage: string;
  reliability: CrossSystemReliability;
  tier: CrossSystemSourceTier;
};

export type CrossSystemSignal = {
  direction: CrossSystemDirection;
  entityReferences: readonly CrossSystemEntityReference[];
  evidenceReferences: readonly string[];
  id: string;
  independentGroup: string;
  provenance: string;
  reliability: CrossSystemReliability;
  semanticType: string;
  sourceId: string;
  strength: CrossSystemStrength;
  themeIds: readonly string[];
  uncertainty: CrossSystemUncertainty;
};

export type CrossSystemTheme = {
  id: string;
  occurrenceCount: number;
  signalIds: readonly string[];
  sourceIds: readonly string[];
};

export type CrossSystemExplanation = {
  integrationConcept: string | null;
  limitationConcept: string;
  practicalConcept: string;
  relationConcept: string;
  sourceConcepts: readonly string[];
};

export type CrossSystemLink = {
  direction: CrossSystemDirection;
  displayEligible: boolean;
  engineVersions: CrossSystemVersions;
  entityReferences: readonly CrossSystemEntityReference[];
  evidenceReferences: readonly string[];
  exclusionReason: CrossSystemExclusionReason | null;
  explanation: CrossSystemExplanation;
  id: string;
  priority: number;
  reliability: CrossSystemReliability;
  semanticType: CrossSystemLinkSemanticType;
  sourceIds: readonly string[];
  strength: CrossSystemStrength;
  themeId: string;
  uncertainty: CrossSystemUncertainty;
};

export type CrossSystemResonance = CrossSystemLink & {
  semanticType:
    | 'direct-resonance'
    | 'period-resonance'
    | 'structural-echo'
    | 'symbolic-support'
    | 'symbolic-tension'
    | 'thematic-resonance';
};

export type CrossSystemContrast = CrossSystemLink & {
  contexts: readonly [string, string];
  integrationThemeId: string;
  poles: readonly [string, string];
  semanticType: 'modality-contrast' | 'symbolic-tension' | 'thematic-contrast';
};

export type CrossSystemConflictKind =
  | 'artificial-connection'
  | 'duplicate-signal'
  | 'healthy-contrast'
  | 'incompatible-sources'
  | 'insufficient-context'
  | 'unresolved-tension';

export type CrossSystemConflict = {
  evidenceReferences: readonly string[];
  id: string;
  kind: CrossSystemConflictKind;
  linkIds: readonly string[];
  resolution: 'exclude' | 'preserve-contrast' | 'separate-lineage';
  semanticSummary: string;
};

export type CrossSystemConvergence = CrossSystemLink & {
  independentSourceCount: number;
  semanticOverlap: readonly string[];
  semanticType: 'contextual-convergence' | 'journey-continuity';
  sourceIndependenceVerified: boolean;
};

export type CrossSystemPriority = {
  leadingLinkId: string | null;
  mainContrastId: string | null;
  journeyContinuityId: string | null;
  rejectedLinkIds: readonly string[];
  supportingLinkIds: readonly string[];
};

export type CrossSystemVersions = {
  contrast: 'contrast-rules-v1';
  convergence: 'convergence-rules-v1';
  engine: 'cross-system-reasoning-v1';
  resonance: 'resonance-rules-v1';
  sourceHierarchy: 'source-hierarchy-v1';
};

export type CrossSystemMetadata = {
  generatedAt: string;
  inputFingerprint: string;
  sourceEngineVersions: Readonly<Record<string, string>>;
  versions: CrossSystemVersions;
};

export type CrossSystemResult = {
  conflicts: readonly CrossSystemConflict[];
  contrasts: readonly CrossSystemContrast[];
  convergences: readonly CrossSystemConvergence[];
  links: readonly CrossSystemLink[];
  metadata: CrossSystemMetadata;
  priority: CrossSystemPriority;
  rejectedLinks: readonly CrossSystemLink[];
  resonances: readonly CrossSystemResonance[];
  signals: readonly CrossSystemSignal[];
  sources: readonly CrossSystemSource[];
  themes: readonly CrossSystemTheme[];
};

export type CrossSystemInput = {
  composition: ThemeComposition;
  connections: readonly InterpretationConnection[];
  continuityContext?: ReadingContinuityContext | null;
  context: InterpretationContext;
  evidence: readonly InterpretationSignal[];
  journeyMemory: JourneyMemorySnapshot | null;
  sourceEngineVersions: Readonly<Record<string, string>>;
};

export type CrossSystemValidationCode =
  | 'broken-reference'
  | 'duplicate-id'
  | 'empty-explanation'
  | 'incompatible-lineage'
  | 'invalid-confidence'
  | 'invalid-enum'
  | 'invalid-version'
  | 'missing-provenance'
  | 'non-serializable'
  | 'rejected-link-displayed'
  | 'unsupported-confirmation'
  | 'zodiac-led-conclusion';

export type CrossSystemValidationError = {
  code: CrossSystemValidationCode;
  message: string;
  path: string;
};

export type CrossSystemValidationReport = {
  errors: readonly CrossSystemValidationError[];
  valid: boolean;
};

export interface CrossSystemReasoningProvider {
  reason(input: CrossSystemInput): CrossSystemResult;
  validate(result: CrossSystemResult): CrossSystemValidationReport;
}
