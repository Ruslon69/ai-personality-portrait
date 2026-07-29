import type { AppProviderProps } from './AppProvider.types';
import { ErrorBoundary } from '../error-boundary';
import { NotificationProvider } from '../notification';
import { QueryProvider } from '../query';
import { ThemeProvider } from '../theme';

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
