import type {
  ContextualContrast,
  Insight,
  PersonalityFacet,
  PersonalityFacetId,
  PortraitVisualIdentity,
  ProfileLocale,
} from '@entities/personality-profile';

import { getInterestLabel, getTraitTemplate } from '../data';
import type { TraitId, TraitScore } from '../model';
import { createSourceReferences } from './explainability';
import { selectRankedTraits } from './trait-evaluation';

type PatternCompositionInput = {
  hasInterpretations: boolean;
  insightsByTrait: ReadonlyMap<string, Insight>;
  interests: readonly string[];
  locale: ProfileLocale;
  ranked: readonly TraitScore[];
  sourceCount: number;
};

const facetPreferences: Readonly<Record<PersonalityFacetId, readonly TraitId[]>> = {
  thinking: ['reflection', 'structure', 'openness', 'practicality'],
  communication: ['connection', 'directness', 'reflection', 'adaptability'],
  motivation: ['initiative', 'practicality', 'connection', 'structure', 'openness'],
  decisions: ['structure', 'reflection', 'adaptability', 'practicality'],
  energy: ['reflection', 'connection', 'autonomy', 'adaptability'],
  adaptation: ['adaptability', 'openness', 'initiative', 'structure'],
};

const facetLabels = {
  en: {
    thinking: 'Thinking',
    communication: 'Communication',
    motivation: 'Motivation',
    decisions: 'Decisions',
    energy: 'Energy',
    adaptation: 'Adaptation',
  },
  ru: {
    thinking: 'Мышление',
    communication: 'Общение',
    motivation: 'Мотивация',
    decisions: 'Решения',
    energy: 'Энергия',
    adaptation: 'Адаптация',
  },
  uk: {
    thinking: 'Мислення',
    communication: 'Спілкування',
    motivation: 'Мотивація',
    decisions: 'Рішення',
    energy: 'Енергія',
    adaptation: 'Адаптація',
  },
} as const;

function phrase(
  locale: ProfileLocale,
  primary: string,
  secondary: string,
  interest?: string,
  hasInterpretations?: boolean,
) {
  if (locale === 'en') {
    return `You combine ${primary} with ${secondary}${interest ? `, especially when exploring ${interest}` : ''}${hasInterpretations ? ' — with optional symbolic layers kept separate' : ''}.`;
  }
  if (locale === 'uk') {
    return `Ви поєднуєте ${primary} і ${secondary}${interest ? `, особливо коли досліджуєте ${interest}` : ''}${hasInterpretations ? ' — а символічні шари залишаються окремою перспективою' : ''}.`;
  }
  return `Вы сочетаете ${primary} и ${secondary}${interest ? `, особенно когда речь идёт про ${interest}` : ''}${hasInterpretations ? ' — а символические слои остаются отдельным ракурсом' : ''}.`;
}

export function createHeroPhrase(input: PatternCompositionInput) {
  const primary = input.ranked[0];
  const secondary = input.ranked[1] ?? primary;
  if (!primary || !secondary) return '';
  const interest = input.interests[0]
    ? getInterestLabel(input.interests[0], input.locale)
    : undefined;
  return phrase(
    input.locale,
    getTraitTemplate(primary.id, input.locale).label,
    getTraitTemplate(secondary.id, input.locale).label,
    interest,
    input.hasInterpretations,
  );
}

const revealHeadlines: Record<ProfileLocale, Record<TraitId, string>> = {
  en: {
    adaptability: 'You change course without losing direction',
    autonomy: 'Freedom works with an inner compass',
    connection: 'You notice connection before perfect words',
    directness: 'Clarity is how you protect connection',
    initiative: 'An idea quickly becomes your first move',
    openness: 'You build your answer from new angles',
    practicality: 'You test ideas where action begins',
    reflection: 'You notice more before making your move',
    structure: 'You turn uncertainty into a clear route',
  },
  ru: {
    adaptability: 'Вы меняете маршрут, не теряя направления',
    autonomy: 'Свобода работает вместе с внутренней опорой',
    connection: 'Вы замечаете контакт раньше готовых формулировок',
    directness: 'Ясность помогает вам беречь контакт',
    initiative: 'Идея быстро становится вашим первым действием',
    openness: 'Вы собираете свой ответ из новых ракурсов',
    practicality: 'Вы проверяете идеи там, где начинается действие',
    reflection: 'Вы замечаете больше, прежде чем сделать ход',
    structure: 'Вы превращаете неопределённость в понятный маршрут',
  },
  uk: {
    adaptability: 'Ви змінюєте маршрут, не втрачаючи напрямку',
    autonomy: 'Свобода працює разом із внутрішньою опорою',
    connection: 'Ви помічаєте контакт раніше за готові слова',
    directness: 'Ясність допомагає вам берегти контакт',
    initiative: 'Ідея швидко стає вашою першою дією',
    openness: 'Ви збираєте власну відповідь із нових ракурсів',
    practicality: 'Ви перевіряєте ідеї там, де починається дія',
    reflection: 'Ви помічаєте більше, перш ніж діяти',
    structure: 'Ви перетворюєте невизначеність на зрозумілий маршрут',
  },
};

