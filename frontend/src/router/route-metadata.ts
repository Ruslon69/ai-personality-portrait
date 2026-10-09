import { productBrand, ROUTES } from '@shared/config';
import { messagesByLocale, resolveLocale, type Locale } from '@shared/i18n';
import { routeCopy } from './route-copy';

const routeTitles: Record<string, Record<Locale, string>> = {
  [ROUTES.compatibility]: {
    es: 'Compatibilidad',
    en: 'Compatibility',
    ru: 'Совместимость',
    uk: 'Сумісність',
  },
  [ROUTES.home]: { es: 'Inicio', en: 'Home', ru: 'Главная', uk: 'Головна' },
  [ROUTES.numerology]: {
    es: 'Por fecha de nacimiento',
    en: 'By birth date',
    ru: 'По дате рождения',
    uk: 'За датою народження',
  },
  [ROUTES.numerologyProfile]: {
    es: 'Lectura por fecha de nacimiento',
    en: 'Birth-date reading',
    ru: 'Разбор по дате рождения',
    uk: 'Розбір за датою народження',
  },
  [ROUTES.numerologyResult]: {
    es: 'Resultado por fecha de nacimiento',
    en: 'Birth-date result',
    ru: 'Результат по дате рождения',
    uk: 'Результат за датою народження',
  },
  [ROUTES.portrait]: { es: 'Retrato', en: 'Portrait', ru: 'Личный разбор', uk: 'Особистий розбір' },
  [ROUTES.portraitBirthDate]: {
    es: 'Añadir fecha de nacimiento',
    en: 'Add birth date',
    ru: 'Добавить дату рождения',
    uk: 'Додати дату народження',
  },
  [ROUTES.portraitGenerating]: {
    es: 'Creando tu retrato',
    en: 'Creating your portrait',
    ru: 'Создание личного разбора',
    uk: 'Створення особистого розбору',
  },
  [ROUTES.portraitQuestions]: {
    es: 'Preguntas sobre ti',
    en: 'Questions about you',
    ru: 'Вопросы о вас',
    uk: 'Запитання про вас',
  },
  [ROUTES.portraitResult]: {
    es: 'Resultado del retrato',
    en: 'Portrait result',
    ru: 'Результат личного разбора',
    uk: 'Результат особистого розбору',
  },
  [ROUTES.portraitResultPreview]: {
    es: 'Vista previa del retrato',
    en: 'Portrait preview',
    ru: 'Предпросмотр портрета',
    uk: 'Попередній перегляд портрета',
  },
  [ROUTES.portraitVoice]: {
    es: 'Voz para el retrato',
    en: 'Portrait voice step',
    ru: 'Голос для портрета',
    uk: 'Голос для портрета',
  },
  [ROUTES.privacy]: {
    es: 'Política de privacidad',
    en: 'Privacy Policy',
    ru: 'Политика приватности',
    uk: 'Політика приватності',
  },
  [ROUTES.profile]: {
    es: 'Mis resultados',
    en: 'My results',
    ru: 'Мои результаты',
    uk: 'Мої результати',
  },
  [ROUTES.profileHistory]: { es: 'Historial', en: 'History', ru: 'История', uk: 'Історія' },
  [ROUTES.settings]: { es: 'Ajustes', en: 'Settings', ru: 'Настройки', uk: 'Налаштування' },
  [ROUTES.tarot]: { es: 'Tarot', en: 'Tarot', ru: 'Таро', uk: 'Таро' },
  [ROUTES.tarotHistory]: {
    es: 'Historial de Tarot',
    en: 'Tarot history',
    ru: 'История Таро',
    uk: 'Історія Таро',
  },
  [ROUTES.tarotReading]: {
    es: 'Lectura de Tarot',
    en: 'Tarot reading',
    ru: 'Расклад Таро',
    uk: 'Розклад Таро',
  },
  [ROUTES.tarotResult]: {
    es: 'Resultado de Tarot',
    en: 'Tarot result',
    ru: 'Результат Таро',
    uk: 'Результат Таро',
  },
  [ROUTES.terms]: {
    es: 'Condiciones de uso',
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
  description: string;
};

export function resolveRouteDocumentMetadata(path: string, locale: Locale): RouteDocumentMetadata {
  const language = resolveLocale(locale);
  const routeTitle = routeTitles[path]?.[language];
  const knownPublicRoute = Boolean(routeTitle) && !privateRoutes.has(path);

  return {
    description: routeCopy[language].description,
    robots: knownPublicRoute ? 'index, follow' : 'noindex, nofollow',
    title: `${routeTitle ?? messagesByLocale[language].system.notFound.title} · ${productBrand.name}`,
  };
}
