import type { Locale } from '@shared/i18n';

export type LegalSection = {
  items?: readonly string[];
  paragraphs?: readonly string[];
  title: string;
};

export type LegalDocument = {
  effectiveDate: string;
  eyebrow: string;
  intro: string;
  ownerNotice: string;
  sections: readonly LegalSection[];
  title: string;
};

export const privacyPolicyCopy: Record<Locale, LegalDocument> = {
  en: {
    effectiveDate: 'Current implementation snapshot: 31 August 2026',
    eyebrow: 'LEGAL · PRIVACY',
    intro:
      'This policy explains how the current Soul Arkana web application processes information. The product is designed to work locally in your browser and currently has no account system, analytics or server-side profile storage.',
    ownerNotice:
      'Before public launch, this policy must name the approved legal operator, privacy contact and applicable jurisdiction.',
    title: 'Privacy Policy',
    sections: [
      {
        title: 'Information you choose to provide',
        items: [
          'Birth dates used for optional Numerology, zodiac context and Tarot context.',
          'Tarot topics, answers, card selections, orientations and completed readings.',
          'Portrait answers, interests, optional birth date and the locally generated portrait.',
          'Journey entries created from saved Tarot readings and daily-card activity.',
          'Interface language, theme and Tarot preferences.',
          'An optional voice sample recorded only when you start the microphone flow.',
        ],
      },
      {
        title: 'Where processing happens',
        paragraphs: [
          'The current application performs its calculations and interpretations in your browser. It does not actively send your inputs, readings, portrait, birth date or voice recording to an external service.',
          'Cloudflare Pages serves the application. As hosting and delivery infrastructure, Cloudflare may process ordinary request information such as an IP address, browser and device headers, the requested URL, timestamps, and network or security logs. This is separate from Soul Arkana actively uploading your Portrait answers, Tarot selections, Numerology inputs or voice recording; the current product code does not send those inputs to Cloudflare APIs or another external service.',
          'Portrait answers and results remain in application memory. They are not written to browser storage and are no longer available after the page is reloaded or the session is otherwise reset.',
        ],
      },
      {
        title: 'Browser storage and retention',
        items: [
          'Journey data, saved Tarot history, Tarot preferences, deck choice, language and theme may remain in persistent browser storage after the browser closes.',
          'Unfinished Tarot state, its random seed and Numerology birth date use session-only browser storage and normally disappear when the browser session ends.',
          'Saved Tarot history is limited by the history limit you select. Reducing the limit removes the oldest overflow after the change is saved successfully.',
          'Browser privacy modes, quota limits, clearing site data or changing devices can make local information unavailable. Soul Arkana cannot recover browser-local data from a server.',
        ],
      },
      {
        title: 'Voice and microphone',
        paragraphs: [
          'Microphone access is requested only after you choose the voice step and start the permission or recording action. You may skip the step.',
          'The recording is held temporarily in the page for playback and local quality checks. It is not persisted or uploaded. Leaving or reloading the flow releases the temporary recording, and the browser permission remains under your browser or device controls.',
        ],
      },
      {
        title: 'Analytics, tracking and cookies',
        paragraphs: [
          'The current product does not use analytics, advertising, tracking pixels, third-party embeds or cookies. Browser storage is used only for the local product state described above. A generic cookie consent banner is therefore not shown.',
        ],
      },
      {
        title: 'Your local controls',
        items: [
          'Delete one saved Tarot reading or clear the complete saved reading history from Tarot History.',
          'Reset Tarot preferences from Settings, or change theme and language at any time.',
          'Start the Portrait flow again or reload the page to discard its volatile answers and result.',
          'Close the browser session to discard session-only Numerology and unfinished Tarot data.',
          'Use your browser’s site-data controls to remove all remaining Soul Arkana browser storage. This also removes preferences and cannot be undone by Soul Arkana.',
        ],
      },
      {
        title: 'Changes to this policy',
        paragraphs: [
          'If Soul Arkana later adds an API, analytics, accounts, cloud storage, payments or other external processing, this policy and any required choices must be updated before those changes are enabled.',
        ],
      },
    ],
  },
  ru: {
    effectiveDate: 'Состояние текущей реализации: 31 августа 2026 года',
    eyebrow: 'ПРАВОВАЯ ИНФОРМАЦИЯ · ПРИВАТНОСТЬ',
    intro:
      'Эта политика объясняет, как текущая веб-версия Soul Arkana обрабатывает информацию. Продукт работает локально в браузере и сейчас не использует аккаунты, аналитику или серверное хранение профиля.',
    ownerNotice:
      'До публичного запуска здесь необходимо указать утверждённого юридического оператора, контакт по вопросам приватности и применимую юрисдикцию.',
    title: 'Политика приватности',
    sections: [
      {
        title: 'Что вы можете предоставить',
        items: [
          'Дату рождения для необязательных расчётов Нумерологии, контекста знака и Таро.',
          'Темы Таро, ответы, выбранные карты, ориентации и завершённые расклады.',
          'Ответы Портрета, интересы, необязательную дату рождения и созданный локально портрет.',
          'Записи Journey, созданные из сохранённых раскладов Таро и взаимодействия с картой дня.',
          'Язык интерфейса, тему и настройки Таро.',
          'Необязательную запись голоса, только если вы запускаете шаг с микрофоном.',
        ],
      },
      {
        title: 'Где происходит обработка',
        paragraphs: [
          'Текущая версия выполняет расчёты и интерпретации в вашем браузере и не отправляет ваши ответы, расклады, портрет, дату рождения или запись голоса во внешний сервис.',
          'Приложение размещено на Cloudflare Pages. Как инфраструктура хостинга и доставки Cloudflare может обрабатывать обычные данные запроса: IP-адрес, заголовки браузера и устройства, запрошенный URL, время запроса, а также сетевые журналы или журналы безопасности. Это не означает, что Soul Arkana загружает ответы Портрета, выборы Таро, данные Нумерологии или запись голоса: текущий код продукта не отправляет эти данные в API Cloudflare или другой внешний сервис.',
          'Ответы и результат Портрета остаются в памяти приложения. Они не записываются в хранилище браузера и становятся недоступны после перезагрузки страницы или сброса сессии.',
        ],
      },
      {
        title: 'Хранилище браузера и срок доступности',
        items: [
          'Journey, история Таро, настройки Таро, выбранная колода, язык и тема могут оставаться в постоянном хранилище браузера после его закрытия.',
          'Незавершённый расклад Таро, его случайный seed и дата для Нумерологии используют сессионное хранилище браузера и обычно исчезают после завершения браузерной сессии.',
          'История Таро ограничена выбранным лимитом. При его уменьшении самые старые записи сверх лимита удаляются после успешного сохранения.',
          'Приватный режим, ограничение квоты, очистка данных сайта или смена устройства могут сделать локальные данные недоступными. Soul Arkana не может восстановить их с сервера.',
        ],
      },
      {
        title: 'Голос и микрофон',
        paragraphs: [
          'Доступ к микрофону запрашивается только после выбора голосового шага и запуска разрешения или записи. Этот шаг можно пропустить.',
          'Запись временно хранится на странице для прослушивания и локальной проверки качества. Она не сохраняется постоянно и не загружается на сервер. При выходе или перезагрузке временная запись освобождается; разрешением микрофона управляет браузер или устройство.',
        ],
      },
      {
        title: 'Аналитика, отслеживание и cookies',
        paragraphs: [
          'Сейчас продукт не использует аналитику, рекламу, пиксели отслеживания, сторонние виджеты или cookies. Хранилище браузера нужно только для описанного локального состояния, поэтому общий cookie-баннер не показывается.',
        ],
      },
      {
        title: 'Как управлять локальными данными',
        items: [
          'Удалить отдельный расклад или очистить всю сохранённую историю можно в Истории Таро.',
          'Сбросить настройки Таро можно в Настройках; тему и язык можно изменить в любой момент.',
          'Чтобы отбросить временные ответы и результат Портрета, начните путь заново или перезагрузите страницу.',
          'Закройте браузерную сессию, чтобы удалить session-only данные Нумерологии и незавершённого Таро.',
          'Через настройки браузера можно удалить все данные сайта Soul Arkana из хранилища браузера. Это также удалит настройки и не может быть отменено Soul Arkana.',
        ],
      },
      {
        title: 'Изменения политики',
        paragraphs: [
          'Если Soul Arkana добавит API, аналитику, аккаунты, облачное хранение, платежи или другую внешнюю обработку, политика и необходимые пользовательские выборы должны быть обновлены до включения этих изменений.',
        ],
      },
    ],
  },
  uk: {
    effectiveDate: 'Стан поточної реалізації: 31 серпня 2026 року',
    eyebrow: 'ПРАВОВА ІНФОРМАЦІЯ · ПРИВАТНІСТЬ',
    intro:
      'Ця політика пояснює, як поточна вебверсія Soul Arkana обробляє інформацію. Продукт працює локально у браузері й зараз не використовує облікові записи, аналітику або серверне зберігання профілю.',
    ownerNotice:
      'До публічного запуску тут необхідно вказати затвердженого юридичного оператора, контакт із питань приватності та застосовну юрисдикцію.',
    title: 'Політика приватності',
    sections: [
      {
        title: 'Що ви можете надати',
        items: [
          'Дату народження для необов’язкових розрахунків Нумерології, контексту знака й Таро.',
          'Теми Таро, відповіді, вибрані карти, орієнтації та завершені розклади.',
          'Відповіді Портрета, інтереси, необов’язкову дату народження та створений локально портрет.',
          'Записи Journey, створені зі збережених розкладів Таро та взаємодії з картою дня.',
          'Мову інтерфейсу, тему й налаштування Таро.',
          'Необов’язковий запис голосу, лише якщо ви запускаєте крок із мікрофоном.',
        ],
      },
      {
        title: 'Де відбувається обробка',
        paragraphs: [
          'Поточна версія виконує розрахунки й інтерпретації у вашому браузері та не надсилає ваші відповіді, розклади, портрет, дату народження або запис голосу до зовнішнього сервісу.',
          'Застосунок розміщено на Cloudflare Pages. Як інфраструктура хостингу й доставки Cloudflare може обробляти звичайні дані запиту: IP-адресу, заголовки браузера та пристрою, запитану URL-адресу, час запиту, а також мережеві журнали або журнали безпеки. Це не означає, що Soul Arkana завантажує відповіді Портрета, вибір Таро, дані Нумерології або запис голосу: поточний код продукту не надсилає ці дані до API Cloudflare чи іншого зовнішнього сервісу.',
          'Відповіді й результат Портрета залишаються в пам’яті застосунку. Вони не записуються до сховища браузера й стають недоступними після перезавантаження сторінки або скидання сесії.',
        ],
      },
      {
        title: 'Сховище браузера та строк доступності',
        items: [
          'Journey, історія Таро, налаштування Таро, вибрана колода, мова й тема можуть залишатися в постійному сховищі браузера після його закриття.',
          'Незавершений розклад Таро, його випадковий seed і дата для Нумерології використовують сесійне сховище браузера та зазвичай зникають після завершення браузерної сесії.',
          'Історія Таро обмежена вибраним лімітом. Після його зменшення найстаріші записи понад ліміт видаляються за умови успішного збереження.',
          'Приватний режим, обмеження квоти, очищення даних сайту або зміна пристрою можуть зробити локальні дані недоступними. Soul Arkana не може відновити їх із сервера.',
        ],
      },
      {
        title: 'Голос і мікрофон',
        paragraphs: [
          'Доступ до мікрофона запитується лише після вибору голосового кроку та запуску дозволу або запису. Цей крок можна пропустити.',
          'Запис тимчасово зберігається на сторінці для прослуховування й локальної перевірки якості. Він не зберігається постійно й не завантажується на сервер. Після виходу або перезавантаження тимчасовий запис звільняється; дозволом мікрофона керує браузер або пристрій.',
        ],
      },
      {
        title: 'Аналітика, відстеження та cookies',
        paragraphs: [
          'Зараз продукт не використовує аналітику, рекламу, пікселі відстеження, сторонні віджети або cookies. Сховище браузера потрібне лише для описаного локального стану, тому загальний cookie-банер не показується.',
        ],
      },
      {
        title: 'Як керувати локальними даними',
        items: [
          'Видалити окремий розклад або очистити всю збережену історію можна в Історії Таро.',
          'Скинути налаштування Таро можна в Налаштуваннях; тему й мову можна змінити будь-коли.',
          'Щоб відкинути тимчасові відповіді й результат Портрета, почніть шлях знову або перезавантажте сторінку.',
          'Закрийте браузерну сесію, щоб видалити session-only дані Нумерології та незавершеного Таро.',
          'У налаштуваннях браузера можна видалити всі дані сайту Soul Arkana зі сховища браузера. Це також видалить налаштування й не може бути скасовано Soul Arkana.',
        ],
      },
      {
        title: 'Зміни політики',
        paragraphs: [
          'Якщо Soul Arkana додасть API, аналітику, облікові записи, хмарне зберігання, платежі або іншу зовнішню обробку, політика й потрібні користувацькі вибори мають бути оновлені до ввімкнення цих змін.',
        ],
      },
    ],
  },
};

