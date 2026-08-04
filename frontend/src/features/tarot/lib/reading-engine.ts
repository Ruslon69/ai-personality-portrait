import type { Locale } from '@shared/i18n';

import { tarotCardById, tarotSpreadById } from '../data';
import type {
  TarotCard,
  TarotCardSelection,
  TarotInterpretation,
  TarotReading,
  TarotReadingContext,
} from '../types';
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

function topicMeaning(card: TarotCard, context: TarotReadingContext) {
  if (context.topic === 'love') return card.relationship[context.locale];
  if (context.topic === 'work') return card.work[context.locale];
  if (context.topic === 'money') return card.money[context.locale];
  if (context.topic === 'decision') return card.personalGrowth[context.locale];
  return card.upright[context.locale];
}

function cardMeaning(card: TarotCard, selection: TarotCardSelection, context: TarotReadingContext) {
  return selection.orientation === 'reversed'
    ? card.reversed[context.locale]
    : topicMeaning(card, context);
}

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
  const focus =
    contextLabels[locale][focusAnswer(context)] ??
    (locale === 'en'
      ? 'your current context'
      : locale === 'uk'
        ? 'ваш поточний контекст'
        : 'ваш текущий контекст');
  const positionLabel = position?.label[locale] ?? selection.positionId;
  const meaning = cardMeaning(card, selection, context);
  const connections = neighbour
    ? locale === 'en'
      ? `${card.name.en} and ${neighbour.name.en} connect ${card.baseThemes.en[0]} with ${neighbour.baseThemes.en[0]}.`
      : locale === 'uk'
        ? `${card.name.uk} і ${neighbour.name.uk} поєднують ${card.baseThemes.uk[0]} з темою «${neighbour.baseThemes.uk[0]}».`
        : `${card.name.ru} и ${neighbour.name.ru} связывают ${card.baseThemes.ru[0]} с темой «${neighbour.baseThemes.ru[0]}».`
    : locale === 'en'
      ? 'This single card becomes the central symbolic lens.'
      : locale === 'uk'
        ? 'Ця карта стає центральною символічною лінзою.'
        : 'Эта карта становится центральной символической линзой.';
  return {
    id: `${context.spreadId}:${selection.positionId}:${card.id}`,
    cardId: card.id,
    positionId: selection.positionId,
    orientation: selection.orientation,
    headline: `${positionLabel} · ${card.name[locale]}`,
    meaningInPosition: meaning,
    contextLink:
      locale === 'en'
        ? `In relation to ${focus}, this card suggests examining ${card.baseThemes.en[0]}.`
        : locale === 'uk'
          ? `У зв’язку з темою «${focus}» карта пропонує розглянути ${card.baseThemes.uk[0]}.`
          : `В связи с темой «${focus}» карта предлагает рассмотреть ${card.baseThemes.ru[0]}.`,
    connections,
    numerologyLink:
      locale === 'en'
        ? `Life-path ${context.numerology.lifePath.value} and personal year ${context.numerology.personalYear.value} add themes of ${context.numerology.personalYear.strengths[0]}; they do not change the card’s meaning.`
        : locale === 'uk'
          ? `Шлях ${context.numerology.lifePath.value} і персональний рік ${context.numerology.personalYear.value} додають тему «${context.numerology.personalYear.strengths[0]}», але не змінюють значення карти.`
          : `Путь ${context.numerology.lifePath.value} и персональный год ${context.numerology.personalYear.value} добавляют тему «${context.numerology.personalYear.strengths[0]}», но не меняют значение карты.`,
    practicalTheme: card.advice[locale],
    reflectionQuestion:
      locale === 'en'
        ? `Where could ${card.baseThemes.en[0]} be observed rather than assumed?`
        : locale === 'uk'
          ? `Де можна спостерігати «${card.baseThemes.uk[0]}», а не лише припускати?`
          : `Где можно наблюдать «${card.baseThemes.ru[0]}», а не только предполагать?`,
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
  const variant =
    stableHash(
      `${context.seed}:${selections.map((item) => item.cardId).join(':')}:${focusAnswer(context)}:${context.interests.join(':')}`,
    ) % 4;
  const theme = leading.baseThemes[locale][0] ?? leading.name[locale];
  const headlines = {
    ru: [
      `Сейчас важнее заметить ${theme}, чем торопить ответ`,
      `Расклад предлагает проверить ${theme} на практике`,
      `В центре периода — ${theme} и один ясный шаг`,
      `Карты соединяют ${theme} с вашим текущим выбором`,
    ],
    en: [
      `Notice ${theme} before rushing the answer`,
      `The reading asks you to test ${theme} in practice`,
      `This period centres on ${theme} and one clear step`,
      `The cards connect ${theme} with your current choice`,
    ],
    uk: [
      `Зараз важливіше помітити ${theme}, ніж квапити відповідь`,
      `Розклад пропонує перевірити ${theme} на практиці`,
      `У центрі періоду — ${theme} й один ясний крок`,
      `Карти поєднують ${theme} з вашим поточним вибором`,
    ],
  }[locale];
  const interpretations = selections.map((selection, index) =>
    createInterpretation(selection, index, selections, context),
  );
  const id = `tarot-${stableHash(JSON.stringify({ context, selections })).toString(36)}`;
  return {
    id,
    spreadId: spread.id,
    context,
    selections,
    createdAt,
    leadingCardId: leading.id,
    headline: headlines[variant] ?? headlines[0],
    summary:
      locale === 'en'
        ? `${spread.title.en} links ${cards.map((card) => card.name.en).join(', ')} into one contextual pattern.`
        : locale === 'uk'
          ? `${spread.title.uk} поєднує ${cards.map((card) => card.name.uk).join(', ')} в один контекстний малюнок.`
          : `${spread.title.ru} связывает ${cards.map((card) => card.name.ru).join(', ')} в один контекстный рисунок.`,
    practicalFocus: interpretations[0]?.practicalTheme ?? leading.advice[locale],
    interpretations,
  };
}
