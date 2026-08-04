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
      description:
        locale === 'en'
          ? 'Supported by several consistent signals'
          : locale === 'uk'
            ? 'Підтримано кількома узгодженими сигналами'
            : 'Поддержано несколькими согласованными сигналами',
      label: locale === 'en' ? 'High' : locale === 'uk' ? 'Висока' : 'Высокая',
      level: 'high',
    };
  }

  if (!includesInterpretation && evidence.length === 2) {
    return {
      description:
        locale === 'en'
          ? 'Supported by some related evidence'
          : locale === 'uk'
            ? 'Підтримано кількома пов’язаними спостереженнями'
            : 'Поддержано несколькими связанными наблюдениями',
      label: locale === 'en' ? 'Medium' : locale === 'uk' ? 'Середня' : 'Средняя',
      level: 'medium',
    };
  }

  return {
    description:
      locale === 'en'
        ? 'Interpretation based on limited signals'
        : locale === 'uk'
          ? 'Інтерпретація спирається на обмежені сигнали'
          : 'Интерпретация основана на ограниченных сигналах',
    label: locale === 'en' ? 'Low' : locale === 'uk' ? 'Низька' : 'Низкая',
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
  const sourceCount = new Set(evidence.map((item) => item.source)).size;
  const lead =
    locale === 'en'
      ? signalCount > 1
        ? sourceCount > 1
          ? 'This observation is supported across several parts of your input.'
          : 'This observation repeats across several of your answers.'
        : 'This is a careful hypothesis based on one relevant choice.'
      : locale === 'uk'
        ? signalCount > 1
          ? sourceCount > 1
            ? 'Це спостереження підтримують кілька частин вашого контексту.'
            : 'Це спостереження повторюється в кількох ваших відповідях.'
          : 'Це обережна гіпотеза на основі одного доречного вибору.'
        : signalCount > 1
          ? sourceCount > 1
            ? 'Этот вывод поддерживают несколько частей вашего контекста.'
            : 'Этот вывод повторяется в нескольких ваших ответах.'
          : 'Это осторожная гипотеза на основе одного связанного выбора.';

  return `${lead} ${contextualExplanation}`;
}
