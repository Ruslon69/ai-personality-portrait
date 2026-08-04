import type {
  Evidence,
  Insight,
  PersonalityRecommendation,
  PersonalitySourceId,
} from '@entities/personality-profile';

export type TraitId =
  | 'adaptability'
  | 'autonomy'
  | 'connection'
  | 'directness'
  | 'initiative'
  | 'openness'
  | 'practicality'
  | 'reflection'
  | 'structure';

export type CollectedEvidence = Evidence & {
  traits: readonly TraitId[];
  weight: number;
};

export type TraitScore = {
  evidence: readonly CollectedEvidence[];
  id: TraitId;
  score: number;
};

export type TraitRule = {
  description: string;
  title: string;
  traits: readonly TraitId[];
  weight?: number;
};

export type TraitTemplate = {
  energyDescription: string;
  energyDetails: string;
  energyTitle: string;
  growthDescription: string;
  growthDetails: string;
  growthTitle: string;
  label: string;
  recommendationDescription: string;
  recommendationDetails: string;
  recommendationLabel: string;
  recommendationTitle: string;
  strengthDescription: string;
  strengthDetails: string;
  strengthTitle: string;
};

export type RuleEngineResult = {
  communication: readonly Insight[];
  energy: readonly Insight[];
  growthAreas: readonly Insight[];
  overview: Insight;
  rankedTraits: readonly TraitScore[];
  recommendations: readonly PersonalityRecommendation[];
  strengths: readonly Insight[];
};

export type InterpretationInput = {
  birthDate: string;
  source: Extract<PersonalitySourceId, 'numerology' | 'zodiac' | 'astrology'>;
};
