import { productBrand, ROUTES } from '@shared/config';
import type { Locale } from '@shared/i18n';

const routeTitles: Record<string, Record<Locale, string>> = {
  [ROUTES.compatibility]: {
    en: 'Compatibility',
    ru: 'Совместимость',
    uk: 'Сумісність',
  },
  [ROUTES.home]: { en: 'Home', ru: 'Главная', uk: 'Головна' },
  [ROUTES.numerology]: { en: 'Numerology', ru: 'Нумерология', uk: 'Нумерологія' },
  [ROUTES.numerologyProfile]: {
    en: 'Numerology profile',
    ru: 'Нумерологический профиль',
    uk: 'Нумерологічний профіль',
  },
  [ROUTES.numerologyResult]: {
    en: 'Numerology result',
    ru: 'Результат нумерологии',
    uk: 'Результат нумерології',
  },
  [ROUTES.portrait]: { en: 'Portrait', ru: 'Портрет', uk: 'Портрет' },
  [ROUTES.portraitBirthDate]: {
    en: 'Portrait birth date',
    ru: 'Дата рождения для портрета',
    uk: 'Дата народження для портрета',
  },
  [ROUTES.portraitGenerating]: {
    en: 'Creating portrait',
    ru: 'Создание портрета',
    uk: 'Створення портрета',
  },
  [ROUTES.portraitQuestions]: {
    en: 'Portrait questions',
    ru: 'Вопросы портрета',
    uk: 'Запитання портрета',
  },
  [ROUTES.portraitResult]: {
    en: 'Portrait result',
    ru: 'Результат портрета',
    uk: 'Результат портрета',
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
  [ROUTES.profile]: { en: 'Journey', ru: 'Journey', uk: 'Journey' },
  [ROUTES.profileHistory]: { en: 'My Path', ru: 'Мой путь', uk: 'Мій шлях' },
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
