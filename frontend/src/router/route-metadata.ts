import { productBrand, ROUTES } from '@shared/config';
import type { Locale } from '@shared/i18n';

const routeTitles: Record<string, Record<Locale, string>> = {
  [ROUTES.compatibility]: {
    en: 'Compatibility',
    ru: 'Совместимость',
    uk: 'Сумісність',
  },
  [ROUTES.home]: { en: 'Home', ru: 'Главная', uk: 'Головна' },
  [ROUTES.numerology]: { en: 'By birth date', ru: 'По дате рождения', uk: 'За датою народження' },
  [ROUTES.numerologyProfile]: {
    en: 'Birth-date reading',
    ru: 'Разбор по дате рождения',
    uk: 'Розбір за датою народження',
  },
  [ROUTES.numerologyResult]: {
    en: 'Birth-date result',
    ru: 'Результат по дате рождения',
    uk: 'Результат за датою народження',
  },
  [ROUTES.portrait]: { en: 'Personal reflection', ru: 'Личный разбор', uk: 'Особистий розбір' },
  [ROUTES.portraitBirthDate]: {
    en: 'Add birth date',
    ru: 'Добавить дату рождения',
    uk: 'Додати дату народження',
  },
  [ROUTES.portraitGenerating]: {
    en: 'Creating your reflection',
    ru: 'Создание личного разбора',
    uk: 'Створення особистого розбору',
  },
  [ROUTES.portraitQuestions]: {
    en: 'Questions about you',
    ru: 'Вопросы о вас',
    uk: 'Запитання про вас',
  },
  [ROUTES.portraitResult]: {
    en: 'Personal reflection result',
    ru: 'Результат личного разбора',
    uk: 'Результат особистого розбору',
  },
  [ROUTES.portraitResultPreview]: {
    en: 'Portrait preview',
    ru: 'Предпросмотр портрета',
    uk: 'Попередній перегляд портрета',
  },
  [ROUTES.portraitVoice]: {
    en: 'Portrait voice step',
    ru: 'Голос для портрета',
    uk: 'Голос для портрета',
  },
  [ROUTES.privacy]: {
    en: 'Privacy Policy',
    ru: 'Политика приватности',
    uk: 'Політика приватності',
  },
  [ROUTES.profile]: { en: 'My results', ru: 'Мои результаты', uk: 'Мої результати' },
  [ROUTES.profileHistory]: { en: 'History', ru: 'История', uk: 'Історія' },
  [ROUTES.settings]: { en: 'Settings', ru: 'Настройки', uk: 'Налаштування' },
  [ROUTES.tarot]: { en: 'Tarot', ru: 'Таро', uk: 'Таро' },
  [ROUTES.tarotHistory]: {
    en: 'Tarot history',
    ru: 'История Таро',
    uk: 'Історія Таро',
  },
  [ROUTES.tarotReading]: {
    en: 'Tarot reading',
    ru: 'Расклад Таро',
    uk: 'Розклад Таро',
  },
  [ROUTES.tarotResult]: {
    en: 'Tarot result',
    ru: 'Результат Таро',
    uk: 'Результат Таро',
  },
  [ROUTES.terms]: {
    en: 'Terms of Use',
    ru: 'Условия использования',
    uk: 'Умови використання',
  },
};

const privateRoutes: ReadonlySet<string> = new Set([
  ROUTES.compatibility,
  ROUTES.numerologyProfile,
  ROUTES.numerologyResult,
  ROUTES.portraitBirthDate,
  ROUTES.portraitGenerating,
  ROUTES.portraitQuestions,
  ROUTES.portraitResult,
  ROUTES.portraitResultPreview,
  ROUTES.portraitVoice,
  ROUTES.profile,
  ROUTES.profileHistory,
  ROUTES.settings,
  ROUTES.tarotHistory,
  ROUTES.tarotReading,
  ROUTES.tarotResult,
]);

export type RouteDocumentMetadata = {
  robots: 'index, follow' | 'noindex, nofollow';
  title: string;
};

export function resolveRouteDocumentMetadata(path: string, locale: Locale): RouteDocumentMetadata {
  const routeTitle = routeTitles[path]?.[locale];
  const knownPublicRoute = Boolean(routeTitle) && !privateRoutes.has(path);

  return {
    robots: knownPublicRoute ? 'index, follow' : 'noindex, nofollow',
    title: `${routeTitle ?? (locale === 'en' ? 'Page not found' : locale === 'uk' ? 'Сторінку не знайдено' : 'Страница не найдена')} · ${productBrand.name}`,
  };
}
