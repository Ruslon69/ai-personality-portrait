import type { ProfileLocale } from '@entities/personality-profile';

export const completionCopy = {
  es: {
    answers: 'Respuestas',
    answersCount: (count: number) =>
      `${count} ${count === 1 ? 'respuesta confirmada' : 'respuestas confirmadas'}.`,
    answersEmpty: 'Aún no has añadido respuestas.',
    voice: 'Voz',
    voiceIncluded: 'La grabación ha superado una revisión técnica. El audio no se ha guardado.',
    voiceSkipped: 'Se ha omitido el paso opcional de voz.',
    birth: 'Fecha de nacimiento',
    birthIncluded: 'Utilizada solo para las lecturas adicionales que has elegido.',
    birthSkipped: 'No se ha utilizado la fecha de nacimiento.',
    interests: 'Intereses',
    interestsCount: (count: number) =>
      `${count} ${count === 1 ? 'interés elegido' : 'intereses elegidos'}.`,
    interestsEmpty: 'No se han añadido intereses.',
  },
  en: {
    answers: 'Answers',
    answersCount: (count: number) =>
      count === 1 ? '1 confirmed answer.' : `${count} confirmed answers.`,
    answersEmpty: 'No answers added yet.',
    voice: 'Voice',
    voiceIncluded: 'The recording passed a technical check. The audio was not stored.',
    voiceSkipped: 'The optional voice step was skipped.',
    birth: 'Birth date',
    birthIncluded: 'Used only for the additional readings you selected.',
    birthSkipped: 'Birth date was not used.',
    interests: 'Interests',
    interestsCount: (count: number) =>
      count === 1 ? '1 selected interest.' : `${count} selected interests.`,
    interestsEmpty: 'No interests were added.',
  },
  ru: {
    answers: 'Ответы',
    answersCount: (count: number) => `Подтверждённых ответов: ${count}.`,
    answersEmpty: 'Ответы пока не добавлены.',
    voice: 'Голос',
    voiceIncluded: 'Запись прошла техническую проверку. Само аудио не сохранено.',
    voiceSkipped: 'Необязательный голосовой шаг пропущен.',
    birth: 'Дата рождения',
    birthIncluded: 'Использована только для дополнительных разборов, которые вы выбрали.',
    birthSkipped: 'Дата рождения не использовалась.',
    interests: 'Интересы',
    interestsCount: (count: number) => `Добавлено интересов: ${count}.`,
    interestsEmpty: 'Интересы не были добавлены.',
  },
  uk: {
    answers: 'Відповіді',
    answersCount: (count: number) => `Підтверджених відповідей: ${count}.`,
    answersEmpty: 'Відповіді ще не додано.',
    voice: 'Голос',
    voiceIncluded: 'Запис пройшов технічну перевірку. Саме аудіо не збережено.',
    voiceSkipped: 'Необов’язковий голосовий крок пропущено.',
    birth: 'Дата народження',
    birthIncluded: 'Використано лише для додаткових розборів, які ви обрали.',
    birthSkipped: 'Дату народження не використано.',
    interests: 'Інтереси',
    interestsCount: (count: number) => `Додано інтересів: ${count}.`,
    interestsEmpty: 'Інтереси не додано.',
  },
} satisfies Record<ProfileLocale, unknown>;

