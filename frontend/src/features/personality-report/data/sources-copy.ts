import type { ProfileLocale, ProfileSourceStatus } from '@entities/personality-profile';

export const sourcesCopy: Record<
  ProfileLocale,
  {
    description: string;
    eyebrow: string;
    status: Record<ProfileSourceStatus, string>;
    title: string;
  }
> = {
  es: {
    description: 'Las observaciones, interpretaciones y recomendaciones se mantienen separadas.',
    eyebrow: 'Fuentes',
    status: { included: 'Incluida', interpretation: 'Lectura opcional', omitted: 'No utilizada' },
    title: 'Descubre en qué se basa cada conclusión',
  },
  en: {
    description: 'Observations, interpretations and recommendations remain separate.',
    eyebrow: 'Sources',
    status: { included: 'Included', interpretation: 'Optional reading', omitted: 'Not used' },
    title: 'See what each conclusion is based on',
  },
  ru: {
    description: 'Наблюдения, дополнительные разборы и советы показаны отдельно.',
    eyebrow: 'Источники выводов',
    status: { included: 'Учтено', interpretation: 'Доп. разбор', omitted: 'Не использовано' },
    title: 'Понятно, на чём основан каждый вывод',
  },
  uk: {
    description: 'Спостереження, додаткові розбори й поради показано окремо.',
    eyebrow: 'Джерела висновків',
    status: { included: 'Враховано', interpretation: 'Дод. розбір', omitted: 'Не використано' },
    title: 'Зрозуміло, на чому ґрунтується кожен висновок',
  },
};
