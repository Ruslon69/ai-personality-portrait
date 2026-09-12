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
      'Это число может проявляться как желание действовать самостоятельно и первым начинать новое.',
      ['инициатива', 'независимость', 'решительность'],
      ['нетерпение', 'изоляция'],
      'Выберите один шаг, который можно начать без дополнительных разрешений.',
    ),
    2: compact(
      'Это число может проявляться как внимание к отношениям, настроению других и взаимности.',
      ['диалог', 'наблюдательность', 'сотрудничество'],
      ['сомнение', 'зависимость от отклика'],
      'Назовите собственную позицию до того, как подстраиваться под чужую.',
    ),
    3: compact(
      'Это число может проявляться как лёгкость в общении, любопытство и желание выражать идеи.',
      ['творчество', 'коммуникация', 'лёгкость'],
      ['рассеивание', 'незавершённость'],
      'Дайте одной идее конкретную форму: заметку, разговор или черновик.',
    ),
    4: compact(
      'Это число может проявляться как любовь к порядку, понятным правилам и последовательной работе.',
      ['система', 'практичность', 'выносливость'],
      ['жёсткость', 'перегрузка контролем'],
      'Отделите необходимый порядок от правил, которые уже можно изменить.',
    ),
    5: compact(
      'Это число может проявляться как тяга к переменам, новому опыту и свободе выбора.',
      ['гибкость', 'исследование', 'адаптация'],
      ['импульсивность', 'неустойчивость'],
      'Добавьте небольшое изменение, не разрушая всю текущую систему.',
    ),
    6: compact(
      'Это число может проявляться как забота о близких и готовность отвечать за общее благополучие.',
      ['поддержка', 'вкус', 'надёжность'],
      ['чрезмерная ответственность', 'идеализация'],
      'Проверьте, где помощь действительно нужна, а где достаточно присутствия.',
    ),
    7: compact(
      'Это число может проявляться как потребность разбираться глубже и самостоятельно обдумывать решения.',
      ['исследование', 'самостоятельное мышление', 'точность'],
      ['закрытость', 'слишком долгие размышления'],
      'Ограничьте время на размышление и зафиксируйте один проверяемый вывод.',
    ),
    8: compact(
      'Это число может проявляться как умение организовать ресурсы, брать ответственность и добиваться результата.',
      ['организация', 'амбиция', 'ответственность'],
      ['давление результата', 'жёсткость'],
      'Определите, какой ресурс важнее усилить, а не просто расходовать больше.',
    ),
    9: compact(
      'Это число может проявляться как сочувствие, широкий взгляд и желание доводить важное до завершения.',
      ['эмпатия', 'целостность', 'завершение'],
      ['размытые границы', 'трудность отпускания'],
      'Закройте один незавершённый цикл прежде, чем открывать следующий.',
    ),
    11: compact(
      'Число 11 может проявляться как высокая чувствительность к впечатлениям и новым идеям.',
      ['чуткость', 'видение', 'выражение смысла'],
      ['перегрузка впечатлениями', 'нервное напряжение'],
      'Переведите сильное ощущение в один спокойный и проверяемый вопрос.',
    ),
    22: compact(
      'Число 22 может проявляться как желание превратить большую идею в работающую систему.',
      ['масштаб', 'системность', 'создание основы'],
      ['завышенная планка', 'страх масштаба'],
      'Сведите большую задачу к первому элементу, который уже можно построить.',
    ),
    33: compact(
      'Число 33 может проявляться как стремление поддерживать людей и ответственно влиять на общее дело.',
      ['наставничество', 'сострадание', 'объединение'],
      ['самопожертвование', 'ожидание идеала'],
      'Помогайте так, чтобы сохранять собственные границы и ресурс.',
    ),
  },
  en: {
    1: compact(
      'This number may show up as a wish to act independently and be the first to begin.',
      ['initiative', 'independence', 'decisiveness'],
      ['impatience', 'isolation'],
      'Choose one step you can begin without further permission.',
    ),
    2: compact(
      'This number may show up as attention to relationships, other people’s moods and reciprocity.',
      ['dialogue', 'awareness', 'cooperation'],
      ['hesitation', 'reliance on response'],
      'Name your own position before adapting to someone else.',
    ),
    3: compact(
      'This number may show up as ease in communication, curiosity and a wish to express ideas.',
      ['creativity', 'communication', 'lightness'],
      ['dispersion', 'unfinished work'],
      'Give one idea a concrete form: a note, conversation or draft.',
    ),
    4: compact(
      'This number may show up as a preference for order, clear rules and steady work.',
      ['systems', 'practicality', 'endurance'],
      ['rigidity', 'over-control'],
      'Separate useful order from rules that are ready to change.',
    ),
    5: compact(
      'This number may show up as a pull towards change, new experiences and freedom of choice.',
      ['flexibility', 'exploration', 'adaptation'],
      ['impulsiveness', 'instability'],
      'Introduce one small change without dismantling the whole system.',
    ),
    6: compact(
      'This number may show up as care for others and a willingness to support shared wellbeing.',
      ['support', 'taste', 'reliability'],
      ['over-responsibility', 'idealisation'],
      'Check where help is needed and where presence is enough.',
    ),
    7: compact(
      'This number may show up as a need to look deeper and think through decisions independently.',
      ['research', 'independent thought', 'precision'],
      ['withdrawal', 'thinking for too long'],
      'Limit reflection time and record one testable conclusion.',
    ),
    8: compact(
      'This number may show up as an ability to organise resources, take responsibility and deliver results.',
      ['organisation', 'ambition', 'responsibility'],
      ['result pressure', 'hardness'],
      'Choose which resource to strengthen instead of simply spending more.',
    ),
    9: compact(
      'This number may show up as empathy, a broad perspective and a wish to bring important work to completion.',
      ['empathy', 'wholeness', 'completion'],
      ['blurred boundaries', 'difficulty letting go'],
      'Close one unfinished cycle before opening the next.',
    ),
    11: compact(
      'Number 11 may show up as strong sensitivity to impressions and new ideas.',
      ['sensitivity', 'vision', 'meaningful expression'],
      ['sensory overload', 'nervous tension'],
      'Turn a strong impression into one calm, testable question.',
    ),
    22: compact(
      'Number 22 may show up as a wish to turn a large idea into a working system.',
      ['scale', 'systems', 'foundation building'],
      ['impossible standards', 'fear of scale'],
      'Reduce the large task to the first element you can build now.',
    ),
    33: compact(
      'Number 33 may show up as a wish to support people and use influence responsibly.',
      ['mentoring', 'compassion', 'integration'],
      ['self-sacrifice', 'ideal expectations'],
      'Support others while protecting your own limits and capacity.',
    ),
  },
  uk: {
    1: compact(
      'Це число може проявлятися як бажання діяти самостійно й першим починати нове.',
      ['ініціатива', 'незалежність', 'рішучість'],
      ['нетерпіння', 'ізоляція'],
      'Оберіть один крок, який можна почати без додаткових дозволів.',
    ),
    2: compact(
      'Це число може проявлятися як увага до стосунків, настрою інших і взаємності.',
      ['діалог', 'спостережливість', 'співпраця'],
      ['сумнів', 'залежність від відгуку'],
      'Назвіть власну позицію до того, як підлаштовуватися під чужу.',
    ),
    3: compact(
      'Це число може проявлятися як легкість у спілкуванні, цікавість і бажання висловлювати ідеї.',
      ['творчість', 'комунікація', 'легкість'],
      ['розпорошення', 'незавершеність'],
      'Надайте одній ідеї конкретної форми: нотатки, розмови чи чернетки.',
    ),
    4: compact(
      'Це число може проявлятися як любов до порядку, зрозумілих правил і послідовної роботи.',
      ['система', 'практичність', 'витривалість'],
      ['жорсткість', 'надмірний контроль'],
      'Відокремте корисний порядок від правил, які вже можна змінити.',
    ),
    5: compact(
      'Це число може проявлятися як потяг до змін, нового досвіду та свободи вибору.',
      ['гнучкість', 'дослідження', 'адаптація'],
      ['імпульсивність', 'нестійкість'],
      'Додайте невелику зміну, не руйнуючи всю поточну систему.',
    ),
    6: compact(
      'Це число може проявлятися як турбота про близьких і готовність відповідати за спільне благополуччя.',
      ['підтримка', 'смак', 'надійність'],
      ['надмірна відповідальність', 'ідеалізація'],
      'Перевірте, де допомога справді потрібна, а де достатньо присутності.',
    ),
    7: compact(
      'Це число може проявлятися як потреба розібратися глибше й самостійно обміркувати рішення.',
      ['дослідження', 'самостійне мислення', 'точність'],
      ['закритість', 'надто довгі роздуми'],
      'Обмежте час на роздуми й зафіксуйте один перевірюваний висновок.',
    ),
    8: compact(
      'Це число може проявлятися як уміння організувати ресурси, брати відповідальність і досягати результату.',
      ['організація', 'амбіція', 'відповідальність'],
      ['тиск результату', 'жорсткість'],
      'Визначте, який ресурс важливіше посилити, а не просто витрачати більше.',
    ),
    9: compact(
      'Це число може проявлятися як співчуття, широкий погляд і бажання завершувати важливе.',
      ['емпатія', 'цілісність', 'завершення'],
      ['розмиті межі', 'складність відпускання'],
      'Закрийте один незавершений цикл перед початком наступного.',
    ),
    11: compact(
      'Число 11 може проявлятися як висока чутливість до вражень і нових ідей.',
      ['чутливість', 'бачення', 'вираження сенсу'],
      ['перевантаження враженнями', 'нервове напруження'],
      'Перетворіть сильне відчуття на одне спокійне й перевірюване питання.',
    ),
    22: compact(
      'Число 22 може проявлятися як бажання перетворити велику ідею на робочу систему.',
      ['масштаб', 'системність', 'створення основи'],
      ['завищена планка', 'страх масштабу'],
      'Зведіть велике завдання до першого елемента, який уже можна створити.',
    ),
    33: compact(
      'Число 33 може проявлятися як прагнення підтримувати людей і відповідально впливати на спільну справу.',
      ['наставництво', 'співчуття', 'об’єднання'],
      ['самопожертва', 'очікування ідеалу'],
      'Допомагайте так, щоб зберігати власні межі й ресурс.',
    ),
  },
};
