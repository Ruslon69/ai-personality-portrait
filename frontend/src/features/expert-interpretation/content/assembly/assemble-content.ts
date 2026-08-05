import type { Locale } from '@shared/i18n';

import type {
  AuthorInterpretationBlock,
  AuthorInterpretationContent,
  InterpretationConnection,
  InterpretationContext,
  InterpretationEvidence,
  InterpretationSection,
  InterpretationSource,
  InterpretationTheme,
  ThemeComposition,
} from '../../types';
import { stableId, uniqueSorted } from '../../utils';
import { resolveCardConcept, resolvePositionModifier, resolveReversedMode } from '../concepts';
import { countWords, interpolate } from '../grammar';
import { contentDictionaries, type ContentDictionary } from '../localization';
import { finalizeAuthorContent } from '../quality';
import { resolveSpreadStrategy } from '../templates';
import { selectVariation } from '../variation';

const contextLabels: Readonly<Record<Locale, Readonly<Record<string, string>>>> = {
  ru: {
    clarity: 'ясности',
    decision: 'решения',
    love: 'отношений',
    money: 'ресурсов',
    open: 'открытого вопроса',
    work: 'работы и обучения',
    day: 'сегодняшнего дня',
    week: 'этой недели',
    month: 'этого месяца',
    year: 'текущего цикла',
    building: 'постепенного движения',
    workFocus: 'текущих дел',
    zodiac: 'символического зодиакального ракурса',
    practical: 'небольшого проверяемого шага',
  },
  en: {
    clarity: 'clarity',
    decision: 'the decision',
    love: 'the relationship',
    money: 'resources',
    open: 'the open question',
    work: 'work and study',
    day: 'today',
    week: 'this week',
    month: 'this month',
    year: 'the current cycle',
    building: 'gradual movement',
    workFocus: 'current work',
    zodiac: 'the symbolic zodiac lens',
    practical: 'one small testable step',
  },
  uk: {
    clarity: 'ясності',
    decision: 'рішення',
    love: 'стосунків',
    money: 'ресурсів',
    open: 'відкритого питання',
    work: 'роботи й навчання',
    day: 'сьогоднішнього дня',
    week: 'цього тижня',
    month: 'цього місяця',
    year: 'поточного циклу',
    building: 'поступового руху',
    workFocus: 'поточних справ',
    zodiac: 'символічного зодіакального ракурсу',
    practical: 'невеликого кроку для перевірки',
  },
};

function localContext(value: string | null | undefined, locale: Locale) {
  if (!value) return contextLabels[locale].open ?? value ?? '';
  const normalized = value === 'work' ? 'workFocus' : value;
  return contextLabels[locale][normalized] ?? contextLabels[locale].open ?? value;
}

function sourceIdsFor(evidenceIds: readonly string[], evidence: readonly InterpretationEvidence[]) {
  return uniqueSorted(
    evidence.filter((item) => evidenceIds.includes(item.id)).map((item) => item.source),
  ) as readonly InterpretationSource[];
}

function makeBlock(input: {
  evidenceIds: readonly string[];
  kind: AuthorInterpretationBlock['kind'];
  sectionId: string;
  sources: readonly InterpretationSource[];
  text: string;
}) {
  return {
    evidenceIds: uniqueSorted(input.evidenceIds),
    id: stableId('content-block', { kind: input.kind, sectionId: input.sectionId }),
    kind: input.kind,
    sourceIds: uniqueSorted(input.sources) as readonly InterpretationSource[],
    text: input.text,
  } satisfies AuthorInterpretationBlock;
}

function contentFocus(
  theme: InterpretationTheme,
  context: InterpretationContext,
  dictionary: ContentDictionary,
) {
  if (theme.kind === 'period') {
    const value =
      theme.relatedNumbers[0] ??
      context.numerology?.numbers.find((item) => item.id === 'personal-year')?.value;
    return value
      ? (dictionary.numberThemes[value] ?? String(value))
      : localContext(context.tarot.period, context.locale);
  }
  if (theme.kind === 'context')
    return localContext(context.tarot.topic ?? context.tarot.period, context.locale);
  if (theme.kind === 'practical')
    return contextLabels[context.locale].practical ?? 'a practical step';
  if (theme.kind === 'symbolic') return contextLabels[context.locale].zodiac ?? 'a symbolic lens';
  const card = context.tarot.cards.find((item) => theme.relatedCards.includes(item.id));
  return card
    ? resolveCardConcept(card, context.locale).focus
    : localContext(context.tarot.topic, context.locale);
}