export const sourceDetailsCopy = {
  es: {
    answers: (count: number) =>
      count === 1
        ? 'Se ha incluido 1 respuesta confirmada.'
        : `Se han incluido ${count} respuestas confirmadas.`,
    answersDetails:
      'Las opciones de respuesta revelan preferencias recurrentes en las situaciones descritas, pero no demuestran rasgos fijos.',
    voiceIncluded: 'La grabación actual ha superado una revisión técnica.',
    voiceSkipped: 'Se ha omitido el paso de voz.',
    voiceDetails:
      'El audio no se guarda en el perfil. Los datos técnicos de la grabación no se usan para identificar, diagnosticar ni extraer conclusiones sobre la personalidad.',
    birthIncluded: 'La fecha solo se ha utilizado en las interpretaciones elegidas.',
    birthSkipped: 'No se ha utilizado la fecha de nacimiento.',
    birthDetails:
      'La fecha de nacimiento no aumenta el grado de respaldo de las observaciones basadas en respuestas y no se usa para predecir.',
    interests: (count: number) =>
      count
        ? count === 1
          ? 'Se ha incluido 1 interés elegido.'
          : `Se han incluido ${count} intereses elegidos.`
        : 'No se han añadido intereses.',
    interestsDetails:
      'Solo se incluyen los intereses elegidos por la persona; el sistema no los deduce.',
    interpretation: 'Añadida como una lectura opcional separada.',
    interpretationDetails:
      'Esta lectura es para el entretenimiento y la reflexión. No es una conclusión científica ni confirma las observaciones basadas en tus respuestas.',
  },
  en: {
    answers: (count: number) =>
      count === 1
        ? '1 confirmed answer was included.'
        : `${count} confirmed answers were included.`,
    answersDetails:
      'Answer choices reveal repeated preferences in described situations, but do not prove fixed traits.',
    voiceIncluded: 'The current recording passed a technical check.',
    voiceSkipped: 'The voice step was skipped.',
    voiceDetails:
      'Audio is not stored in the profile. Recording metadata is not used for identification, diagnosis or personality inference.',
    birthIncluded: 'The date was used only in selected interpretations.',
    birthSkipped: 'Birth date was not used.',
    birthDetails:
      'Birth date does not increase confidence in answer-based observations and is not used for predictions.',
    interests: (count: number) =>
      count
        ? count === 1
          ? '1 selected interest was included.'
          : `${count} selected interests were included.`
        : 'No interests were added.',
    interestsDetails:
      'Only interests chosen by the user are included; the system does not infer them.',
    interpretation: 'Added as a separate optional reading.',
    interpretationDetails:
      'This reading is for entertainment and reflection. It is not a scientific conclusion and does not confirm observations based on your answers.',
  },
  ru: {
    answers: (count: number) => `Учтено подтверждённых ответов: ${count}.`,
    answersDetails:
      'Готовые варианты позволяют находить повторяющиеся предпочтения в описанных ситуациях, но не доказывают неизменные черты.',
    voiceIncluded: 'Текущая запись прошла техническую проверку.',
    voiceSkipped: 'Голосовой шаг пропущен.',
    voiceDetails:
      'Аудио не хранится в профиле. Технические метаданные записи не используются для идентификации, диагностики или определения личности.',
    birthIncluded: 'Дата использована только в выбранных дополнительных разборах.',
    birthSkipped: 'Дата рождения не использовалась.',
    birthDetails:
      'Дата рождения не повышает уверенность наблюдений по ответам и не используется для предсказаний.',
    interests: (count: number) =>
      count ? `Учтено выбранных интересов: ${count}.` : 'Интересы не были добавлены.',
    interestsDetails:
      'Учитываются только интересы, которые пользователь выбрал самостоятельно. Система не пытается вывести их из других данных.',
    interpretation: 'Добавлен как отдельный необязательный разбор.',
    interpretationDetails:
      'Этот разбор предназначен для развлечения и размышления о себе. Он не является научным выводом и не подтверждает наблюдения по вашим ответам.',
  },
  uk: {
    answers: (count: number) => `Враховано підтверджених відповідей: ${count}.`,
    answersDetails:
      'Варіанти відповідей допомагають знаходити повторювані вподобання в описаних ситуаціях, але не доводять незмінні риси.',
    voiceIncluded: 'Поточний запис пройшов технічну перевірку.',
    voiceSkipped: 'Голосовий крок пропущено.',
    voiceDetails:
      'Аудіо не зберігається у профілі. Метадані запису не використовуються для ідентифікації, діагностики чи визначення особистості.',
    birthIncluded: 'Дату використано лише в обраних додаткових розборах.',
    birthSkipped: 'Дату народження не використано.',
    birthDetails:
      'Дата народження не підвищує впевненість спостережень із відповідей і не використовується для передбачень.',
    interests: (count: number) =>
      count ? `Враховано обраних інтересів: ${count}.` : 'Інтереси не додано.',
    interestsDetails:
      'Враховуються лише інтереси, які користувач обрав самостійно; система не намагається їх вивести.',
    interpretation: 'Додано як окремий необов’язковий розбір.',
    interpretationDetails:
      'Цей розбір призначений для розваги й роздумів про себе. Він не є науковим висновком і не підтверджує спостереження за вашими відповідями.',
  },
} satisfies Record<ProfileLocale, unknown>;

export const profileCopy = {
  es: {
    communicationDescription:
      'Cómo el ritmo, la claridad y la conexión pueden influir en tus conversaciones.',
    communicationTitle: 'Cómo puede funcionar mejor el diálogo para ti',
    energyDescription: 'Condiciones para descansar que puedes probar en la vida cotidiana.',
    energyTitle: 'Qué puede devolverte claridad y energía',
    greeting: 'Tu retrato personal',
    introduction:
      'Este retrato se basa en tus respuestas y en las lecturas opcionales que has elegido. Tómalo como una reflexión, no como un diagnóstico ni una descripción fija de ti.',
    title: 'Retrato personal',
  },
  en: {
    communicationDescription: 'How pace, clarity and connection may shape your conversations.',
    communicationTitle: 'How dialogue may work best for you',
    energyDescription: 'Conditions for recovery that you can test in everyday life.',
    energyTitle: 'What may restore clarity and energy',
    greeting: 'Your personal portrait',
    introduction:
      'This portrait is based on your answers and any optional readings you chose. Treat it as something to reflect on, not a diagnosis or a fixed description of you.',
    title: 'Personal portrait',
  },
  ru: {
    communicationDescription: 'Как темп, ясность и контакт могут влиять на ваши разговоры.',
    communicationTitle: 'Как вам может быть удобнее вести диалог',
    energyDescription: 'Условия восстановления, которые можно проверить в собственной жизни.',
    energyTitle: 'Что может возвращать ясность и силы',
    greeting: 'Ваш персональный портрет',
    introduction:
      'Этот разбор основан на ваших ответах и дополнительных данных, которые вы выбрали. Используйте его для размышления о себе, а не как диагноз или окончательное описание личности.',
    title: 'Персональный портрет',
  },
  uk: {
    communicationDescription: 'Як темп, ясність і контакт можуть впливати на ваші розмови.',
    communicationTitle: 'Як вам може бути зручніше вести діалог',
    energyDescription: 'Умови відновлення, які можна перевірити у власному житті.',
    energyTitle: 'Що може повертати ясність і сили',
    greeting: 'Ваш персональний портрет',
    introduction:
      'Цей розбір ґрунтується на ваших відповідях і додаткових даних, які ви обрали. Використовуйте його для роздумів про себе, а не як діагноз чи остаточний опис особистості.',
    title: 'Персональний портрет',
  },
} satisfies Record<ProfileLocale, unknown>;
