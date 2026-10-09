import type { Locale } from '@shared/i18n';

export const previewCopy = {
  es: {
    badge: 'Tu reflexión está lista',
    lead: 'Empieza con tres observaciones basadas en tus respuestas y en los detalles que has elegido añadir.',
    important: 'Ten en cuenta',
    caution:
      'No es un diagnóstico ni una definición definitiva de tu personalidad. Usa cada observación como una pregunta para reflexionar.',
    observationEyebrow: 'Primeras observaciones',
    observationTitle: 'Lo que ya podemos observar',
    recommendationEyebrow: 'Pequeñas acciones',
    recommendationTitle: 'Dos ideas para probar',
    continueEyebrow: 'Sigue explorando',
    continueTitle: 'Descubre cómo se conectan las observaciones',
    continueLead:
      'Continúa hacia las conexiones, el contexto y los pasos prácticos que hay detrás de estas observaciones.',
    open: 'Abrir el retrato completo',
  },
  en: {
    badge: 'Your reflection is ready',
    lead: 'Start with three observations based on your answers and the details you chose to add.',
    important: 'Important',
    caution:
      'This is not a diagnosis or a final definition of personality. Use each observation as a question to consider.',
    observationEyebrow: 'First observations',
    observationTitle: 'What may already be visible',
    recommendationEyebrow: 'Small actions',
    recommendationTitle: 'Two ideas you can test',
    continueEyebrow: 'Keep exploring',
    continueTitle: 'See how the observations work together',
    continueLead:
      'Continue to the connections, context and practical steps behind these observations.',
    open: 'Open full portrait',
  },
  ru: {
    badge: 'Ваш разбор готов',
    lead: 'Начните с трёх наблюдений по вашим ответам и выбранным дополнениям.',
    important: 'Важно',
    caution:
      'Это не диагноз и не окончательное определение личности. Используйте каждый вывод как повод поразмышлять о себе.',
    observationEyebrow: 'Первые наблюдения',
    observationTitle: 'Что можно заметить уже сейчас',
    recommendationEyebrow: 'Небольшие действия',
    recommendationTitle: 'Две идеи, которые легко проверить',
    continueEyebrow: 'Продолжить исследование',
    continueTitle: 'Посмотрите, как наблюдения работают вместе',
    continueLead: 'Продолжите, чтобы увидеть связи, контекст и практические шаги.',
    open: 'Открыть полный портрет',
  },
  uk: {
    badge: 'Ваш розбір готовий',
    lead: 'Почніть із трьох спостережень за вашими відповідями й обраними доповненнями.',
    important: 'Важливо',
    caution:
      'Це не діагноз і не остаточне визначення особистості. Використовуйте кожен висновок як привід поміркувати про себе.',
    observationEyebrow: 'Перші спостереження',
    observationTitle: 'Що можна помітити вже зараз',
    recommendationEyebrow: 'Невеликі дії',
    recommendationTitle: 'Дві ідеї, які легко перевірити',
    continueEyebrow: 'Продовжити дослідження',
    continueTitle: 'Подивіться, як спостереження працюють разом',
    continueLead: 'Продовжте, щоб побачити зв’язки, контекст і практичні кроки.',
    open: 'Відкрити повний портрет',
  },
} as const satisfies Record<Locale, unknown>;
