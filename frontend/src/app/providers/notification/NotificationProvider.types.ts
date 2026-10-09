import type { PropsWithChildren } from 'react';

import type { ToastTone } from '@shared/ui';
import type { Locale } from '@shared/i18n';

export type Notification = {
  id: string;
  message: string;
  resolveMessage?: (locale: Locale) => string;
  tone: ToastTone;
};

export type NotificationContextValue = {
  clear: () => void;
  dismiss: (id: string) => void;
  notifications: readonly Notification[];
  notify: (message: string | ((locale: Locale) => string), tone?: ToastTone) => string;
};

export type NotificationProviderProps = PropsWithChildren;