function headlineWithinLimits(headline: string, locale: Locale, strategyId: string) {
  const normalized = headline.replace(/[.?]+$/u, '').trim();
  const count = countWords(normalized);
  if (count >= 5 && count <= 12) return normalized;
  const fallbacks: Readonly<Record<Locale, Readonly<Record<string, string>>>> = {
    ru: {
      love: 'Сейчас отношениям нужны ясность и честный диалог',
      money: 'Ресурсам сейчас нужны ясность и практические границы',
      decision: 'Перед выбором стоит вернуть себе ясную опору',
      week: 'Эта неделя просит сверить направление движения',
      month: 'Этот месяц помогает придать намерению ясную форму',
      'compact-year': 'Текущий цикл просит удерживать выбранное направление',
      'work-study': 'В делах важнее опора, чем резкое ускорение',
      'card-of-the-day': 'Сегодня важнее заметить направление следующего шага',
    },
    en: {
      love: 'Connection now needs clarity and honest dialogue',
      money: 'Resources now need clarity and practical boundaries',
      decision: 'Bring a clear anchor back before choosing',
      week: 'This week asks you to check direction',
      month: 'This month gives intention a clearer form',
      'compact-year': 'This cycle asks you to hold direction',
      'work-study': 'Practical grounding matters more than sudden speed',
      'card-of-the-day': 'Notice the direction of your next step today',
    },
    uk: {
      love: 'Стосункам зараз потрібні ясність і чесний діалог',
      money: 'Ресурсам зараз потрібні ясність і практичні межі',
      decision: 'Перед вибором варто повернути собі ясну опору',
      week: 'Цей тиждень просить звірити напрям руху',
      month: 'Цей місяць допомагає надати наміру ясної форми',
      'compact-year': 'Поточний цикл просить утримувати обраний напрям',
      'work-study': 'У справах опора важливіша за різке прискорення',
      'card-of-the-day': 'Сьогодні важливо помітити напрям наступного кроку',
    },
  };
  return fallbacks[locale][strategyId] ?? fallbacks[locale]['card-of-the-day'] ?? normalized;
}

function relevantConnection(
  theme: InterpretationTheme,
  connections: readonly InterpretationConnection[],
) {
  return connections
    .filter((item) => theme.connectionIds.includes(item.id))
    .sort((left, right) => {
      const rank = { primary: 0, secondary: 1, contextual: 2 } as const;
      return rank[left.strength] - rank[right.strength] || left.id.localeCompare(right.id);
    })[0];
}

function numerologyBlock(
  theme: InterpretationTheme,
  context: InterpretationContext,
  dictionary: ContentDictionary,
  evidence: readonly InterpretationEvidence[],
  connections: readonly InterpretationConnection[],
  sectionId: string,
  fingerprint: string,
) {
  if (!context.numerology) return null;
  const numbers = context.numerology.numbers;
  const numberById = (id: (typeof numbers)[number]['id']) => numbers.find((item) => item.id === id);
  const cardLink = connections.find(
    (item) =>
      item.source === 'numerology' &&
      item.semanticId.startsWith('numerology.card-number-link.') &&
      item.cardIds.some((cardId) => theme.relatedCards.includes(cardId)),
  );
  const periodId =
    context.tarot.period === 'day'
      ? 'personal-day'
      : context.tarot.period === 'month'
        ? 'personal-month'
        : 'personal-year';
  const number =
    (theme.kind === 'card' && cardLink
      ? numbers.find((item) => cardLink.numberValues.includes(item.value))
      : null) ??
    (theme.kind === 'period'
      ? numberById(periodId)
      : theme.kind === 'practical'
        ? numberById('birthday')
        : theme.kind === 'context'
          ? numberById('life-path')
          : null);
  if (!number) return null;
  const relatedNumberIds =
    theme.kind === 'context'
      ? uniqueSorted(
          [number.id, numberById('first-impression')?.id].filter(
            (id): id is (typeof numbers)[number]['id'] => Boolean(id),
          ),
        )
      : [number.id];
  const evidenceIds = evidence
    .filter((item) => item.source === 'numerology' && item.reference?.id === number.id)
    .map((item) => item.id);
  if (theme.kind === 'context') {
    evidenceIds.push(
      ...evidence
        .filter(
          (item) =>
            item.source === 'numerology' &&
            item.reference?.kind === 'number' &&
            relatedNumberIds.includes(item.reference.id as (typeof numbers)[number]['id']),
        )
        .map((item) => item.id),
    );
  }
  if (!evidenceIds.length) return null;
  const coreContrast = connections.find(
    (item) => item.source === 'numerology' && item.semanticId === 'numerology.core-distinct-lenses',
  );
  const wordingContext = cardLink
    ? 'tarot'
    : theme.kind === 'period'
      ? 'period'
      : theme.kind === 'practical'
        ? 'practical'
        : coreContrast
          ? 'tension'
          : 'core';
  let text = interpolate(
    selectVariation(dictionary.numerology[wordingContext], `${fingerprint}:number:${number.id}`),
    {
      number: number.value,
      numberTheme: dictionary.numberThemes[number.value] ?? String(number.value),
    },
  );
  const social = theme.kind === 'context' ? numberById('first-impression') : null;
  if (social) {
    text = `${text} ${interpolate(
      selectVariation(dictionary.numerology.social, `${fingerprint}:number:${social.id}`),
      {
        number: social.value,
        numberTheme: dictionary.numberThemes[social.value] ?? String(social.value),
      },
    )}`;
  }
  if (context.numerology.masterNumbers.includes(number.value)) {
    text = `${text} ${interpolate(
      selectVariation(dictionary.numerology.core, `${fingerprint}:master:${number.value}`),
      {
        number: number.value,
        numberTheme: dictionary.numberThemes[number.value] ?? String(number.value),
      },
    )}`;
  }
  return makeBlock({
    evidenceIds: uniqueSorted(evidenceIds),
    kind: 'numerology-connection',
    sectionId,
    sources: ['numerology'],
    text,
  });
}

