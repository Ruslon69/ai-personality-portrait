import type { AppProviderProps } from './AppProvider.types';
import { I18nProvider } from '@shared/i18n';

import { ErrorBoundary } from '../error-boundary';
import { NotificationProvider } from '../notification';
import { QueryProvider } from '../query';
import { ThemeProvider } from '../theme';

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <QueryProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </QueryProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
