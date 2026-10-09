import type { Locale } from '@shared/i18n';

import type { VoiceRecordingIssue, VoiceRecordingStatus } from '../types';

type VoiceRecordingCopy = {
  actions: Record<
    | 'allow'
    | 'back'
    | 'checking'
    | 'continueWithout'
    | 'recordAgain'
    | 'requestAgain'
    | 'skip'
    | 'start'
    | 'stop'
    | 'use'
    | 'waiting',
    string
  >;
  errors: Record<
    | 'deviceLost'
    | 'genericPermission'
    | 'noDevice'
    | 'permissionDenied'
    | 'playback'
    | 'preparePlayback'
    | 'recorder'
    | 'stop'
    | 'unsupported'
    | 'unsupportedFormat',
    string
  >;
  introduction: { eyebrow: string; lead: string; title: string };
  issueMessages: Record<VoiceRecordingIssue, string>;
  panel: {
    currentDuration: (duration: string) => string;
    duration: string;
    maximum: (duration: string) => string;
    playback: string;
    playbackLabel: string;
    qualityBad: string;
    qualityGood: string;
    qualityLabel: string;
    recording: string;
    signal: string;
    spinnerPermission: string;
    spinnerValidation: string;
  };
  privacy: { eyebrow: string; items: readonly string[]; title: string };
  qualitySuccess: string;
  readingText: string;
  script: { duration: string; eyebrow: string; title: string };
  signal: Record<'detected' | 'good' | 'idle' | 'quiet' | 'unavailable', string>;
  skipMessage: string;
  statusDescriptions: Record<VoiceRecordingStatus, string>;
  statusLabels: Record<VoiceRecordingStatus, string>;
  workspaceLabel: string;
};

