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

function copyVariant(seed: string, length: number) {
  const value = [...seed].reduce((total, character) => total * 31 + character.charCodeAt(0), 7);
  return Math.abs(value) % length;
}

function russianPositionAction(role: PositionRole, action: string, seed: string) {
  const variants = {
    advice: [
      `Следующий шаг может быть таким: ${action}.`,
      `Не обязательно решать всё сразу — сначала ${action}.`,
      `Попробуйте проверить это небольшим действием: ${action}.`,
      `Оставьте себе право на паузу и ${action}.`,
    ],
    current: [
      `Сверьте это с реальными обстоятельствами: ${action}.`,
      `Здесь не нужен рывок — сначала ${action}.`,
      `Один честный шаг в эту сторону — ${action}.`,
      `На практике это можно проверить так: ${action}.`,
    ],
    hidden: [
      `Проверьте эту мысль фактами: ${action}.`,
      `Не торопитесь делать вывод — сначала ${action}.`,
      `Эта часть ситуации станет яснее, если ${action}.`,
      `Оставьте место паузе и ${action}.`,
    ],
    inner: [
      `С этим чувством можно обойтись бережно: ${action}.`,
      `Попробуйте дать себе время и ${action}.`,
      `Спросите себя, что изменится, если ${action}.`,
      `Внутреннее напряжение ослабевает, когда ${action}.`,
    ],
    obstacle: [
      `Снимите часть давления: ${action}.`,
      `Не пытайтесь закрыть всё сразу — ${action}.`,
      `Эта сложность требует не силы, а того, чтобы ${action}.`,
      `Предел здесь обозначает одно: ${action}.`,
    ],
    outcome: [
      `Сохраните это как ориентир: ${action}.`,
      `Дальше пригодится ${action}.`,
      `Здесь можно позволить себе ${action}.`,
      `Итог проверяется тем, что вы ${action}.`,
    ],
    relationship: [
      `Вместо догадок — ${action}.`,
      `Открытый разговор начнётся с того, чтобы ${action}.`,
      `Не оставляйте это между строк: ${action}.`,
      `Сначала договоритесь о том, чтобы ${action}.`,
    ],
    support: [
      `Эту опору можно использовать, если ${action}.`,
      `Помощь здесь выглядит так: ${action}.`,
      `Сильная сторона проявится, когда ${action}.`,
      `Берегите этот ресурс и ${action}.`,
    ],
    work: [
      `Вместо лишнего давления попробуйте ${action}.`,
      `Сделайте ставку на то, чтобы ${action}.`,
      `Здесь результат поддержит ${action}.`,
      `Сначала освободите место для того, чтобы ${action}.`,
    ],
  } satisfies Record<PositionRole, readonly string[]>;
  return variants[role][copyVariant(seed, variants[role].length)] ?? `Попробуйте ${action}.`;
}

function localizedTopicMeaning(card: TarotCard, locale: Locale, topic?: TarotTopic) {
  if (topic === 'love') return card.relationship[locale];
  if (topic === 'work') return card.work[locale];
  if (topic === 'money') return card.money[locale];
  if (topic === 'decision') return card.personalGrowth[locale];
  return card.upright[locale];
}

