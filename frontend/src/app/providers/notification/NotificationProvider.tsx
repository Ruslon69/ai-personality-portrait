import { useCallback, useMemo, useState } from 'react';

import { Toast } from '@shared/ui';
import { useI18n } from '@shared/i18n';

import { NotificationContext } from './NotificationContext';
import styles from './NotificationProvider.module.css';
import type {
  Notification,
  NotificationContextValue,
  NotificationProviderProps,
} from './NotificationProvider.types';

let notificationSequence = 0;

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { locale } = useI18n();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback<NotificationContextValue['notify']>((message, tone = 'neutral') => {
    notificationSequence += 1;
    const id = `notification-${notificationSequence}`;

    setNotifications((current) => [...current, { id, message, tone }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const clear = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({ clear, dismiss, notifications, notify }),
    [clear, dismiss, notifications, notify],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        aria-label={
          locale === 'en' ? 'Notifications' : locale === 'uk' ? 'Сповіщення' : 'Уведомления'
        }
        className={styles.viewport}
        role="region"
      >
        {notifications.map((notification) => (
          <Toast key={notification.id} tone={notification.tone}>
            {notification.message}
          </Toast>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
