import type { Locale } from '@shared/i18n';

export const routeCopy = {
  ru: {
    loading: 'Загрузка страницы',
    description:
      'Soul Arkana — расклады Таро, разбор по дате рождения и личные наблюдения для размышления о себе.',
  },
  es: {
    loading: 'Cargando página',
    description:
      'Soul Arkana: Tarot, lecturas por fecha de nacimiento y observaciones personales para reflexionar.',
  },
  en: {
    loading: 'Loading page',
    description:
      'Soul Arkana — Tarot readings, birth-date readings and personal observations for self-reflection.',
  },
  uk: {
    loading: 'Завантаження сторінки',
    description:
      'Soul Arkana — розклади Таро, розбір за датою народження й особисті спостереження для роздумів про себе.',
  },
} satisfies Record<Locale, { loading: string; description: string }>;
