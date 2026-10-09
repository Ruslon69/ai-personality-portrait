import type { Locale } from '@shared/i18n';

type Copy = {
  highDescription: string;
  highLabel: string;
  mediumDescription: string;
  mediumLabel: string;
  lowDescription: string;
  lowLabel: string;
  tentativeLead: string;
};
export const confidenceCopy: Record<Locale, Copy> = {
  es: {
    highDescription: 'Aparece en varias de tus respuestas',
    highLabel: 'Alto',
    mediumDescription: 'Aparece en dos respuestas relacionadas',
    mediumLabel: 'Medio',
    lowDescription: 'Basado en información limitada',
    lowLabel: 'Bajo',
    tentativeLead: 'Es una observación provisional basada en una sola elección.',
  },
  en: {
    highDescription: 'This shows up in several of your answers',
    highLabel: 'High',
    mediumDescription: 'This shows up in two related answers',
    mediumLabel: 'Medium',
    lowDescription: 'Based on limited information',
    lowLabel: 'Low',
    tentativeLead: 'This is a tentative observation based on one choice.',
  },
  uk: {
    highDescription: 'Це видно одразу в кількох ваших відповідях',
    highLabel: 'Висока',
    mediumDescription: 'Це видно у двох пов’язаних відповідях',
    mediumLabel: 'Середня',
    lowDescription: 'Висновок зроблено за обмеженою інформацією',
    lowLabel: 'Низька',
    tentativeLead: 'Це попереднє спостереження на основі однієї відповіді.',
  },
  ru: {
    highDescription: 'Это видно сразу в нескольких ваших ответах',
    highLabel: 'Высокая',
    mediumDescription: 'Это видно в двух связанных ответах',
    mediumLabel: 'Средняя',
    lowDescription: 'Вывод сделан на основе ограниченной информации',
    lowLabel: 'Низкая',
    tentativeLead: 'Это предварительное наблюдение по одному ответу.',
  },
};
