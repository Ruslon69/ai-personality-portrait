import type { Locale } from '@shared/i18n';

import type { InterpretationTarotCardContext } from '../../types';

type LocalizedConcept = Record<Locale, string>;

const localized = (ru: string, en: string, uk: string): LocalizedConcept => ({ en, ru, uk });

const majorConcepts: Readonly<Record<string, LocalizedConcept>> = {
  'major-fool': localized(
    'новому началу без спешки',
    'a new beginning without haste',
    'новому початку без поспіху',
  ),
  'major-magician': localized(
    'намерению и доступным инструментам',
    'intention and available tools',
    'наміру й доступним інструментам',
  ),
  'major-high-priestess': localized(
    'паузе и невысказанному знанию',
    'pause and unspoken knowledge',
    'паузі й невисловленому знанню',
  ),
  'major-empress': localized(
    'росту и заботе о форме',
    'growth and care for form',
    'зростанню й турботі про форму',
  ),
  'major-emperor': localized(
    'структуре и ясным границам',
    'structure and clear boundaries',
    'структурі й ясним межам',
  ),
  'major-hierophant': localized(
    'опыту и проверенным ориентирам',
    'experience and tested guidance',
    'досвіду й перевіреним орієнтирам',
  ),
  'major-lovers': localized(
    'выбору в согласии с ценностями',
    'a choice aligned with values',
    'вибору у згоді з цінностями',
  ),
  'major-chariot': localized('направлению движения', 'the direction of movement', 'напряму руху'),
  'major-strength': localized(
    'спокойной внутренней устойчивости',
    'calm inner steadiness',
    'спокійній внутрішній стійкості',
  ),
  'major-hermit': localized(
    'собственному темпу и исследованию',
    'your own pace and inquiry',
    'власному темпу й дослідженню',
  ),
  'major-wheel': localized(
    'смене цикла и точке поворота',
    'a changing cycle and turning point',
    'зміні циклу й точці повороту',
  ),
  'major-justice': localized(
    'соразмерности выбора и последствий',
    'proportion between choice and consequence',
    'співмірності вибору й наслідків',
  ),
  'major-hanged-man': localized(
    'смене привычной перспективы',
    'a shift in familiar perspective',
    'зміні звичної перспективи',
  ),
  'major-death': localized(
    'завершению и освобождению места',
    'an ending that makes room',
    'завершенню й звільненню місця',
  ),
  'major-temperance': localized(
    'сочетанию разных тем в верной мере',
    'bringing different themes into balance',
    'поєднанню різних тем у належній мірі',
  ),
  'major-devil': localized(
    'цене привычной привязанности',
    'the cost of a familiar attachment',
    'ціні звичної прив’язаності',
  ),
  'major-tower': localized(
    'пересмотру неработающей конструкции',
    'revising a structure that no longer works',
    'перегляду конструкції, що більше не працює',
  ),
  'major-star': localized(
    'ориентиру после перемен',
    'a guiding point after change',
    'орієнтиру після змін',
  ),
  'major-moon': localized(
    'неясности и проверке впечатлений',
    'uncertainty and checking impressions',
    'неясності й перевірці вражень',
  ),
  'major-sun': localized(
    'ясности и открытому проявлению',
    'clarity and open expression',
    'ясності й відкритому прояву',
  ),
  'major-judgement': localized(
    'переоценке прошлого опыта',
    'a reassessment of past experience',
    'переоцінці минулого досвіду',
  ),
  'major-world': localized(
    'завершению цикла и целостной картине',
    'completion and the wider picture',
    'завершенню циклу й цілісній картині',
  ),
};

const suitConcepts = {
  cups: localized(
    'эмоциональному отклику и связи',
    'emotional response and connection',
    'емоційному відгуку й зв’язку',
  ),
  pentacles: localized(
    'ресурсам и практической опоре',
    'resources and practical grounding',
    'ресурсам і практичній опорі',
  ),
  swords: localized(
    'ясности мысли и формулировкам',
    'clarity of thought and language',
    'ясності думки й формулюванням',
  ),
  wands: localized(
    'импульсу, инициативе и действию',
    'impulse, initiative and action',
    'імпульсу, ініціативі й дії',
  ),
} as const;

const rankConcepts: Readonly<Record<number, LocalizedConcept>> = {
  1: localized('началу', 'a beginning', 'початку'),
  2: localized(
    'выбору между двумя направлениями',
    'a choice between two directions',
    'вибору між двома напрямами',
  ),
  3: localized(
    'первому развитию темы',
    'the first development of a theme',
    'першому розвитку теми',
  ),
  4: localized('закреплению формы', 'stabilising the form', 'закріпленню форми'),
  5: localized('точке напряжения', 'a point of tension', 'точці напруження'),
  6: localized('восстановлению движения', 'movement returning', 'відновленню руху'),
  7: localized(
    'проверке выбранного курса',
    'testing the chosen course',
    'перевірці обраного курсу',
  ),
  8: localized('последовательной практике', 'steady practice', 'послідовній практиці'),
  9: localized(
    'зрелости перед завершением',
    'maturity before completion',
    'зрілості перед завершенням',
  ),
  10: localized(
    'завершению текущего этапа',
    'completion of the current stage',
    'завершенню поточного етапу',
  ),
  11: localized('открытому исследованию', 'open exploration', 'відкритому дослідженню'),
  12: localized('направленному движению', 'directed movement', 'спрямованому руху'),
  13: localized('внутренней зрелости', 'inner maturity', 'внутрішній зрілості'),
  14: localized(
    'ответственному управлению',
    'responsible stewardship',
    'відповідальному керуванню',
  ),
};

export type ResolvedCardConcept = {
  focus: string;
  rank: string;
  suit: string | null;
};

export function resolveCardConcept(
  card: InterpretationTarotCardContext,
  locale: Locale,
): ResolvedCardConcept {
  if (card.arcana === 'major') {
    return {
      focus:
        majorConcepts[card.id]?.[locale] ??
        localized('текущей теме карты', 'the card’s current theme', 'поточній темі карти')[locale],
      rank: rankConcepts[card.number]?.[locale] ?? String(card.number),
      suit: null,
    };
  }
  const suit = card.suit
    ? suitConcepts[card.suit][locale]
    : localized('повседневному контексту', 'everyday context', 'повсякденному контексту')[locale];
  const rank = rankConcepts[card.number]?.[locale] ?? String(card.number);
  const connector: Readonly<Record<Locale, string>> = { en: 'through', ru: 'через', uk: 'через' };
  return { focus: `${rank} ${connector[locale]} ${suit}`, rank, suit };
}
