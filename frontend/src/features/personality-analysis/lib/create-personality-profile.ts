import { completionCopy, sourceDetailsCopy, profileCopy } from '../data/profile-copy';
import { portraitAssemblyCopy } from '../data/portrait-assembly-copy';
import type {
  DraftPortrait,
  Evidence,
  Insight,
  PersonalityProfile,
  PersonalityProfileSource,
  ProfileLocale,
  ProfileCompletionItem,
} from '@entities/personality-profile';
import { getSourceReference } from '@entities/personality-profile';

import { getInterestLabel, getTraitTemplate } from '../data';
import { collectEvidence } from './collect-evidence';
import {
  createContextualContrasts,
  createHeroPhrase,
  createPortraitVisualIdentity,
  createPortraitFacets,
  createRevealCopy,
} from './pattern-composition';
import {
  createAstrologyInterpretation,
  createNumerologyInterpretation,
  createZodiacInterpretation,
} from './interpretations';
import { runRuleEngine } from './rule-engine';

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function serializeDraft(draft: DraftPortrait) {
  const answers = Object.entries(draft.answers)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([questionId, response]) => [
      questionId,
      { optionIds: [...response.optionIds].sort(), skipped: response.skipped },
    ]);

  return JSON.stringify({
    answers,
    birthDate: draft.birthDate,
    interests: [...draft.interests].sort(),
    interpretationLayers: draft.interpretationLayers,
    voice:
      draft.voice.status === 'included'
        ? {
            durationMs: draft.voice.durationMs,
            mimeType: draft.voice.mimeType,
            status: draft.voice.status,
          }
        : draft.voice,
  });
}

function createInterpretations(draft: DraftPortrait, locale: ProfileLocale): readonly Insight[] {
  if (draft.birthDate.status !== 'included') {
    return [];
  }

  const insights: Insight[] = [];

  if (draft.interpretationLayers.numerology) {
    insights.push(createNumerologyInterpretation(draft.birthDate.value, locale));
  }
  if (draft.interpretationLayers.zodiac) {
    insights.push(createZodiacInterpretation(draft.birthDate.value, locale));
  }
  if (draft.interpretationLayers.astrology) {
    insights.push(createAstrologyInterpretation(draft.birthDate.value, locale));
  }

  return insights;
}

function createCompletion(
  draft: DraftPortrait,
  locale: ProfileLocale,
): readonly ProfileCompletionItem[] {
  const answeredCount = Object.values(draft.answers).filter(
    (answer) => !answer.skipped && answer.optionIds.length > 0,
  ).length;

  const copy = completionCopy[locale];
  return [
    {
      description: answeredCount > 0 ? copy.answersCount(answeredCount) : copy.answersEmpty,
      id: 'answers',
      label: copy.answers,
      status: answeredCount > 0 ? 'complete' : 'missing',
    },
    {
      description: draft.voice.status === 'included' ? copy.voiceIncluded : copy.voiceSkipped,
      id: 'voice',
      label: copy.voice,
      status: draft.voice.status === 'included' ? 'complete' : 'skipped',
    },
    {
      description: draft.birthDate.status === 'included' ? copy.birthIncluded : copy.birthSkipped,
      id: 'birth-date',
      label: copy.birth,
      status: draft.birthDate.status === 'included' ? 'complete' : 'skipped',
    },
    {
      description:
        draft.interests.length > 0
          ? copy.interestsCount(draft.interests.length)
          : copy.interestsEmpty,
      id: 'interests',
      label: copy.interests,
      status: draft.interests.length > 0 ? 'complete' : 'missing',
    },
  ];
}

