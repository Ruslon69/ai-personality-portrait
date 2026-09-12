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
    'Вы восстанавливаетесь в тишине и наедине с собой.',
    ['reflection', 'autonomy'],
  ),
  'recovery-after-busy-day:close-conversation': rule(
    'Разговор как способ восстановиться',
    'Разговор с близким человеком помогает вам восстановиться.',
    ['connection'],
  ),
  'recovery-after-busy-day:physical-activity': rule(
    'Движение помогает переключиться',
    'Движение или прогулка помогают вам восстановиться.',
    ['adaptability', 'practicality'],
  ),
  'recovery-after-busy-day:change-of-scene': rule(
    'Новые впечатления возвращают энергию',
    'Смена обстановки помогает вам восстановиться.',
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
    'При выборе вы обращаете внимание на первое ощущение.',
    ['reflection', 'openness'],
  ),
  'important-decision:small-experiment': rule(
    'Решение через небольшой эксперимент',
    'Вам проще проверить решение небольшим действием.',
    ['initiative', 'practicality', 'adaptability'],
  ),
  'important-decision:depends': rule(
    'Способ решения зависит от задачи',
    'Подход к выбору меняется в зависимости от контекста.',
    ['adaptability', 'reflection'],
  ),
  'plans-change:adapt-fast': rule(
    'Быстрая перестройка',
    'Когда планы меняются, вы быстро переходите к новому варианту.',
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
    'Ваша реакция на перемены зависит от их масштаба и важности.',
    ['adaptability', 'reflection'],
  ),
  'disagreement:talk-now': rule(
    'Разговор без долгого откладывания',
    'Вы предпочитаете обсуждать недопонимание сразу.',
    ['directness', 'connection', 'initiative'],
  ),
  'disagreement:pause-and-return': rule(
    'Пауза с возвращением к разговору',
    'В напряжённом разговоре вам помогает пауза с последующим возвращением к теме.',
    ['reflection', 'connection'],
  ),
  'disagreement:write-first': rule(
    'Мысль сначала формулируется письменно',
    'Перед разговором помогает структурировать позицию в тексте.',
    ['structure', 'reflection'],
  ),
  'disagreement:wait-for-signal': rule(
    'Внимание к готовности другого',
    'В сложном разговоре вы учитываете готовность собеседника продолжать.',
    ['connection', 'reflection'],
  ),
  'disagreement:depends': rule(
    'Формат разговора выбирается по ситуации',
    'Способ разбирать недопонимание зависит от контекста.',
    ['adaptability', 'connection'],
  ),
  'group-roles:organize': rule(
    'Организация общего процесса',
    'В группе вы готовы отвечать за план и договорённости.',
    ['structure', 'initiative'],
  ),
  'group-roles:generate-ideas': rule(
    'Создание новых идей',
    'В общей работе вы готовы предлагать новые идеи.',
    ['openness', 'initiative'],
  ),
  'group-roles:support-people': rule(
    'Поддержка людей и атмосферы',
    'В группе вы замечаете настроение людей и качество общения.',
    ['connection'],
  ),
  'group-roles:check-details': rule(
    'Внимание к деталям и рискам',
    'В общей работе вы замечаете детали и возможные сложности.',
    ['structure', 'reflection', 'practicality'],
  ),
  'group-roles:observe-first': rule(
    'Наблюдение перед включением',
    'В новой совместной работе сначала важно понять обстановку.',
    ['reflection', 'adaptability'],
  ),
  'work-rhythm:deep-focus': rule(
    'Глубокое внимание',
    'Вам удобно долго работать над одной задачей без переключений.',
    ['reflection', 'structure'],
  ),
  'work-rhythm:switch-tasks': rule(
    'Чередование задач',
    'Смена разных задач помогает вам сохранять внимание.',
    ['adaptability', 'openness'],
  ),
  'work-rhythm:sprints': rule(
    'Короткие интенсивные отрезки',
    'Вам удобно работать короткими и интенсивными отрезками.',
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
    'В сложный момент вам важно, чтобы вас выслушали без быстрых советов.',
    ['connection', 'reflection'],
  ),
  'support-style:practical-help': rule(
    'Конкретная помощь',
    'В поддержке вы цените конкретную помощь.',
    ['practicality', 'connection'],
  ),
  'support-style:give-space': rule(
    'Личное пространство как поддержка',
    'В сложный момент важна возможность побыть в своём темпе.',
    ['autonomy', 'reflection'],
  ),
  'support-style:change-focus': rule(
    'Переключение внимания',
    'Временное переключение помогает вам справиться с напряжением.',
    ['adaptability', 'openness'],
  ),
  'support-style:plan-together': rule(
    'Совместный план действий',
    'В поддержке вы цените понятный план следующих шагов.',
    ['structure', 'connection', 'practicality'],
  ),
  'new-environment:start-conversations': rule(
    'Инициатива в новом окружении',
    'В новой компании вы готовы первым начать разговор.',
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
    'В новом окружении вам помогает сосредоточиться на цели встречи.',
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
    'Ответственность перед другими помогает вам не бросать долгое дело.',
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
    'Вы предпочитаете прямо говорить о своих границах.',
    ['directness', 'autonomy'],
  ),
  'personal-boundaries:signal-softly': rule(
    'Мягкое обозначение границ',
    'Сначала вы стараетесь мягко обозначить свою границу.',
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
    'Вам легче принять обратную связь, если сначала отмечены сильные стороны.',
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
    'Удобный способ обсуждения зависит от темы и ситуации.',
    ['adaptability', 'reflection'],
  ),
  'free-evening:planned': rule(
    'Заранее выбранный свободный вечер',
    'Свободное время приятнее, когда у него есть понятный план.',
    ['structure', 'autonomy'],
  ),
  'free-evening:follow-mood': rule(
    'Свободный вечер по настроению',
    'В свободное время вам важно выбирать занятие по настроению.',
    ['openness', 'adaptability'],
  ),
  'free-evening:social-time': rule(
    'Свободное время с людьми',
    'Свободный вечер вам хочется провести с другими людьми.',
    ['connection', 'openness'],
  ),
  'free-evening:personal-project': rule(
    'Время для личного интереса',
    'Свободный вечер хочется посвятить собственному проекту.',
    ['autonomy', 'initiative'],
  ),
  'free-evening:no-plans': rule(
    'Время без обязательств',
    'В свободное время вам важно не иметь заранее заданного плана.',
    ['reflection', 'autonomy'],
  ),
  'unclear-request:clarify-outcome': rule(
    'Сначала прояснить результат',
    'В неясной задаче вы сначала уточняете, каким должен быть результат.',
    ['structure', 'directness'],
  ),
  'unclear-request:draft-first': rule(
    'Черновик как способ прояснить задачу',
    'Быстрый черновик помогает вам прояснить неопределённую задачу.',
    ['initiative', 'adaptability'],
  ),
  'unclear-request:ask-example': rule(
    'Опора на конкретный пример',
    'Прояснить задачу помогает пример или похожий результат.',
    ['practicality', 'connection'],
  ),
  'unclear-request:explore-alone': rule(
    'Самостоятельное исследование вариантов',
    'Перед уточняющим вопросом вы готовы самостоятельно изучить варианты.',
    ['autonomy', 'openness'],
  ),
  'time-pressure:narrow-priorities': rule(
    'Сокращение до главного',
    'Под давлением времени вы сначала определяете обязательный результат.',
    ['structure', 'practicality'],
  ),
  'time-pressure:act-first': rule(
    'Действие с уточнением по пути',
    'Под давлением времени вы предпочитаете быстро начать действовать.',
    ['initiative', 'adaptability'],
  ),
  'time-pressure:ask-support': rule(
    'Быстро обсудить с другим человеком',
    'Под давлением времени вы предпочитаете быстро сверить решение с другим человеком.',
    ['connection', 'practicality'],
  ),
  'time-pressure:pause-reflect': rule(
    'Короткая пауза для порядка',
    'Даже при срочности вы сначала определяете порядок действий.',
    ['reflection', 'structure'],
  ),
  'unfinished-project:final-stretch': rule(
    'Короткий рывок перед завершением',
    'Короткий отрезок сосредоточенной работы помогает вам закончить дело.',
    ['initiative', 'practicality'],
  ),
  'unfinished-project:polish-details': rule(
    'Завершение через список деталей',
    'На последнем этапе вам помогает понятный список оставшихся деталей.',
    ['structure', 'reflection'],
  ),
  'unfinished-project:share-draft': rule(
    'Обратная связь помогает завершить',
    'Чтобы закончить дело, вы готовы показать черновик другому человеку и узнать его мнение.',
    ['connection', 'adaptability'],
  ),
  'unfinished-project:switch-return': rule(
    'Возвращение со свежим взглядом',
    'Короткий перерыв помогает вам заметить, что ещё нужно закончить.',
    ['adaptability', 'reflection'],
  ),
  'new-topic:map-basics': rule(
    'Сначала понять основы',
    'Знакомство с новой темой вы начинаете с основных понятий и общей структуры.',
    ['structure', 'reflection'],
  ),
  'new-topic:experiment': rule(
    'Новое через практическую пробу',
    'Чтобы понять новую тему, вы предпочитаете сразу попробовать что-то на практике.',
    ['initiative', 'practicality'],
  ),
  'new-topic:discuss': rule(
    'Новое через разговор',
    'Разобраться в теме помогает обмен идеями с другим человеком.',
    ['connection', 'openness'],
  ),
  'new-topic:explore-broadly': rule(
    'Свободное знакомство с темой',
    'Вы предпочитаете знакомиться с новой темой свободно, без строгого плана.',
    ['openness', 'adaptability'],
  ),
};
