import { readingConnectionCopy } from '../data/reading-connection-copy';
import { localeDefinitions, type Locale } from '@shared/i18n';

import type { TarotCard, TarotCardSelection, TarotSpreadPosition, TarotTopic } from '../types';
import { getRussianTarotInterpretationProfile } from './russian-interpretation-profiles';

type PositionRole =
  | 'advice'
  | 'current'
  | 'hidden'
  | 'inner'
  | 'obstacle'
  | 'outcome'
  | 'relationship'
  | 'support'
  | 'work';

type ReadingSynthesis = {
  headline: string;
  practicalFocus: string;
  summary: string;
};

const roleTerms: readonly [PositionRole, readonly string[]][] = [
  ['obstacle', ['obstacle', 'risk', 'tension']],
  ['support', ['support', 'resource', 'strength', 'opportunity']],
  ['advice', ['advice', 'action', 'direction', 'focus', 'step']],
  ['outcome', ['integration', 'outcome']],
  ['relationship', ['dynamic', 'link', 'love', 'relation', 'you']],
  ['work', ['career', 'work']],
  ['inner', ['inner']],
  ['hidden', ['hidden', 'missed']],
];

const russianRankNames: Readonly<Record<string, string>> = {
  ace: 'Туз',
  five: 'Пятёрка',
  four: 'Четвёрка',
  king: 'Король',
  knight: 'Рыцарь',
  nine: 'Девятка',
  page: 'Паж',
  queen: 'Королева',
  seven: 'Семёрка',
  six: 'Шестёрка',
  ten: 'Десятка',
  three: 'Тройка',
  two: 'Двойка',
  eight: 'Восьмёрка',
};

const russianSuitNames: Readonly<Record<string, string>> = {
  cups: 'Кубков',
  pentacles: 'Пентаклей',
  swords: 'Мечей',
  wands: 'Жезлов',
};

export function russianCardName(card: TarotCard) {
  if (card.arcana === 'major' || !card.suit) return card.name.ru;
  const rank = card.id.slice(card.suit.length + 1);
  return `${russianRankNames[rank] ?? card.name.ru} ${russianSuitNames[card.suit] ?? ''}`.trim();
}

function resolvePositionRole(positionId: string): PositionRole {
  const normalized = positionId.toLowerCase();
  return (
    roleTerms.find(([, terms]) => terms.some((term) => normalized.includes(term)))?.[0] ?? 'current'
  );
}

function russianMeaning(card: TarotCard, orientation: TarotCardSelection['orientation']) {
  const interpretation = getRussianTarotInterpretationProfile(card.id);
  if (!interpretation) {
    return orientation === 'reversed' ? card.reversed.ru : card.upright.ru;
  }
  return orientation === 'reversed' ? interpretation.reversed : interpretation.upright;
}

function russianAction(card: TarotCard) {
  return getRussianTarotInterpretationProfile(card.id)?.action ?? card.advice.ru;
}

function completeSentence(value: string, locale: Locale = 'ru') {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const capitalized = `${trimmed.charAt(0).toLocaleUpperCase(localeDefinitions[locale].formatTag)}${trimmed.slice(1)}`;
  return /[.!?]$/u.test(capitalized) ? capitalized : `${capitalized}.`;
}

function plainCardMeaning(card: TarotCard, orientation: TarotCardSelection['orientation']) {
  return completeSentence(russianMeaning(card, orientation));
}

function plainCardAction(card: TarotCard) {
  return completeSentence(russianAction(card));
}

const russianPositionLead: Record<PositionRole, string> = {
  advice: 'Эта карта подсказывает возможный следующий шаг.',
  current: 'Карта описывает то, что сейчас важнее всего заметить.',
  hidden: 'Карта обращает внимание на то, что легко упустить.',
  inner: 'Карта помогает назвать ваше внутреннее состояние.',
  obstacle: 'Карта показывает возможную трудность.',
  outcome: 'Карта описывает возможное развитие ситуации, а не гарантированный итог.',
  relationship: 'Карта помогает посмотреть на отношения без догадок о другом человеке.',
  support: 'Карта показывает, на что уже можно опереться.',
  work: 'Карта помогает оценить ситуацию в делах.',
};

