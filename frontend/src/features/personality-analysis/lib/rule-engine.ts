import type {
  Evidence,
  Insight,
  InsightFormat,
  InsightRecommendation,
  ProfileLocale,
} from '@entities/personality-profile';

import { getInterestLabel, getTraitTemplate, recommendationCategoryByTrait } from '../data';
import type { CollectedEvidence, RuleEngineResult, TraitId, TraitScore } from '../model';
import {
  createConfidenceExplanation,
  createEvidenceGroups,
  createInsightExplanation,
  createSourceReferences,
} from './explainability';
import { evaluateTraits, selectRankedTraits } from './trait-evaluation';

type RuleEngineOptions = {
  interests: readonly string[];
  locale: ProfileLocale;
};

function uniqueEvidence(evidence: readonly CollectedEvidence[], limit = 4) {
  const seen = new Set<string>();
  return evidence
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, limit)
    .map(({ description, id, source, title }): Evidence => ({ description, id, source, title }));
}

function createInsight(
  id: string,
  title: string,
  description: string,
  details: string,
  evidence: readonly CollectedEvidence[],
  fallbackEvidence: readonly CollectedEvidence[],
  traitIds: readonly TraitId[],
  format: InsightFormat,
  locale: ProfileLocale,
  recommendation?: InsightRecommendation,
  additionalSources: readonly 'interests'[] = [],
): Insight {
  const selectedEvidence = uniqueEvidence(evidence.length > 0 ? evidence : fallbackEvidence);
  return {
    confidence: createConfidenceExplanation(selectedEvidence, locale),
    description,
    evidence: selectedEvidence,
    evidenceGroups: createEvidenceGroups(selectedEvidence, locale),
    explanation: createInsightExplanation(selectedEvidence, details, locale),
    format,
    id,
    recommendation,
    sources: createSourceReferences(selectedEvidence, additionalSources, locale),
    title,
    traitIds,
  };
}

function overviewCopy(locale: ProfileLocale, primary: string, secondary: string) {
  if (locale === 'en')
    return `Your choices combine ${primary} with ${secondary}. The balance may shift with context rather than staying fixed.`;
  if (locale === 'uk')
    return `У ваших виборах поєднуються ${primary} і ${secondary}. Їхній баланс може змінюватися разом із контекстом.`;
  return `В ваших выборах одновременно заметны ${primary} и ${secondary}. Их баланс может меняться вместе с контекстом.`;
}

function createOverview(
  ranked: readonly TraitScore[],
  evidence: readonly CollectedEvidence[],
  locale: ProfileLocale,
) {
  const primary = ranked[0];
  const secondary = ranked[1] ?? primary;
  if (!primary || !secondary) throw new Error('Personality profile requires supported answers.');
  const primaryTemplate = getTraitTemplate(primary.id, locale);
  const secondaryTemplate = getTraitTemplate(secondary.id, locale);
  return createInsight(
    'overview',
    `${primaryTemplate.strengthTitle} · ${secondaryTemplate.strengthTitle}`,
    overviewCopy(locale, primaryTemplate.label, secondaryTemplate.label),
    `${primaryTemplate.strengthDetails} ${secondaryTemplate.strengthDetails}`,
    [...primary.evidence, ...secondary.evidence],
    evidence,
    [primary.id, secondary.id],
    'featured',
    locale,
    {
      description: primaryTemplate.recommendationDetails,
      title: primaryTemplate.recommendationTitle,
    },
  );
}

function recommendationContext(locale: ProfileLocale, interest?: string) {
  if (!interest) return '';
  if (locale === 'en') return ` Try it in a situation connected with ${interest}.`;
  if (locale === 'uk') return ` Спробуйте це в ситуації, пов’язаній із ${interest}.`;
  return ` Попробуйте это в ситуации, связанной с ${interest}.`;
}

export function runRuleEngine(
  evidence: readonly CollectedEvidence[],
  options: RuleEngineOptions,
): RuleEngineResult {
  const ranked = evaluateTraits(evidence);
  if (ranked.length === 0) throw new Error('Not enough supported answers.');

  const strengths = ranked.slice(0, 5).map(({ evidence: traitEvidence, id }, index) => {
    const template = getTraitTemplate(id, options.locale);
    return createInsight(
      `strength:${id}`,
      template.strengthTitle,
      template.strengthDescription,
      template.strengthDetails,
      traitEvidence,
      evidence,
      [id],
      index === 0 ? 'featured' : index < 3 ? 'paired' : 'application',
      options.locale,
      { description: template.recommendationDetails, title: template.recommendationTitle },
    );
  });

  const growthAreas = ranked.slice(0, 3).map(({ evidence: traitEvidence, id }) => {
    const template = getTraitTemplate(id, options.locale);
    return createInsight(
      `growth:${id}`,
      template.growthTitle,
      template.growthDescription,
      template.growthDetails,
      traitEvidence,
      evidence,
      [id],
      'application',
      options.locale,
      { description: template.recommendationDetails, title: template.recommendationTitle },
    );
  });

  const buildTopic = (
    prefix: 'communication' | 'energy',
    preferred: readonly TraitId[],
    select: (template: ReturnType<typeof getTraitTemplate>) => readonly [string, string, string],
  ) =>
    selectRankedTraits(ranked, preferred, 2).map(({ evidence: traitEvidence, id }) => {
      const template = getTraitTemplate(id, options.locale);
      const [title, description, details] = select(template);
      return createInsight(
        `${prefix}:${id}`,
        title,
        description,
        details,
        traitEvidence,
        evidence,
        [id],
        prefix === 'communication' ? 'context' : 'application',
        options.locale,
        { description: template.recommendationDetails, title: template.recommendationTitle },
      );
    });

  const communication = buildTopic(
    'communication',
    ['connection', 'directness', 'reflection', 'structure', 'adaptability'],
    (template) => [
      template.strengthTitle,
      template.strengthDescription,
      `${template.strengthDetails} ${template.growthDetails}`,
    ],
  );
  const energy = buildTopic(
    'energy',
    ['reflection', 'autonomy', 'connection', 'adaptability', 'practicality', 'structure'],
    (template) => [template.energyTitle, template.energyDescription, template.energyDetails],
  );

  const interest = options.interests[0]
    ? getInterestLabel(options.interests[0], options.locale)
    : undefined;
  const recommendations = ranked.slice(0, 5).map(({ evidence: traitEvidence, id }) => {
    const template = getTraitTemplate(id, options.locale);
    return {
      ...createInsight(
        `recommendation:${id}`,
        template.recommendationTitle,
        `${template.recommendationDescription}${recommendationContext(options.locale, interest)}`,
        template.recommendationDetails,
        traitEvidence,
        evidence,
        [id],
        'application',
        options.locale,
        { description: template.recommendationDetails, title: template.recommendationLabel },
        interest ? ['interests'] : [],
      ),
      actionLabel: template.recommendationLabel,
      category: recommendationCategoryByTrait[id],
      context: template.recommendationDescription,
    };
  });

  return {
    communication,
    energy,
    growthAreas,
    overview: createOverview(ranked, evidence, options.locale),
    rankedTraits: ranked,
    recommendations,
    strengths,
  };
}
