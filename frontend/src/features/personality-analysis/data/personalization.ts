import type { ProfileLocale } from '@entities/personality-profile';

import type { TraitId, TraitTemplate } from '../model';
import { traitTemplates } from './trait-templates';
import { spanishTraitTemplates } from './trait-templates-es';

type LocalizedTraitCopy = TraitTemplate;

const en: Readonly<Record<TraitId, LocalizedTraitCopy>> = {
  adaptability: {
    strengthDetails:
      'Several answers favour adapting to the circumstances rather than keeping to one script.',
    growthDetails:
      'Before changing a plan, name what matters to preserve. This can help you adapt without losing direction.',
    energyDetails: 'Vary how you rest and leave a little room to adjust the plan.',
    recommendationLabel: 'For a changing plan',
    label: 'adaptability',
    strengthTitle: 'Adaptive thinking',
    strengthDescription: 'You adjust your approach when the situation changes.',
    growthTitle: 'Keep one steady point',
    growthDescription: 'Flexibility works best when one priority stays clear.',
    energyTitle: 'Freedom to change pace',
    energyDescription: 'A flexible rhythm may help you recover without forcing one routine.',
    recommendationTitle: 'Prepare one alternative route',
    recommendationDescription: 'Give the next plan one allowed variation.',
    recommendationDetails:
      'Name the main step and one acceptable alternative before circumstances change.',
  },
  autonomy: {
    strengthDetails: 'Your answers value independent space to check a decision and regain clarity.',
    growthDetails:
      'You do not have to explain everything. Name the boundary and when you are ready to reconnect.',
    energyDetails:
      'A short period without new demands can help separate your own priorities from outside noise.',
    recommendationLabel: 'For personal space',
    label: 'independence',
    strengthTitle: 'Independent judgement',
    strengthDescription: 'You value room to check decisions against your own criteria.',
    growthTitle: 'Name your need for space',
    growthDescription: 'Others understand your space better when its boundaries are named.',
    energyTitle: 'Time at your own pace',
    energyDescription: 'A short pause without new demands can restore clarity.',
    recommendationTitle: 'Set the boundaries of a pause',
    recommendationDescription: 'Protect a short period without new requests.',
    recommendationDetails: 'Say when your pause begins and when you expect to reconnect.',
  },
  connection: {
    strengthDetails:
      'Several answers give weight to trust, the other person’s readiness and a calm conversation.',
    growthDetails:
      'Before an important conversation, name one of your own needs as clearly as you consider the other person’s state.',
    energyDetails:
      'Choose a conversation that does not require an immediate decision or a fast pace.',
    recommendationLabel: 'For a conversation',
    label: 'connection',
    strengthTitle: 'Attention to relationships',
    strengthDescription: 'You notice how trust and the shape of a conversation affect the outcome.',
    growthTitle: 'Keep yourself in the conversation',
    growthDescription: 'Care for the relationship can include your own needs just as clearly.',
    energyTitle: 'Contact without pressure',
    energyDescription: 'A calm exchange with someone you trust may restore energy.',
    recommendationTitle: 'Begin with common ground',
    recommendationDescription:
      'Start a difficult conversation by naming what you both want to preserve.',
    recommendationDetails:
      'Use one sentence for the shared goal before moving to the disagreement.',
  },
  directness: {
    strengthDetails:
      'Your answers value brief, specific wording when giving feedback or having a difficult conversation.',
    growthDetails:
      'Add one sentence about the purpose of the conversation. It can help the other person hear the meaning, as well as the request.',
    energyDetails: 'With explicit agreements, you do not have to keep guessing the next step.',
    recommendationLabel: 'For a clear agreement',
    label: 'clarity',
    strengthTitle: 'Direct communication',
    strengthDescription:
      'You value expectations and boundaries that can be understood without guessing.',
    growthTitle: 'Add context to directness',
    growthDescription: 'A clear position lands better when its purpose is visible.',
    energyTitle: 'Clarity without guesswork',
    energyDescription: 'Explicit agreements can reduce unnecessary tension.',
    recommendationTitle: 'Separate fact from request',
    recommendationDescription: 'Turn an important request into one concrete sentence.',
    recommendationDetails: 'Name the fact, the request and the preferred timing separately.',
  },
  initiative: {
    strengthDetails:
      'Your answers show a willingness to start a conversation, try an approach or take responsibility for moving things forward.',
    growthDetails: 'Before acting, ask what result would show that this approach works.',
    energyDetails:
      'Choose a step with a visible result rather than trying to solve the whole task at once.',
    recommendationLabel: 'For getting started',
    label: 'initiative',
    strengthTitle: 'Forward momentum',
    strengthDescription: 'You can turn intention into a concrete first move.',
    growthTitle: 'Check the direction',
    growthDescription: 'A quick start becomes stronger with one short reality check.',
    energyTitle: 'Momentum after a first step',
    energyDescription: 'A small completed action can restore momentum.',
    recommendationTitle: 'Run a small experiment',
    recommendationDescription: 'Turn your next idea into a step you can test.',
    recommendationDetails: 'Choose an action that finishes quickly and gives you new information.',
  },
  openness: {
    strengthDetails:
      'Your answers show a willingness to change surroundings, try approaches and notice your own response.',
    growthDetails: 'Before trying a new option, decide what you want to test or gain from it.',
    energyDetails: 'Try a small change of scene that does not require another major commitment.',
    recommendationLabel: 'For a fresh perspective',
    label: 'openness',
    strengthTitle: 'Openness to possibilities',
    strengthDescription: 'New approaches and perspectives can keep you engaged.',
    growthTitle: 'Give curiosity a direction',
    growthDescription: 'Variety is more useful when you know what you want to explore.',
    energyTitle: 'A small change of scene',
    energyDescription: 'A new setting or idea may gently reset your attention.',
    recommendationTitle: 'Change one element',
    recommendationDescription: 'Add one unfamiliar approach to a familiar task.',
    recommendationDetails:
      'Experiment with one part of the process instead of replacing everything.',
  },
  practicality: {
    strengthDetails: 'Concrete help, visible progress and a clear next step recur in your answers.',
    growthDetails:
      'After choosing a workable solution, check whether it serves the main goal, as well as making the next step easier.',
    energyDetails:
      'Choose an action with a clear finish and temporarily set aside what does not belong to it.',
    recommendationLabel: 'For practical action',
    label: 'practicality',
    strengthTitle: 'A practical approach',
    strengthDescription: 'You value choices that can be applied and checked in real life.',
    growthTitle: 'Reconnect action with meaning',
    growthDescription: 'A workable answer can still be checked against the wider purpose.',
    energyTitle: 'The feeling of completion',
    energyDescription: 'One finished step may restore more clarity than a long list.',
    recommendationTitle: 'Define what done means',
    recommendationDescription: 'Reduce the task to its next observable result.',
    recommendationDetails:
      'Write down one action, its finish line and the moment you will review it.',
  },
  reflection: {
    strengthDetails:
      'Pausing, observing or checking your own response before acting recurs in your answers.',
    growthDetails:
      'Decide in advance what information is enough and when to move from thinking to action.',
    energyDetails:
      'Even a brief pause without new input can help you put your own response into words and choose the next step.',
    recommendationLabel: 'For an important decision',
    label: 'reflection',
    strengthTitle: 'Thoughtfulness',
    strengthDescription: 'You give yourself time to notice context before acting.',
    growthTitle: 'Notice when there is enough',
    growthDescription: 'Reflection helps until it delays a useful real-world check.',
    energyTitle: 'Space to process',
    energyDescription: 'A pause without new decisions may bring clarity back.',
    recommendationTitle: 'Limit the time for reflection',
    recommendationDescription: 'Give the next decision a clear thinking window.',
    recommendationDetails: 'Choose a deadline and two criteria that are enough for the next step.',
  },
  structure: {
    strengthDetails: 'Facts, a plan, visible progress and concrete examples recur in your answers.',
    growthDetails:
      'Separate the essential part of a plan from what you can revise without losing the result.',
    energyDetails: 'Focus on the nearest stage and what would count as completing it.',
    recommendationLabel: 'For a clear plan',
    label: 'structure',
    strengthTitle: 'Structured thinking',
    strengthDescription: 'You create clarity through sequence, criteria and visible progress.',
    growthTitle: 'Leave room inside the plan',
    growthDescription: 'Structure stays useful when circumstances can still change it.',
    energyTitle: 'A clear next step',
    energyDescription: 'A visible sequence can reduce the feeling of overload.',
    recommendationTitle: 'Choose three anchors',
    recommendationDescription: 'Reduce the next decision to three useful reference points.',
    recommendationDetails:
      'Name one must-have, one preference and one condition for reconsidering.',
  },
};

