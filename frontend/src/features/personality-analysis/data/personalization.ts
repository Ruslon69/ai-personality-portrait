import type { ProfileLocale } from '@entities/personality-profile';

import type { TraitId, TraitTemplate } from '../model';
import { traitTemplates } from './trait-templates';

type LocalizedTraitCopy = Pick<
  TraitTemplate,
  | 'energyDescription'
  | 'energyTitle'
  | 'growthDescription'
  | 'growthTitle'
  | 'label'
  | 'recommendationDescription'
  | 'recommendationDetails'
  | 'recommendationTitle'
  | 'strengthDescription'
  | 'strengthTitle'
>;

const en: Readonly<Record<TraitId, LocalizedTraitCopy>> = {
  adaptability: {
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
    label: 'independence',
    strengthTitle: 'Independent grounding',
    strengthDescription: 'You value room to check decisions against your own criteria.',
    growthTitle: 'Make independence visible',
    growthDescription: 'Others understand your space better when its boundaries are named.',
    energyTitle: 'Time at your own pace',
    energyDescription: 'A short pause without new demands can restore clarity.',
    recommendationTitle: 'Define the edges of a pause',
    recommendationDescription: 'Protect a short period without new requests.',
    recommendationDetails: 'Say when your pause begins and when you expect to reconnect.',
  },
  connection: {
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
    label: 'initiative',
    strengthTitle: 'Forward momentum',
    strengthDescription: 'You can turn intention into a concrete first move.',
    growthTitle: 'Check the direction',
    growthDescription: 'A quick start becomes stronger with one short reality check.',
    energyTitle: 'Energy from a first step',
    energyDescription: 'A small completed action can restore momentum.',
    recommendationTitle: 'Run a small experiment',
    recommendationDescription: 'Turn the nearest idea into a testable step.',
    recommendationDetails: 'Choose an action that finishes quickly and gives you new information.',
  },
  openness: {
    label: 'openness',
    strengthTitle: 'Openness to possibilities',
    strengthDescription: 'New approaches and perspectives can keep you engaged.',
    growthTitle: 'Give curiosity a direction',
    growthDescription: 'Variety is more useful when you know what you want to explore.',
    energyTitle: 'A small change of perspective',
    energyDescription: 'A new setting or idea may gently reset your attention.',
    recommendationTitle: 'Change one element',
    recommendationDescription: 'Add one unfamiliar approach to a familiar task.',
    recommendationDetails:
      'Experiment with one part of the process instead of replacing everything.',
  },
  practicality: {
    label: 'practicality',
    strengthTitle: 'Practical focus',
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
    label: 'reflection',
    strengthTitle: 'Thoughtful attention',
    strengthDescription: 'You give yourself time to notice context before acting.',
    growthTitle: 'Notice when there is enough',
    growthDescription: 'Reflection helps until it delays a useful real-world check.',
    energyTitle: 'Space to process',
    energyDescription: 'A pause without new decisions may bring clarity back.',
    recommendationTitle: 'Set a boundary for reflection',
    recommendationDescription: 'Give the next decision a clear thinking window.',
    recommendationDetails: 'Choose a deadline and two criteria that are enough for the next step.',
  },
  structure: {
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
    label: 'самостійність',
    strengthTitle: 'Самостійна опора',
    strengthDescription: 'Ви цінуєте простір, де можна звірити рішення з власними критеріями.',
    growthTitle: 'Робити самостійність видимою',
    growthDescription: 'Іншим легше поважати ваш простір, коли його межі названі.',
    energyTitle: 'Час у своєму темпі',
    energyDescription: 'Коротка пауза без нових вимог може повертати ясність.',
    recommendationTitle: 'Окресліть межі паузи',
    recommendationDescription: 'Захистіть невеликий проміжок без нових запитів.',
    recommendationDetails:
      'Скажіть, коли починається пауза і коли ви плануєте повернутися до контакту.',
  },
  connection: {
    label: 'увага до зв’язку',
    strengthTitle: 'Увага до стосунків',
    strengthDescription: 'Ви помічаєте, як довіра й форма розмови впливають на результат.',
    growthTitle: 'Зберігати себе в діалозі',
    growthDescription: 'Турбота про контакт може так само ясно включати ваші потреби.',
    energyTitle: 'Контакт без тиску',
    energyDescription: 'Спокійна розмова з близькою людиною може повертати сили.',
    recommendationTitle: 'Почніть зі спільної опори',
    recommendationDescription: 'На початку складної розмови назвіть те, що хочете зберегти разом.',
    recommendationDetails:
      'Одним реченням сформулюйте спільну мету, а потім переходьте до розбіжності.',
  },
  directness: {
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
    label: 'ініціативність',
    strengthTitle: 'Рух уперед',
    strengthDescription: 'Ви можете перетворювати намір на конкретний перший крок.',
    growthTitle: 'Перевіряти напрям',
    growthDescription: 'Швидкий старт стає сильнішим після короткої перевірки реальністю.',
    energyTitle: 'Енергія від першого кроку',
    energyDescription: 'Невелика завершена дія може повертати відчуття руху.',
    recommendationTitle: 'Зробіть невеликий експеримент',
    recommendationDescription: 'Перетворіть найближчу ідею на крок, який можна перевірити.',
    recommendationDetails: 'Оберіть дію, що швидко завершується й дає нову інформацію.',
  },
  openness: {
    label: 'відкритість новому',
    strengthTitle: 'Відкритість можливостям',
    strengthDescription: 'Нові підходи й перспективи можуть підтримувати ваш інтерес.',
    growthTitle: 'Спрямовувати цікавість',
    growthDescription: 'Різноманіття корисніше, коли зрозуміло, що саме ви досліджуєте.',
    energyTitle: 'Невелика зміна перспективи',
    energyDescription: 'Нова обстановка чи ідея може м’яко перемикати увагу.',
    recommendationTitle: 'Змініть один елемент',
    recommendationDescription: 'Додайте один незвичний спосіб до знайомого завдання.',
    recommendationDetails: 'Експериментуйте з однією частиною процесу, а не змінюйте все.',
  },
  practicality: {
    label: 'практичність',
    strengthTitle: 'Практичний фокус',
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
    label: 'вдумливість',
    strengthTitle: 'Вдумлива увага',
    strengthDescription: 'Ви даєте собі час помітити контекст перед дією.',
    growthTitle: 'Помічати момент достатності',
    growthDescription: 'Роздуми допомагають, доки не відкладають перевірку в реальності.',
    energyTitle: 'Простір для осмислення',
    energyDescription: 'Пауза без нових рішень може повертати ясність.',
    recommendationTitle: 'Окресліть межу роздумів',
    recommendationDescription: 'Дайте найближчому рішенню зрозуміле вікно для обдумування.',
    recommendationDetails: 'Оберіть строк і два критерії, яких достатньо для наступного кроку.',
  },
  structure: {
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

function completeTemplate(
  copy: LocalizedTraitCopy,
  locale: Exclude<ProfileLocale, 'ru'>,
): TraitTemplate {
  const details =
    locale === 'en'
      ? 'This pattern appears across more than one everyday choice and remains a hypothesis to check in context.'
      : 'Цей патерн повторюється в кількох повсякденних виборах і залишається гіпотезою для перевірки в контексті.';

  return {
    ...copy,
    energyDetails: copy.energyDescription,
    growthDetails: copy.growthDescription,
    recommendationLabel: copy.recommendationTitle,
    strengthDetails: details,
  };
}

export function getTraitTemplate(id: TraitId, locale: ProfileLocale): TraitTemplate {
  if (locale === 'ru') return traitTemplates[id];
  return completeTemplate(locale === 'en' ? en[id] : uk[id], locale);
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
    music: 'музыку',
    cinema: 'кино',
    nature: 'природу',
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
    music: 'музику',
    cinema: 'кіно',
    nature: 'природу',
    selfDevelopment: 'саморозвиток',
  },
} as const;

export function getInterestLabel(id: string, locale: ProfileLocale) {
  if (id.startsWith('other:')) return id.slice(6);
  return interestLabels[locale][id as keyof (typeof interestLabels)[ProfileLocale]] ?? id;
}
