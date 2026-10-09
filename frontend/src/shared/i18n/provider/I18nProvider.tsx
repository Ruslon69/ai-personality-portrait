import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { messagesByLocale } from '../locales';
import type { I18nProviderProps, Locale } from '../types';
import { getInitialLocale, saveLocale } from '../utils';
import { isSupportedLocale } from '../utils/locale';
import { localeDefinitions } from '../config/locale-definitions';
import { I18nContext } from './I18nContext';

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
  const initialLocale = useRef(locale);

  useLayoutEffect(() => {
    document.documentElement.lang = localeDefinitions[locale].htmlLang;
  }, [locale]);

  useLayoutEffect(() => {
    saveLocale(initialLocale.current);
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    if (!isSupportedLocale(nextLocale)) return false;
    setLocaleState(nextLocale);
    return saveLocale(nextLocale);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      messages: messagesByLocale[locale],
      setLocale,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