function assembleSection(
  section: InterpretationSection,
  theme: InterpretationTheme,
  sectionIndex: number,
  context: InterpretationContext,
  evidence: readonly InterpretationEvidence[],
  connections: readonly InterpretationConnection[],
  dictionary: ContentDictionary,
  fingerprint: string,
) {
  const focus = contentFocus(theme, context, dictionary);
  const card = context.tarot.cards.find((item) => theme.relatedCards.includes(item.id));
  const relationship = relevantConnection(theme, connections);
  const sourceIds = sourceIdsFor(theme.evidenceIds, evidence);
  const blocks: AuthorInterpretationBlock[] = [];

  if (card) {
    const positionModifier = resolvePositionModifier(card.positionId);
    const positionText = interpolate(
      selectVariation(dictionary.position[positionModifier], `${fingerprint}:position:${card.id}`),
      { focus },
    );
    const reversedMode = resolveReversedMode(card, context);
    const orientationText = interpolate(
      selectVariation(
        dictionary.orientation[reversedMode ?? 'upright'],
        `${fingerprint}:orientation:${card.id}`,
      ),
      { focus },
    );
    blocks.push(
      makeBlock({
        evidenceIds: theme.evidenceIds,
        kind: 'card-position-meaning',
        sectionId: section.id,
        sources: sourceIds,
        text: `${positionText} ${orientationText}`,
      }),
    );
  }

  if (theme.kind === 'context' || theme.kind === 'symbolic') {
    blocks.push(
      makeBlock({
        evidenceIds: theme.evidenceIds,
        kind: 'contextual-meaning',
        sectionId: section.id,
        sources: sourceIds,
        text: interpolate(
          selectVariation(dictionary.contextual, `${fingerprint}:context:${theme.id}`),
          { context: focus },
        ),
      }),
    );
  }

  if (relationship && relationship.cardIds.length >= 2) {
    const [leftId, rightId] = relationship.cardIds;
    const left = context.tarot.cards.find((item) => item.id === leftId);
    const right = context.tarot.cards.find((item) => item.id === rightId);
    if (left && right) {
      blocks.push(
        makeBlock({
          evidenceIds: relationship.evidenceIds,
          kind: 'card-connections',
          sectionId: section.id,
          sources: sourceIdsFor(relationship.evidenceIds, evidence),
          text: interpolate(
            selectVariation(
              dictionary.connection[relationship.kind],
              `${fingerprint}:connection:${relationship.id}`,
            ),
            {
              left: resolveCardConcept(left, context.locale).focus,
              right: resolveCardConcept(right, context.locale).focus,
            },
          ),
        }),
      );
    }
  }

  const numberBlock = numerologyBlock(
    theme,
    context,
    dictionary,
    evidence,
    connections,
    section.id,
    fingerprint,
  );
  if (numberBlock) blocks.push(numberBlock);

  if (
    context.metadata.sourceAvailability.psychologicalContext &&
    (sectionIndex === 0 || theme.kind === 'practical')
  ) {
    const psychologicalEvidence = evidence.filter(
      (item) => item.source === 'psychological-context',
    );
    const psychologicalFocus = localContext(
      context.psychology.desiredReadingFocus ?? context.psychology.currentConcern,
      context.locale,
    );
    blocks.push(
      makeBlock({
        evidenceIds: psychologicalEvidence.map((item) => item.id),
        kind: 'psychological-context',
        sectionId: section.id,
        sources: ['psychological-context'],
        text: interpolate(
          selectVariation(dictionary.psychological, `${fingerprint}:psychology:${section.id}`),
          { context: psychologicalFocus },
        ),
      }),
    );
  }

  const practicalEvidenceIds = theme.evidenceIds.length
    ? theme.evidenceIds
    : evidence.slice(0, 1).map((item) => item.id);
  let practicalText = interpolate(
    selectVariation(dictionary.practical, `${fingerprint}:practical:${section.id}`, sectionIndex),
    { focus },
  );
  if (sectionIndex === 0) {
    practicalText = `${interpolate(
      selectVariation(dictionary.contextual, `${fingerprint}:practical-context`),
      { context: localContext(context.tarot.topic ?? context.tarot.period, context.locale) },
    )} ${practicalText}`;
    const interest = context.interests.selected.find((item) => dictionary.interestExamples[item]);
    if (interest) {
      practicalText = `${practicalText} ${selectVariation(dictionary.interestExamples[interest] ?? [], `${fingerprint}:interest:${interest}`)}.`;
    }
  }
  blocks.push(
    makeBlock({
      evidenceIds: practicalEvidenceIds,
      kind: 'practical-focus',
      sectionId: section.id,
      sources: sourceIdsFor(practicalEvidenceIds, evidence),
      text: practicalText,
    }),
    makeBlock({
      evidenceIds: theme.evidenceIds,
      kind: 'reflection-question',
      sectionId: section.id,
      sources: sourceIds,
      text: interpolate(
        selectVariation(dictionary.reflection, `${fingerprint}:reflection:${section.id}`),
        { focus },
      ),
    }),
    makeBlock({
      evidenceIds: theme.evidenceIds,
      kind: 'uncertainty-note',
      sectionId: section.id,
      sources: sourceIds,
      text: selectVariation(dictionary.uncertainty, `${fingerprint}:uncertainty:${section.id}`),
    }),
  );

  const opening = sectionIndex
    ? `${selectVariation(dictionary.transitions, `${fingerprint}:transition:${section.id}`)}.`
    : null;
  return {
    blocks,
    headline: interpolate(
      selectVariation(dictionary.sectionHeadline, `${fingerprint}:section-headline:${theme.id}`),
      { focus },
    ),
    id: stableId('author-content-section', section.id),
    ...(opening ? { opening } : {}),
    sectionId: section.id,
  };
}

