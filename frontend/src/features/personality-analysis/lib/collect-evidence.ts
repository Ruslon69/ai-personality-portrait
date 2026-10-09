import { evidenceAssemblyCopy } from '../data/evidence-copy';
import { getPortraitQuestions } from '@features/questionnaire/data/portraitQuestions';
import type {
  DraftPortrait,
  Evidence,
  PersonalitySourceId,
  ProfileLocale,
} from '@entities/personality-profile';

import { answerRules, getInterestLabel } from '../data';
import type { CollectedEvidence } from '../model';

export type EvidenceCollection = {
  context: readonly Evidence[];
  traitEvidence: readonly CollectedEvidence[];
};

function createContextEvidence(
  id: string,
  source: PersonalitySourceId,
  title: string,
  description: string,
): Evidence {
  return { description, id, source, title };
}

export function collectEvidence(
  draft: DraftPortrait,
  locale: ProfileLocale = 'ru',
): EvidenceCollection {
  const traitEvidence: CollectedEvidence[] = [];
  const context: Evidence[] = [];
  const questions = getPortraitQuestions(locale);

  Object.entries(draft.answers)
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([questionId, response]) => {
      if (response.skipped) return;
      [...response.optionIds].sort().forEach((optionId) => {
        const rule = answerRules[`${questionId}:${optionId}`];
        if (!rule) return;
        const question = questions.find((item) => item.id === questionId);
        const option = question?.options.find((item) => item.id === optionId);
        if (!question || !option) return;
        traitEvidence.push({
          description: option.label,
          id: `answer:${questionId}:${optionId}`,
          source: 'answers',
          title: question.title,
          traits: rule.traits,
          weight: rule.weight ?? 1,
        });
      });
    });

  draft.interests.forEach((interestId) => {
    const label = getInterestLabel(interestId, locale);
    context.push({
      description: evidenceAssemblyCopy[locale].interestDescription(label),
      id: `interest:${interestId}`,
      source: 'interests',
      title: evidenceAssemblyCopy[locale].interestTitle,
    });
  });

  if (draft.voice.status === 'included') {
    const seconds = Math.round(draft.voice.durationMs / 1000);
    context.push(
      createContextEvidence(
        'voice:technical-context',
        'voice',
        evidenceAssemblyCopy[locale].voiceTitle,
        evidenceAssemblyCopy[locale].voiceDescription(seconds),
      ),
    );
  }

  if (draft.birthDate.status === 'included') {
    context.push(
      createContextEvidence(
        'birth-date:provided',
        'birth-date',
        evidenceAssemblyCopy[locale].birthTitle,
        evidenceAssemblyCopy[locale].birthDescription,
      ),
    );
  }

  return { context, traitEvidence };
}