const uk: Readonly<Record<TraitId, LocalizedTraitCopy>> = {
  adaptability: {
    strengthDetails:
      'У кількох відповідях ви обираєте спосіб дії відповідно до обставин, а не дотримуєтеся одного сценарію.',
    growthDetails:
      'Перед зміною плану назвіть, що важливо зберегти. Це допомагає пристосуватися, не втрачаючи напряму.',
    energyDetails:
      'Чергуйте способи відпочинку й заздалегідь залишайте трохи простору для зміни плану.',
    recommendationLabel: 'Для змін у плані',
    label: 'гнучкість',
    strengthTitle: 'Адаптивне мислення',
    strengthDescription: 'Ви змінюєте спосіб дії, коли цього потребує ситуація.',
    growthTitle: 'Зберігати одну опору',
    growthDescription: 'Гнучкість працює краще, коли один пріоритет залишається ясним.',
    energyTitle: 'Свобода змінити ритм',
    energyDescription: 'Гнучкий ритм може допомагати відновленню без жорсткого сценарію.',
    recommendationTitle: 'Підготуйте один запасний маршрут',
    recommendationDescription: 'Залиште в найближчому плані один дозволений варіант.',
    recommendationDetails: 'Назвіть основний крок і одну прийнятну альтернативу заздалегідь.',
  },
  autonomy: {
    strengthDetails:
      'Відповіді показують цінність особистого простору, де можна перевірити рішення й відновити ясність.',
    growthDetails:
      'Не обов’язково пояснювати все докладно: достатньо окреслити межу й момент, коли ви готові повернутися до спілкування.',
    energyDetails:
      'Короткий час без нових вимог допомагає відокремити власні пріоритети від зовнішнього шуму.',
    recommendationLabel: 'Для особистого простору',
    label: 'самостійність',
    strengthTitle: 'Опора на себе',
    strengthDescription: 'Ви цінуєте простір, де можна звірити рішення з власними критеріями.',
    growthTitle: 'Називати потребу в особистому просторі',
    growthDescription: 'Іншим легше поважати ваш простір, коли його межі названі.',
    energyTitle: 'Час у своєму темпі',
    energyDescription: 'Коротка пауза без нових вимог може повертати ясність.',
    recommendationTitle: 'Окресліть межі паузи',
    recommendationDescription: 'Захистіть невеликий проміжок без нових запитів.',
    recommendationDetails:
      'Скажіть, коли починається пауза і коли ви плануєте повернутися до контакту.',
  },
  connection: {
    strengthDetails:
      'У кількох відповідях для вас важливі довіра, готовність співрозмовника й спокійна розмова.',
    growthDetails:
      'Перед важливою розмовою назвіть одну власну потребу так само чітко, як ви враховуєте стан іншої людини.',
    energyDetails:
      'Оберіть розмову, у якій не потрібно негайно ухвалювати рішення чи підтримувати високий темп.',
    recommendationLabel: 'Для розмови',
    label: 'увага до зв’язку',
    strengthTitle: 'Увага до стосунків',
    strengthDescription: 'Ви помічаєте, як довіра й форма розмови впливають на результат.',
    growthTitle: 'Зберігати себе в діалозі',
    growthDescription: 'Турбота про стосунки може так само чітко враховувати ваші потреби.',
    energyTitle: 'Контакт без тиску',
    energyDescription: 'Спокійна розмова з близькою людиною може повертати сили.',
    recommendationTitle: 'Почніть зі спільної опори',
    recommendationDescription: 'На початку складної розмови назвіть те, що хочете зберегти разом.',
    recommendationDetails:
      'Одним реченням сформулюйте спільну мету, а потім переходьте до розбіжності.',
  },
  directness: {
    strengthDetails:
      'Відповіді вказують на цінність коротких, конкретних формулювань у зворотному зв’язку й складних розмовах.',
    growthDetails:
      'Додайте до чіткої позиції одне речення про мету розмови. Це допоможе іншій людині почути зміст, а не лише вимогу.',
    energyDetails:
      'Коли домовленості сформульовані прямо, не доводиться постійно вгадувати наступний крок.',
    recommendationLabel: 'Для чіткої домовленості',
    label: 'ясність',
    strengthTitle: 'Пряма комунікація',
    strengthDescription: 'Ви цінуєте очікування й межі, які не потрібно вгадувати.',
    growthTitle: 'Додавати контекст до прямоти',
    growthDescription: 'Чітка позиція звучить точніше, коли зрозуміла її мета.',
    energyTitle: 'Ясність без здогадок',
    energyDescription: 'Прямі домовленості можуть зменшувати зайве напруження.',
    recommendationTitle: 'Відокремте факт від прохання',
    recommendationDescription: 'Сформулюйте важливе прохання одним конкретним реченням.',
    recommendationDetails: 'Окремо назвіть факт, прохання та бажаний час.',
  },
  initiative: {
    strengthDetails:
      'У відповідях помітна готовність починати розмову, пробувати новий спосіб або брати відповідальність за рух уперед.',
    growthDetails:
      'Перед дією запитайте себе: який результат покаже, що обраний спосіб справді працює?',
    energyDetails:
      'Оберіть крок із видимим результатом замість спроби одразу розв’язати все завдання.',
    recommendationLabel: 'Для початку',
    label: 'ініціативність',
    strengthTitle: 'Рух уперед',
    strengthDescription: 'Ви можете перетворювати намір на перший конкретний крок.',
    growthTitle: 'Перевіряти напрям',
    growthDescription: 'Швидкий старт стає сильнішим після короткої перевірки реальністю.',
    energyTitle: 'Сили після першого кроку',
    energyDescription: 'Невелика завершена дія може повертати відчуття руху.',
    recommendationTitle: 'Зробіть невеликий експеримент',
    recommendationDescription: 'Перетворіть найближчу ідею на крок, який можна перевірити.',
    recommendationDetails: 'Оберіть дію, що швидко завершується й дає нову інформацію.',
  },
  openness: {
    strengthDetails:
      'Відповіді показують готовність змінювати обстановку, пробувати різні підходи й дослухатися до власного відгуку.',
    growthDetails: 'Перед новим варіантом визначте, що саме хочете перевірити чи отримати.',
    energyDetails:
      'Для відновлення оберіть невелику зміну обстановки, яка не потребує ще одного великого зобов’язання.',
    recommendationLabel: 'Для свіжого погляду',
    label: 'відкритість новому',
    strengthTitle: 'Відкритість можливостям',
    strengthDescription: 'Нові підходи й перспективи можуть підтримувати ваш інтерес.',
    growthTitle: 'Спрямовувати цікавість',
    growthDescription: 'Різноманіття корисніше, коли зрозуміло, що саме ви досліджуєте.',
    energyTitle: 'Невелика зміна обстановки',
    energyDescription: 'Нова обстановка чи ідея може м’яко перемикати увагу.',
    recommendationTitle: 'Змініть один елемент',
    recommendationDescription: 'Додайте один незвичний спосіб до знайомого завдання.',
    recommendationDetails: 'Експериментуйте з однією частиною процесу, а не змінюйте все.',
  },
  practicality: {
    strengthDetails:
      'У відповідях повторюється орієнтація на конкретну допомогу, видимий прогрес і зрозумілий наступний крок.',
    growthDetails:
      'Обравши дієве рішення, перевірте, чи відповідає воно головній меті, а не лише зручності найближчого кроку.',
    energyDetails:
      'Оберіть дію з чітким завершенням і тимчасово відкладіть усе, що до неї не належить.',
    recommendationLabel: 'Для практичної дії',
    label: 'практичність',
    strengthTitle: 'Практичний підхід',
    strengthDescription: 'Ви цінуєте рішення, які можна застосувати й перевірити.',
    growthTitle: 'Звіряти дію зі змістом',
    growthDescription: 'Робоче рішення варто перевірити на відповідність ширшій меті.',
    energyTitle: 'Відчуття завершеності',
    energyDescription: 'Один завершений крок може повертати більше ясності, ніж довгий список.',
    recommendationTitle: 'Визначте точку завершення',
    recommendationDescription: 'Скоротіть завдання до наступного видимого результату.',
    recommendationDetails: 'Запишіть одну дію, критерій завершення та момент перевірки.',
  },
  reflection: {
    strengthDetails:
      'У відповідях неодноразово з’являються пауза, спостереження чи перевірка власного відгуку перед дією.',
    growthDetails:
      'Заздалегідь визначте, якої інформації достатньо, і призначте момент переходу від аналізу до дії.',
    energyDetails:
      'Навіть коротка пауза без нової інформації допомагає сформулювати власну реакцію й обрати наступний крок.',
    recommendationLabel: 'Для важливого вибору',
    label: 'вдумливість',
    strengthTitle: 'Вдумливість',
    strengthDescription: 'Ви даєте собі час помітити контекст перед дією.',
    growthTitle: 'Помічати момент достатності',
    growthDescription: 'Роздуми допомагають, доки не відкладають перевірку в реальності.',
    energyTitle: 'Простір для осмислення',
    energyDescription: 'Пауза без нових рішень може повертати ясність.',
    recommendationTitle: 'Обмежте час на роздуми',
    recommendationDescription: 'Визначте час на обдумування найближчого рішення.',
    recommendationDetails: 'Оберіть строк і два критерії, яких достатньо для наступного кроку.',
  },
  structure: {
    strengthDetails:
      'У відповідях повторюється цінність фактів, плану, видимого прогресу й конкретних прикладів.',
    growthDetails:
      'Відокремте обов’язкову частину плану від тієї, яку можна переглянути без втрати результату.',
    energyDetails: 'Зосередьтеся лише на найближчому етапі й критерії його завершення.',
    recommendationLabel: 'Для чіткого плану',
    label: 'структурність',
    strengthTitle: 'Структурне мислення',
    strengthDescription: 'Ви створюєте ясність через послідовність, критерії та видимий прогрес.',
    growthTitle: 'Залишати простір у плані',
    growthDescription: 'Структура корисна, коли обставини все ще можуть її змінити.',
    energyTitle: 'Ясний наступний крок',
    energyDescription: 'Зрозуміла послідовність може зменшувати відчуття перевантаження.',
    recommendationTitle: 'Оберіть три опори',
    recommendationDescription: 'Скоротіть найближче рішення до трьох корисних орієнтирів.',
    recommendationDetails: 'Назвіть одну обов’язкову умову, одне побажання й умову перегляду.',
  },
};

