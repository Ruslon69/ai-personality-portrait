import type { Locale } from '@shared/i18n';

import type { Notification } from './NotificationProvider.types';

export function notificationMessage(notification: Notification, locale: Locale): string {
  return notification.resolveMessage?.(locale) ?? notification.message;
}