export function createActiveCardInterpretation(input: {
  card: TarotCard;
  index: number;
  locale: Locale;
  orientation: TarotCardSelection['orientation'];
  position: TarotSpreadPosition;
  topic?: TarotTopic;
}) {
  const { card, index, locale, orientation, position, topic } = input;
  const role = resolvePositionRole(position.id);
  if (locale === 'ru') {
    const meaning = russianMeaning(card, orientation).replace(/[.!?]+$/u, '');
    const openings: Record<PositionRole, readonly string[]> = {
      advice: [
        `Здесь пригодится ${meaning}.`,
        `Следующий шаг проще выбрать, если ${meaning}.`,
        `Похоже, решение начинается с того, что ${meaning}.`,
        `Не усложняйте эту задачу: ${meaning}.`,
        `Сейчас можно держаться того, что ${meaning}.`,
      ],
      current: [
        `Похоже, ситуация требует признать: ${meaning}.`,
        `Здесь чувствуется простая вещь: ${meaning}.`,
        `На поверхности — одно, но важнее другое: ${meaning}.`,
        `Ситуация складывается так, что ${meaning}.`,
        `Это тот случай, когда ${meaning}.`,
      ],
      hidden: [
        `За внешними обстоятельствами может скрываться то, что ${meaning}.`,
        `Неочевидная часть ситуации — ${meaning}.`,
        `Сначала легко заметить одно, но глубже видно: ${meaning}.`,
        `Здесь есть то, что пока остаётся за кадром: ${meaning}.`,
        `В этой истории не всё лежит на поверхности: ${meaning}.`,
      ],
      inner: [
        `Внутри это может ощущаться так: ${meaning}.`,
        `Похоже, вы уже чувствуете: ${meaning}.`,
        `Когда остаётесь с собой, становится заметно: ${meaning}.`,
        `Внутренний фон сейчас такой: ${meaning}.`,
        `Есть чувство, которое трудно обойти: ${meaning}.`,
      ],
      obstacle: [
        `Сложность появляется там, где ${meaning}.`,
        `Главный узел здесь в том, что ${meaning}.`,
        `Дело упирается в следующее: ${meaning}.`,
        `Трудность не столько во внешнем, сколько в том, что ${meaning}.`,
        `Напряжение накапливается, когда ${meaning}.`,
      ],
      outcome: [
        `Дальше многое будет зависеть от того, что ${meaning}.`,
        `К завершению этой истории проявится следующее: ${meaning}.`,
        `Общий вектор выглядит так: ${meaning}.`,
        `Со временем станет заметно: ${meaning}.`,
        `Итог здесь скорее о том, что ${meaning}.`,
      ],
      relationship: [
        `Между вами может проявляться так: ${meaning}.`,
        `Тонкий нюанс здесь в том, что ${meaning}.`,
        `В контакте с другим человеком особенно заметно: ${meaning}.`,
        `Похоже, связь сейчас проверяется тем, что ${meaning}.`,
        `Тема близости звучит здесь так: ${meaning}.`,
      ],
      support: [
        `Опора уже есть в том, что ${meaning}.`,
        `Ситуацию удерживает простая вещь: ${meaning}.`,
        `Помогает то, что ${meaning}.`,
        `Сильная сторона здесь в том, что ${meaning}.`,
        `Ресурс проявляется там, где ${meaning}.`,
      ],
      work: [
        `В задаче на первый план выходит: ${meaning}.`,
        `Здесь многое решает то, что ${meaning}.`,
        `Похоже, дело требует признать: ${meaning}.`,
        `Результат сейчас зависит от того, что ${meaning}.`,
        `Особенно заметно, что ${meaning}.`,
      ],
    };
    const seed = `${card.id}:${position.id}:${orientation}:${index}`;
    const opening =
      openings[role][copyVariant(seed, openings[role].length)] ?? `Здесь заметно: ${meaning}.`;
    return `${opening} ${russianPositionAction(role, russianAction(card), seed)}`;
  }

  const meaning =
    orientation === 'reversed' ? card.reversed[locale] : localizedTopicMeaning(card, locale, topic);
  if (locale === 'uk') {
    return `У позиції «${position.label.uk}» карта ${card.name.uk} поєднує запит «${position.prompt.uk}» із таким змістом: ${meaning} Практичний напрям — ${card.advice.uk}`;
  }
  return `In “${position.label.en}”, ${card.name.en} connects “${position.prompt.en}” with this specific theme: ${meaning} A practical direction is to ${card.advice.en.charAt(0).toLocaleLowerCase()}${card.advice.en.slice(1)}`;
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
  if (locale === 'ru') return russianMeaning(card, orientation).replace(/[.!?]+$/u, '');
  return orientation === 'reversed' ? card.shadow[locale] : card.light[locale];
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
  const opportunityDomain = domainCopy[locale][cardDomain(opportunity)];
  const riskDomain = domainCopy[locale][cardDomain(risk)];
  if (locale === 'ru') {
    const action = russianAction(direction);
    const singleSummary = `В этом раскладе особенно звучит тема ${opportunityDomain}. Она может поддержать через то, что ${opportunityTheme}. Рядом остаётся уязвимое место: ${riskTheme}. Не принимайте это за готовый прогноз — сверяйте смысл с тем, что происходит вокруг. ${action}.`;
    return {
      headline: `В центре — ${domainLabel}`,
      practicalFocus: `Попробуйте ${action}.`,
      summary:
        cards.length === 1
          ? singleSummary
          : `В этом раскладе снова и снова звучит тема ${domainLabel}. Похоже, вопрос упирается в то, на что вы реально можете опереться и где пора яснее обозначить границы.\n\nОдна часть ситуации подталкивает к ${opportunityDomain}, другая напоминает о ${riskDomain}. Хороший ресурс — ${opportunityTheme}. Но есть и уязвимое место: ${riskTheme}. Сверьте это не только с внутренним ощущением, но и с тем, как люди отвечают, какие договорённости выполняются и где расходуются силы.\n\nНе ищите в символах готовый прогноз. Посмотрите, что уже происходит в разговорах, делах или расходах, и ${action}.`,
    };
  }

  const action = direction.advice[locale];
  if (locale === 'uk') {
    return {
      headline: `У центрі — ${domainLabel}`,
      practicalFocus: action,
      summary: `У цьому розкладі найсильніше повторюється тема ${domainLabel}. Водночас одна частина ситуації тягнеться до «${opportunityTheme}», а інша просить зважити на «${riskTheme}» — це не наперед визначений результат. Можливість пов’язана з конструктивною стороною карти, а головний ризик — прийняти складний сценарій за неминучий. Практичний напрям: ${action}`,
    };
  }
  return {
    headline: `The reading centres on ${domainLabel}`,
    practicalFocus: action,
    summary: `The spread keeps returning to ${domainLabel}. One part of the situation leans toward “${opportunityTheme}”, while another asks for “${riskTheme}”; neither is a predetermined outcome. The useful opportunity is in the constructive side of the cards, while the main risk is treating a difficult possibility as inevitable. A practical direction is ${action}`,
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
  const { card, index, locale, neighbour, orientation, position } = input;
  if (!neighbour) {
    if (locale === 'ru')
      return `${russianCardName(card)} становится центральным ракурсом: ${russianMeaning(card, orientation)}.`;
    if (locale === 'uk') return `${card.name.uk} стає центральним ракурсом цього розкладу.`;
    return `${card.name.en} becomes the central lens of this reading.`;
  }
  if (locale === 'ru') {
    const left = getRussianTarotInterpretationProfile(card.id)?.upright ?? card.light.ru;
    const right = getRussianTarotInterpretationProfile(neighbour.id)?.upright ?? neighbour.light.ru;
    const cardName = russianCardName(card);
    const neighbourName = russianCardName(neighbour);
    const patterns = [
      `${cardName} и ${neighbourName} встречаются в теме «${left}» и постепенно переводят её к «${right}».`,
      `Здесь одна тема продолжает другую: от «${left}» к «${right}». Рядом ${neighbourName} меняет акцент ${cardName}.`,
      `Если читать их вместе, ${cardName} напоминает о «${left}», а ${neighbourName} добавляет к этому «${right}».`,
      `Рядом с ${neighbourName} ${cardName} звучит иначе: «${left}» получает продолжение в теме «${right}».`,
      `Между этими картами есть разговор — «${left}» встречается с «${right}», и от этого меняется общий тон.`,
    ];
    return patterns[index % patterns.length] ?? patterns[0];
  }
  if (locale === 'uk')
    return `${card.name.uk} і ${neighbour.name.uk} поєднують теми «${card.light.uk}» та «${neighbour.light.uk}» у позиції «${position.label.uk}».`;
  return `${card.name.en} and ${neighbour.name.en} connect “${card.light.en}” with “${neighbour.light.en}” in “${position.label.en}”.`;
}

export function createCardPracticalFocus(card: TarotCard, locale: Locale) {
  if (locale === 'ru') {
    const action = russianAction(card);
    const variants = [
      `Попробуйте ${action}.`,
      `Один возможный шаг — ${action}.`,
      `Если это откликается, ${action}.`,
      `Здесь уместно ${action}.`,
    ];
    return variants[copyVariant(card.id, variants.length)] ?? variants[0];
  }
  return card.advice[locale];
}

export function interpretationWordCount(value: string) {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}
