import type { Locale } from '@shared/i18n';

import type { QuestionnaireQuestion } from '../types';

type QuestionCopy = {
  description?: string;
  options: readonly string[];
  title: string;
};

type QuestionSpec = {
  allowSkip?: boolean;
  category: string;
  copy: Record<Locale, QuestionCopy>;
  id: string;
  maxSelections?: number;
  optionIds: readonly string[];
  presentation: QuestionnaireQuestion['presentation'];
  required?: boolean;
  type: QuestionnaireQuestion['type'];
};

const specs: readonly QuestionSpec[] = [
  {
    id: 'free-evening',
    category: 'energy',
    presentation: 'branch',
    type: 'single',
    optionIds: ['planned', 'follow-mood', 'social-time', 'personal-project', 'no-plans'],
    copy: {
      ru: {
        title: 'У вас неожиданно освободился вечер. Что чаще происходит дальше?',
        options: [
          'Выбираю занятие, которое давно откладывалось',
          'Решаю по настроению уже в моменте',
          'Ищу возможность увидеться с кем-то',
          'Возвращаюсь к личному проекту',
          'Оставляю время совсем без планов',
        ],
      },
      en: {
        title: 'An evening unexpectedly opens up. What usually happens next?',
        options: [
          'I pick something I have been postponing',
          'I decide based on how I feel in the moment',
          'I look for someone to spend time with',
          'I return to a personal project',
          'I keep the time completely unplanned',
        ],
      },
      uk: {
        title: 'У вас несподівано звільнився вечір. Що найчастіше відбувається далі?',
        options: [
          'Обираю справу, яку давно було відкладено',
          'Вирішую за настроєм уже в моменті',
          'Шукаю можливість із кимось побачитися',
          'Повертаюся до особистого проєкту',
          'Залишаю час зовсім без планів',
        ],
      },
    },
  },
  {
    id: 'important-decision',
    category: 'decisions',
    presentation: 'cards',
    type: 'single',
    optionIds: ['facts-and-time', 'talk-it-through', 'intuition', 'small-experiment', 'depends'],
    copy: {
      ru: {
        title: 'Нужно выбрать между надёжным вариантом и новым, но неясным. Что помогает решить?',
        options: [
          'Собрать факты и дать себе время',
          'Обсудить с человеком, которому доверяю',
          'Прислушаться к первому внутреннему отклику',
          'Проверить новое небольшим экспериментом',
          'Зависит от цены ошибки',
        ],
      },
      en: {
        title: 'You must choose between a reliable option and a new but uncertain one. What helps?',
        options: [
          'Gather facts and give myself time',
          'Talk it through with someone I trust',
          'Listen to my first internal response',
          'Test the new option with a small experiment',
          'It depends on the cost of being wrong',
        ],
      },
      uk: {
        title: 'Треба обрати між надійним варіантом і новим, але неясним. Що допомагає?',
        options: [
          'Зібрати факти й дати собі час',
          'Обговорити з людиною, якій довіряю',
          'Прислухатися до першого внутрішнього відгуку',
          'Перевірити нове невеликим експериментом',
          'Залежить від ціни помилки',
        ],
      },
    },
  },
  {
    id: 'plans-change',
    category: 'uncertainty',
    presentation: 'binary',
    type: 'single',
    optionIds: ['adapt-fast', 'pause-first', 'clarify-plan', 'restore-plan', 'depends'],
    copy: {
      ru: {
        title: 'План на день меняется в последний момент. Какая реакция вам ближе?',
        options: [
          'Сразу перестраиваюсь и иду дальше',
          'Сначала беру короткую паузу',
          'Уточняю новый порядок действий',
          'Сохраняю хотя бы важную часть прежнего плана',
          'Зависит от того, насколько это важно',
        ],
      },
      en: {
        title: 'Your day changes at the last minute. Which response feels most familiar?',
        options: [
          'I adjust quickly and move on',
          'I take a short pause first',
          'I clarify the new order of actions',
          'I preserve the most important part of the old plan',
          'It depends on how much is at stake',
        ],
      },
      uk: {
        title: 'План на день змінюється в останню мить. Яка реакція вам ближча?',
        options: [
          'Одразу перебудовуюся й рухаюся далі',
          'Спочатку беру коротку паузу',
          'Уточнюю новий порядок дій',
          'Зберігаю важливу частину попереднього плану',
          'Залежить від того, наскільки це важливо',
        ],
      },
    },
  },
  {
    id: 'unclear-request',
    category: 'uncertainty',
    presentation: 'branch',
    type: 'single',
    optionIds: ['clarify-outcome', 'draft-first', 'ask-example', 'explore-alone'],
    copy: {
      ru: {
        title: 'Вам дают задачу с туманным результатом. С чего вы начинаете?',
        options: [
          'Уточняю, как выглядит хороший результат',
          'Делаю быстрый черновик и показываю',
          'Прошу пример или похожую задачу',
          'Сначала самостоятельно исследую варианты',
        ],
      },
      en: {
        title: 'You receive a task with an unclear outcome. Where do you begin?',
        options: [
          'Clarify what a good result looks like',
          'Make a quick draft and show it',
          'Ask for an example or similar task',
          'Explore the options independently first',
        ],
      },
      uk: {
        title: 'Ви отримуєте завдання з неясним результатом. Із чого починаєте?',
        options: [
          'Уточнюю, який вигляд має хороший результат',
          'Роблю швидку чернетку й показую',
          'Прошу приклад або схоже завдання',
          'Спочатку самостійно досліджую варіанти',
        ],
      },
    },
  },
  {
    id: 'disagreement',
    category: 'communication',
    presentation: 'cards',
    type: 'single',
    optionIds: ['talk-now', 'pause-and-return', 'write-first', 'wait-for-signal', 'depends'],
    copy: {
      ru: {
        title: 'После разговора остаётся ощущение, что вас поняли не так. Что вы чаще делаете?',
        options: [
          'Возвращаюсь к теме сразу',
          'Беру паузу и договариваюсь продолжить',
          'Сначала формулирую мысль письменно',
          'Жду признака, что другой готов слушать',
          'Выбираю способ по ситуации',
        ],
      },
      en: {
        title: 'After a conversation, you feel misunderstood. What do you usually do?',
        options: [
          'Return to the subject straight away',
          'Pause and agree to continue later',
          'Formulate my point in writing first',
          'Wait until the other person seems ready',
          'Choose based on the situation',
        ],
      },
      uk: {
        title: 'Після розмови здається, що вас зрозуміли не так. Що ви робите?',
        options: [
          'Одразу повертаюся до теми',
          'Беру паузу й домовляюся продовжити',
          'Спочатку формулюю думку письмово',
          'Чекаю, коли інша людина буде готова слухати',
          'Обираю спосіб за ситуацією',
        ],
      },
    },
  },
  {
    id: 'time-pressure',
    category: 'pressure',
    presentation: 'binary',
    type: 'single',
    optionIds: ['narrow-priorities', 'act-first', 'ask-support', 'pause-reflect'],
    copy: {
      ru: {
        title: 'До дедлайна меньше часа, а задача ещё не собрана. Что помогает больше всего?',
        options: [
          'Сократить результат до самого важного',
          'Сразу действовать и уточнять по пути',
          'Подключить человека для быстрой сверки',
          'Взять две минуты, чтобы выбрать порядок',
        ],
      },
      en: {
        title: 'Less than an hour remains and the work is not together yet. What helps most?',
        options: [
          'Reduce the result to what matters most',
          'Start acting and refine along the way',
          'Bring someone in for a quick check',
          'Take two minutes to choose an order',
        ],
      },
      uk: {
        title: 'До дедлайну менш ніж година, а робота ще не зібрана. Що допомагає найбільше?',
        options: [
          'Скоротити результат до найважливішого',
          'Одразу діяти й уточнювати в процесі',
          'Залучити когось для швидкої перевірки',
          'Взяти дві хвилини, щоб обрати порядок',
        ],
      },
    },
  },
  {
    id: 'group-roles',
    category: 'communication',
    presentation: 'multiple',
    type: 'multiple',
    maxSelections: 3,
    allowSkip: true,
    required: false,
    optionIds: ['organize', 'generate-ideas', 'support-people', 'check-details', 'observe-first'],
    copy: {
      ru: {
        title: 'В небольшой группе какие роли вы берёте без особых усилий?',
        description: 'Можно выбрать до трёх.',
        options: [
          'Собираю процесс и договорённости',
          'Предлагаю новые направления',
          'Поддерживаю людей и атмосферу',
          'Замечаю детали и риски',
          'Сначала наблюдаю, затем включаюсь',
        ],
      },
      en: {
        title: 'In a small group, which roles do you take on naturally?',
        description: 'Choose up to three.',
        options: [
          'Organize the process and agreements',
          'Suggest new directions',
          'Support people and the atmosphere',
          'Notice details and risks',
          'Observe first, then join in',
        ],
      },
      uk: {
        title: 'У невеликій групі які ролі ви берете без особливих зусиль?',
        description: 'Можна обрати до трьох.',
        options: [
          'Організовую процес і домовленості',
          'Пропоную нові напрями',
          'Підтримую людей і атмосферу',
          'Помічаю деталі й ризики',
          'Спочатку спостерігаю, потім долучаюся',
        ],
      },
    },
  },
  {
    id: 'work-rhythm',
    category: 'motivation',
    presentation: 'cards',
    type: 'single',
    optionIds: ['deep-focus', 'switch-tasks', 'sprints', 'steady-pace', 'depends'],
    copy: {
      ru: {
        title: 'День полностью в вашем распоряжении. Какой ритм помогает сохранить внимание?',
        options: [
          'Долго держать одну задачу',
          'Чередовать разные типы задач',
          'Работать короткими интенсивными отрезками',
          'Двигаться небольшими равномерными шагами',
          'Подбирать ритм под задачу',
        ],
      },
      en: {
        title: 'You control the whole day. Which rhythm helps you stay engaged?',
        options: [
          'Stay with one task for a long stretch',
          'Alternate between different kinds of tasks',
          'Work in short, intense bursts',
          'Move in small, steady steps',
          'Choose the rhythm for the task',
        ],
      },
      uk: {
        title: 'Увесь день у вашому розпорядженні. Який ритм допомагає тримати увагу?',
        options: [
          'Довго працювати над одним завданням',
          'Чергувати різні типи завдань',
          'Працювати короткими інтенсивними відрізками',
          'Рухатися невеликими рівними кроками',
          'Добирати ритм під завдання',
        ],
      },
    },
  },
  {
    id: 'unfinished-project',
    category: 'motivation',
    presentation: 'branch',
    type: 'single',
    optionIds: ['final-stretch', 'polish-details', 'share-draft', 'switch-return'],
    copy: {
      ru: {
        title: 'Проект почти готов, но последние 10% тянутся дольше всего. Что обычно помогает?',
        options: [
          'Назначить короткий финальный рывок',
          'Пройтись по деталям по списку',
          'Показать черновик и получить отклик',
          'Переключиться и вернуться со свежим взглядом',
        ],
      },
      en: {
        title: 'A project is almost ready, but the final 10% keeps stretching. What usually helps?',
        options: [
          'Schedule a short final push',
          'Work through the details as a checklist',
          'Share the draft and get a response',
          'Switch away and return with fresh eyes',
        ],
      },
      uk: {
        title: 'Проєкт майже готовий, але останні 10% тягнуться найдовше. Що допомагає?',
        options: [
          'Запланувати короткий фінальний ривок',
          'Пройти деталі за списком',
          'Показати чернетку й отримати відгук',
          'Перемкнутися й повернутися зі свіжим поглядом',
        ],
      },
    },
  },
  {
    id: 'support-style',
    category: 'relationships',
    presentation: 'multiple',
    type: 'multiple',
    maxSelections: 3,
    optionIds: ['listen', 'practical-help', 'give-space', 'change-focus', 'plan-together'],
    copy: {
      ru: {
        title: 'У вас сложный день. Какая поддержка действительно помогает?',
        description: 'Выберите до трёх подходящих вариантов.',
        options: [
          'Спокойно выслушать без быстрых решений',
          'Предложить конкретную помощь',
          'Дать время и личное пространство',
          'Помочь ненадолго переключиться',
          'Вместе собрать понятный план',
        ],
      },
      en: {
        title: 'You have had a difficult day. What support genuinely helps?',
        description: 'Choose up to three.',
        options: [
          'Listen without rushing to solve it',
          'Offer practical help',
          'Give me time and personal space',
          'Help me shift attention for a while',
          'Build a clear plan together',
        ],
      },
      uk: {
        title: 'У вас складний день. Яка підтримка справді допомагає?',
        description: 'Оберіть до трьох.',
        options: [
          'Спокійно вислухати без швидких рішень',
          'Запропонувати конкретну допомогу',
          'Дати час і особистий простір',
          'Допомогти ненадовго перемкнутися',
          'Разом скласти зрозумілий план',
        ],
      },
    },
  },
  {
    id: 'new-environment',
    category: 'communication',
    presentation: 'branch',
    type: 'single',
    optionIds: ['start-conversations', 'observe', 'one-contact', 'focus-on-purpose', 'depends'],
    copy: {
      ru: {
        title: 'Вы приходите туда, где почти никого не знаете. Как обычно осваиваетесь?',
        options: [
          'Самостоятельно начинаю знакомиться',
          'Сначала читаю обстановку',
          'Нахожу одного комфортного человека',
          'Сосредотачиваюсь на цели визита',
          'Каждый раз по-разному',
        ],
      },
      en: {
        title: 'You arrive somewhere knowing almost no one. How do you settle in?',
        options: [
          'Start conversations myself',
          'Read the room first',
          'Find one person I feel comfortable with',
          'Focus on why I came',
          'It changes every time',
        ],
      },
      uk: {
        title: 'Ви приходите туди, де майже нікого не знаєте. Як освоюєтеся?',
        options: [
          'Самостійно починаю знайомитися',
          'Спочатку зчитую обстановку',
          'Знаходжу одну комфортну людину',
          'Зосереджуюся на меті візиту',
          'Щоразу по-різному',
        ],
      },
    },
  },
  {
    id: 'long-project-motivation',
    category: 'motivation',
    presentation: 'ranked',
    type: 'multiple',
    maxSelections: 3,
    optionIds: ['visible-progress', 'meaning', 'commitment', 'variety', 'deadline'],
    copy: {
      ru: {
        title: 'Что сильнее всего удерживает вас в долгом деле?',
        description: 'Выберите до трёх — порядок выбора сохранится.',
        options: [
          'Видимый прогресс',
          'Смысл и польза результата',
          'Обязательства перед людьми',
          'Возможность менять подход',
          'Чёткий срок и план',
        ],
      },
      en: {
        title: 'What keeps you engaged in a long project?',
        description: 'Choose up to three; your selection order is kept.',
        options: [
          'Visible progress',
          'Meaning and usefulness',
          'Commitment to other people',
          'Room to change the approach',
          'A clear deadline and plan',
        ],
      },
      uk: {
        title: 'Що найбільше утримує вас у тривалій справі?',
        description: 'Оберіть до трьох; порядок вибору збережеться.',
        options: [
          'Видимий прогрес',
          'Сенс і користь результату',
          'Зобов’язання перед людьми',
          'Можливість змінювати підхід',
          'Чіткий строк і план',
        ],
      },
    },
  },
  {
    id: 'personal-boundaries',
    category: 'relationships',
    presentation: 'cards',
    type: 'single',
    optionIds: ['say-directly', 'signal-softly', 'step-away', 'return-later', 'depends'],
    copy: {
      ru: {
        title: 'Близкий человек просит о том, на что у вас сейчас нет ресурса. Как отвечаете?',
        options: [
          'Прямо говорю, что сейчас не могу',
          'Сначала обозначаю это мягко',
          'Сокращаю контакт, чтобы восстановиться',
          'Возвращаюсь к разговору позже',
          'Зависит от человека и ситуации',
        ],
      },
      en: {
        title: 'Someone close asks for something you do not have capacity for. How do you respond?',
        options: [
          'Say directly that I cannot do it now',
          'Signal it gently first',
          'Reduce contact to recover',
          'Return to the conversation later',
          'It depends on the person and situation',
        ],
      },
      uk: {
        title: 'Близька людина просить про те, на що у вас зараз немає ресурсу. Як відповідаєте?',
        options: [
          'Прямо кажу, що зараз не можу',
          'Спочатку позначаю це м’яко',
          'Скорочую контакт, щоб відновитися',
          'Повертаюся до розмови пізніше',
          'Залежить від людини й ситуації',
        ],
      },
    },
  },
  {
    id: 'feedback-style',
    category: 'communication',
    presentation: 'binary',
    type: 'single',
    optionIds: ['examples', 'strengths-first', 'direct', 'reflection-time', 'depends'],
    copy: {
      ru: {
        title: 'Вам дают важную обратную связь. В каком формате её легче услышать?',
        options: [
          'Через конкретные примеры',
          'Сначала опора, затем улучшения',
          'Коротко и прямо',
          'С возможностью обдумать после',
          'Зависит от темы',
        ],
      },
      en: {
        title: 'You receive important feedback. Which format makes it easier to hear?',
        options: [
          'Concrete examples',
          'Strengths first, then improvements',
          'Short and direct',
          'Time to reflect afterwards',
          'It depends on the subject',
        ],
      },
      uk: {
        title: 'Ви отримуєте важливий зворотний зв’язок. Який формат легше почути?',
        options: [
          'Конкретні приклади',
          'Спочатку опора, потім покращення',
          'Коротко й прямо',
          'Час обдумати після',
          'Залежить від теми',
        ],
      },
    },
  },
  {
    id: 'new-topic',
    category: 'openness',
    presentation: 'branch',
    type: 'single',
    optionIds: ['map-basics', 'experiment', 'discuss', 'explore-broadly'],
    copy: {
      ru: {
        title: 'Вас заинтересовала новая тема. Как вы обычно входите в неё?',
        options: [
          'Сначала собираю базовую карту',
          'Сразу пробую что-то руками',
          'Ищу человека для разговора',
          'Исследую широко без строгого маршрута',
        ],
      },
      en: {
        title: 'A new subject catches your interest. How do you usually enter it?',
        options: [
          'Build a basic map first',
          'Try something hands-on straight away',
          'Find someone to discuss it with',
          'Explore broadly without a strict route',
        ],
      },
      uk: {
        title: 'Вас зацікавила нова тема. Як ви зазвичай входите в неї?',
        options: [
          'Спочатку складаю базову карту',
          'Одразу пробую щось на практиці',
          'Шукаю людину для розмови',
          'Досліджую широко без суворого маршруту',
        ],
      },
    },
  },
  {
    id: 'recovery-after-busy-day',
    category: 'energy',
    presentation: 'cards',
    type: 'single',
    optionIds: [
      'quiet-time',
      'close-conversation',
      'physical-activity',
      'change-of-scene',
      'depends',
    ],
    copy: {
      ru: {
        title: 'После дня, полного людей и задач, где вы быстрее возвращаетесь к себе?',
        options: [
          'В тишине и наедине',
          'В спокойном разговоре с близким',
          'В движении или на прогулке',
          'В новой обстановке',
          'Каждый раз по-разному',
        ],
      },
      en: {
        title: 'After a day full of people and tasks, what brings you back to yourself?',
        options: [
          'Quiet time alone',
          'A calm conversation with someone close',
          'Movement or a walk',
          'A change of surroundings',
          'It varies each time',
        ],
      },
      uk: {
        title: 'Після дня, повного людей і завдань, де ви швидше повертаєтеся до себе?',
        options: [
          'У тиші й наодинці',
          'У спокійній розмові з близькою людиною',
          'У русі або на прогулянці',
          'У новій обстановці',
          'Щоразу по-різному',
        ],
      },
    },
  },
];

export function getPortraitQuestions(locale: Locale): readonly QuestionnaireQuestion[] {
  return specs.map((spec) => {
    const copy = spec.copy[locale];
    return {
      allowSkip: spec.allowSkip ?? false,
      category: spec.category,
      description: copy.description,
      id: spec.id,
      maxSelections: spec.maxSelections,
      options: spec.optionIds.map((id, index) => ({ id, label: copy.options[index] ?? id })),
      presentation: spec.presentation,
      required: spec.required ?? true,
      title: copy.title,
      type: spec.type,
    };
  });
}

export const portraitQuestions = getPortraitQuestions('ru');
