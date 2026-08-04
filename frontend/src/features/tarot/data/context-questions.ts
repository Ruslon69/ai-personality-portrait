import type { Locale } from '@shared/i18n';

export type TarotContextQuestion = {
  id: string;
  title: Record<Locale, string>;
  options: readonly { id: string; label: Record<Locale, string> }[];
};
const option = (id: string, ru: string, en: string, uk: string) => ({ id, label: { ru, en, uk } });
export const tarotContextQuestions: readonly TarotContextQuestion[] = [
  {
    id: 'decision-style',
    title: {
      ru: 'Когда решение действительно важно, что помогает сдвинуться?',
      en: 'When a decision truly matters, what helps you move?',
      uk: 'Коли рішення справді важливе, що допомагає зрушити?',
    },
    options: [
      option(
        'facts',
        'Собрать факты и увидеть ограничения',
        'Gather facts and see the constraints',
        'Зібрати факти й побачити обмеження',
      ),
      option(
        'talk',
        'Проговорить с человеком, которому доверяю',
        'Talk it through with someone I trust',
        'Проговорити з людиною, якій довіряю',
      ),
      option(
        'test',
        'Попробовать небольшой обратимый шаг',
        'Try a small reversible step',
        'Спробувати невеликий зворотний крок',
      ),
      option(
        'pause',
        'Дать себе паузу и услышать внутренний отклик',
        'Pause and notice my inner response',
        'Дати собі паузу й почути внутрішній відгук',
      ),
    ],
  },
  {
    id: 'uncertainty',
    title: {
      ru: 'Если ясного ответа пока нет, что происходит чаще?',
      en: 'When there is no clear answer yet, what happens most often?',
      uk: 'Коли ясної відповіді ще немає, що трапляється найчастіше?',
    },
    options: [
      option(
        'map',
        'Строю несколько возможных сценариев',
        'I map several possible scenarios',
        'Будую кілька можливих сценаріїв',
      ),
      option(
        'move',
        'Начинаю действовать и уточняю по пути',
        'I act and adjust along the way',
        'Починаю діяти й уточнюю в процесі',
      ),
      option(
        'wait',
        'Жду нового сигнала или информации',
        'I wait for another signal or piece of information',
        'Чекаю нового сигналу чи інформації',
      ),
      option(
        'context',
        'Смотрю, насколько решение вообще срочное',
        'I check how urgent the decision really is',
        'Дивлюся, наскільки рішення взагалі термінове',
      ),
    ],
  },
  {
    id: 'current-focus',
    title: {
      ru: 'Что сейчас чаще возвращается в мысли?',
      en: 'What keeps returning to your thoughts right now?',
      uk: 'Що зараз найчастіше повертається в думки?',
    },
    options: [
      option(
        'relationship',
        'Разговор или отношения',
        'A conversation or relationship',
        'Розмова чи стосунки',
      ),
      option(
        'work',
        'Работа, учёба или направление',
        'Work, learning or direction',
        'Робота, навчання чи напрям',
      ),
      option('resources', 'Деньги и устойчивость', 'Money and stability', 'Гроші та стійкість'),
      option(
        'change',
        'Перемена, которую пора оформить',
        'A change that needs a form',
        'Зміна, якій час надати форми',
      ),
    ],
  },
  {
    id: 'change-response',
    title: {
      ru: 'Когда планы меняются, что вам нужнее всего?',
      en: 'When plans change, what do you need most?',
      uk: 'Коли плани змінюються, що вам найбільше потрібно?',
    },
    options: [
      option(
        'anchor',
        'Сохранить одну понятную опору',
        'Keep one clear anchor',
        'Зберегти одну зрозумілу опору',
      ),
      option(
        'space',
        'Получить пространство без немедленного решения',
        'Have space without an immediate decision',
        'Отримати простір без негайного рішення',
      ),
      option(
        'new-route',
        'Быстро увидеть новый маршрут',
        'See a new route quickly',
        'Швидко побачити новий маршрут',
      ),
      option(
        'support',
        'Проверить ситуацию в диалоге',
        'Check the situation through dialogue',
        'Перевірити ситуацію в діалозі',
      ),
    ],
  },
  {
    id: 'reading-intent',
    title: {
      ru: 'Что вы хотите получить от расклада?',
      en: 'What would you like the reading to offer?',
      uk: 'Що ви хочете отримати від розкладу?',
    },
    options: [
      option(
        'clarity',
        'Увидеть ситуацию яснее',
        'See the situation more clearly',
        'Побачити ситуацію ясніше',
      ),
      option(
        'angle',
        'Найти непривычный ракурс',
        'Find an unfamiliar angle',
        'Знайти незвичний ракурс',
      ),
      option(
        'action',
        'Выбрать небольшой следующий шаг',
        'Choose a small next step',
        'Обрати невеликий наступний крок',
      ),
      option(
        'reflection',
        'Спокойно сформулировать, что я уже чувствую',
        'Put words to what I already feel',
        'Спокійно сформулювати те, що вже відчуваю',
      ),
    ],
  },
  {
    id: 'period-state',
    title: {
      ru: 'Как лучше всего описать текущий период?',
      en: 'Which description fits the current period best?',
      uk: 'Який опис найкраще пасує поточному періоду?',
    },
    options: [
      option(
        'threshold',
        'Я стою у точки перехода',
        'I am at a threshold',
        'Я стою на порозі переходу',
      ),
      option(
        'building',
        'Я постепенно собираю основу',
        'I am gradually building a foundation',
        'Я поступово збираю основу',
      ),
      option(
        'noise',
        'Слишком много сигналов одновременно',
        'There are too many signals at once',
        'Забагато сигналів одночасно',
      ),
      option(
        'settling',
        'Мне важно закрепить уже начатое',
        'I need to stabilise what has begun',
        'Мені важливо закріпити вже розпочате',
      ),
    ],
  },
];