function localizedTopicMeaning(card: TarotCard, locale: Locale, topic?: TarotTopic) {
  if (topic === 'love') return card.relationship[locale];
  if (topic === 'work') return card.work[locale];
  if (topic === 'money') return card.money[locale];
  if (topic === 'decision') return card.personalGrowth[locale];
  return card.upright[locale];
}

export function createActiveCardGuidance(input: {
  card: TarotCard;
  index: number;
  locale: Locale;
  orientation: TarotCardSelection['orientation'];
  position: TarotSpreadPosition;
  topic?: TarotTopic;
}) {
  const { card, locale, orientation, position, topic } = input;
  const role = resolvePositionRole(position.id);
  if (locale === 'ru') {
    return {
      action: plainCardAction(card),
      meaning: `${plainCardMeaning(card, orientation)} ${russianPositionLead[role]}`,
    };
  }

  const meaning =
    orientation === 'reversed' ? card.reversed[locale] : localizedTopicMeaning(card, locale, topic);
  return {
    action: completeSentence(card.advice[locale], locale),
    meaning: `${position.label[locale]}: ${completeSentence(meaning, locale)}`,
  };
}

export function createActiveCardInterpretation(
  input: Parameters<typeof createActiveCardGuidance>[0],
) {
  const guidance = createActiveCardGuidance(input);
  return `${guidance.meaning} ${guidance.action}`;
}

type SemanticDomain = 'action' | 'emotion' | 'material' | 'mind' | 'transition';

const majorDomains: Readonly<Record<string, SemanticDomain>> = {
  'major-chariot': 'action',
  'major-death': 'transition',
  'major-devil': 'material',
  'major-emperor': 'material',
  'major-empress': 'material',
  'major-fool': 'transition',
  'major-hanged-man': 'transition',
  'major-hermit': 'mind',
  'major-hierophant': 'material',
  'major-high-priestess': 'mind',
  'major-judgement': 'transition',
  'major-justice': 'mind',
  'major-lovers': 'emotion',
  'major-magician': 'action',
  'major-moon': 'emotion',
  'major-star': 'emotion',
  'major-strength': 'action',
  'major-sun': 'action',
  'major-temperance': 'transition',
  'major-tower': 'transition',
  'major-wheel': 'transition',
  'major-world': 'transition',
};

function cardDomain(card: TarotCard): SemanticDomain {
  if (card.suit === 'wands') return 'action';
  if (card.suit === 'cups') return 'emotion';
  if (card.suit === 'swords') return 'mind';
  if (card.suit === 'pentacles') return 'material';
  return majorDomains[card.id] ?? 'transition';
}

const domainCopy: Record<Locale, Record<SemanticDomain, string>> = {
  es: {
    action: 'la iniciativa y la acción con rumbo',
    emotion: 'la honestidad emocional y la conexión',
    material: 'los recursos, los límites y el apoyo práctico',
    mind: 'la claridad de pensamiento y las palabras honestas',
    transition: 'dejar que un patrón anterior dé paso a algo nuevo',
  },
  en: {
    action: 'initiative and directed action',
    emotion: 'emotional honesty and connection',
    material: 'resources, boundaries and practical support',
    mind: 'clarity of thought and honest language',
    transition: 'letting an old pattern give way to something new',
  },
  ru: {
    action: 'инициатива и движение',
    emotion: 'близость и эмоциональная честность',
    material: 'устойчивость и опора',
    mind: 'ясность и честный разговор',
    transition: 'переход к новой форме',
  },
  uk: {
    action: 'ініціатива та спрямована дія',
    emotion: 'емоційна чесність і якість зв’язку',
    material: 'ресурси, межі та практична опора',
    mind: 'ясність думки й чесне формулювання',
    transition: 'перехід від звичного до нового',
  },
};