const contrastHeadlines: Record<string, Record<ProfileLocale, string>> = {
  'adaptability:structure': {
    en: 'Freedom meets a system that can still move',
    ru: 'Свобода встречается с системой, которая умеет меняться',
    uk: 'Свобода зустрічається із системою, що вміє змінюватися',
  },
  'initiative:reflection': {
    en: 'You pause carefully — then move with purpose',
    ru: 'Вы берёте паузу — а затем действуете точно',
    uk: 'Ви берете паузу — а потім дієте точно',
  },
  'autonomy:connection': {
    en: 'Independence and closeness both have a place',
    ru: 'Самостоятельность и близость находят общий ритм',
    uk: 'Самостійність і близькість знаходять спільний ритм',
  },
  'openness:practicality': {
    en: 'Curiosity becomes useful through a small experiment',
    ru: 'Любопытство становится полезным через небольшой эксперимент',
    uk: 'Цікавість стає корисною через невеликий експеримент',
  },
};

export function createRevealCopy(input: PatternCompositionInput, hasContextualContrast: boolean) {
  const primary = input.ranked[0];
  const secondary = input.ranked[1] ?? primary;
  if (!primary || !secondary) return { headline: '', lead: '' };
  const pairKey = [primary.id, secondary.id].sort().join(':');
  const headline =
    hasContextualContrast && contrastHeadlines[pairKey]
      ? contrastHeadlines[pairKey][input.locale]
      : revealHeadlines[input.locale][primary.id];
  const primaryLabel = getTraitTemplate(primary.id, input.locale).label;
  const secondaryLabel = getTraitTemplate(secondary.id, input.locale).label;
  const interest = input.interests[0]
    ? getInterestLabel(input.interests[0], input.locale)
    : undefined;
  const lead =
    input.locale === 'en'
      ? `${primaryLabel} and ${secondaryLabel} repeat across your choices${interest ? `, while ${interest} gives the examples a personal direction` : ''}. Open the portrait to see where they reinforce each other and where context changes the picture.`
      : input.locale === 'uk'
        ? `${primaryLabel} і ${secondaryLabel} повторюються у ваших виборах${interest ? `, а ${interest} надає прикладам особистого напрямку` : ''}. Відкрийте портрет, щоб побачити, де вони підсилюють одне одного, а де важливий контекст.`
        : `${primaryLabel} и ${secondaryLabel} повторяются в ваших выборах${interest ? `, а ${interest} задаёт примерам личное направление` : ''}. Откройте портрет, чтобы увидеть, где они усиливают друг друга, а где важен контекст.`;
  return { headline, lead };
}

const motifByInterest: Record<string, PortraitVisualIdentity['motif']> = {
  business: 'grid',
  cinema: 'rhythm',
  creativity: 'freeform',
  games: 'grid',
  learning: 'constellation',
  movement: 'pulse',
  music: 'rhythm',
  nature: 'freeform',
  people: 'constellation',
  selfDevelopment: 'constellation',
  technology: 'grid',
  travel: 'route',
};

export function createPortraitVisualIdentity(
  profileId: string,
  input: PatternCompositionInput,
): PortraitVisualIdentity {
  const primaryId = input.ranked[0]?.id ?? 'adaptability';
  const seedValue = [...profileId].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const accent: PortraitVisualIdentity['accent'] = ['adaptability', 'openness'].includes(primaryId)
    ? 'adaptive'
    : ['reflection', 'autonomy'].includes(primaryId)
      ? 'calm'
      : ['connection', 'directness'].includes(primaryId)
        ? 'connected'
        : 'focused';
  return {
    accent,
    motif: motifByInterest[input.interests[0] ?? ''] ?? 'constellation',
    nodeCount: Math.min(8, Math.max(4, input.sourceCount + 2)),
    orbitCount: Math.min(3, Math.max(1, input.hasInterpretations ? 3 : input.sourceCount - 1)),
    seed: profileId,
    shape: (['ring', 'arc', 'diamond'] as const)[seedValue % 3] ?? 'ring',
  };
}

export function createPortraitFacets(input: PatternCompositionInput): readonly PersonalityFacet[] {
  return (Object.keys(facetPreferences) as PersonalityFacetId[]).flatMap((id) => {
    const selected = selectRankedTraits(input.ranked, facetPreferences[id], 1)[0];
    if (!selected) return [];
    const insight = input.insightsByTrait.get(selected.id);
    if (!insight) return [];
    const template = getTraitTemplate(selected.id, input.locale);
    return [
      {
        confidence: insight.confidence,
        description: insight.description,
        id,
        label: facetLabels[input.locale][id],
        sources: insight.sources,
        targetId:
          id === 'communication' ? 'communication' : id === 'energy' ? 'energy' : 'patterns',
        title: template.label,
      },
    ];
  });
}

type ContrastRule = {
  ids: readonly [TraitId, TraitId];
  copy: Record<ProfileLocale, Omit<ContextualContrast, 'evidence' | 'id' | 'sources'>>;
};

