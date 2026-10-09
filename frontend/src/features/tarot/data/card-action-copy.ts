import type { Locale } from '@shared/i18n';
import { spanishCardActions } from './card-copy-es';

/** Editorial equivalents of the existing Russian card actions.
 * Content only: card identities, selection and interpretation rules are unchanged.
 */
export const cardActionCopy: Readonly<Record<string, Record<Exclude<Locale, 'ru'>, string>>> = {
  'major-fool': {
    es: spanishCardActions['major-fool']!,
    en: 'Separate curiosity from risks whose consequences you can already see.',
    uk: 'Відокремте цікавість від ризиків, наслідки яких уже видно.',
  },
  'major-magician': {
    es: spanishCardActions['major-magician']!,
    en: 'Name your goal and check which tools you already have.',
    uk: 'Назвіть мету й перевірте, які засоби вже є у вашому розпорядженні.',
  },
  'major-high-priestess': {
    es: spanishCardActions['major-high-priestess']!,
    en: 'Give yourself time to separate feelings from untested assumptions.',
    uk: 'Дайте собі час відокремити відчуття від неперевірених припущень.',
  },
  'major-empress': {
    es: spanishCardActions['major-empress']!,
    en: 'Notice what needs care now and support it with one concrete action.',
    uk: 'Визначте, що зараз потребує турботи, і підтримайте це конкретною дією.',
  },
  'major-emperor': {
    es: spanishCardActions['major-emperor']!,
    en: 'Clarify one boundary, rule or responsibility that makes the situation more predictable.',
    uk: 'Уточніть одну межу, правило чи відповідальність, що зробить ситуацію передбачуванішою.',
  },
  'major-hierophant': {
    es: spanishCardActions['major-hierophant']!,
    en: 'Compare the advice you receive with your own values before accepting it.',
    uk: 'Зіставте чужу пораду з власними цінностями, перш ніж прийняти її.',
  },
  'major-lovers': {
    es: spanishCardActions['major-lovers']!,
    en: 'Name a choice that respects both the relationship and your own principles.',
    uk: 'Назвіть вибір, що збереже і стосунки, і ваші власні принципи.',
  },
  'major-chariot': {
    es: spanishCardActions['major-chariot']!,
    en: 'Align your pace with your goal before putting in more effort.',
    uk: 'Узгодьте темп із метою, перш ніж докладати більше зусиль.',
  },
  'major-strength': {
    es: spanishCardActions['major-strength']!,
    en: 'Name the strong feeling and find a way to express it without suppression or aggression.',
    uk: 'Назвіть сильне почуття й знайдіть спосіб виразити його без пригнічення чи агресії.',
  },
  'major-hermit': {
    es: spanishCardActions['major-hermit']!,
    en: 'Make time to think on your own and decide when to return from the pause.',
    uk: 'Виділіть час для самостійних роздумів і визначте, коли повернетеся до справ.',
  },
  'major-wheel': {
    es: spanishCardActions['major-wheel']!,
    en: 'Separate what has already changed from what you can still influence.',
    uk: 'Відокремте те, що вже змінилося, від того, на що ви ще можете вплинути.',
  },
  'major-justice': {
    es: spanishCardActions['major-justice']!,
    en: 'Compare the facts, agreements and consequences without defending a preferred conclusion.',
    uk: 'Зіставте факти, домовленості й наслідки, не виправдовуючи заздалегідь бажаний висновок.',
  },
  'major-hanged-man': {
    es: spanishCardActions['major-hanged-man']!,
    en: 'Stop forcing a decision and name the expectation or viewpoint you may need to let go.',
    uk: 'Не квапте рішення. Назвіть очікування чи погляд, від якого, можливо, варто відмовитися.',
  },
  'major-death': {
    es: spanishCardActions['major-death']!,
    en: 'Name what has already ended and what you are keeping alive out of habit.',
    uk: 'Назвіть те, що вже завершилося, і те, що ви підтримуєте лише за звичкою.',
  },
  'major-temperance': {
    es: spanishCardActions['major-temperance']!,
    en: 'Reduce the load and choose a pace you can sustain.',
    uk: 'Зменште навантаження й оберіть темп, який зможете підтримувати.',
  },
  'major-devil': {
    es: spanishCardActions['major-devil']!,
    en: 'Be honest about what this situation gives you and what it costs.',
    uk: 'Чесно назвіть, що дає вам ця ситуація і яку ціну ви за неї платите.',
  },
  'major-tower': {
    es: spanishCardActions['major-tower']!,
    en: 'Avoid fixing everything at once. Find one part that is no longer working.',
    uk: 'Не намагайтеся виправити все одразу. Знайдіть одну частину, яка вже не працює.',
  },
  'major-star': {
    es: spanishCardActions['major-star']!,
    en: 'Notice one sign of recovery and support it without expecting an immediate result.',
    uk: 'Помітьте одну ознаку відновлення й підтримайте її без вимоги миттєвого результату.',
  },
  'major-moon': {
    es: spanishCardActions['major-moon']!,
    en: 'Separate what you can observe from what you imagine before making a final decision.',
    uk: 'Відокремте те, що спостерігаєте, від того, що уявляєте, перш ніж ухвалити остаточне рішення.',
  },
  'major-sun': {
    es: spanishCardActions['major-sun']!,
    en: 'Bring the main issue into the open and name it without exaggeration.',
    uk: 'Відкрито назвіть головне й перевірте, чи не перебільшуєте ви.',
  },
  'major-judgement': {
    es: spanishCardActions['major-judgement']!,
    en: 'Take one lesson from the past without punishing yourself for an old mistake.',
    uk: 'Візьміть із минулого один урок, не караючи себе за колишню помилку.',
  },
  'major-world': {
    es: spanishCardActions['major-world']!,
    en: 'Resolve one remaining question and note what this completed chapter taught you.',
    uk: 'Закрийте одне нерозв’язане питання й відзначте, чого навчив завершений етап.',
  },
  'wands-ace': {
    es: spanishCardActions['wands-ace']!,
    en: 'Choose the smallest step that lets you test the idea in practice.',
    uk: 'Оберіть найменший крок, що допоможе перевірити ідею на практиці.',
  },
  'wands-two': {
    es: spanishCardActions['wands-two']!,
    en: 'Compare two directions by their real possibilities and what you would give up in each.',
    uk: 'Порівняйте два напрями за реальними можливостями й тим, від чого доведеться відмовитися.',
  },
  'wands-three': {
    es: spanishCardActions['wands-three']!,
    en: 'Check the feedback and dependencies before expanding the plan.',
    uk: 'Перевірте відгуки й залежності, перш ніж розширювати план.',
  },
  'wands-four': {
    es: spanishCardActions['wands-four']!,
    en: 'Strengthen an agreement that lets you share the achievement.',
    uk: 'Зміцніть домовленість, завдяки якій можна розділити радість від досягнення.',
  },
  'wands-five': {
    es: spanishCardActions['wands-five']!,
    en: 'Name the disagreement and agree on the ground rules before continuing the debate.',
    uk: 'Назвіть предмет розбіжностей і погодьте правила, перш ніж продовжувати суперечку.',
  },
  'wands-six': {
    es: spanishCardActions['wands-six']!,
    en: 'Separate the result from the praise and recognise each person’s contribution.',
    uk: 'Відокремте результат від похвали й відзначте внесок кожного.',
  },
  'wands-seven': {
    es: spanishCardActions['wands-seven']!,
    en: 'Choose one essential boundary instead of trying to defend everything.',
    uk: 'Оберіть одну принципову межу замість того, щоб захищати все одночасно.',
  },
  'wands-eight': {
    es: spanishCardActions['wands-eight']!,
    en: 'Remove one obstacle and check that everyone understands the next step.',
    uk: 'Усуньте одну перешкоду й перевірте, чи всі однаково розуміють наступний крок.',
  },
  'wands-nine': {
    es: spanishCardActions['wands-nine']!,
    en: 'Distinguish useful caution from habitual vigilance and leave room to recover.',
    uk: 'Відрізніть розумну обережність від звичної настороженості й залиште час для відновлення.',
  },
  'wands-ten': {
    es: spanishCardActions['wands-ten']!,
    en: 'Decide what you need to carry and what you can delegate or let go.',
    uk: 'Визначте, що має залишитися на вас, а що можна передати чи відпустити.',
  },
  'wands-page': {
    es: spanishCardActions['wands-page']!,
    en: 'Test the idea with a small experiment before talking about its future potential.',
    uk: 'Перевірте ідею невеликим дослідом, перш ніж говорити про її майбутні можливості.',
  },
  'wands-knight': {
    es: spanishCardActions['wands-knight']!,
    en: 'Slow one decision down enough to consider the consequences of the first step.',
    uk: 'Сповільніть одне рішення настільки, щоб оцінити наслідки першого кроку.',
  },
  'wands-queen': {
    es: spanishCardActions['wands-queen']!,
    en: 'Give yourself room to act in a setting where you do not have to prove your confidence.',
    uk: 'Дозвольте собі діяти там, де не потрібно постійно доводити свою впевненість.',
  },
  'wands-king': {
    es: spanishCardActions['wands-king']!,
    en: 'Set a direction, the limits of your responsibility and a clear measure of progress.',
    uk: 'Визначте напрям, межі своїх повноважень і зрозумілий критерій результату.',
  },
  'cups-ace': {
    es: spanishCardActions['cups-ace']!,
    en: 'Name the feeling precisely and choose a safe way to express it.',
    uk: 'Дайте почуттю точну назву й оберіть безпечний спосіб його виразити.',
  },
  'cups-two': {
    es: spanishCardActions['cups-two']!,
    en: 'Check that you both understand the exchange, boundaries and responsibilities in the same way.',
    uk: 'Перевірте, чи однаково ви розумієте взаємність, межі й відповідальність.',
  },
  'cups-three': {
    es: spanishCardActions['cups-three']!,
    en: 'Reach out to people who can share the joy and the load without leaving others out.',
    uk: 'Зверніться до людей, з якими можна розділити радість і навантаження, не виключаючи інших.',
  },
  'cups-four': {
    es: spanishCardActions['cups-four']!,
    en: 'Name what is missing before accepting or rejecting a new possibility.',
    uk: 'Назвіть, чого бракує, перш ніж прийняти чи відкинути нову можливість.',
  },
  'cups-five': {
    es: spanishCardActions['cups-five']!,
    en: 'Acknowledge the loss, then notice the support that remains.',
    uk: 'Визнайте втрату, а потім помітьте опори, які залишилися.',
  },
  'cups-six': {
    es: spanishCardActions['cups-six']!,
    en: 'Draw on a supportive memory without asking the present to repeat the past.',
    uk: 'Спирайтеся на добрий досвід із минулого, не вимагаючи від теперішнього повторити його.',
  },
  'cups-seven': {
    es: spanishCardActions['cups-seven']!,
    en: 'Narrow the choice to two options and check each against facts and consequences.',
    uk: 'Звузьте вибір до двох варіантів і перевірте кожен за фактами та наслідками.',
  },
  'cups-eight': {
    es: spanishCardActions['cups-eight']!,
    en: 'Name what this situation no longer gives you and where you want to go next.',
    uk: 'Назвіть, чого ця ситуація вже не дає, і до чого ви хочете прийти.',
  },
  'cups-nine': {
    es: spanishCardActions['cups-nine']!,
    en: 'Check what brings real satisfaction and what only looks like success.',
    uk: 'Перевірте, що приносить справжнє задоволення, а що лише виглядає успіхом.',
  },
  'cups-ten': {
    es: spanishCardActions['cups-ten']!,
    en: 'Discuss what support and shared wellbeing mean to each of you.',
    uk: 'Обговоріть, що для кожного означають підтримка й спільний добробут.',
  },
  'cups-page': {
    es: spanishCardActions['cups-page']!,
    en: 'Express one feeling directly without turning it into a hint or a drama.',
    uk: 'Виразіть одне почуття прямо, без натяків і драматизації.',
  },
  'cups-knight': {
    es: spanishCardActions['cups-knight']!,
    en: 'Compare an appealing gesture with the actions that follow it.',
    uk: 'Зіставте привабливий жест із діями, які за ним підуть.',
  },
  'cups-queen': {
    es: spanishCardActions['cups-queen']!,
    en: 'Show compassion without taking responsibility for another person’s feelings.',
    uk: 'Виявляйте співчуття, не беручи на себе відповідальність за чужі почуття.',
  },
  'cups-king': {
    es: spanishCardActions['cups-king']!,
    en: 'Speak calmly about what you feel without using silence to control the conversation.',
    uk: 'Спокійно говоріть про почуття, не використовуючи мовчання для керування розмовою.',
  },
  'swords-ace': {
    es: spanishCardActions['swords-ace']!,
    en: 'State the main question and check which facts you still need to answer it.',
    uk: 'Сформулюйте головне запитання й перевірте, яких фактів ще бракує для відповіді.',
  },
  'swords-two': {
    es: spanishCardActions['swords-two']!,
    en: 'Name the cost of waiting and one criterion for choosing between the two paths.',
    uk: 'Назвіть ціну зволікання й один критерій для вибору між двома шляхами.',
  },
  'swords-three': {
    es: spanishCardActions['swords-three']!,
    en: 'Name what hurts without making a decision solely to stop the pain immediately.',
    uk: 'Назвіть, що болить, не ухвалюючи рішення лише заради негайного полегшення.',
  },
  'swords-four': {
    es: spanishCardActions['swords-four']!,
    en: 'Protect a short quiet pause and choose a realistic time to return to the task.',
    uk: 'Захистіть коротку тиху паузу й визначте реалістичний час повернення до справи.',
  },
  'swords-five': {
    es: spanishCardActions['swords-five']!,
    en: 'Decide whether being right or restoring the connection matters more here.',
    uk: 'Визначте, що зараз важливіше: довести свою правоту чи відновити спілкування.',
  },
  'swords-six': {
    es: spanishCardActions['swords-six']!,
    en: 'Choose what you need to take forward and what no longer helps you move on.',
    uk: 'Визначте, що потрібно взяти із собою, а що вже не допомагає рухатися далі.',
  },
  'swords-seven': {
    es: spanishCardActions['swords-seven']!,
    en: 'Check whether an indirect approach protects a boundary or avoids an honest conversation.',
    uk: 'Перевірте, чи непрямий підхід захищає важливу межу, чи лише дозволяє уникнути чесної розмови.',
  },
  'swords-eight': {
    es: spanishCardActions['swords-eight']!,
    en: 'Test one apparent limitation through action instead of accepting it as a fact.',
    uk: 'Перевірте дією одне можливе обмеження, перш ніж прийняти його як факт.',
  },
  'swords-nine': {
    es: spanishCardActions['swords-nine']!,
    en: 'Write down the facts behind the worry and reach out for support.',
    uk: 'Запишіть факти, що стоять за тривогою, і зверніться по підтримку.',
  },
  'swords-ten': {
    es: spanishCardActions['swords-ten']!,
    en: 'Stop revisiting the damage and choose one first step towards recovery.',
    uk: 'Не повертайтеся знову до завданої шкоди. Оберіть перший крок до відновлення.',
  },
  'swords-page': {
    es: spanishCardActions['swords-page']!,
    en: 'Ask one precise question and hear the answer before forming an interpretation.',
    uk: 'Поставте одне точне запитання й вислухайте відповідь, перш ніж її тлумачити.',
  },
  'swords-knight': {
    es: spanishCardActions['swords-knight']!,
    en: 'Check the key fact before acting quickly or entering an argument.',
    uk: 'Перевірте головний факт, перш ніж поспішати з дією чи вступати в суперечку.',
  },
  'swords-queen': {
    es: spanishCardActions['swords-queen']!,
    en: 'State the boundary directly without adding punishment or dismissal.',
    uk: 'Назвіть межу прямо, без покарання чи знецінення.',
  },
  'swords-king': {
    es: spanishCardActions['swords-king']!,
    en: 'Review the decision and check that the same rule applies to everyone.',
    uk: 'Перегляньте рішення й перевірте, чи однакове правило діє для всіх.',
  },
  'pentacles-ace': {
    es: spanishCardActions['pentacles-ace']!,
    en: 'Assess the resource in concrete terms and make a first practical contribution.',
    uk: 'Оцініть ресурс у конкретних цифрах і зробіть перший практичний внесок.',
  },
  'pentacles-two': {
    es: spanishCardActions['pentacles-two']!,
    en: 'Choose the main priority and set aside time or resources for it.',
    uk: 'Оберіть головний пріоритет і виділіть для нього час або ресурси.',
  },
  'pentacles-three': {
    es: spanishCardActions['pentacles-three']!,
    en: 'Agree on quality, roles and the point where expert feedback would help.',
    uk: 'Узгодьте якість, ролі й момент, коли стане в пригоді фаховий відгук.',
  },
  'pentacles-four': {
    es: spanishCardActions['pentacles-four']!,
    en: 'Choose a reasonable reserve and what you can safely put to use.',
    uk: 'Визначте розумний запас і те, що можна безпечно використати.',
  },
  'pentacles-five': {
    es: spanishCardActions['pentacles-five']!,
    en: 'Name the specific need and check what practical support is available.',
    uk: 'Назвіть конкретну потребу й перевірте, яка практична підтримка доступна.',
  },
  'pentacles-six': {
    es: spanishCardActions['pentacles-six']!,
    en: 'Clarify the exchange and check that the help does not create a hidden obligation.',
    uk: 'Уточніть умови обміну й перевірте, чи допомога не створює прихованого зобов’язання.',
  },
  'pentacles-seven': {
    es: spanishCardActions['pentacles-seven']!,
    en: 'Compare the effort and results before deciding whether to continue in the same way.',
    uk: 'Зіставте зусилля й результати, перш ніж продовжувати тим самим способом.',
  },
  'pentacles-eight': {
    es: spanishCardActions['pentacles-eight']!,
    en: 'Choose one skill and improve it through practice and feedback.',
    uk: 'Оберіть одну навичку й удосконалюйте її через практику та відгуки.',
  },
  'pentacles-nine': {
    es: spanishCardActions['pentacles-nine']!,
    en: 'Recognise what you have achieved and check whether independence has become isolation.',
    uk: 'Визнайте свій результат і перевірте, чи самостійність не стала ізоляцією.',
  },
  'pentacles-ten': {
    es: spanishCardActions['pentacles-ten']!,
    en: 'Discuss how shared resources are managed and what needs to last into the next stage.',
    uk: 'Обговоріть правила спільних ресурсів і те, що потрібно зберегти на наступному етапі.',
  },
  'pentacles-page': {
    es: spanishCardActions['pentacles-page']!,
    en: 'Gather the basic facts and turn your interest into a simple learning or financial plan.',
    uk: 'Зберіть основні дані й перетворіть інтерес на простий навчальний або фінансовий план.',
  },
  'pentacles-knight': {
    es: spanishCardActions['pentacles-knight']!,
    en: 'Keep the useful routine and change one process that no longer brings results.',
    uk: 'Збережіть корисний ритм і змініть один процес, що вже не дає результату.',
  },
  'pentacles-queen': {
    es: spanishCardActions['pentacles-queen']!,
    en: 'Replenish your basic resources before giving your attention to more demands.',
    uk: 'Відновіть основні ресурси, перш ніж приділяти увагу новим вимогам.',
  },
  'pentacles-king': {
    es: spanishCardActions['pentacles-king']!,
    en: 'Keep useful control without making control the goal itself.',
    uk: 'Зберігайте корисний контроль, не перетворюючи його на самоціль.',
  },
};
