import type { PropsWithChildren } from 'react';

import type { ToastTone } from '@shared/ui';

export type Notification = {
  id: string;
  message: string;
  tone: ToastTone;
};

export type NotificationContextValue = {
  clear: () => void;
  dismiss: (id: string) => void;
  notifications: readonly Notification[];
  notify: (message: string, tone?: ToastTone) => string;
};

export type NotificationProviderProps = PropsWithChildren;
