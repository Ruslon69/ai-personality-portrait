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
      ru: 'Когда решение действительно важно, что помогает его принять?',
      en: 'When a decision truly matters, what helps you make it?',
      uk: 'Коли рішення справді важливе, що допомагає його прийняти?',
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
        'Взять паузу и прислушаться к своим чувствам',
        'Pause and notice how I feel',
        'Взяти паузу й прислухатися до своїх почуттів',
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
        'Жду новой информации',
        'I wait for more information',
        'Чекаю на нову інформацію',
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
        'Перемены и что с ними делать',
        'A change and what to do with it',
        'Зміни й те, що з ними робити',
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
        'Не принимать решение сразу',
        'Avoid deciding immediately',
        'Не приймати рішення одразу',
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
        'Посмотреть на ситуацию иначе',
        'Look at the situation differently',
        'Поглянути на ситуацію інакше',
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
        'Я нахожусь на пороге перемен',
        'I am on the verge of change',
        'Я стою на порозі змін',
      ),
      option(
        'building',
        'Я постепенно закладываю основу',
        'I am gradually building a foundation',
        'Я поступово закладаю основу',
      ),
      option(
        'noise',
        'Слишком много информации одновременно',
        'There is too much information at once',
        'Забагато інформації одночасно',
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
