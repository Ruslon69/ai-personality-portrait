import type { Locale } from '@shared/i18n';

import { tarotCardById, tarotSpreadById } from '../data';
import type {
  TarotCard,
  TarotCardSelection,
  TarotInterpretation,
  TarotReading,
  TarotReadingContext,
} from '../types';
import {
  createExpertInterpretationBundleForTarot,
  createReadingEngineLineage,
} from './expert-interpretation-adapter';
import {
  createActiveCardInterpretation,
  createCardConnection,
  createCardPracticalFocus,
  createReadingSynthesis,
  russianCardName,
} from './interpretation-copy';
import { stableHash } from './seeded-shuffle';

function focusAnswer(context: TarotReadingContext) {
  return (
    context.psychologyAnswers.find((answer) => answer.questionId === 'current-focus')?.optionId ??
    context.psychologyAnswers[0]?.optionId ??
    'context'
  );
}

const contextLabels: Record<Locale, Record<string, string>> = {
  ru: {
    relationship: 'разговоры и отношения',
    work: 'работа и направление',
    resources: 'ресурсы и устойчивость',
    change: 'изменения',
    facts: 'проверка фактами',
    talk: 'диалог',
    test: 'небольшой эксперимент',
    pause: 'пауза',
  },
  en: {
    relationship: 'conversations and relationships',
    work: 'work and direction',
    resources: 'resources and stability',
    change: 'change',
    facts: 'checking facts',
    talk: 'dialogue',
    test: 'a small experiment',
    pause: 'a pause',
  },
  uk: {
    relationship: 'розмови й стосунки',
    work: 'робота й напрям',
    resources: 'ресурси та стійкість',
    change: 'зміни',
    facts: 'перевірка фактами',
    talk: 'діалог',
    test: 'невеликий експеримент',
    pause: 'пауза',
  },
};

function createInterpretation(
  selection: TarotCardSelection,
  index: number,
  selections: readonly TarotCardSelection[],
  context: TarotReadingContext,
): TarotInterpretation {
  const locale = context.locale;
  const card = tarotCardById.get(selection.cardId);
  const spread = tarotSpreadById.get(context.spreadId);
  const position = spread?.positions.find((item) => item.id === selection.positionId);
  const neighbour = tarotCardById.get(
    selections[index === selections.length - 1 ? Math.max(0, index - 1) : index + 1]?.cardId ?? '',
  );
  if (!card) throw new Error(`Unknown tarot card: ${selection.cardId}`);
  if (!position) throw new Error(`Unknown tarot position: ${selection.positionId}`);
  const focus =
    contextLabels[locale][focusAnswer(context)] ??
    (locale === 'en'
      ? 'your current context'
      : locale === 'uk'
        ? 'ваш поточний контекст'
        : 'ваш текущий контекст');
  const positionLabel = position.label[locale];
  const naturalCardName = locale === 'ru' ? russianCardName(card) : card.name[locale];
  const meaning = createActiveCardInterpretation({
    card,
    index,
    locale,
    orientation: selection.orientation,
    position,
    ...(context.topic ? { topic: context.topic } : {}),
  });
  const connections = createCardConnection({
    card,
    index,
    locale,
    ...(neighbour ? { neighbour } : {}),
    orientation: selection.orientation,
    position,
  });
  return {
    id: `${context.spreadId}:${selection.positionId}:${card.id}`,
    cardId: card.id,
    positionId: selection.positionId,
    orientation: selection.orientation,
    headline: `${positionLabel} · ${card.name[locale]}`,
    meaningInPosition: meaning,
    contextLink:
      locale === 'en'
        ? `For ${focus}, “${positionLabel}” makes ${card.name.en} a question about what you can actually notice, not a prediction.`
        : locale === 'uk'
          ? `У контексті «${focus}» карта ${card.name.uk} допомагає побачити, що відбувається насправді, а не вгадувати майбутнє.`
          : `Эта карта помогает посмотреть на происходящее трезво: что уже подтверждается фактами, а что пока держится на ожиданиях?`,
    connections,
    numerologyLink:
      locale === 'en'
        ? `Life-path ${context.numerology.lifePath.value} and personal year ${context.numerology.personalYear.value} add themes of ${context.numerology.personalYear.strengths[0]}; they do not change the card’s meaning.`
        : locale === 'uk'
          ? `Шлях ${context.numerology.lifePath.value} і персональний рік ${context.numerology.personalYear.value} додають тему «${context.numerology.personalYear.strengths[0]}», але не змінюють значення карти.`
          : `Числовой период здесь лишь усиливает тему ${context.numerology.personalYear.strengths[0]}; основной смысл всё равно задаёт сама карта.`,
    practicalTheme: createCardPracticalFocus(card, locale),
    reflectionQuestion:
      locale === 'en'
        ? `What in “${positionLabel}” supports the constructive meaning of ${card.name.en}, and what contradicts it?`
        : locale === 'uk'
          ? `Що в позиції «${positionLabel}» підтверджує конструктивний зміст карти ${card.name.uk}, а що йому суперечить?`
          : `Что здесь подтверждает смысл карты ${naturalCardName}, а что ему противоречит?`,
    uncertainty:
      locale === 'en'
        ? 'This is one possible symbolic reading, not a guaranteed event or instruction.'
        : locale === 'uk'
          ? 'Це один із можливих символічних ракурсів, а не гарантована подія чи вказівка.'
          : 'Это один из возможных символических ракурсов, а не гарантированное событие или указание.',
  };
}

export function createTarotReading(
  context: TarotReadingContext,
  selections: readonly TarotCardSelection[],
  createdAt = new Date().toISOString(),
): TarotReading {
  const locale = context.locale;
  const spread = tarotSpreadById.get(context.spreadId);
  if (!spread) throw new Error(`Unknown tarot spread: ${context.spreadId}`);
  if (selections.length !== spread.positions.length)
    throw new Error('Selection count does not match spread');
  const cards = selections
    .map((selection) => tarotCardById.get(selection.cardId))
    .filter(Boolean) as TarotCard[];
  const leading = cards[0];
  if (!leading) throw new Error('Reading requires at least one card');
  const interpretations = selections.map((selection, index) =>
    createInterpretation(selection, index, selections, context),
  );
  const synthesis = createReadingSynthesis({
    cards,
    locale,
    positions: spread.positions,
    selections,
  });
  const id = `tarot-${stableHash(JSON.stringify({ context, selections })).toString(36)}`;
  const expert = createExpertInterpretationBundleForTarot(context, selections, createdAt, {
    currentReadingId: id,
  });
  return {
    id,
    spreadId: spread.id,
    context,
    selections,
    createdAt,
    leadingCardId: leading.id,
    headline: synthesis.headline,
    summary: synthesis.summary,
    practicalFocus: synthesis.practicalFocus,
    interpretations,
    crossSystemReasoning: expert.reasoning,
    expertInterpretation: expert.result,
    narrative: expert.narrative,
    reasoningVersions: createReadingEngineLineage(context, expert),
  };
}
