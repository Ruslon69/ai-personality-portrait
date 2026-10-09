import { readingContextCopy } from '../data/reading-context-copy';
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
  es: {
    relationship: 'las conversaciones y relaciones',
    work: 'el trabajo y el rumbo',
    resources: 'los recursos y la estabilidad',
    change: 'el cambio',
    facts: 'la comprobación de los hechos',
    talk: 'el diálogo',
    test: 'un pequeño experimento',
    pause: 'una pausa',
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
    contextLabels[locale][focusAnswer(context)] ?? readingContextCopy[locale].defaultContext;
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
    contextLink: readingContextCopy[locale].contextLink(focus, card),
    connections,
    numerologyLink: readingContextCopy[locale].numerologyLink(context),
    practicalTheme: createCardPracticalFocus(card, locale),
    reflectionQuestion: readingContextCopy[locale].reflectionQuestion(card, naturalCardName),
    uncertainty: readingContextCopy[locale].uncertainty,
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
