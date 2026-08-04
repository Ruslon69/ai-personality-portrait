export type InsightConfidence = 'high' | 'medium' | 'low';
export type InsightFormat =
  'featured' | 'paired' | 'context' | 'application' | 'hypothesis' | 'interpretation';
export type ProfileLocale = 'en' | 'ru' | 'uk';
export type PortraitMarkMotif =
  'constellation' | 'grid' | 'route' | 'rhythm' | 'pulse' | 'freeform';
export type PortraitMarkShape = 'arc' | 'diamond' | 'ring';
export type PersonalityFacetId =
  'thinking' | 'communication' | 'motivation' | 'decisions' | 'energy' | 'adaptation';

export type PersonalitySourceId =
  'answers' | 'voice' | 'birth-date' | 'interests' | 'numerology' | 'zodiac' | 'astrology';

export type SourceReference = {
  category: 'signal' | 'context' | 'interpretation';
  id: PersonalitySourceId;
  label: string;
  shortLabel: string;
};

export type Evidence = {
  description: string;
  id: string;
  source: PersonalitySourceId;
  title: string;
};

export type EvidenceGroup = {
  evidence: readonly Evidence[];
  id: string;
  source: SourceReference;
  title: string;
};

export type ConfidenceExplanation = {
  description: string;
  label: string;
  level: InsightConfidence;
};

export type InsightRecommendation = {
  description: string;
  title: string;
};

export type Insight = {
  confidence: ConfidenceExplanation;
  description: string;
  evidence: readonly Evidence[];
  evidenceGroups: readonly EvidenceGroup[];
  explanation: string;
  format: InsightFormat;
  id: string;
  recommendation?: InsightRecommendation;
  sources: readonly SourceReference[];
  title: string;
  traitIds: readonly string[];
};

export type PersonalityRecommendation = Insight & {
  actionLabel: string;
  category: 'communication' | 'work' | 'recovery' | 'decisions' | 'relationships' | 'interest';
  context: string;
};

export type PersonalityFacet = {
  confidence: ConfidenceExplanation;
  description: string;
  id: PersonalityFacetId;
  label: string;
  sources: readonly SourceReference[];
  targetId: string;
  title: string;
};

export type ContextualContrast = {
  context: string;
  evidence: readonly Evidence[];
  id: string;
  meaning: string;
  sources: readonly SourceReference[];
  suggestion: string;
  usual: string;
};

export type PersonalityNarrativeSection = {
  description: string;
  eyebrow: string;
  id: string;
  items: readonly Insight[];
  title: string;
};

export type ProfileSourceStatus = 'included' | 'omitted' | 'interpretation';

export type PersonalityProfileSource = SourceReference & {
  description: string;
  details: string;
  status: ProfileSourceStatus;
};

export type ProfileCompletionStatus = 'complete' | 'skipped' | 'missing';

export type ProfileCompletionItem = {
  description: string;
  id: 'answers' | 'voice' | 'birth-date' | 'interests';
  label: string;
  status: ProfileCompletionStatus;
};

export type PersonalityProfileAccess = 'free' | 'full';

export type PortraitVisualIdentity = {
  accent: 'adaptive' | 'calm' | 'connected' | 'focused';
  motif: PortraitMarkMotif;
  nodeCount: number;
  orbitCount: number;
  seed: string;
  shape: PortraitMarkShape;
};

export type PersonalityProfile = {
  access: PersonalityProfileAccess;
  communication: PersonalityNarrativeSection;
  completion: readonly ProfileCompletionItem[];
  createdAt: string;
  contrasts: readonly ContextualContrast[];
  energy: PersonalityNarrativeSection;
  evidence: readonly Evidence[];
  greeting: string;
  growthAreas: readonly Insight[];
  heroPhrase: string;
  id: string;
  interpretations: readonly Insight[];
  introduction: string;
  keyTraits: readonly string[];
  locale: ProfileLocale;
  overview: Insight;
  portraitFacets: readonly PersonalityFacet[];
  primaryInterest?: string;
  recommendations: readonly PersonalityRecommendation[];
  revealHeadline: string;
  revealLead: string;
  sourceDetails: readonly PersonalityProfileSource[];
  strengths: readonly Insight[];
  title: string;
  visualIdentity: PortraitVisualIdentity;
};
