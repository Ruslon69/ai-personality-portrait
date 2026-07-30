import { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { messagesByLocale } from '../locales';
import type { I18nProviderProps, Locale } from '../types';
import { getInitialLocale, saveLocale } from '../utils';
import { I18nContext } from './I18nContext';

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    saveLocale(locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
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
