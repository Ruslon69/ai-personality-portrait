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
  es: {
    effectiveDate: 'Estado de la implementación: 31 de agosto de 2026',
    eyebrow: 'Información legal · Privacidad',
    intro:
      'Esta política explica cómo trata la información la aplicación web actual de Soul Arkana. El producto está diseñado para funcionar en tu navegador y actualmente no tiene cuentas, analítica ni almacenamiento de perfiles en un servidor.',
    ownerNotice:
      'Antes del lanzamiento público, esta política deberá indicar el operador legal aprobado, el contacto de privacidad y la jurisdicción aplicable.',
    title: 'Política de privacidad',
    sections: [
      {
        title: 'Información que eliges proporcionar',
        items: [
          'Fechas de nacimiento para Numerología opcional, contexto del zodiaco y contexto de Tarot.',
          'Temas de Tarot, respuestas, selección de cartas, orientaciones y lecturas completadas.',
          'Respuestas del retrato, intereses, fecha de nacimiento opcional y el retrato generado en tu dispositivo.',
          'Resultados guardados de lecturas de Tarot y de la actividad de la carta del día.',
          'Idioma de la interfaz, tema y preferencias de Tarot.',
          'Una muestra de voz opcional, grabada solo cuando inicias el proceso del micrófono.',
        ],
      },
      {
        title: 'Dónde se procesa la información',
        paragraphs: [
          'La aplicación actual realiza sus cálculos e interpretaciones en tu navegador. No envía activamente tus datos introducidos, lecturas, retrato, fecha de nacimiento ni grabación de voz a un servicio externo.',
          'Cloudflare Pages sirve la aplicación. Como infraestructura de alojamiento y distribución, Cloudflare puede procesar información habitual de las solicitudes, como la dirección IP, las cabeceras del navegador y del dispositivo, la URL solicitada, las marcas de tiempo y los registros de red o seguridad. Esto es distinto de que Soul Arkana envíe tus respuestas del retrato, selecciones de Tarot, datos de Numerología o grabación de voz: el código actual no envía esos datos a las API de Cloudflare ni a otro servicio externo.',
          'Las respuestas y los resultados del retrato permanecen en la memoria de la aplicación. No se escriben en el almacenamiento del navegador y dejan de estar disponibles al recargar la página o reiniciar la sesión de la aplicación.',
        ],
      },
      {
        title: 'Almacenamiento del navegador y conservación',
        items: [
          'Los resultados guardados, el historial y las preferencias de Tarot, la elección de baraja, el idioma y el tema pueden conservarse en el almacenamiento persistente del navegador después de cerrarlo.',
          'Una lectura de Tarot sin terminar, la información necesaria para retomar la selección de cartas y tu fecha de nacimiento de Numerología se conservan temporalmente en este navegador. Normalmente desaparecen al terminar la sesión del navegador.',
          'El historial de Tarot guardado tiene el límite que elijas. Al reducirlo, se eliminan las lecturas más antiguas que lo superen una vez guardado el cambio.',
          'Los modos privados del navegador, los límites de espacio, borrar los datos del sitio o cambiar de dispositivo pueden hacer que la información deje de estar disponible. Soul Arkana no puede recuperar desde un servidor los datos guardados solo en el navegador.',
        ],
      },
      {
        title: 'Voz y micrófono',
        paragraphs: [
          'El acceso al micrófono solo se solicita cuando eliges el paso de voz e inicias la acción de permiso o grabación. Puedes omitirlo.',
          'La grabación se mantiene temporalmente en la página para reproducirla y revisar su calidad en tu dispositivo. No se guarda de forma persistente ni se envía a un servidor. Al salir del proceso o recargarlo, se libera la grabación temporal. El permiso del micrófono sigue bajo el control de tu navegador o dispositivo.',
        ],
      },
      {
        title: 'Analítica, seguimiento y cookies',
        paragraphs: [
          'El producto actual no usa analítica, publicidad, píxeles de seguimiento, contenido incrustado de terceros ni cookies. El almacenamiento del navegador solo se usa para el estado del producto descrito arriba. Por eso no se muestra un aviso genérico de consentimiento de cookies.',
        ],
      },
      {
        title: 'Tus controles en el dispositivo',
        items: [
          'Elimina una lectura de Tarot guardada o vacía todo el historial de lecturas desde el Historial de Tarot.',
          'Restablece las preferencias de Tarot desde Ajustes o cambia el tema y el idioma cuando quieras.',
          'Empieza de nuevo el retrato o recarga la página para descartar sus respuestas y resultado temporales.',
          'Los datos temporales de Numerología y de Tarot sin terminar normalmente desaparecen al finalizar la sesión del navegador. Algunos navegadores restauran las sesiones; borrar los datos de este sitio en los ajustes del navegador también elimina esa información.',
          'Usa los controles de datos del sitio de tu navegador para eliminar el resto de la información de Soul Arkana. También se borrarán las preferencias y Soul Arkana no podrá deshacerlo.',
        ],
      },
      {
        title: 'Cambios en esta política',
        paragraphs: [
          'Si Soul Arkana añade una API, analítica, cuentas, almacenamiento en la nube, pagos u otro tratamiento externo, esta política y las opciones necesarias deberán actualizarse antes de activar esos cambios.',
        ],
      },
    ],
  },
  en: {
    effectiveDate: 'Current implementation snapshot: 31 August 2026',
    eyebrow: 'Legal · Privacy',
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
          'Saved results created from Tarot readings and daily-card activity.',
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
          'Saved results, Tarot history, Tarot preferences, deck choice, language and theme may remain in persistent browser storage after the browser closes.',
          'An unfinished Tarot reading, the information needed to resume its card selection, and your Numerology birth date are kept temporarily in this browser. They normally disappear when the browser session ends.',
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
          'Temporary Numerology and unfinished Tarot data normally disappear when the browser session ends. Some browsers restore sessions; clearing this site’s data in your browser settings also removes this information.',
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
    eyebrow: 'Правовая информация · Приватность',
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
          'Сохранённые результаты раскладов Таро и взаимодействия с картой дня.',
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
          'Сохранённые результаты, история Таро, настройки Таро, выбранная колода, язык и тема могут оставаться в постоянном хранилище браузера после его закрытия.',
          'Незавершённый расклад Таро, данные для продолжения выбора карт и дата для Нумерологии временно хранятся в этом браузере. Обычно они исчезают после завершения сессии браузера.',
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
          'Чтобы отбросить временные ответы и результат личного разбора, начните его заново или перезагрузите страницу.',
          'Временные данные Нумерологии и незавершённого Таро обычно исчезают после завершения сессии браузера. Некоторые браузеры восстанавливают сессии; очистка данных этого сайта в настройках браузера также удаляет эту информацию.',
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
    eyebrow: 'Правова інформація · Приватність',
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
          'Збережені результати розкладів Таро та взаємодії з картою дня.',
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
          'Збережені результати, історія Таро, налаштування Таро, вибрана колода, мова й тема можуть залишатися в постійному сховищі браузера після його закриття.',
          'Незавершений розклад Таро, дані для продовження вибору карт і дата для Нумерології тимчасово зберігаються в цьому браузері. Зазвичай вони зникають після завершення сесії браузера.',
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
          'Щоб відкинути тимчасові відповіді й результат особистого розбору, почніть його знову або перезавантажте сторінку.',
          'Тимчасові дані Нумерології та незавершеного Таро зазвичай зникають після завершення сесії браузера. Деякі браузери відновлюють сесії; очищення даних цього сайту в налаштуваннях браузера також видаляє цю інформацію.',
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
  es: {
    effectiveDate: 'Borrador para la revisión de lanzamiento: 30 de agosto de 2026',
    eyebrow: 'Información legal · Condiciones',
    intro:
      'Estas condiciones describen el uso previsto de la aplicación web actual de Soul Arkana. Antes del lanzamiento público deberán aprobarlas el propietario y los responsables legales.',
    ownerNotice:
      'Antes del lanzamiento público, estas condiciones deberán indicar el operador legal aprobado, los datos de contacto, la jurisdicción y la fecha definitiva de entrada en vigor.',
    title: 'Condiciones de uso',
    sections: [
      {
        title: 'Un producto para la reflexión y la interpretación',
        paragraphs: [
          'Soul Arkana ofrece lecturas de Tarot, cálculos por fecha de nacimiento y reflexiones personales para la autoexploración y el entretenimiento. Los resultados son perspectivas y propuestas, no hechos comprobados sobre ti ni garantías sobre el futuro.',
        ],
      },
      {
        title: 'No es asesoramiento profesional',
        items: [
          'Soul Arkana no ofrece diagnósticos ni tratamientos médicos o psicológicos.',
          'Soul Arkana no ofrece asesoramiento legal, financiero ni de inversión.',
          'Soul Arkana no garantiza acontecimientos, resultados, compatibilidad ni certezas en las relaciones.',
          'Consulta a un profesional con la cualificación adecuada cuando una decisión requiera asesoramiento especializado.',
        ],
      },
      {
        title: 'Tus decisiones y tu uso',
        paragraphs: [
          'Tú decides cómo interpretar y utilizar el producto. No uses una lectura o un retrato como única base para una decisión de salud, seguridad, legal, económica, laboral o de relaciones.',
          'Usa el producto para tu propia reflexión. No grabes a otra persona ni introduzcas información sensible sobre ella sin el derecho y el permiso adecuados.',
        ],
      },
      {
        title: 'Limitaciones de los datos en el navegador',
        paragraphs: [
          'La versión actual guarda cierta información solo en tu navegador. Borrar los datos del sitio, usar navegación privada, cambiar de navegador o dispositivo, denegar el almacenamiento o un fallo del navegador puede eliminarla. Soul Arkana no tiene actualmente una copia en el servidor y no puede restaurar esos datos.',
        ],
      },
      {
        title: 'Disponibilidad',
        paragraphs: [
          'El servicio puede cambiar, pausarse o no estar disponible. No se promete un funcionamiento ininterrumpido ni libre de errores. Las acciones de recuperación y la conservación en el navegador se ofrecen en la medida que permite la implementación actual.',
        ],
      },
      {
        title: 'Materiales del producto',
        paragraphs: [
          'Usar Soul Arkana no transfiere la propiedad de su interfaz original, sus textos ni las obras aprobadas. El propietario legal deberá confirmar los avisos definitivos de titularidad y las atribuciones a terceros antes del lanzamiento público.',
        ],
      },
    ],
  },
  en: {
    effectiveDate: 'Draft for release review: 30 August 2026',
    eyebrow: 'Legal · Terms',
    intro:
      'These terms describe the intended use of the current Soul Arkana web application. They remain subject to owner and legal approval before public launch.',
    ownerNotice:
      'Before public launch, these terms must name the approved legal operator, contact details, jurisdiction and final effective date.',
    title: 'Terms of Use',
    sections: [
      {
        title: 'A reflective, interpretive product',
        paragraphs: [
          'Soul Arkana provides Tarot readings, birth-date calculations and personal reflections for self-reflection and entertainment. Results are perspectives and prompts, not verified facts about you or guarantees about the future.',
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
    eyebrow: 'Правовая информация · Условия',
    intro:
      'Эти условия описывают предполагаемое использование текущей веб-версии Soul Arkana. До публичного запуска они должны быть утверждены владельцем продукта и юридическим специалистом.',
    ownerNotice:
      'До публичного запуска здесь необходимо указать утверждённого юридического оператора, контактные данные, юрисдикцию и окончательную дату вступления в силу.',
    title: 'Условия использования',
    sections: [
      {
        title: 'Продукт для размышления о себе',
        paragraphs: [
          'Soul Arkana предлагает расклады Таро, расчёты по дате рождения и личные разборы для размышления о себе и развлечения. Результаты помогают посмотреть на ситуацию и задать вопросы, но не являются подтверждёнными фактами о вас или гарантиями будущего.',
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
          'Используйте продукт, чтобы поразмышлять о себе. Не записывайте другого человека и не вводите его чувствительные данные без надлежащего права и разрешения.',
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
    eyebrow: 'Правова інформація · Умови',
    intro:
      'Ці умови описують передбачене використання поточної вебверсії Soul Arkana. До публічного запуску їх мають затвердити власник продукту та юридичний фахівець.',
    ownerNotice:
      'До публічного запуску тут необхідно вказати затвердженого юридичного оператора, контактні дані, юрисдикцію та остаточну дату набрання чинності.',
    title: 'Умови використання',
    sections: [
      {
        title: 'Продукт для роздумів про себе',
        paragraphs: [
          'Soul Arkana пропонує розклади Таро, розрахунки за датою народження й особисті розбори для роздумів про себе та розваги. Результати допомагають поглянути на ситуацію й поставити запитання, але не є підтвердженими фактами про вас або гарантіями майбутнього.',
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
          'Використовуйте продукт, щоб поміркувати про себе. Не записуйте іншу людину й не вводьте її чутливі дані без належного права та дозволу.',
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
