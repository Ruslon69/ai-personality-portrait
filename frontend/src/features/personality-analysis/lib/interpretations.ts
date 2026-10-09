import { birthDateInterpretationCopy } from '../data/birth-date-interpretation-copy';
import type {
  Evidence,
  Insight,
  PersonalitySourceId,
  ProfileLocale,
} from '@entities/personality-profile';
import { createZodiacProfile, reduceNumerology } from '@features/numerology';
import {
  createConfidenceExplanation,
  createEvidenceGroups,
  createSourceReferences,
} from './explainability';

function createInterpretationEvidence(
  source: Extract<PersonalitySourceId, 'numerology' | 'zodiac' | 'astrology'>,
  title: string,
  description: string,
): Evidence {
  return {
    description,
    id: `${source}:birth-date`,
    source,
    title,
  };
}

function createInterpretation(
  source: Extract<PersonalitySourceId, 'numerology' | 'zodiac' | 'astrology'>,
  title: string,
  description: string,
  details: string,
  evidence: Evidence,
  locale: ProfileLocale,
): Insight {
  return {
    confidence: createConfidenceExplanation([evidence], locale),
    description,
    evidence: [evidence],
    evidenceGroups: createEvidenceGroups([evidence], locale),
    explanation: details,
    format: 'interpretation',
    id: `interpretation:${source}`,
    sources: createSourceReferences([evidence], ['birth-date'], locale),
    title,
    traitIds: [],
  };
}

function getLifePathNumber(birthDate: string) {
  const [year = 0, month = 0, day = 0] = birthDate.split('-').map(Number);
  return reduceNumerology([year, month, day]).value;
}

export function createNumerologyInterpretation(
  birthDate: string,
  locale: ProfileLocale = 'ru',
): Insight {
  const number = getLifePathNumber(birthDate);
  const evidence = createInterpretationEvidence(
    'numerology',
    birthDateInterpretationCopy[locale].numerologyEvidenceTitle(number),
    birthDateInterpretationCopy[locale].numerologyEvidenceDescription,
  );

  return createInterpretation(
    'numerology',
    birthDateInterpretationCopy[locale].numerologyTitle(number),
    birthDateInterpretationCopy[locale].numerologyDescription(number),
    birthDateInterpretationCopy[locale].numerologyContext,
    evidence,
    locale,
  );
}

export function createZodiacInterpretation(
  birthDate: string,
  locale: ProfileLocale = 'ru',
): Insight {
  const sign = createZodiacProfile(birthDate, locale);
  const label = sign.sign;
  const evidence = createInterpretationEvidence(
    'zodiac',
    birthDateInterpretationCopy[locale].zodiacEvidenceTitle(label),
    birthDateInterpretationCopy[locale].zodiacEvidenceDescription,
  );

  return createInterpretation(
    'zodiac',
    birthDateInterpretationCopy[locale].zodiacTitle(label),
    birthDateInterpretationCopy[locale].zodiacDescription(label, sign),
    birthDateInterpretationCopy[locale].zodiacContext,
    evidence,
    locale,
  );
}

export function createAstrologyInterpretation(
  birthDate: string,
  locale: ProfileLocale = 'ru',
): Insight {
  const sign = createZodiacProfile(birthDate, locale);
  const { element, modality } = sign;
  const signLabel = sign.sign;
  const evidence = createInterpretationEvidence(
    'astrology',
    birthDateInterpretationCopy[locale].astrologyEvidenceTitle,
    birthDateInterpretationCopy[locale].astrologyEvidenceDescription(birthDate, locale),
  );

  return createInterpretation(
    'astrology',
    birthDateInterpretationCopy[locale].astrologyTitle,
    birthDateInterpretationCopy[locale].astrologyDescription(signLabel, element, modality),
    birthDateInterpretationCopy[locale].astrologyContext,
    evidence,
    locale,
  );
}