export const traitTemplatesByLocale = {
  ru: traitTemplates,
  en,
  uk,
  es: spanishTraitTemplates,
} satisfies Record<ProfileLocale, Readonly<Record<TraitId, TraitTemplate>>>;

export function getTraitTemplate(id: TraitId, locale: ProfileLocale): TraitTemplate {
  return traitTemplatesByLocale[locale][id];
}

export const recommendationCategoryByTrait = {
  adaptability: 'work',
  autonomy: 'relationships',
  connection: 'communication',
  directness: 'communication',
  initiative: 'work',
  openness: 'interest',
  practicality: 'work',
  reflection: 'decisions',
  structure: 'decisions',
} as const;

const interestLabels = {
  es: {
    technology: 'tecnología',
    creativity: 'creatividad',
    people: 'relaciones',
    movement: 'movimiento',
    travel: 'viajes',
    learning: 'aprendizaje',
    business: 'negocios',
    games: 'juegos',
    music: 'música',
    cinema: 'cine',
    nature: 'naturaleza',
    selfDevelopment: 'desarrollo personal',
  },
  en: {
    technology: 'technology',
    creativity: 'creative work',
    people: 'relationships',
    movement: 'movement',
    travel: 'travel',
    learning: 'learning',
    business: 'business',
    games: 'games',
    music: 'music',
    cinema: 'film',
    nature: 'nature',
    selfDevelopment: 'self-development',
  },
  ru: {
    technology: 'технологии',
    creativity: 'творчество',
    people: 'отношения',
    movement: 'движение',
    travel: 'путешествия',
    learning: 'обучение',
    business: 'бизнес',
    games: 'игры',
    music: 'музыка',
    cinema: 'кино',
    nature: 'природа',
    selfDevelopment: 'саморазвитие',
  },
  uk: {
    technology: 'технології',
    creativity: 'творчість',
    people: 'стосунки',
    movement: 'рух',
    travel: 'подорожі',
    learning: 'навчання',
    business: 'бізнес',
    games: 'ігри',
    music: 'музика',
    cinema: 'кіно',
    nature: 'природа',
    selfDevelopment: 'саморозвиток',
  },
} as const;

