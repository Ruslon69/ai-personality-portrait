import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Toast } from '@shared/ui';
import { useI18n, type Locale } from '@shared/i18n';

import { NotificationContext } from './NotificationContext';
import { notificationMessage } from './notification-message';
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
  paused,
  locale,
}: {
  dismiss: (id: string) => void;
  notification: Notification;
  paused: boolean;
  locale: Locale;
}) {
  useEffect(() => {
    if (paused) return;
    const timeoutId = window.setTimeout(() => dismiss(notification.id), notificationLifetimeMs);
    return () => window.clearTimeout(timeoutId);
  }, [dismiss, notification.id, paused]);

  return <Toast tone={notification.tone}>{notificationMessage(notification, locale)}</Toast>;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { locale, messages } = useI18n();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateReserve = () => {
      document.documentElement.style.setProperty(
        '--sa-notification-reserve',
        `${viewport.getBoundingClientRect().height}px`,
      );
    };
    const observer = new ResizeObserver(updateReserve);
    observer.observe(viewport);
    updateReserve();
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--sa-notification-reserve');
    };
  }, []);

  const notify = useCallback<NotificationContextValue['notify']>(
    (message, tone = 'neutral') => {
      notificationSequence += 1;
      const id = `notification-${notificationSequence}`;
      const text = typeof message === 'function' ? message(locale) : message;
      const resolveMessage = typeof message === 'function' ? message : undefined;

      setNotifications((current) =>
        current.some(
          (notification) =>
            notificationMessage(notification, locale) === text && notification.tone === tone,
        )
          ? current
          : [...current, { id, message: text, resolveMessage, tone }],
      );
      return id;
    },
    [locale],
  );

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
        aria-label={messages.shell.notifications}
        className={styles.viewport}
        ref={viewportRef}
        tabIndex={notifications.length ? 0 : undefined}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        role="region"
      >
        {notifications.map((notification) => (
          <NotificationToast
            dismiss={dismiss}
            key={notification.id}
            notification={notification}
            locale={locale}
            paused={paused}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
