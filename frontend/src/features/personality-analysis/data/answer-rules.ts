import type { TraitId, TraitRule } from '../model';

const rule = (
  title: string,
  description: string,
  traits: readonly TraitId[],
  weight = 1,
): TraitRule => ({ description, title, traits, weight });

export const answerRules: Readonly<Record<string, TraitRule>> = {
  'recovery-after-busy-day:quiet-time': rule(
    'Тишина после насыщенного дня',
    'Для восстановления выбрано спокойное время наедине.',
    ['reflection', 'autonomy'],
  ),
  'recovery-after-busy-day:close-conversation': rule(
    'Разговор как способ восстановиться',
    'Для восстановления выбран контакт с близким человеком.',
    ['connection'],
  ),
  'recovery-after-busy-day:physical-activity': rule(
    'Движение помогает переключиться',
    'Для восстановления выбрана физическая активность или прогулка.',
    ['adaptability', 'practicality'],
  ),
  'recovery-after-busy-day:change-of-scene': rule(
    'Новые впечатления возвращают энергию',
    'Для восстановления выбрана смена обстановки.',
    ['openness', 'adaptability'],
  ),
  'recovery-after-busy-day:depends': rule(
    'Способ восстановления зависит от контекста',
    'Выбор отдыха меняется вместе с ситуацией.',
    ['adaptability', 'reflection'],
  ),
  'important-decision:facts-and-time': rule(
    'Факты и время перед решением',
    'В важном выборе нужна опора на информацию и пауза.',
    ['structure', 'reflection'],
  ),
  'important-decision:talk-it-through': rule(
    'Решение через диалог',
    'Важный выбор легче проверить в разговоре с доверенным человеком.',
    ['connection', 'reflection'],
  ),
  'important-decision:intuition': rule(
    'Внимание к внутреннему отклику',
    'При выборе учитывается первое внутреннее ощущение.',
    ['reflection', 'openness'],
  ),
  'important-decision:small-experiment': rule(
    'Решение через небольшой эксперимент',
    'Предпочтение отдано быстрой практической проверке.',
    ['initiative', 'practicality', 'adaptability'],
  ),
  'important-decision:depends': rule(
    'Способ решения зависит от задачи',
    'Подход к выбору меняется в зависимости от контекста.',
    ['adaptability', 'reflection'],
  ),
  'plans-change:adapt-fast': rule(
    'Быстрая перестройка',
    'При изменении планов выбран быстрый переход к новому сценарию.',
    ['adaptability', 'initiative'],
  ),
  'plans-change:pause-first': rule(
    'Пауза перед перестройкой',
    'При изменении планов сначала нужна возможность собраться.',
    ['reflection', 'autonomy'],
  ),
  'plans-change:clarify-plan': rule(
    'Новая последовательность действий',
    'После изменения обстоятельств важно уточнить новый план.',
    ['structure', 'practicality'],
  ),
  'plans-change:restore-plan': rule(
    'Сохранение важной части плана',
    'При изменениях есть стремление удержать рабочую основу прежнего плана.',
    ['structure', 'autonomy'],
  ),
  'plans-change:depends': rule(
    'Гибкая реакция на изменения',
    'Реакция на перемены соотносится с их значимостью.',
    ['adaptability', 'reflection'],
  ),
  'disagreement:talk-now': rule(
    'Разговор без долгого откладывания',
    'Недопонимание предпочтительно обсуждать сразу.',
    ['directness', 'connection', 'initiative'],
  ),
  'disagreement:pause-and-return': rule(
    'Пауза с возвращением к разговору',
    'В напряжённом диалоге выбрана пауза без отказа от продолжения.',
    ['reflection', 'connection'],
  ),
  'disagreement:write-first': rule(
    'Мысль сначала формулируется письменно',
    'Перед разговором помогает структурировать позицию в тексте.',
    ['structure', 'reflection'],
  ),
  'disagreement:wait-for-signal': rule(
    'Внимание к готовности другого',
    'Темп сложного разговора соотносится с готовностью собеседника.',
    ['connection', 'reflection'],
  ),
  'disagreement:depends': rule(
    'Формат разговора выбирается по ситуации',
    'Способ разбирать недопонимание зависит от контекста.',
    ['adaptability', 'connection'],
  ),
  'group-roles:organize': rule(
    'Организация общего процесса',
    'В группе естественно брать ответственность за договорённости.',
    ['structure', 'initiative'],
  ),
  'group-roles:generate-ideas': rule(
    'Создание новых идей',
    'В общей работе естественно предлагать новые направления.',
    ['openness', 'initiative'],
  ),
  'group-roles:support-people': rule(
    'Поддержка людей и атмосферы',
    'В группе внимание направлено на контакт и состояние участников.',
    ['connection'],
  ),
  'group-roles:check-details': rule(
    'Внимание к деталям и рискам',
    'В общей работе естественно замечать нюансы и возможные сложности.',
    ['structure', 'reflection', 'practicality'],
  ),
  'group-roles:observe-first': rule(
    'Наблюдение перед включением',
    'В новой совместной работе сначала важно понять обстановку.',
    ['reflection', 'adaptability'],
  ),
  'work-rhythm:deep-focus': rule(
    'Глубокое внимание',
    'Для работы выбран длительный фокус на одной задаче.',
    ['reflection', 'structure'],
  ),
  'work-rhythm:switch-tasks': rule(
    'Чередование задач',
    'Внимание поддерживается через смену разных типов активности.',
    ['adaptability', 'openness'],
  ),
  'work-rhythm:sprints': rule(
    'Короткие интенсивные отрезки',
    'Рабочий темп строится вокруг сфокусированных рывков.',
    ['initiative', 'practicality'],
  ),
  'work-rhythm:steady-pace': rule(
    'Равномерный рабочий ритм',
    'Внимание поддерживают небольшие последовательные шаги.',
    ['structure', 'practicality'],
  ),
  'work-rhythm:depends': rule(
    'Ритм под задачу',
    'Способ работы меняется в зависимости от характера задачи.',
    ['adaptability', 'reflection'],
  ),
  'support-style:listen': rule(
    'Поддержка через внимательное слушание',
    'Полезной ощущается возможность быть услышанным без быстрых решений.',
    ['connection', 'reflection'],
  ),
  'support-style:practical-help': rule(
    'Конкретная помощь',
    'В поддержке ценится понятное практическое действие.',
    ['practicality', 'connection'],
  ),
  'support-style:give-space': rule(
    'Личное пространство как поддержка',
    'В сложный момент важна возможность побыть в своём темпе.',
    ['autonomy', 'reflection'],
  ),
  'support-style:change-focus': rule(
    'Переключение внимания',
    'Поддержкой может стать временная смена фокуса.',
    ['adaptability', 'openness'],
  ),
  'support-style:plan-together': rule(
    'Совместный план действий',
    'В поддержке ценится ясная последовательность следующих шагов.',
    ['structure', 'connection', 'practicality'],
  ),
  'new-environment:start-conversations': rule(
    'Инициатива в новом окружении',
    'В новой компании выбран самостоятельный старт общения.',
    ['initiative', 'connection'],
  ),
  'new-environment:observe': rule(
    'Сначала понять обстановку',
    'В новом окружении сначала важно присмотреться.',
    ['reflection', 'adaptability'],
  ),
  'new-environment:one-contact': rule(
    'Опора на один комфортный контакт',
    'Освоиться помогает спокойная связь с одним человеком.',
    ['connection', 'reflection'],
  ),
  'new-environment:focus-on-purpose': rule(
    'Опора на цель присутствия',
    'В новом окружении внимание удерживается на задаче.',
    ['autonomy', 'structure'],
  ),
  'new-environment:depends': rule(
    'Разный способ входить в новые группы',
    'Поведение в новой компании зависит от её контекста.',
    ['adaptability', 'reflection'],
  ),
  'long-project-motivation:visible-progress': rule(
    'Мотивация через видимый прогресс',
    'В долгом деле помогают завершённые этапы.',
    ['structure', 'practicality'],
  ),
  'long-project-motivation:meaning': rule(
    'Мотивация через смысл',
    'В долгом деле важно понимать пользу результата.',
    ['reflection', 'autonomy'],
  ),
  'long-project-motivation:commitment': rule(
    'Обязательства перед людьми',
    'В долгом деле поддерживает ответственность перед другими.',
    ['connection', 'structure'],
  ),
  'long-project-motivation:variety': rule(
    'Разнообразие сохраняет интерес',
    'В долгом деле помогает возможность менять подход.',
    ['openness', 'adaptability'],
  ),
  'long-project-motivation:deadline': rule(
    'Срок и план как опора',
    'В долгом деле помогают ясные рамки и последовательность.',
    ['structure', 'practicality'],
  ),
  'personal-boundaries:say-directly': rule(
    'Прямое обозначение границ',
    'Личные границы предпочтительно называть ясно.',
    ['directness', 'autonomy'],
  ),
  'personal-boundaries:signal-softly': rule(
    'Мягкое обозначение границ',
    'Сначала выбран бережный способ показать свою границу.',
    ['connection', 'reflection'],
  ),
  'personal-boundaries:step-away': rule(
    'Дистанция для защиты границ',
    'При нарушении границы помогает сократить контакт.',
    ['autonomy', 'directness'],
  ),
  'personal-boundaries:return-later': rule(
    'Разговор о границах в подходящий момент',
    'Границу удобнее обсуждать после подготовки.',
    ['reflection', 'autonomy'],
  ),
  'personal-boundaries:depends': rule(
    'Границы с учётом контекста',
    'Способ обозначить границу зависит от человека и ситуации.',
    ['adaptability', 'reflection'],
  ),
  'feedback-style:examples': rule(
    'Обратная связь через факты',
    'Для понимания обратной связи важны конкретные примеры.',
    ['structure', 'practicality'],
  ),
  'feedback-style:strengths-first': rule(
    'Сначала опора, затем улучшения',
    'Обратная связь легче воспринимается в бережной последовательности.',
    ['connection', 'reflection'],
  ),
  'feedback-style:direct': rule(
    'Короткая и прямая обратная связь',
    'В обратной связи ценится ясность без долгого вступления.',
    ['directness', 'practicality'],
  ),
  'feedback-style:reflection-time': rule(
    'Время обдумать обратную связь',
    'После разговора нужна возможность спокойно осмыслить услышанное.',
    ['reflection', 'autonomy'],
  ),
  'feedback-style:depends': rule(
    'Формат обратной связи зависит от темы',
    'Предпочтительный способ разговора меняется вместе с контекстом.',
    ['adaptability', 'reflection'],
  ),
  'free-evening:planned': rule(
    'Заранее выбранный свободный вечер',
    'Свободное время приятнее, когда у него есть понятный план.',
    ['structure', 'autonomy'],
  ),
  'free-evening:follow-mood': rule(
    'Свободный вечер по настроению',
    'В свободное время ценится возможность выбрать занятие в моменте.',
    ['openness', 'adaptability'],
  ),
  'free-evening:social-time': rule(
    'Свободное время с людьми',
    'Вечер естественно направить на общение.',
    ['connection', 'openness'],
  ),
  'free-evening:personal-project': rule(
    'Время для личного интереса',
    'Свободный вечер хочется посвятить собственному проекту.',
    ['autonomy', 'initiative'],
  ),
  'free-evening:no-plans': rule(
    'Пространство без обязательств',
    'В свободное время ценится отсутствие заранее заданных планов.',
    ['reflection', 'autonomy'],
  ),
  'unclear-request:clarify-outcome': rule(
    'Сначала прояснить результат',
    'В неясной задаче сначала уточняется критерий хорошего результата.',
    ['structure', 'directness'],
  ),
  'unclear-request:draft-first': rule(
    'Черновик как способ прояснить задачу',
    'Неопределённость проверяется быстрым первым вариантом.',
    ['initiative', 'adaptability'],
  ),
  'unclear-request:ask-example': rule(
    'Опора на конкретный пример',
    'Прояснить задачу помогает пример или похожий результат.',
    ['practicality', 'connection'],
  ),
  'unclear-request:explore-alone': rule(
    'Самостоятельное исследование вариантов',
    'Перед уточнением есть готовность самостоятельно изучить пространство решений.',
    ['autonomy', 'openness'],
  ),
  'time-pressure:narrow-priorities': rule(
    'Сокращение до главного',
    'Под давлением времени сначала выделяется обязательный результат.',
    ['structure', 'practicality'],
  ),
  'time-pressure:act-first': rule(
    'Действие с уточнением по пути',
    'Под давлением времени выбран быстрый переход к действию.',
    ['initiative', 'adaptability'],
  ),
  'time-pressure:ask-support': rule(
    'Быстрая сверка с другим человеком',
    'Под давлением времени полезно подключить внешнюю точку проверки.',
    ['connection', 'practicality'],
  ),
  'time-pressure:pause-reflect': rule(
    'Короткая пауза для порядка',
    'Даже при срочности сначала выбирается последовательность действий.',
    ['reflection', 'structure'],
  ),
  'unfinished-project:final-stretch': rule(
    'Финальный сфокусированный отрезок',
    'Завершение поддерживает короткий период направленного усилия.',
    ['initiative', 'practicality'],
  ),
  'unfinished-project:polish-details': rule(
    'Завершение через список деталей',
    'Последний этап легче проходить по понятной последовательности.',
    ['structure', 'reflection'],
  ),
  'unfinished-project:share-draft': rule(
    'Обратная связь помогает завершить',
    'Черновой результат полезно проверить через контакт с другим человеком.',
    ['connection', 'adaptability'],
  ),
  'unfinished-project:switch-return': rule(
    'Возвращение со свежим взглядом',
    'Короткое переключение помогает снова увидеть незавершённые части.',
    ['adaptability', 'reflection'],
  ),
  'new-topic:map-basics': rule(
    'Карта новой темы',
    'Знакомство с новым начинается с базовой структуры.',
    ['structure', 'reflection'],
  ),
  'new-topic:experiment': rule(
    'Новое через практическую пробу',
    'Понимание темы строится через первый эксперимент.',
    ['initiative', 'practicality'],
  ),
  'new-topic:discuss': rule(
    'Новое через разговор',
    'Разобраться в теме помогает обмен идеями с другим человеком.',
    ['connection', 'openness'],
  ),
  'new-topic:explore-broadly': rule(
    'Широкое исследование',
    'Новая тема сначала исследуется без жёсткого маршрута.',
    ['openness', 'adaptability'],
  ),
};
