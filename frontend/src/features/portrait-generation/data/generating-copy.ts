import type { Locale } from '@shared/i18n';

export const generatingCopy = {
  es: {
    eyebrow: 'Tus respuestas se conectan',
    title: 'Tu retrato toma forma',
    lead: 'Comparamos tus respuestas y mantenemos aparte las lecturas opcionales por fecha de nacimiento.',
    note: 'Tu retrato se abrirá automáticamente.',
    complete: 'Completado',
    current: 'En curso',
    pending: 'Pendiente',
  },
  en: {
    eyebrow: 'Your answers are connected',
    title: 'Assembling your portrait',
    lead: 'We compare your answers and keep optional birth-date insights separate.',
    note: 'Your portrait will open automatically.',
    complete: 'Complete',
    current: 'In progress',
    pending: 'Waiting',
  },
  ru: {
    eyebrow: 'Сопоставляем ваши ответы',
    title: 'Собираем ваш портрет',
    lead: 'Мы ищем связи в ответах, а дополнение по дате рождения показываем отдельно.',
    note: 'Портрет откроется автоматически.',
    complete: 'Завершено',
    current: 'Выполняется',
    pending: 'Ожидает',
  },
  uk: {
    eyebrow: 'Зіставляємо ваші відповіді',
    title: 'Збираємо ваш портрет',
    lead: 'Ми шукаємо зв’язки у відповідях, а доповнення за датою народження показуємо окремо.',
    note: 'Портрет відкриється автоматично.',
    complete: 'Завершено',
    current: 'Виконується',
    pending: 'Очікує',
  },
} as const satisfies Record<Locale, unknown>;
