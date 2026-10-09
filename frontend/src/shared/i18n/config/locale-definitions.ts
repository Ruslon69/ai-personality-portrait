// Register language names and formatting conventions here. Translation content
// remains in the existing typed dictionaries; no language-specific routes.
export const localeDefinitions = {
  ru: {
    label: 'Русский',
    shortLabel: 'RU',
    htmlLang: 'ru',
    script: 'cyrillic',
    formatTag: 'ru-RU',
    enabled: true,
    status: 'production',
  },
  en: {
    label: 'English',
    shortLabel: 'EN',
    htmlLang: 'en',
    script: 'latin',
    formatTag: 'en-GB',
    enabled: true,
    status: 'production',
  },
  uk: {
    label: 'Українська',
    shortLabel: 'UK',
    htmlLang: 'uk',
    script: 'cyrillic',
    formatTag: 'uk-UA',
    enabled: true,
    status: 'production',
  },
  es: {
    label: 'Español',
    shortLabel: 'ES',
    htmlLang: 'es',
    script: 'latin',
    formatTag: 'es',
    enabled: true,
    status: 'production',
  },
} as const;
