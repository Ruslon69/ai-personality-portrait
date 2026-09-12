import type { Locale } from '@shared/i18n';

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

function completeSentence(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const capitalized = `${trimmed.charAt(0).toLocaleUpperCase('ru-RU')}${trimmed.slice(1)}`;
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
      meaning: `${russianPositionLead[role]} ${plainCardMeaning(card, orientation)}`,
    };
  }

  const meaning =
    orientation === 'reversed' ? card.reversed[locale] : localizedTopicMeaning(card, locale, topic);
  if (locale === 'uk') {
    return {
      action: completeSentence(card.advice.uk),
      meaning: `${position.label.uk}: ${completeSentence(meaning)}`,
    };
  }
  return {
    action: completeSentence(card.advice.en),
    meaning: `${position.label.en}: ${completeSentence(meaning)}`,
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
  en: {
    action: 'initiative and directed action',
    emotion: 'emotional honesty and connection',
    material: 'resources, boundaries and practical support',
    mind: 'clarity of thought and honest language',
    transition: 'the transition from an exhausted form to a new one',
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
    transition: 'перехід від вичерпаної форми до нової',
  },
};

const domainHeadlines: Record<Locale, Record<SemanticDomain, string>> = {
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
  const riskTheme = localizedCardTheme(risk, 'reversed', locale);
  if (locale === 'ru') {
    const action = plainCardAction(direction);
    return {
      headline: domainHeadlines.ru[domain],
      practicalFocus: action,
      summary: `Главная тема расклада — ${domainLabel}. ${opportunityTheme} На что обратить внимание. ${riskTheme} ${action}`,
    };
  }

  const action = direction.advice[locale];
  if (locale === 'uk') {
    return {
      headline: domainHeadlines.uk[domain],
      practicalFocus: completeSentence(action),
      summary: `Головна тема розкладу — ${domainLabel}. ${opportunityTheme} На що звернути увагу. ${riskTheme} ${completeSentence(action)}`,
    };
  }
  return {
    headline: domainHeadlines.en[domain],
    practicalFocus: completeSentence(action),
    summary: `The reading’s main theme is ${domainLabel}. ${opportunityTheme} What to watch for. ${riskTheme} ${completeSentence(action)}`,
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
  const { card, locale, neighbour, orientation, position } = input;
  if (!neighbour) {
    if (locale === 'ru')
      return `${russianCardName(card)} задаёт главную тему. ${plainCardMeaning(card, orientation)}`;
    if (locale === 'uk') return `${card.name.uk} задає головну тему цього розкладу.`;
    return `${card.name.en} sets the main theme of this reading.`;
  }
  if (locale === 'ru') {
    const left = plainCardMeaning(card, orientation);
    const right = plainCardMeaning(neighbour, 'upright');
    const cardName = russianCardName(card);
    const neighbourName = russianCardName(neighbour);
    return `Эти карты показывают два связанных момента. ${cardName}: ${left} ${neighbourName}: ${right}`;
  }
  if (locale === 'uk')
    return `${card.name.uk} і ${neighbour.name.uk} поєднують теми «${card.light.uk}» та «${neighbour.light.uk}» у позиції «${position.label.uk}».`;
  return `${card.name.en} and ${neighbour.name.en} connect “${card.light.en}” with “${neighbour.light.en}” in “${position.label.en}”.`;
}

export function createCardPracticalFocus(card: TarotCard, locale: Locale) {
  if (locale === 'ru') {
    return plainCardAction(card);
  }
  return completeSentence(card.advice[locale]);
}

export function interpretationWordCount(value: string) {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}