const contrastRules: readonly ContrastRule[] = [
  {
    ids: ['structure', 'adaptability'],
    copy: {
      ru: {
        usual: 'Обычно ясный план помогает вам быстро увидеть следующий шаг.',
        context: 'Но когда обстоятельства меняются, вы готовы перестроить способ действия.',
        meaning: 'Структура для вас может быть опорой, а не жёстким сценарием.',
        suggestion: 'Перед стартом отделите обязательную часть плана от той, которую можно менять.',
      },
      en: {
        usual: 'A clear plan usually helps you see the next step.',
        context: 'When circumstances change, you can adjust the method.',
        meaning: 'Structure may be a support for you, not a rigid script.',
        suggestion: 'Separate the essential part of the plan from what can change.',
      },
      uk: {
        usual: 'Зазвичай ясний план допомагає вам побачити наступний крок.',
        context: 'Коли обставини змінюються, ви готові перебудувати спосіб дії.',
        meaning: 'Структура може бути для вас опорою, а не жорстким сценарієм.',
        suggestion: 'Відокремте обов’язкову частину плану від тієї, яку можна змінювати.',
      },
    },
  },
  {
    ids: ['reflection', 'initiative'],
    copy: {
      ru: {
        usual: 'Обычно вам важно сначала понять контекст и сформулировать позицию.',
        context: 'Но при ясной цели вы способны быстро перейти к первому действию.',
        meaning: 'Пауза и инициативность могут включаться на разных этапах одного решения.',
        suggestion: 'Дайте себе короткое время на проверку, а затем выберите один тестовый шаг.',
      },
      en: {
        usual: 'You often want to understand the context before forming a position.',
        context: 'With a clear purpose, you can move quickly into action.',
        meaning: 'Reflection and initiative may belong to different stages of one decision.',
        suggestion: 'Set a short review window, then choose one testable step.',
      },
      uk: {
        usual: 'Часто вам важливо спочатку зрозуміти контекст і сформулювати позицію.',
        context: 'За ясної мети ви можете швидко перейти до першої дії.',
        meaning: 'Пауза й ініціативність можуть працювати на різних етапах одного рішення.',
        suggestion: 'Дайте собі короткий час на перевірку, а потім оберіть один тестовий крок.',
      },
    },
  },
  {
    ids: ['autonomy', 'connection'],
    copy: {
      ru: {
        usual: 'Вам важно сохранять собственный темп и пространство для решения.',
        context: 'С близкими или в сложной ситуации поддерживающий контакт может стать опорой.',
        meaning: 'Самостоятельность не исключает потребность в точном, безопасном диалоге.',
        suggestion: 'Сразу обозначайте, нужен вам разговор или время, после которого вы вернётесь.',
      },
      en: {
        usual: 'Your own pace and room to decide matter to you.',
        context: 'With trusted people, supportive contact can become a resource.',
        meaning: 'Independence does not rule out a need for a precise, safe conversation.',
        suggestion: 'Say whether you need a conversation now or a pause with a clear return point.',
      },
      uk: {
        usual: 'Для вас важливі власний темп і простір для рішення.',
        context: 'З близькими підтримувальний контакт може стати опорою.',
        meaning: 'Самостійність не виключає потреби в точному й безпечному діалозі.',
        suggestion: 'Одразу називайте, потрібна розмова чи пауза з ясним моментом повернення.',
      },
    },
  },
  {
    ids: ['practicality', 'openness'],
    copy: {
      ru: {
        usual: 'Вам легче доверять идее, когда её можно проверить на практике.',
        context: 'При этом новые способы и неожиданные перспективы поддерживают интерес.',
        meaning:
          'Любопытство становится особенно полезным, когда получает форму небольшого эксперимента.',
        suggestion: 'Проверяйте новую идею на одном ограниченном участке, не меняя всё сразу.',
      },
      en: {
        usual: 'An idea feels more useful when you can test it in practice.',
        context: 'New approaches and unexpected perspectives still keep you engaged.',
        meaning: 'Curiosity may work best when it becomes a small experiment.',
        suggestion: 'Test the new idea in one bounded area instead of changing everything.',
      },
      uk: {
        usual: 'Ідеї легше довіряти, коли її можна перевірити на практиці.',
        context: 'Водночас нові способи й несподівані перспективи підтримують інтерес.',
        meaning: 'Цікавість може бути найкориснішою у формі невеликого експерименту.',
        suggestion: 'Перевірте нову ідею на одній ділянці, не змінюючи все одразу.',
      },
    },
  },
];

export function createContextualContrasts(
  input: PatternCompositionInput,
): readonly ContextualContrast[] {
  const scores = new Map(input.ranked.map((item) => [item.id, item]));
  return contrastRules
    .flatMap((rule) => {
      const left = scores.get(rule.ids[0]);
      const right = scores.get(rule.ids[1]);
      if (!left || !right || left.evidence.length === 0 || right.evidence.length === 0) return [];
      const evidence = [...left.evidence.slice(0, 2), ...right.evidence.slice(0, 2)];
      return [
        {
          ...rule.copy[input.locale],
          evidence,
          id: `contrast:${rule.ids.join(':')}`,
          sources: createSourceReferences(evidence, [], input.locale),
        },
      ];
    })
    .slice(0, 2);
}