function createSourceDetails(
  draft: DraftPortrait,
  locale: ProfileLocale,
): readonly PersonalityProfileSource[] {
  const answeredCount = Object.values(draft.answers).filter(
    (answer) => !answer.skipped && answer.optionIds.length > 0,
  ).length;
  const copy = sourceDetailsCopy[locale];
  const sources: PersonalityProfileSource[] = [
    {
      ...getSourceReference('answers', locale),
      description: copy.answers(answeredCount),
      details: copy.answersDetails,
      status: answeredCount > 0 ? 'included' : 'omitted',
    },
    {
      ...getSourceReference('voice', locale),
      description: draft.voice.status === 'included' ? copy.voiceIncluded : copy.voiceSkipped,
      details: copy.voiceDetails,
      status: draft.voice.status === 'included' ? 'included' : 'omitted',
    },
    {
      ...getSourceReference('birth-date', locale),
      description: draft.birthDate.status === 'included' ? copy.birthIncluded : copy.birthSkipped,
      details: copy.birthDetails,
      status: draft.birthDate.status === 'included' ? 'included' : 'omitted',
    },
    {
      ...getSourceReference('interests', locale),
      description: copy.interests(draft.interests.length),
      details: copy.interestsDetails,
      status: draft.interests.length > 0 ? 'included' : 'omitted',
    },
  ];

  const interpretationSources = [
    {
      enabled: draft.interpretationLayers.numerology && draft.birthDate.status === 'included',
      id: 'numerology' as const,
    },
    {
      enabled: draft.interpretationLayers.zodiac && draft.birthDate.status === 'included',
      id: 'zodiac' as const,
    },
    {
      enabled: draft.interpretationLayers.astrology && draft.birthDate.status === 'included',
      id: 'astrology' as const,
    },
  ];

  interpretationSources.forEach((source) => {
    if (!source.enabled) {
      return;
    }

    sources.push({
      ...getSourceReference(source.id, locale),
      description: copy.interpretation,
      details: copy.interpretationDetails,
      status: 'interpretation',
    });
  });

  return sources;
}

export function createPersonalityProfile(
  draft: DraftPortrait,
  createdAt: string,
  locale: ProfileLocale = 'ru',
): PersonalityProfile {
  const { context, traitEvidence } = collectEvidence(draft, locale);
  const ruleResult = runRuleEngine(traitEvidence, { interests: draft.interests, locale });
  const interpretations = createInterpretations(draft, locale);
  const answerAndInterestEvidence = traitEvidence.map(
    ({ description, id, source, title }): Evidence => ({
      description,
      id,
      source,
      title,
    }),
  );
  const profileId = `portrait-${stableHash(serializeDraft(draft))}`;
  const insightsByTrait = new Map(
    [
      ...ruleResult.strengths,
      ...ruleResult.growthAreas,
      ...ruleResult.communication,
      ...ruleResult.energy,
      ruleResult.overview,
    ].flatMap((insight) => insight.traitIds.map((traitId) => [traitId, insight] as const)),
  );
  const compositionInput = {
    hasInterpretations: interpretations.length > 0,
    insightsByTrait,
    interests: draft.interests,
    locale,
    ranked: ruleResult.rankedTraits,
    sourceCount: [
      Object.keys(draft.answers).length > 0,
      draft.interests.length > 0,
      draft.voice.status === 'included',
      draft.birthDate.status === 'included',
      interpretations.length > 0,
    ].filter(Boolean).length,
  };
  const contrasts = createContextualContrasts(compositionInput);
  const revealCopy = createRevealCopy(compositionInput, contrasts.length > 0);
  const copy = profileCopy[locale];

  return {
    access: 'full',
    communication: {
      description: copy.communicationDescription,
      eyebrow: portraitAssemblyCopy[locale].communication,
      id: 'communication',
      items: ruleResult.communication,
      title: copy.communicationTitle,
    },
    completion: createCompletion(draft, locale),
    createdAt,
    contrasts,
    energy: {
      description: copy.energyDescription,
      eyebrow: portraitAssemblyCopy[locale].energy,
      id: 'energy',
      items: ruleResult.energy,
      title: copy.energyTitle,
    },
    evidence: [
      ...answerAndInterestEvidence,
      ...context,
      ...interpretations.flatMap((insight) => insight.evidence),
    ],
    greeting: copy.greeting,
    growthAreas: ruleResult.growthAreas,
    heroPhrase: createHeroPhrase(compositionInput),
    id: profileId,
    interpretations,
    introduction: copy.introduction,
    keyTraits: ruleResult.rankedTraits
      .slice(0, 3)
      .map((trait) => getTraitTemplate(trait.id, locale).label),
    locale,
    overview: ruleResult.overview,
    portraitFacets: createPortraitFacets(compositionInput),
    primaryInterest: draft.interests[0] ? getInterestLabel(draft.interests[0], locale) : undefined,
    recommendations: ruleResult.recommendations,
    revealHeadline: revealCopy.headline,
    revealLead: revealCopy.lead,
    sourceDetails: createSourceDetails(draft, locale),
    strengths: ruleResult.strengths,
    title: copy.title,
    visualIdentity: createPortraitVisualIdentity(profileId, compositionInput),
  };
}

export function canCreatePersonalityProfile(draft: DraftPortrait) {
  return collectEvidence(draft).traitEvidence.length > 0;
}
