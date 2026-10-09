import { confidenceCopy } from '../data/confidence-copy';
import {
  getSourceReference,
  getSourceReferences,
  type ConfidenceExplanation,
  type Evidence,
  type EvidenceGroup,
  type PersonalitySourceId,
  type ProfileLocale,
  type SourceReference,
} from '@entities/personality-profile';

const sourceOrder: readonly PersonalitySourceId[] = [
  'answers',
  'interests',
  'voice',
  'birth-date',
  'numerology',
  'zodiac',
  'astrology',
];

export function createConfidenceExplanation(
  evidence: readonly Evidence[],
  locale: ProfileLocale = 'ru',
): ConfidenceExplanation {
  const includesInterpretation = evidence.some(
    (item) => getSourceReference(item.source).category === 'interpretation',
  );

  if (!includesInterpretation && evidence.length >= 3) {
    return {
      description: confidenceCopy[locale].highDescription,
      label: confidenceCopy[locale].highLabel,
      level: 'high',
    };
  }

  if (!includesInterpretation && evidence.length === 2) {
    return {
      description: confidenceCopy[locale].mediumDescription,
      label: confidenceCopy[locale].mediumLabel,
      level: 'medium',
    };
  }

  return {
    description: confidenceCopy[locale].lowDescription,
    label: confidenceCopy[locale].lowLabel,
    level: 'low',
  };
}

export function createEvidenceGroups(
  evidence: readonly Evidence[],
  locale: ProfileLocale = 'ru',
): readonly EvidenceGroup[] {
  return sourceOrder.flatMap((sourceId) => {
    const sourceEvidence = evidence.filter((item) => item.source === sourceId);
    if (sourceEvidence.length === 0) {
      return [];
    }

    const source = getSourceReference(sourceId, locale);
    return [
      {
        evidence: sourceEvidence,
        id: `evidence-group:${sourceId}`,
        source,
        title: source.label,
      },
    ];
  });
}

export function createSourceReferences(
  evidence: readonly Evidence[],
  additionalSources: readonly PersonalitySourceId[] = [],
  locale: ProfileLocale = 'ru',
): readonly SourceReference[] {
  const includedSources = new Set([...evidence.map((item) => item.source), ...additionalSources]);

  return getSourceReferences(
    sourceOrder.filter((sourceId) => includedSources.has(sourceId)),
    locale,
  );
}

export function createInsightExplanation(
  evidence: readonly Evidence[],
  contextualExplanation: string,
  locale: ProfileLocale = 'ru',
) {
  const signalCount = evidence.length;
  // The disclosure already shows source and confidence. Keep the explanation
  // focused on the actual pattern; retain the caveat for a single choice.
  if (signalCount > 1) return contextualExplanation;
  const lead = confidenceCopy[locale].tentativeLead;

  return `${lead} ${contextualExplanation}`;
}
