import type { Locale } from '@shared/i18n';

import type { InterpretationTarotCardContext } from '../../types';

type LocalizedConcept = Record<Locale, string>;

const localized = (ru: string, en: string, uk: string, es: string): LocalizedConcept => ({
  en,
  ru,
  uk,
  es,
});

const majorConcepts: Readonly<Record<string, LocalizedConcept>> = {
  'major-fool': localized(
    'новому началу без спешки',
    'a new beginning without haste',
    'новому початку без поспіху',
    'un nuevo comienzo sin prisas',
  ),
  'major-magician': localized(
    'намерению и доступным инструментам',
    'intention and available tools',
    'наміру й доступним інструментам',
    'la intención y las herramientas disponibles',
  ),
  'major-high-priestess': localized(
    'паузе и невысказанному знанию',
    'pause and unspoken knowledge',
    'паузі й невисловленому знанню',
    'la pausa y el conocimiento aún no expresado',
  ),
  'major-empress': localized(
    'росту и заботе о форме',
    'growth and care for form',
    'зростанню й турботі про форму',
    'el crecimiento y el cuidado de la forma',
  ),
  'major-emperor': localized(
    'структуре и ясным границам',
    'structure and clear boundaries',
    'структурі й ясним межам',
    'la estructura y los límites claros',
  ),
  'major-hierophant': localized(
    'опыту и проверенным ориентирам',
    'experience and tested guidance',
    'досвіду й перевіреним орієнтирам',
    'la experiencia y las referencias contrastadas',
  ),
  'major-lovers': localized(
    'выбору в согласии с ценностями',
    'a choice aligned with values',
    'вибору у згоді з цінностями',
    'una elección coherente con los valores',
  ),
  'major-chariot': localized(
    'направлению движения',
    'the direction of movement',
    'напряму руху',
    'el rumbo del movimiento',
  ),
  'major-strength': localized(
    'спокойной внутренней устойчивости',
    'calm inner steadiness',
    'спокійній внутрішній стійкості',
    'la firmeza interior tranquila',
  ),
  'major-hermit': localized(
    'собственному темпу и исследованию',
    'your own pace and inquiry',
    'власному темпу й дослідженню',
    'tu propio ritmo y la búsqueda',
  ),
  'major-wheel': localized(
    'смене цикла и точке поворота',
    'a changing cycle and turning point',
    'зміні циклу й точці повороту',
    'un cambio de ciclo y un punto de giro',
  ),
  'major-justice': localized(
    'соразмерности выбора и последствий',
    'proportion between choice and consequence',
    'співмірності вибору й наслідків',
    'la proporción entre elección y consecuencia',
  ),
  'major-hanged-man': localized(
    'смене привычной перспективы',
    'a shift in familiar perspective',
    'зміні звичної перспективи',
    'un cambio en la perspectiva habitual',
  ),
  'major-death': localized(
    'завершению и освобождению места',
    'an ending that makes room',
    'завершенню й звільненню місця',
    'un cierre que deja espacio',
  ),
  'major-temperance': localized(
    'сочетанию разных тем в верной мере',
    'bringing different themes into balance',
    'поєднанню різних тем у належній мірі',
    'el equilibrio entre distintos temas',
  ),
  'major-devil': localized(
    'цене привычной привязанности',
    'the cost of a familiar attachment',
    'ціні звичної прив’язаності',
    'el coste de un apego conocido',
  ),
  'major-tower': localized(
    'пересмотру неработающей конструкции',
    'revising a structure that no longer works',
    'перегляду конструкції, що більше не працює',
    'la revisión de una estructura que ya no funciona',
  ),
  'major-star': localized(
    'ориентиру после перемен',
    'a guiding point after change',
    'орієнтиру після змін',
    'una referencia después del cambio',
  ),
  'major-moon': localized(
    'неясности и проверке впечатлений',
    'uncertainty and checking impressions',
    'неясності й перевірці вражень',
    'la incertidumbre y la comprobación de las impresiones',
  ),
  'major-sun': localized(
    'ясности и открытому проявлению',
    'clarity and open expression',
    'ясності й відкритому прояву',
    'la claridad y la expresión abierta',
  ),
  'major-judgement': localized(
    'переоценке прошлого опыта',
    'a reassessment of past experience',
    'переоцінці минулого досвіду',
    'la revisión de la experiencia pasada',
  ),
  'major-world': localized(
    'завершению цикла и целостной картине',
    'completion and the wider picture',
    'завершенню циклу й цілісній картині',
    'el cierre y la visión de conjunto',
  ),
};

