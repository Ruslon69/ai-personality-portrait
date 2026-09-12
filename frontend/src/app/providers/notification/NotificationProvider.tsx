import { useCallback, useEffect, useMemo, useState } from 'react';

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
const notificationLifetimeMs = 6_000;

function NotificationToast({
  dismiss,
  notification,
}: {
  dismiss: (id: string) => void;
  notification: Notification;
}) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => dismiss(notification.id), notificationLifetimeMs);
    return () => window.clearTimeout(timeoutId);
  }, [dismiss, notification.id]);

  return <Toast tone={notification.tone}>{notification.message}</Toast>;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { locale } = useI18n();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback<NotificationContextValue['notify']>((message, tone = 'neutral') => {
    notificationSequence += 1;
    const id = `notification-${notificationSequence}`;

    setNotifications((current) =>
      current.some((notification) => notification.message === message && notification.tone === tone)
        ? current
        : [...current, { id, message, tone }],
    );
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
          <NotificationToast dismiss={dismiss} key={notification.id} notification={notification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