export const voiceRecordingCopy: Record<Locale, VoiceRecordingCopy> = {
  es: {
    actions: {
      allow: 'Permitir micrófono',
      back: 'Volver',
      checking: 'Revisando grabación',
      continueWithout: 'Continuar sin voz',
      recordAgain: 'Grabar de nuevo',
      requestAgain: 'Comprobar el micrófono de nuevo',
      skip: 'Omitir voz',
      start: 'Empezar a grabar',
      stop: 'Detener grabación',
      use: 'Usar grabación',
      waiting: 'Esperando permiso',
    },
    errors: {
      deviceLost:
        'El micrófono ha dejado de enviar audio. Revisa el dispositivo e inténtalo de nuevo.',
      genericPermission:
        'No se ha podido preparar el micrófono. Inténtalo de nuevo o continúa sin voz.',
      noDevice: 'No se ha encontrado un micrófono. Revisa la conexión o continúa sin voz.',
      permissionDenied:
        'No se ha concedido acceso al micrófono. Permítelo en los ajustes del navegador o continúa sin voz.',
      playback:
        'El navegador no ha podido reproducir esta grabación. Grábala de nuevo u omite la voz.',
      preparePlayback: 'No se ha podido preparar la reproducción. Graba de nuevo.',
      recorder: 'Ha ocurrido un error al grabar. Inténtalo de nuevo o continúa sin voz.',
      stop: 'La grabación no se ha detenido correctamente. Inténtalo de nuevo o continúa sin voz.',
      unsupported: 'Este navegador no permite grabar en el dispositivo. Puedes continuar sin voz.',
      unsupportedFormat:
        'El navegador no ha podido iniciar un formato de grabación compatible. Prueba otro navegador u omite la voz.',
    },
    introduction: {
      eyebrow: 'Paso opcional',
      lead: 'Una grabación breve añade observaciones solo sobre el habla en esta muestra. No define tu personalidad ni se usa para identificarte.',
      title: 'Añade voz a tu retrato',
    },
    issueMessages: {
      empty: 'No se ha detectado audio. Revisa el micrófono e inténtalo de nuevo.',
      'low-signal': 'La señal es muy baja. Prueba a hablar un poco más cerca del micrófono.',
      'too-long':
        'La grabación supera la duración máxima. Lee el texto de nuevo a tu ritmo natural.',
      'too-short': 'La grabación es demasiado breve. Lee todo el texto preparado.',
      'unsupported-format':
        'El navegador ha creado un formato de audio no compatible. Prueba otro navegador u omite la voz.',
    },
    panel: {
      currentDuration: (duration) => `Duración de la grabación actual: ${duration}`,
      duration: 'Duración',
      maximum: (duration) => `máximo ${duration}`,
      playback: 'Reproducción',
      playbackLabel: 'Reproducir la voz grabada',
      qualityBad: 'Conviene repetir la grabación',
      qualityGood: 'La grabación es adecuada',
      qualityLabel: 'Calidad técnica de la grabación',
      recording: 'Grabación',
      signal: 'Nivel de señal',
      spinnerPermission: 'Esperando permiso para el micrófono',
      spinnerValidation: 'Revisando la calidad técnica de la grabación',
    },
    privacy: {
      eyebrow: 'Privacidad',
      items: [
        'Puedes omitir la voz.',
        'El audio no se envía a ningún servidor.',
        'Por defecto, la grabación original se elimina después del análisis.',
        'La grabación no se conserva al recargar la página.',
      ],
      title: 'Tú decides sobre la grabación',
    },
    qualitySuccess: 'La calidad de la grabación es adecuada para el siguiente paso.',
    readingText:
      'Hoy he decidido cambiar un rato mi ruta habitual y caminar por una calle que no conocía. Hacía buen tiempo, me rodeaban los sonidos familiares de la ciudad y en las ventanas empezaban a encenderse las luces. Por el camino he visto una pequeña cafetería, me he detenido junto al escaparate y he pensado que a veces viene bien dejar espacio para descubrimientos inesperados. Después he retomado mis planes con la sensación de haber hecho una breve pausa. Ese momento sencillo me ha recordado que prestar atención a los detalles permite ver más, incluso cuando el día parece completamente normal.',
    script: {
      duration: 'Tiempo estimado de lectura: 30–45 segundos.',
      eyebrow: 'Texto para leer',
      title: 'Lee a tu ritmo natural',
    },
    signal: {
      detected: 'Señal detectada',
      good: 'El nivel de señal es suficiente',
      idle: 'El micrófono no está grabando',
      quiet: 'La señal sigue siendo muy baja',
      unavailable: 'No se puede medir la señal; la grabación continúa',
    },
    skipMessage: 'Continuando sin la parte de voz',
    statusDescriptions: {
      error: 'Puedes omitir la voz y continuar.',
      idle: 'El permiso solo se solicita cuando eliges una acción.',
      invalid: 'La grabación permanece solo en esta pestaña. Puedes intentarlo de nuevo.',
      'permission-denied': 'Puedes omitir la voz y continuar.',
      ready: 'El permiso está confirmado, pero la grabación aún no ha empezado.',
      recorded: 'La duración, el formato y el nivel de señal se revisan en tu dispositivo.',
      recording: 'Lee a tu ritmo natural. Puedes parar cuando quieras.',
      'requesting-permission': 'Confirma el acceso en el aviso del navegador.',
      unsupported: 'Puedes omitir la voz y continuar.',
      valid: 'Puedes reproducir la grabación, usarla o grabar de nuevo.',
      validating: 'La duración, el formato y el nivel de señal se revisan en tu dispositivo.',
    },
    statusLabels: {
      error: 'Requiere atención',
      idle: 'Micrófono apagado',
      invalid: 'Inténtalo de nuevo',
      'permission-denied': 'Acceso no concedido',
      ready: 'Micrófono listo',
      recorded: 'Grabación completada',
      recording: 'Grabando',
      'requesting-permission': 'Comprobando acceso',
      unsupported: 'Grabación no disponible',
      valid: 'Grabación lista',
      validating: 'Revisando grabación',
    },
    workspaceLabel: 'Preparación y grabación de voz',
  },
  en: {
    actions: {
      allow: 'Allow microphone',
      back: 'Back',
      checking: 'Checking recording',
      continueWithout: 'Continue without voice',
      recordAgain: 'Record again',
      requestAgain: 'Check microphone again',
      skip: 'Skip voice',
      start: 'Start recording',
      stop: 'Stop recording',
      use: 'Use recording',
      waiting: 'Waiting for permission',
    },
    errors: {
      deviceLost: 'The microphone stopped sending audio. Check the device and try again.',
      genericPermission:
        'The microphone could not be prepared. Try again or continue without voice.',
      noDevice: 'No microphone was found. Check the device connection or continue without voice.',
      permissionDenied:
        'Microphone access was not granted. Allow it in browser settings or continue without voice.',
      playback: 'The browser could not play this recording. Record it again or skip voice.',
      preparePlayback: 'The recording could not be prepared for playback. Please record it again.',
      recorder: 'An error occurred while recording. Try again or continue without voice.',
      stop: 'The recording could not stop correctly. Try again or continue without voice.',
      unsupported: 'This browser does not support local recording. You can continue without voice.',
      unsupportedFormat:
        'The browser could not start a supported recording format. Try another browser or skip voice.',
    },
    introduction: {
      eyebrow: 'Optional step',
      lead: 'A short recording adds observations only about speech in this sample. It does not define personality and is not used for identification.',
      title: 'Add voice to your portrait',
    },
    issueMessages: {
      empty: 'No audio data was detected. Check the microphone and try again.',
      'low-signal': 'The signal is too quiet. Try speaking a little closer to the microphone.',
      'too-long':
        'The recording exceeded the maximum length. Read the text again at a natural pace.',
      'too-short': 'The recording is too short. Read the prepared text in full.',
      'unsupported-format':
        'The browser created an unsupported audio format. Try another browser or skip voice.',
    },
    panel: {
      currentDuration: (duration) => `Current recording duration ${duration}`,
      duration: 'Duration',
      maximum: (duration) => `maximum ${duration}`,
      playback: 'Playback',
      playbackLabel: 'Play the recorded voice',
      qualityBad: 'Recording should be repeated',
      qualityGood: 'Recording is suitable',
      qualityLabel: 'Technical recording quality',
      recording: 'Recording',
      signal: 'Signal level',
      spinnerPermission: 'Waiting for microphone permission',
      spinnerValidation: 'Checking technical recording quality',
    },
    privacy: {
      eyebrow: 'Privacy',
      items: [
        'You can skip voice.',
        'Audio is not sent to a server.',
        'The source recording is deleted after analysis by default.',
        'The recording is not retained after a page refresh.',
      ],
      title: 'The recording stays under your control',
    },
    qualitySuccess: 'The recording quality is suitable for the next step.',
    readingText:
      'Today I decided to change my usual route for a while and walk down an unfamiliar street. The weather was calm, familiar city sounds surrounded me, and lights were already appearing in the windows. On the way I noticed a small café, paused by the window, and thought that it can be useful to leave room in the day for unexpected discoveries. Then I returned to my plans with the feeling of a short pause. This simple moment reminded me that attention to detail helps us notice more, even when the day seems completely ordinary.',
    script: {
      duration: 'Estimated reading time: 30–45 seconds.',
      eyebrow: 'Text to read',
      title: 'Read at your natural pace',
    },
    signal: {
      detected: 'Signal detected',
      good: 'Signal level is sufficient',
      idle: 'The microphone is not recording',
      quiet: 'The signal is still very quiet',
      unavailable: 'Signal measurement is unavailable; recording continues',
    },
    skipMessage: 'Continuing without the voice layer',
    statusDescriptions: {
      error: 'You can skip the voice step and continue.',
      idle: 'Permission is requested only after you take action.',
      invalid: 'The recording is stored only in this tab. You can safely try again.',
      'permission-denied': 'You can skip the voice step and continue.',
      ready: 'Permission is confirmed, but recording has not started yet.',
      recorded: 'The duration, format and signal level are being checked locally.',
      recording: 'Read at your natural pace. You can stop at any time.',
      'requesting-permission': 'Confirm access in the browser system prompt.',
      unsupported: 'You can skip the voice step and continue.',
      valid: 'You can play the recording, use it, or record again.',
      validating: 'The duration, format and signal level are being checked locally.',
    },
    statusLabels: {
      error: 'Needs attention',
      idle: 'Microphone off',
      invalid: 'Try again',
      'permission-denied': 'Access not granted',
      ready: 'Microphone ready',
      recorded: 'Recording complete',
      recording: 'Recording',
      'requesting-permission': 'Checking access',
      unsupported: 'Recording unavailable',
      valid: 'Recording ready',
      validating: 'Checking recording',
    },
    workspaceLabel: 'Voice preparation and recording',
  },
  ru: {
    actions: {
      allow: 'Разрешить микрофон',
      back: 'Назад',
      checking: 'Проверяем запись',
      continueWithout: 'Продолжить без голоса',
      recordAgain: 'Записать заново',
      requestAgain: 'Проверить микрофон снова',
      skip: 'Пропустить голос',
      start: 'Начать запись',
      stop: 'Остановить запись',
      use: 'Использовать запись',
      waiting: 'Ожидаем разрешение',
    },
    errors: {
      deviceLost: 'Микрофон перестал передавать звук. Проверьте устройство и попробуйте ещё раз.',
      genericPermission:
        'Не удалось подготовить микрофон. Попробуйте ещё раз или продолжите без голосового шага.',
      noDevice:
        'Микрофон не найден. Проверьте подключение устройства или продолжите без голосового шага.',
      permissionDenied:
        'Доступ к микрофону не предоставлен. Его можно разрешить в настройках браузера или продолжить без голоса.',
      playback:
        'Браузер не смог воспроизвести эту запись. Попробуйте записать её ещё раз или пропустите голос.',
      preparePlayback:
        'Не удалось подготовить запись для прослушивания. Попробуйте записать её ещё раз.',
      recorder: 'Во время записи произошла ошибка. Попробуйте ещё раз или продолжите без голоса.',
      stop: 'Запись не удалось корректно остановить. Попробуйте ещё раз или продолжите без голоса.',
      unsupported:
        'Этот браузер не поддерживает локальную запись. Можно продолжить без голосового шага.',
      unsupportedFormat:
        'Браузер не смог начать запись в поддерживаемом формате. Можно попробовать другой браузер или пропустить голос.',
    },
    introduction: {
      eyebrow: 'Необязательный этап',
      lead: 'Короткая запись добавит наблюдения только об особенностях речи в этом фрагменте. Она не определяет личность и не используется для идентификации.',
      title: 'Добавьте голос к портрету',
    },
    issueMessages: {
      empty: 'В записи не обнаружены аудиоданные. Проверьте микрофон и попробуйте ещё раз.',
      'low-signal':
        'Сигнал получился слишком тихим. Попробуйте говорить немного ближе к микрофону.',
      'too-long':
        'Запись превысила максимальную длительность. Прочитайте текст ещё раз без спешки.',
      'too-short': 'Запись получилась слишком короткой. Прочитайте подготовленный текст полностью.',
      'unsupported-format':
        'Браузер создал неподдерживаемый аудиоформат. Можно попробовать другой браузер или пропустить голос.',
    },
    panel: {
      currentDuration: (duration) => `Текущая длительность записи ${duration}`,
      duration: 'Длительность',
      maximum: (duration) => `максимум ${duration}`,
      playback: 'Прослушивание',
      playbackLabel: 'Прослушать записанный голос',
      qualityBad: 'Запись лучше повторить',
      qualityGood: 'Запись подходит',
      qualityLabel: 'Техническая оценка качества записи',
      recording: 'Запись',
      signal: 'Уровень сигнала',
      spinnerPermission: 'Ожидаем разрешение на использование микрофона',
      spinnerValidation: 'Проверяем техническое качество записи',
    },
    privacy: {
      eyebrow: 'Приватность',
      items: [
        'Голос можно пропустить.',
        'Аудио не отправляется на сервер.',
        'Исходная запись удаляется после анализа по умолчанию.',
        'После обновления страницы запись не сохраняется.',
      ],
      title: 'Запись остаётся под вашим контролем',
    },
    qualitySuccess: 'Техническое качество записи подходит для следующего шага.',
    readingText:
      'Сегодня я решил ненадолго изменить привычный маршрут и пройтись по незнакомой улице. Погода была спокойной, вокруг слышались обычные городские звуки, а в окнах уже зажигался свет. По дороге я заметил небольшое кафе, остановился у витрины и подумал, что иногда полезно оставлять в дне место для случайных открытий. Потом я вернулся к своим делам, сохранив ощущение короткой паузы. Этот простой момент напомнил мне, что внимание к деталям помогает замечать больше, даже когда день кажется совершенно обычным.',
    script: {
      duration: 'Ориентировочное время чтения — 30–45 секунд.',
      eyebrow: 'Текст для чтения',
      title: 'Прочитайте в привычном темпе',
    },
    signal: {
      detected: 'Сигнал обнаружен',
      good: 'Уровень сигнала достаточный',
      idle: 'Микрофон сейчас не записывает',
      quiet: 'Сигнал пока очень тихий',
      unavailable: 'Измерение уровня недоступно, запись продолжается',
    },
    skipMessage: 'Продолжаем без записи голоса',
    statusDescriptions: {
      error: 'Голосовой этап можно пропустить и продолжить личный разбор.',
      idle: 'Доступ запрашивается только после вашего действия.',
      invalid: 'Запись сохранена только в этой вкладке. Можно спокойно повторить попытку.',
      'permission-denied': 'Голосовой этап можно пропустить и продолжить личный разбор.',
      ready: 'Доступ проверен, но запись ещё не началась.',
      recorded: 'Локально проверяем длительность, формат и уровень сигнала.',
      recording: 'Читайте текст в привычном темпе. Остановить запись можно в любой момент.',
      'requesting-permission': 'Подтвердите доступ в системном окне браузера.',
      unsupported: 'Голосовой этап можно пропустить и продолжить личный разбор.',
      valid: 'Можно прослушать запись, использовать её или записать заново.',
      validating: 'Локально проверяем длительность, формат и уровень сигнала.',
    },
    statusLabels: {
      error: 'Нужна проверка',
      idle: 'Микрофон выключен',
      invalid: 'Лучше повторить',
      'permission-denied': 'Доступ не предоставлен',
      ready: 'Микрофон готов',
      recorded: 'Запись завершена',
      recording: 'Идёт запись',
      'requesting-permission': 'Проверяем доступ',
      unsupported: 'Запись недоступна',
      valid: 'Запись готова',
      validating: 'Проверяем запись',
    },
    workspaceLabel: 'Подготовка и запись голоса',
  },
  uk: {
    actions: {
      allow: 'Дозволити мікрофон',
      back: 'Назад',
      checking: 'Перевіряємо запис',
      continueWithout: 'Продовжити без голосу',
      recordAgain: 'Записати знову',
      requestAgain: 'Перевірити мікрофон знову',
      skip: 'Пропустити голос',
      start: 'Почати запис',
      stop: 'Зупинити запис',
      use: 'Використати запис',
      waiting: 'Очікуємо дозволу',
    },
    errors: {
      deviceLost: 'Мікрофон перестав передавати звук. Перевірте пристрій і спробуйте ще раз.',
      genericPermission:
        'Не вдалося підготувати мікрофон. Спробуйте ще раз або продовжте без голосу.',
      noDevice: 'Мікрофон не знайдено. Перевірте підключення пристрою або продовжте без голосу.',
      permissionDenied:
        'Доступ до мікрофона не надано. Дозвольте його в налаштуваннях браузера або продовжте без голосу.',
      playback: 'Браузер не зміг відтворити цей запис. Запишіть його знову або пропустіть голос.',
      preparePlayback: 'Не вдалося підготувати запис до прослуховування. Запишіть його ще раз.',
      recorder: 'Під час запису сталася помилка. Спробуйте ще раз або продовжте без голосу.',
      stop: 'Не вдалося коректно зупинити запис. Спробуйте ще раз або продовжте без голосу.',
      unsupported: 'Цей браузер не підтримує локальний запис. Можна продовжити без голосу.',
      unsupportedFormat:
        'Браузер не зміг почати запис у підтримуваному форматі. Спробуйте інший браузер або пропустіть голос.',
    },
    introduction: {
      eyebrow: 'Необов’язковий крок',
      lead: 'Короткий запис додасть спостереження лише про особливості мовлення в цьому фрагменті. Він не визначає особистість і не використовується для ідентифікації.',
      title: 'Додайте голос до портрета',
    },
    issueMessages: {
      empty: 'У записі не виявлено аудіоданих. Перевірте мікрофон і спробуйте ще раз.',
      'low-signal': 'Сигнал надто тихий. Спробуйте говорити трохи ближче до мікрофона.',
      'too-long':
        'Запис перевищив максимальну тривалість. Прочитайте текст ще раз у природному темпі.',
      'too-short': 'Запис надто короткий. Прочитайте підготовлений текст повністю.',
      'unsupported-format':
        'Браузер створив непідтримуваний аудіоформат. Спробуйте інший браузер або пропустіть голос.',
    },
    panel: {
      currentDuration: (duration) => `Поточна тривалість запису ${duration}`,
      duration: 'Тривалість',
      maximum: (duration) => `максимум ${duration}`,
      playback: 'Прослуховування',
      playbackLabel: 'Прослухати записаний голос',
      qualityBad: 'Запис краще повторити',
      qualityGood: 'Запис підходить',
      qualityLabel: 'Технічна оцінка якості запису',
      recording: 'Запис',
      signal: 'Рівень сигналу',
      spinnerPermission: 'Очікуємо дозволу на використання мікрофона',
      spinnerValidation: 'Перевіряємо технічну якість запису',
    },
    privacy: {
      eyebrow: 'Приватність',
      items: [
        'Голос можна пропустити.',
        'Аудіо не надсилається на сервер.',
        'Початковий запис типово видаляється після аналізу.',
        'Після оновлення сторінки запис не зберігається.',
      ],
      title: 'Запис залишається під вашим контролем',
    },
    qualitySuccess: 'Технічна якість запису підходить для наступного кроку.',
    readingText:
      'Сьогодні я вирішив ненадовго змінити звичний маршрут і пройтися незнайомою вулицею. Погода була спокійною, навколо лунали звичайні міські звуки, а у вікнах уже запалювалося світло. Дорогою я помітив невелике кафе, зупинився біля вітрини й подумав, що іноді корисно залишати в дні місце для випадкових відкриттів. Потім я повернувся до своїх справ, зберігши відчуття короткої паузи. Цей простий момент нагадав мені, що увага до деталей допомагає помічати більше, навіть коли день здається цілком звичайним.',
    script: {
      duration: 'Орієнтовний час читання — 30–45 секунд.',
      eyebrow: 'Текст для читання',
      title: 'Читайте у звичному темпі',
    },
    signal: {
      detected: 'Сигнал виявлено',
      good: 'Рівень сигналу достатній',
      idle: 'Мікрофон зараз не записує',
      quiet: 'Сигнал поки дуже тихий',
      unavailable: 'Вимірювання рівня недоступне, запис триває',
    },
    skipMessage: 'Продовжуємо без запису голосу',
    statusDescriptions: {
      error: 'Голосовий крок можна пропустити й продовжити.',
      idle: 'Доступ запитується лише після вашої дії.',
      invalid: 'Запис зберігається лише в цій вкладці. Можна спокійно спробувати ще раз.',
      'permission-denied': 'Голосовий крок можна пропустити й продовжити.',
      ready: 'Доступ підтверджено, але запис ще не розпочався.',
      recorded: 'Локально перевіряємо тривалість, формат і рівень сигналу.',
      recording: 'Читайте у звичному темпі. Запис можна зупинити будь-коли.',
      'requesting-permission': 'Підтвердьте доступ у системному вікні браузера.',
      unsupported: 'Голосовий крок можна пропустити й продовжити.',
      valid: 'Можна прослухати запис, використати його або записати знову.',
      validating: 'Локально перевіряємо тривалість, формат і рівень сигналу.',
    },
    statusLabels: {
      error: 'Потрібна перевірка',
      idle: 'Мікрофон вимкнено',
      invalid: 'Краще повторити',
      'permission-denied': 'Доступ не надано',
      ready: 'Мікрофон готовий',
      recorded: 'Запис завершено',
      recording: 'Триває запис',
      'requesting-permission': 'Перевіряємо доступ',
      unsupported: 'Запис недоступний',
      valid: 'Запис готовий',
      validating: 'Перевіряємо запис',
    },
    workspaceLabel: 'Підготовка й запис голосу',
  },
};
