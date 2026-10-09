import type { Locale } from '@shared/i18n';
import type { TarotCard, TarotReadingContext } from '../types';
type Copy = {
  defaultContext: string;
  contextLink: (focus: string, card: TarotCard) => string;
  numerologyLink: (context: TarotReadingContext) => string;
  reflectionQuestion: (card: TarotCard, naturalCardName: string) => string;
  uncertainty: string;
};
export const readingContextCopy: Record<Locale, Copy> = {
  es: {
    defaultContext: 'tu contexto actual',
    contextLink: (focus: string, card: TarotCard) =>
      `En relación con ${focus}, ${card.name.es} invita a distinguir lo que ya ocurre de lo que solo esperas.`,
    numerologyLink: (context: TarotReadingContext) =>
      `Tu lectura por fecha añade el tema «${context.numerology.personalYear.strengths[0]}». No cambia el significado de la carta.`,
    reflectionQuestion: (card: TarotCard) =>
      `¿Qué respalda aquí el significado de ${card.name.es} y qué lo contradice?`,
    uncertainty:
      'Es una posible lectura simbólica, no un acontecimiento garantizado ni una instrucción.',
  },
  en: {
    defaultContext: 'your current context',
    contextLink: (focus: string, card: TarotCard) =>
      `For ${focus}, ${card.name.en} asks you to separate what is already happening from what you only expect.`,
    numerologyLink: (context: TarotReadingContext) =>
      `Your birth-date reading adds the theme “${context.numerology.personalYear.strengths[0]}”. It does not change the card’s meaning.`,
    reflectionQuestion: (card: TarotCard) =>
      `What supports the meaning of ${card.name.en} here, and what contradicts it?`,
    uncertainty: 'This is one possible symbolic reading, not a guaranteed event or instruction.',
  },
  uk: {
    defaultContext: 'ваш поточний контекст',
    contextLink: (focus: string, card: TarotCard) =>
      `У темі «${focus}» карта ${card.name.uk} допомагає відокремити реальні події від очікувань.`,
    numerologyLink: (context: TarotReadingContext) =>
      `Розбір за датою додає тему «${context.numerology.personalYear.strengths[0]}». Він не змінює значення карти.`,
    reflectionQuestion: (card: TarotCard) =>
      `Що тут підтверджує значення карти «${card.name.uk}», а що йому суперечить?`,
    uncertainty: 'Це лише один зі способів тлумачення, а не гарантована подія чи вказівка.',
  },
  ru: {
    defaultContext: 'ваш текущий контекст',
    contextLink: () =>
      `Эта карта помогает посмотреть на происходящее трезво: что уже подтверждается фактами, а что пока держится на ожиданиях?`,
    numerologyLink: (context: TarotReadingContext) =>
      `Разбор по дате добавляет тему «${context.numerology.personalYear.strengths[0]}». Он не меняет значение карты.`,
    reflectionQuestion: (...[, naturalCardName]) =>
      `Что здесь подтверждает значение карты «${naturalCardName}», а что ему противоречит?`,
    uncertainty: 'Это лишь один из способов толкования, а не гарантированное событие или указание.',
  },
};