const domainHeadlines: Record<Locale, Record<SemanticDomain, string>> = {
  es: {
    action: 'Elige un paso claro y empieza',
    emotion: 'Reconoce con honestidad lo que sientes',
    material: 'Céntrate en los recursos y los límites claros',
    mind: 'Aclara los hechos antes de decidir',
    transition: 'Acepta el cambio y elige qué viene después',
  },
  en: {
    action: 'Choose one clear step and begin',
    emotion: 'Be honest about what you feel',
    material: 'Focus on resources and clear boundaries',
    mind: 'Clarify the facts before deciding',
    transition: 'Accept the change and choose what follows',
  },
  ru: {
    action: 'Выберите один конкретный шаг и начните',
    emotion: 'Честно назовите то, что вы чувствуете',
    material: 'Сосредоточьтесь на ресурсах и ясных границах',
    mind: 'Сначала проясните факты и свои слова',
    transition: 'Примите перемены и выберите следующий шаг',
  },
  uk: {
    action: 'Оберіть один конкретний крок і почніть',
    emotion: 'Чесно назвіть те, що ви відчуваєте',
    material: 'Зосередьтеся на ресурсах і чітких межах',
    mind: 'Спочатку з’ясуйте факти й доберіть слова',
    transition: 'Прийміть зміни й оберіть наступний крок',
  },
};

function dominantDomain(cards: readonly TarotCard[]) {
  const counts = new Map<SemanticDomain, number>();
  cards.forEach((card) => {
    const domain = cardDomain(card);
    counts.set(domain, (counts.get(domain) ?? 0) + 1);
  });
  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'transition';
}

function pickIndex(
  selections: readonly TarotCardSelection[],
  positions: readonly TarotSpreadPosition[],
  predicate: (selection: TarotCardSelection, role: PositionRole) => boolean,
) {
  const index = selections.findIndex((selection, selectionIndex) =>
    predicate(
      selection,
      resolvePositionRole(positions[selectionIndex]?.id ?? selection.positionId),
    ),
  );
  return index >= 0 ? index : 0;
}

function localizedCardTheme(
  card: TarotCard,
  orientation: TarotCardSelection['orientation'],
  locale: Locale,
) {
  if (locale === 'ru') return plainCardMeaning(card, orientation);
  return completeSentence(
    orientation === 'reversed' ? card.reversed[locale] : card.upright[locale],
  );
}

