import type { Locale } from '@shared/i18n';

type NumberMeaning = {
  application: string;
  interpretation: string;
  strengths: readonly [string, string, string];
  tensions: readonly [string, string];
};

const compact = (
  interpretation: string,
  strengths: readonly [string, string, string],
  tensions: readonly [string, string],
  application: string,
): NumberMeaning => ({ application, interpretation, strengths, tensions });

export const numberMeanings: Record<Locale, Record<number, NumberMeaning>> = {
  ru: {
    1: compact(
      'Тема самостоятельного начала и ясного направления.',
      ['инициатива', 'независимость', 'решительность'],
      ['нетерпение', 'изоляция'],
      'Выберите один шаг, который можно начать без дополнительных разрешений.',
    ),
    2: compact(
      'Тема чувствительности к связям, ритму и взаимности.',
      ['диалог', 'наблюдательность', 'сотрудничество'],
      ['сомнение', 'зависимость от отклика'],
      'Назовите собственную позицию до того, как подстраиваться под чужую.',
    ),
    3: compact(
      'Тема выражения, любопытства и движения идей.',
      ['творчество', 'коммуникация', 'лёгкость'],
      ['рассеивание', 'незавершённость'],
      'Дайте одной идее конкретную форму: заметку, разговор или черновик.',
    ),
    4: compact(
      'Тема структуры, последовательности и надёжной опоры.',
      ['система', 'практичность', 'выносливость'],
      ['жёсткость', 'перегрузка контролем'],
      'Отделите необходимый порядок от правил, которые уже можно изменить.',
    ),
    5: compact(
      'Тема движения, опыта и обновления перспективы.',
      ['гибкость', 'исследование', 'адаптация'],
      ['импульсивность', 'неустойчивость'],
      'Добавьте небольшое изменение, не разрушая всю текущую систему.',
    ),
    6: compact(
      'Тема заботы, ответственности и качества пространства.',
      ['поддержка', 'вкус', 'надёжность'],
      ['чрезмерная ответственность', 'идеализация'],
      'Проверьте, где помощь действительно нужна, а где достаточно присутствия.',
    ),
    7: compact(
      'Тема глубины, анализа и внутренней настройки.',
      ['исследование', 'самостоятельное мышление', 'точность'],
      ['закрытость', 'переанализ'],
      'Ограничьте время на размышление и зафиксируйте один проверяемый вывод.',
    ),
    8: compact(
      'Тема влияния, ресурсов и практического масштаба.',
      ['организация', 'амбиция', 'ответственность'],
      ['давление результата', 'жёсткость'],
      'Определите, какой ресурс важнее усилить, а не просто расходовать больше.',
    ),
    9: compact(
      'Тема завершения, широкого взгляда и смысловой связи.',
      ['эмпатия', 'целостность', 'завершение'],
      ['размытые границы', 'трудность отпускания'],
      'Закройте один незавершённый цикл прежде, чем открывать следующий.',
    ),
    11: compact(
      'Мастер-число интуитивного сигнала и вдохновляющей ясности.',
      ['чуткость', 'видение', 'выражение смысла'],
      ['перегрузка впечатлениями', 'нервное напряжение'],
      'Переведите сильное ощущение в один спокойный и проверяемый вопрос.',
    ),
    22: compact(
      'Мастер-число большой идеи, которой нужна рабочая архитектура.',
      ['масштаб', 'системность', 'создание основы'],
      ['завышенная планка', 'страх масштаба'],
      'Сведите большую задачу к первому элементу, который уже можно построить.',
    ),
    33: compact(
      'Мастер-число зрелой поддержки и ответственности за влияние.',
      ['наставничество', 'сострадание', 'объединение'],
      ['самопожертвование', 'ожидание идеала'],
      'Помогайте так, чтобы сохранять собственные границы и ресурс.',
    ),
  },
  en: {
    1: compact(
      'A theme of independent beginnings and clear direction.',
      ['initiative', 'independence', 'decisiveness'],
      ['impatience', 'isolation'],
      'Choose one step you can begin without further permission.',
    ),
    2: compact(
      'A theme of sensitivity to connection, rhythm and reciprocity.',
      ['dialogue', 'awareness', 'cooperation'],
      ['hesitation', 'reliance on response'],
      'Name your own position before adapting to someone else.',
    ),
    3: compact(
      'A theme of expression, curiosity and moving ideas.',
      ['creativity', 'communication', 'lightness'],
      ['dispersion', 'unfinished work'],
      'Give one idea a concrete form: a note, conversation or draft.',
    ),
    4: compact(
      'A theme of structure, consistency and dependable support.',
      ['systems', 'practicality', 'endurance'],
      ['rigidity', 'over-control'],
      'Separate useful order from rules that are ready to change.',
    ),
    5: compact(
      'A theme of movement, experience and renewed perspective.',
      ['flexibility', 'exploration', 'adaptation'],
      ['impulsiveness', 'instability'],
      'Introduce one small change without dismantling the whole system.',
    ),
    6: compact(
      'A theme of care, responsibility and the quality of a shared space.',
      ['support', 'taste', 'reliability'],
      ['over-responsibility', 'idealisation'],
      'Check where help is needed and where presence is enough.',
    ),
    7: compact(
      'A theme of depth, analysis and inner calibration.',
      ['research', 'independent thought', 'precision'],
      ['withdrawal', 'over-analysis'],
      'Limit reflection time and record one testable conclusion.',
    ),
    8: compact(
      'A theme of influence, resources and practical scale.',
      ['organisation', 'ambition', 'responsibility'],
      ['result pressure', 'hardness'],
      'Choose which resource to strengthen instead of simply spending more.',
    ),
    9: compact(
      'A theme of completion, broad perspective and meaningful connection.',
      ['empathy', 'wholeness', 'completion'],
      ['blurred boundaries', 'difficulty letting go'],
      'Close one unfinished cycle before opening the next.',
    ),
    11: compact(
      'A master-number theme of intuitive signal and inspiring clarity.',
      ['sensitivity', 'vision', 'meaningful expression'],
      ['sensory overload', 'nervous tension'],
      'Turn a strong impression into one calm, testable question.',
    ),
    22: compact(
      'A master-number theme of a large idea needing working architecture.',
      ['scale', 'systems', 'foundation building'],
      ['impossible standards', 'fear of scale'],
      'Reduce the large task to the first element you can build now.',
    ),
    33: compact(
      'A master-number theme of mature support and responsible influence.',
      ['mentoring', 'compassion', 'integration'],
      ['self-sacrifice', 'ideal expectations'],
      'Support others while protecting your own limits and capacity.',
    ),
  },
  uk: {
    1: compact(
      'Тема самостійного початку й ясного напрямку.',
      ['ініціатива', 'незалежність', 'рішучість'],
      ['нетерпіння', 'ізоляція'],
      'Оберіть один крок, який можна почати без додаткових дозволів.',
    ),
    2: compact(
      'Тема чутливості до зв’язків, ритму й взаємності.',
      ['діалог', 'спостережливість', 'співпраця'],
      ['сумнів', 'залежність від відгуку'],
      'Назвіть власну позицію до того, як підлаштовуватися під чужу.',
    ),
    3: compact(
      'Тема вираження, цікавості й руху ідей.',
      ['творчість', 'комунікація', 'легкість'],
      ['розпорошення', 'незавершеність'],
      'Надайте одній ідеї конкретної форми: нотатки, розмови чи чернетки.',
    ),
    4: compact(
      'Тема структури, послідовності й надійної опори.',
      ['система', 'практичність', 'витривалість'],
      ['жорсткість', 'надмірний контроль'],
      'Відокремте корисний порядок від правил, які вже можна змінити.',
    ),
    5: compact(
      'Тема руху, досвіду й оновлення перспективи.',
      ['гнучкість', 'дослідження', 'адаптація'],
      ['імпульсивність', 'нестійкість'],
      'Додайте невелику зміну, не руйнуючи всю поточну систему.',
    ),
    6: compact(
      'Тема турботи, відповідальності та якості простору.',
      ['підтримка', 'смак', 'надійність'],
      ['надмірна відповідальність', 'ідеалізація'],
      'Перевірте, де допомога справді потрібна, а де достатньо присутності.',
    ),
    7: compact(
      'Тема глибини, аналізу й внутрішнього налаштування.',
      ['дослідження', 'самостійне мислення', 'точність'],
      ['закритість', 'переаналіз'],
      'Обмежте час на роздуми й зафіксуйте один перевірюваний висновок.',
    ),
    8: compact(
      'Тема впливу, ресурсів і практичного масштабу.',
      ['організація', 'амбіція', 'відповідальність'],
      ['тиск результату', 'жорсткість'],
      'Визначте, який ресурс важливіше посилити, а не просто витрачати більше.',
    ),
    9: compact(
      'Тема завершення, широкого погляду й змістовного зв’язку.',
      ['емпатія', 'цілісність', 'завершення'],
      ['розмиті межі', 'складність відпускання'],
      'Закрийте один незавершений цикл перед початком наступного.',
    ),
    11: compact(
      'Майстер-число інтуїтивного сигналу й натхненної ясності.',
      ['чутливість', 'бачення', 'вираження сенсу'],
      ['перевантаження враженнями', 'нервове напруження'],
      'Перетворіть сильне відчуття на одне спокійне й перевірюване питання.',
    ),
    22: compact(
      'Майстер-число великої ідеї, якій потрібна робоча архітектура.',
      ['масштаб', 'системність', 'створення основи'],
      ['завищена планка', 'страх масштабу'],
      'Зведіть велике завдання до першого елемента, який уже можна створити.',
    ),
    33: compact(
      'Майстер-число зрілої підтримки й відповідальності за вплив.',
      ['наставництво', 'співчуття', 'об’єднання'],
      ['самопожертва', 'очікування ідеалу'],
      'Допомагайте так, щоб зберігати власні межі й ресурс.',
    ),
  },
};