export function assembleAuthorInterpretationContent(input: {
  composition: ThemeComposition;
  connections: readonly InterpretationConnection[];
  context: InterpretationContext;
  evidence: readonly InterpretationEvidence[];
  fingerprint: string;
  sections: readonly InterpretationSection[];
}): AuthorInterpretationContent {
  const { composition, connections, context, evidence, fingerprint, sections } = input;
  const dictionary = contentDictionaries[context.locale];
  const strategy = resolveSpreadStrategy(context.tarot.spreadId);
  const leading =
    composition.themes.find((theme) => theme.id === composition.leadingThemeId) ??
    composition.themes[0];
  if (!leading) throw new Error('Author content requires a leading theme.');
  const focus = contentFocus(leading, context, dictionary);
  const emptyQuality: AuthorInterpretationContent['quality'] = {
    issues: [],
    mergedSectionIds: [],
    replacements: [],
    score: {
      claimSafety: 0,
      completeness: 0,
      localizationCompleteness: 0,
      overall: 0,
      repetition: 0,
      sectionBalance: 0,
      sourceGrounding: 0,
      specificity: 0,
    },
    threshold: 0,
    valid: false,
  };
  const initial: AuthorInterpretationContent = {
    closing: selectVariation(dictionary.closing, `${fingerprint}:closing`),
    headline: headlineWithinLimits(
      interpolate(selectVariation(dictionary.headline[strategy.id], `${fingerprint}:headline`), {
        focus,
      }),
      context.locale,
      strategy.id,
    ),
    locale: context.locale,
    narrativeStrategy: strategy.id,
    opening: selectVariation(dictionary.opening[strategy.id], `${fingerprint}:opening`),
    quality: emptyQuality,
    sections: sections.map((section, index) => {
      const theme =
        composition.themes.find((item) => section.id.endsWith(item.id.replace('theme:', ''))) ??
        composition.themes[index];
      if (!theme) throw new Error(`Missing theme for section ${section.id}.`);
      return assembleSection(
        section,
        theme,
        index,
        context,
        evidence,
        connections,
        dictionary,
        fingerprint,
      );
    }),
    version: 'author-content-v1',
  };
  return finalizeAuthorContent(initial, dictionary, evidence, fingerprint);
}