const suitConcepts = {
  cups: localized(
    'эмоциональному отклику и связи',
    'emotional response and connection',
    'емоційному відгуку й зв’язку',
    'la respuesta emocional y la conexión',
  ),
  pentacles: localized(
    'ресурсам и практической опоре',
    'resources and practical grounding',
    'ресурсам і практичній опорі',
    'los recursos y el apoyo práctico',
  ),
  swords: localized(
    'ясности мысли и формулировкам',
    'clarity of thought and language',
    'ясності думки й формулюванням',
    'la claridad de pensamiento y de las palabras',
  ),
  wands: localized(
    'импульсу, инициативе и действию',
    'impulse, initiative and action',
    'імпульсу, ініціативі й дії',
    'el impulso, la iniciativa y la acción',
  ),
} as const;

const rankConcepts: Readonly<Record<number, LocalizedConcept>> = {
  1: localized('началу', 'a beginning', 'початку', 'un comienzo'),
  2: localized(
    'выбору между двумя направлениями',
    'a choice between two directions',
    'вибору між двома напрямами',
    'una elección entre dos rumbos',
  ),
  3: localized(
    'первому развитию темы',
    'the first development of a theme',
    'першому розвитку теми',
    'el primer desarrollo de un tema',
  ),
  4: localized(
    'закреплению формы',
    'stabilising the form',
    'закріпленню форми',
    'la consolidación de la forma',
  ),
  5: localized('точке напряжения', 'a point of tension', 'точці напруження', 'un punto de tensión'),
  6: localized(
    'восстановлению движения',
    'movement returning',
    'відновленню руху',
    'el regreso del movimiento',
  ),
  7: localized(
    'проверке выбранного курса',
    'testing the chosen course',
    'перевірці обраного курсу',
    'la comprobación del rumbo elegido',
  ),
  8: localized(
    'последовательной практике',
    'steady practice',
    'послідовній практиці',
    'la práctica constante',
  ),
  9: localized(
    'зрелости перед завершением',
    'maturity before completion',
    'зрілості перед завершенням',
    'la madurez antes del cierre',
  ),
  10: localized(
    'завершению текущего этапа',
    'completion of the current stage',
    'завершенню поточного етапу',
    'el cierre de la etapa actual',
  ),
  11: localized(
    'открытому исследованию',
    'open exploration',
    'відкритому дослідженню',
    'la exploración abierta',
  ),
  12: localized(
    'направленному движению',
    'directed movement',
    'спрямованому руху',
    'el movimiento con rumbo',
  ),
  13: localized(
    'внутренней зрелости',
    'inner maturity',
    'внутрішній зрілості',
    'la madurez interior',
  ),
  14: localized(
    'ответственному управлению',
    'responsible stewardship',
    'відповідальному керуванню',
    'la gestión responsable',
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
        localized(
          'текущей теме карты',
          'the card’s current theme',
          'поточній темі карти',
          'el tema actual de la carta',
        )[locale],
      rank: rankConcepts[card.number]?.[locale] ?? String(card.number),
      suit: null,
    };
  }
  const suit = card.suit
    ? suitConcepts[card.suit][locale]
    : localized(
        'повседневному контексту',
        'everyday context',
        'повсякденному контексту',
        'el contexto cotidiano',
      )[locale];
  const rank = rankConcepts[card.number]?.[locale] ?? String(card.number);
  const connector: Readonly<Record<Locale, string>> = {
    es: 'a través de',
    en: 'through',
    ru: 'через',
    uk: 'через',
  };
  return { focus: `${rank} ${connector[locale]} ${suit}`, rank, suit };
}