export const termsCopy: Record<Locale, LegalDocument> = {
  en: {
    effectiveDate: 'Draft for release review: 30 August 2026',
    eyebrow: 'LEGAL · TERMS',
    intro:
      'These terms describe the intended use of the current Soul Arkana web application. They remain subject to owner and legal approval before public launch.',
    ownerNotice:
      'Before public launch, these terms must name the approved legal operator, contact details, jurisdiction and final effective date.',
    title: 'Terms of Use',
    sections: [
      {
        title: 'A reflective, interpretive product',
        paragraphs: [
          'Soul Arkana provides Tarot, Numerology, Portrait, Journey and contextual interpretations for personal reflection and entertainment. Results are perspectives and prompts, not verified facts about you or guaranteed statements about the future.',
        ],
      },
      {
        title: 'Not professional advice',
        items: [
          'Soul Arkana does not provide medical or psychological diagnosis or treatment.',
          'Soul Arkana does not provide legal, financial or investment advice.',
          'Soul Arkana does not guarantee events, outcomes, compatibility or relationship certainty.',
          'Seek an appropriately qualified professional when a decision requires professional advice.',
        ],
      },
      {
        title: 'Your decisions and use',
        paragraphs: [
          'You remain responsible for how you interpret and use the product. Do not use a reading or portrait as the sole basis for a health, safety, legal, financial, employment or relationship decision.',
          'Use the product for your own reflection. Do not record another person or enter sensitive information about them without an appropriate right and permission.',
        ],
      },
      {
        title: 'Local data limitations',
        paragraphs: [
          'The current version stores certain information only in your browser. Clearing site data, using private browsing, changing browsers or devices, storage denial or browser failure may remove it. Soul Arkana does not currently maintain a server copy and cannot restore local data.',
        ],
      },
      {
        title: 'Availability',
        paragraphs: [
          'The service may change, pause or be unavailable. No uninterrupted or error-free operation is promised. Recovery actions and browser-local persistence are provided on a best-effort basis within the current implementation.',
        ],
      },
      {
        title: 'Product materials',
        paragraphs: [
          'Using Soul Arkana does not transfer ownership of its original interface, copy or approved artwork. Final ownership notices and any third-party attribution must be confirmed by the legal owner before public launch.',
        ],
      },
    ],
  },
  ru: {
    effectiveDate: 'Проект для релизной проверки: 30 августа 2026 года',
    eyebrow: 'ПРАВОВАЯ ИНФОРМАЦИЯ · УСЛОВИЯ',
    intro:
      'Эти условия описывают предполагаемое использование текущей веб-версии Soul Arkana. До публичного запуска они должны быть утверждены владельцем продукта и юридическим специалистом.',
    ownerNotice:
      'До публичного запуска здесь необходимо указать утверждённого юридического оператора, контактные данные, юрисдикцию и окончательную дату вступления в силу.',
    title: 'Условия использования',
    sections: [
      {
        title: 'Рефлексивный и интерпретационный продукт',
        paragraphs: [
          'Soul Arkana предлагает Таро, Нумерологию, Портрет, Journey и контекстные интерпретации для личной рефлексии и развлечения. Результаты — это ракурсы и вопросы, а не подтверждённые факты о вас и не гарантии будущего.',
        ],
      },
      {
        title: 'Не профессиональная консультация',
        items: [
          'Soul Arkana не проводит медицинскую или психологическую диагностику и не назначает лечение.',
          'Soul Arkana не предоставляет юридические, финансовые или инвестиционные советы.',
          'Soul Arkana не гарантирует события, результаты, совместимость или определённость отношений.',
          'Если решение требует профессиональной консультации, обратитесь к квалифицированному специалисту.',
        ],
      },
      {
        title: 'Ваши решения и использование',
        paragraphs: [
          'Вы сами отвечаете за интерпретацию и использование продукта. Не используйте расклад или портрет как единственное основание для решений о здоровье, безопасности, праве, финансах, работе или отношениях.',
          'Используйте продукт для собственной рефлексии. Не записывайте другого человека и не вводите его чувствительные данные без надлежащего права и разрешения.',
        ],
      },
      {
        title: 'Ограничения локальных данных',
        paragraphs: [
          'Текущая версия хранит часть информации только в вашем браузере. Очистка данных сайта, приватный режим, смена браузера или устройства, запрет хранилища или сбой браузера могут удалить её. Soul Arkana не хранит серверную копию и не может восстановить локальные данные.',
        ],
      },
      {
        title: 'Доступность',
        paragraphs: [
          'Сервис может изменяться, приостанавливаться или быть недоступен. Бесперебойная и безошибочная работа не гарантируется. Восстановление и локальное сохранение работают в пределах возможностей текущей реализации.',
        ],
      },
      {
        title: 'Материалы продукта',
        paragraphs: [
          'Использование Soul Arkana не передаёт права на оригинальный интерфейс, тексты или утверждённые иллюстрации. Итоговые сведения о правообладателе и необходимые атрибуции должны быть подтверждены юридическим владельцем до публичного запуска.',
        ],
      },
    ],
  },
  uk: {
    effectiveDate: 'Проєкт для релізної перевірки: 30 серпня 2026 року',
    eyebrow: 'ПРАВОВА ІНФОРМАЦІЯ · УМОВИ',
    intro:
      'Ці умови описують передбачене використання поточної вебверсії Soul Arkana. До публічного запуску їх мають затвердити власник продукту та юридичний фахівець.',
    ownerNotice:
      'До публічного запуску тут необхідно вказати затвердженого юридичного оператора, контактні дані, юрисдикцію та остаточну дату набрання чинності.',
    title: 'Умови використання',
    sections: [
      {
        title: 'Рефлексивний та інтерпретаційний продукт',
        paragraphs: [
          'Soul Arkana пропонує Таро, Нумерологію, Портрет, Journey і контекстні інтерпретації для особистої рефлексії та розваги. Результати — це ракурси й запитання, а не підтверджені факти про вас і не гарантії майбутнього.',
        ],
      },
      {
        title: 'Не професійна консультація',
        items: [
          'Soul Arkana не проводить медичну або психологічну діагностику й не призначає лікування.',
          'Soul Arkana не надає юридичних, фінансових або інвестиційних порад.',
          'Soul Arkana не гарантує подій, результатів, сумісності або визначеності стосунків.',
          'Якщо рішення потребує професійної консультації, зверніться до кваліфікованого фахівця.',
        ],
      },
      {
        title: 'Ваші рішення та використання',
        paragraphs: [
          'Ви самі відповідаєте за інтерпретацію та використання продукту. Не використовуйте розклад або портрет як єдину підставу для рішень щодо здоров’я, безпеки, права, фінансів, роботи чи стосунків.',
          'Використовуйте продукт для власної рефлексії. Не записуйте іншу людину й не вводьте її чутливі дані без належного права та дозволу.',
        ],
      },
      {
        title: 'Обмеження локальних даних',
        paragraphs: [
          'Поточна версія зберігає частину інформації лише у вашому браузері. Очищення даних сайту, приватний режим, зміна браузера чи пристрою, заборона сховища або збій браузера можуть видалити її. Soul Arkana не зберігає серверної копії й не може відновити локальні дані.',
        ],
      },
      {
        title: 'Доступність',
        paragraphs: [
          'Сервіс може змінюватися, призупинятися або бути недоступним. Безперервна й безпомилкова робота не гарантується. Відновлення та локальне збереження працюють у межах можливостей поточної реалізації.',
        ],
      },
      {
        title: 'Матеріали продукту',
        paragraphs: [
          'Використання Soul Arkana не передає права на оригінальний інтерфейс, тексти або затверджені ілюстрації. Остаточні відомості про правовласника й потрібні атрибуції мають бути підтверджені юридичним власником до публічного запуску.',
        ],
      },
    ],
  },
};
