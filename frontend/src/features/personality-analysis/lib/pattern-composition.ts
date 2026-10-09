import { portraitHeroPhrase } from '../data/portrait-assembly-copy';
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
  es: {
    thinking: 'Pensamiento',
    communication: 'Comunicación',
    motivation: 'Motivación',
    decisions: 'Decisiones',
    energy: 'Energía',
    adaptation: 'Adaptación',
  },
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

export function createHeroPhrase(input: PatternCompositionInput) {
  const primary = input.ranked[0];
  const secondary = input.ranked[1] ?? primary;
  if (!primary || !secondary) return '';
  const interest = input.interests[0]
    ? getInterestLabel(input.interests[0], input.locale, 'object')
    : undefined;
  return portraitHeroPhrase[input.locale](
    getTraitTemplate(primary.id, input.locale).label,
    getTraitTemplate(secondary.id, input.locale).label,
    interest,
    input.hasInterpretations,
  );
}

const revealHeadlines: Record<ProfileLocale, Record<TraitId, string>> = {
  es: {
    adaptability: 'Puedes cambiar el enfoque sin perder el objetivo',
    autonomy: 'Prefieres decidir con independencia',
    connection: 'La confianza importa en tus relaciones',
    directness: 'Las palabras claras te ayudan a cuidar las relaciones',
    initiative: 'Conviertes pronto las ideas en primeros pasos',
    openness: 'Consideras más de una respuesta posible',
    practicality: 'Prefieres las ideas que puedes probar',
    reflection: 'Te tomas tiempo para comprender antes de actuar',
    structure: 'Un plan claro te ayuda ante la incertidumbre',
  },
  en: {
    adaptability: 'You can change your approach and keep the goal',
    autonomy: 'You prefer to make decisions independently',
    connection: 'Trust matters to you in relationships',
    directness: 'Clear words help you protect relationships',
    initiative: 'You turn ideas into first steps quickly',
    openness: 'You consider more than one possible answer',
    practicality: 'You prefer ideas that can be tested',
    reflection: 'You take time to understand before acting',
    structure: 'A clear plan helps with uncertainty',
  },
  ru: {
    adaptability: 'Вы умеете менять способ, сохраняя цель',
    autonomy: 'Вам важно принимать решения самостоятельно',
    connection: 'В отношениях вам особенно важно доверие',
    directness: 'Ясные слова помогают вам беречь отношения',
    initiative: 'Вы быстро превращаете идеи в первые шаги',
    openness: 'Вы рассматриваете больше одного возможного ответа',
    practicality: 'Вам ближе идеи, которые можно проверить',
    reflection: 'Перед действием вам важно разобраться',
    structure: 'Понятный план помогает вам при неопределённости',
  },
  uk: {
    adaptability: 'Ви вмієте змінювати спосіб, зберігаючи мету',
    autonomy: 'Для вас важливо приймати рішення самостійно',
    connection: 'У стосунках для вас особливо важлива довіра',
    directness: 'Чіткі слова допомагають вам берегти стосунки',
    initiative: 'Ви швидко перетворюєте ідеї на перші кроки',
    openness: 'Ви розглядаєте більше однієї можливої відповіді',
    practicality: 'Вам ближчі ідеї, які можна перевірити',
    reflection: 'Перед дією вам важливо розібратися',
    structure: 'Зрозумілий план допомагає вам у невизначеності',
  },
};

const contrastHeadlines: Record<string, Record<ProfileLocale, string>> = {
  'adaptability:structure': {
    es: 'Combinas un plan claro con flexibilidad',
    en: 'You combine a clear plan with flexibility',
    ru: 'Вы сочетаете понятный план с гибкостью',
    uk: 'Ви поєднуєте зрозумілий план із гнучкістю',
  },
  'initiative:reflection': {
    es: 'Primero reflexionas, después actúas',
    en: 'You think first and then act',
    ru: 'Сначала вы думаете, а затем действуете',
    uk: 'Спочатку ви думаєте, а потім дієте',
  },
  'autonomy:connection': {
    es: 'Necesitas tanto independencia como cercanía',
    en: 'You need both independence and closeness',
    ru: 'Вам нужны и самостоятельность, и близость',
    uk: 'Вам потрібні й самостійність, і близькість',
  },
  'openness:practicality': {
    es: 'La curiosidad se vuelve útil con un pequeño experimento',
    en: 'Curiosity becomes useful through a small experiment',
    ru: 'Любопытство становится полезным через небольшой эксперимент',
    uk: 'Цікавість стає корисною через невеликий експеримент',
  },
};