const interestObjectLabels = {
  es: interestLabels.es,
  en: interestLabels.en,
  ru: { ...interestLabels.ru, music: 'музыку', nature: 'природу' },
  uk: { ...interestLabels.uk, music: 'музику', nature: 'природу' },
} as const;

const interestInstrumentalLabels = {
  es: interestLabels.es,
  en: interestLabels.en,
  ru: {
    technology: 'технологиями',
    creativity: 'творчеством',
    people: 'отношениями',
    movement: 'движением',
    travel: 'путешествиями',
    learning: 'обучением',
    business: 'бизнесом',
    games: 'играми',
    music: 'музыкой',
    cinema: 'кино',
    nature: 'природой',
    selfDevelopment: 'саморазвитием',
  },
  uk: {
    technology: 'технологіями',
    creativity: 'творчістю',
    people: 'стосунками',
    movement: 'рухом',
    travel: 'подорожами',
    learning: 'навчанням',
    business: 'бізнесом',
    games: 'іграми',
    music: 'музикою',
    cinema: 'кіно',
    nature: 'природою',
    selfDevelopment: 'саморозвитком',
  },
} as const;

export const interestForms = {
  es: { display: interestLabels.es, instrumental: interestLabels.es, object: interestLabels.es },
  en: { display: interestLabels.en, instrumental: interestLabels.en, object: interestLabels.en },
  ru: {
    display: interestLabels.ru,
    instrumental: interestInstrumentalLabels.ru,
    object: interestObjectLabels.ru,
  },
  uk: {
    display: interestLabels.uk,
    instrumental: interestInstrumentalLabels.uk,
    object: interestObjectLabels.uk,
  },
} satisfies Record<
  ProfileLocale,
  Record<'display' | 'instrumental' | 'object', Record<string, string>>
>;

const unknownInterest: Record<ProfileLocale, string> = {
  es: 'otro interés',
  en: 'another interest',
  ru: 'другой интерес',
  uk: 'інший інтерес',
};

export function getInterestLabel(
  id: string,
  locale: ProfileLocale,
  form: 'display' | 'instrumental' | 'object' = 'display',
) {
  if (id.startsWith('other:')) return id.slice(6);
  const labels: Record<string, string> = interestForms[locale][form];
  return labels[id] ?? unknownInterest[locale];
}