export function createReadingSynthesis(input: {
  cards: readonly TarotCard[];
  locale: Locale;
  positions: readonly TarotSpreadPosition[];
  selections: readonly TarotCardSelection[];
}): ReadingSynthesis {
  const { cards, locale, positions, selections } = input;
  const domain = dominantDomain(cards);
  const domainLabel = domainCopy[locale][domain];
  const opportunityIndex = pickIndex(
    selections,
    positions,
    (selection, role) =>
      selection.orientation === 'upright' && (role === 'support' || role === 'advice'),
  );
  const riskIndex = pickIndex(
    selections,
    positions,
    (selection, role) => selection.orientation === 'reversed' || role === 'obstacle',
  );
  const directionIndex = pickIndex(
    selections,
    positions,
    (_selection, role) => role === 'advice' || role === 'outcome',
  );
  const opportunity = cards[opportunityIndex] ?? cards[0];
  const risk = cards[riskIndex] ?? cards.at(-1) ?? cards[0];
  const direction = cards[directionIndex] ?? cards.at(-1) ?? cards[0];
  if (!opportunity || !risk || !direction) throw new Error('Reading synthesis requires cards.');
  const opportunityTheme = localizedCardTheme(
    opportunity,
    selections[opportunityIndex]?.orientation ?? 'upright',
    locale,
  );
  const riskOrientation = selections[riskIndex]?.orientation ?? 'upright';
  const riskTheme = localizedCardTheme(risk, riskOrientation, locale);
  const hasDistinctContrast = riskIndex !== opportunityIndex && riskTheme !== opportunityTheme;
  const introductions = {
    ru: `Главная тема расклада — ${domainLabel}.`,
    es: `La lectura se centra en ${domainLabel}.`,
    en: `The reading centres on ${domainLabel}.`,
    uk: `Головна тема розкладу — ${domainLabel}.`,
  };
  const contrastLabel = {
    ru:
      riskOrientation === 'reversed' ? 'На что обратить внимание:' : 'Ещё одна сторона этой темы:',
    es: riskOrientation === 'reversed' ? 'También conviene observar:' : 'Otra faceta de este tema:',
    en: riskOrientation === 'reversed' ? 'Also worth noticing:' : 'Another side of this theme:',
    uk: riskOrientation === 'reversed' ? 'Водночас варто помітити:' : 'Ще один бік цієї теми:',
  };
  const reflection = {
    ru: {
      action:
        'Сопоставьте этот импульс с вашей ситуацией: где уже можно действовать, а где сначала нужно выбрать направление?',
      emotion:
        'Посмотрите, как эта тема проявляется в вашем вопросе: что вы чувствуете сами и о чём ещё стоит поговорить?',
      material:
        'Сопоставьте эту тему с вашей ситуацией: на что вы можете опереться и какие обязательства стоит пересмотреть?',
      mind: 'Сопоставьте эту тему с вашим вопросом: что уже известно, а где выводы пока опережают факты?',
      transition:
        'Посмотрите на вашу ситуацию через эту тему: что уже меняется и чему вы хотите дать место дальше?',
    },
    es: {
      action:
        'Piensa cómo encaja este impulso en tu situación: ¿qué está listo para actuar y qué necesita aún un rumbo?',
      emotion:
        'Relaciona este tema con tu pregunta: ¿qué sientes tú y qué necesita una conversación?',
      material:
        'Piensa cómo encaja este tema en tu situación: ¿en qué puedes apoyarte y qué compromisos conviene revisar?',
      mind: 'Relaciona este tema con tu pregunta: ¿qué sabes y dónde podrías estar llegando a conclusiones antes de conocer los hechos?',
      transition:
        'Mira tu situación desde este tema: ¿qué está cambiando ya y a qué te gustaría hacer espacio?',
    },
    en: {
      action:
        'Consider where this impulse fits your situation: what is ready for action, and what still needs a direction?',
      emotion:
        'Consider how this theme fits your question: what do you feel yourself, and what still needs a conversation?',
      material:
        'Consider how this theme fits your situation: what can you rely on, and which commitments need another look?',
      mind: 'Relate this theme to your question: what is known, and where might conclusions be running ahead of facts?',
      transition:
        'Look at your situation through this theme: what is already changing, and what would you like to make room for?',
    },
    uk: {
      action:
        'Співвіднесіть цей імпульс зі своєю ситуацією: де вже можна діяти, а де спочатку потрібно обрати напрям?',
      emotion:
        'Подивіться, як ця тема проявляється у вашому запитанні: що ви відчуваєте самі й про що ще варто поговорити?',
      material:
        'Співвіднесіть цю тему зі своєю ситуацією: на що ви можете спертися й які зобов’язання варто переглянути?',
      mind: 'Співвіднесіть цю тему зі своїм запитанням: що вже відомо, а де висновки поки випереджають факти?',
      transition:
        'Подивіться на свою ситуацію через цю тему: що вже змінюється й чому ви хочете дати місце далі?',
    },
  };
  // Advice has its own visible payoff. Keep synthesis focused on the actual drawn meanings.
  return {
    headline: domainHeadlines[locale][domain],
    practicalFocus:
      locale === 'ru'
        ? plainCardAction(direction)
        : completeSentence(direction.advice[locale], locale),
    summary: [
      introductions[locale],
      opportunityTheme,
      hasDistinctContrast ? `${contrastLabel[locale]} ${riskTheme}` : reflection[locale][domain],
    ]
      .filter(Boolean)
      .join(' '),
  };
}

export function createCardConnection(input: {
  card: TarotCard;
  index: number;
  locale: Locale;
  neighbour?: TarotCard;
  orientation: TarotCardSelection['orientation'];
  position: TarotSpreadPosition;
}) {
  const { card, locale, neighbour, orientation } = input;
  if (!neighbour) {
    if (locale === 'ru')
      return `${russianCardName(card)} задаёт главную тему. ${plainCardMeaning(card, orientation)}`;
    return readingConnectionCopy[locale].single(card.name[locale]);
  }
  if (locale === 'ru') {
    const left = plainCardMeaning(card, orientation);
    const right = plainCardMeaning(neighbour, 'upright');
    const cardName = russianCardName(card);
    const neighbourName = russianCardName(neighbour);
    return `Эти карты показывают два связанных момента. ${cardName}: ${left} ${neighbourName}: ${right}`;
  }
  return readingConnectionCopy[locale].pair(
    card.name[locale],
    orientation === 'reversed' ? card.reversed[locale] : card.upright[locale],
    neighbour.name[locale],
    neighbour.upright[locale],
  );
}

export function createCardPracticalFocus(card: TarotCard, locale: Locale) {
  if (locale === 'ru') {
    return plainCardAction(card);
  }
  return completeSentence(card.advice[locale], locale);
}

export function interpretationWordCount(value: string) {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}