const traitSummaries: Record<ProfileLocale, Record<TraitId, string>> = {
  es: {
    adaptability:
      'Cuando cambian las circunstancias, puedes ajustar el enfoque sin perder de vista el objetivo.',
    autonomy: 'Prefieres decidir por tu cuenta y necesitas espacio para actuar con independencia.',
    connection: 'Te sientes más a gusto en relaciones con confianza y atención genuina.',
    directness: 'Valoras las palabras claras y prefieres abordar lo importante abiertamente.',
    initiative: 'Cuando una idea te parece valiosa, te animas a dar el primer paso.',
    openness: 'Consideras varias posibilidades antes de quedarte con una respuesta.',
    practicality: 'Confías más en las ideas cuando puedes probarlas en la vida real.',
    reflection: 'Sueles comprender la situación antes de actuar.',
    structure: 'Dividir una situación en pasos claros te ayuda a orientarte.',
  },
  en: {
    adaptability: 'When circumstances change, you can adjust without losing sight of the goal.',
    autonomy: 'You prefer to make your own decisions and need room to act independently.',
    connection: 'You feel most comfortable in relationships with trust and genuine attention.',
    directness: 'You value clear words and prefer to address important things openly.',
    initiative: 'Once an idea feels worthwhile, you are ready to take the first step.',
    openness: 'You consider several possibilities before settling on one answer.',
    practicality: 'You trust ideas more when you can test them in real life.',
    reflection: 'You tend to understand a situation before you act.',
    structure: 'Breaking a situation into clear next steps helps you find your bearings.',
  },
  ru: {
    adaptability: 'Когда обстоятельства меняются, вы умеете перестроиться и не потерять цель.',
    autonomy: 'Вы предпочитаете принимать решения сами и цените свободу действий.',
    connection: 'В отношениях вам особенно важны доверие и искреннее внимание.',
    directness: 'Вы цените ясные слова и предпочитаете говорить о важном прямо.',
    initiative: 'Если идея кажется стоящей, вы готовы сделать первый шаг.',
    openness: 'Перед выбором вы рассматриваете несколько возможных вариантов.',
    practicality: 'Вы больше доверяете идеям, которые можно проверить на деле.',
    reflection: 'Обычно вам важно сначала разобраться, а потом действовать.',
    structure:
      'Вам легче сориентироваться, когда можно разбить ситуацию на понятные следующие шаги.',
  },
  uk: {
    adaptability: 'Коли обставини змінюються, ви вмієте перебудуватися й не втратити мету.',
    autonomy: 'Ви віддаєте перевагу самостійним рішенням і цінуєте свободу дій.',
    connection: 'У стосунках для вас особливо важливі довіра та щира увага.',
    directness: 'Ви цінуєте чіткі слова й волієте говорити про важливе прямо.',
    initiative: 'Якщо ідея здається вартою уваги, ви готові зробити перший крок.',
    openness: 'Перед вибором ви розглядаєте кілька можливих варіантів.',
    practicality: 'Ви більше довіряєте ідеям, які можна перевірити на практиці.',
    reflection: 'Зазвичай вам важливо спочатку розібратися, а потім діяти.',
    structure:
      'Вам легше зорієнтуватися, коли можна розкласти ситуацію на зрозумілі наступні кроки.',
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
  const lead = [
    traitSummaries[input.locale][primary.id],
    secondary.id === primary.id ? '' : traitSummaries[input.locale][secondary.id],
  ]
    .filter(Boolean)
    .join(' ');
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
      es: {
        usual: 'Un plan claro suele ayudarte a ver el siguiente paso.',
        context: 'Cuando las circunstancias cambian, puedes ajustar el método.',
        meaning: 'La estructura puede ser un apoyo para ti, no un guion rígido.',
        suggestion: 'Separa lo esencial del plan de aquello que puede cambiar.',
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
      es: {
        usual: 'A menudo quieres comprender el contexto antes de formarte una opinión.',
        context: 'Con un propósito claro, puedes pasar pronto a la acción.',
        meaning: 'La reflexión y la iniciativa pueden ser etapas distintas de una misma decisión.',
        suggestion:
          'Reserva un breve tiempo para revisar y elige después un paso que puedas probar.',
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
      es: {
        usual: 'Te importan tu propio ritmo y el espacio para decidir.',
        context: 'Con personas de confianza, una conversación de apoyo puede ser un recurso.',
        meaning: 'La independencia no excluye la necesidad de una conversación clara y segura.',
        suggestion:
          'Di si necesitas hablar ahora o hacer una pausa, y acuerda cuándo retomar el contacto.',
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
      es: {
        usual: 'Una idea te resulta más útil cuando puedes probarla en la práctica.',
        context:
          'Los enfoques nuevos y las perspectivas inesperadas también despiertan tu interés.',
        meaning: 'Tu curiosidad puede funcionar mejor si se convierte en un pequeño experimento.',
        suggestion: 'Prueba la idea nueva en un ámbito concreto en lugar de cambiarlo todo.',
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
