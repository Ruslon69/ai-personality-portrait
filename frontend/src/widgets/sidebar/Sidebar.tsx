import { useEffect, useRef } from 'react';

import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { Button, Typography } from '@shared/ui';

import { navigationItems } from './navigation';
import styles from './Sidebar.module.css';
import type { SidebarProps } from './Sidebar.types';

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isModifiedClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function Sidebar({ isDrawer, isOpen, onClose }: SidebarProps) {
  const { currentPath, navigate } = useRouter();
  const { messages } = useI18n();
  const sidebarRef = useRef<HTMLElement>(null);
  const isVisible = !isDrawer || isOpen;

  useEffect(() => {
    if (!isDrawer || !isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTarget = sidebarRef.current?.querySelector<HTMLElement>(
      '[aria-current="page"], button',
    );
    focusTarget?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isDrawer, isOpen, onClose]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!isDrawer || !isOpen || event.key !== 'Tab') {
      return;
    }

    const focusableElements = Array.from(
      sidebarRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    );
    const firstElement = focusableElements.at(0);
    const lastElement = focusableElements.at(-1);

    if (!firstElement || !lastElement) {
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <>
      {isDrawer && isOpen ? (
        <button
          aria-label={messages.shell.header.closeNavigation}
          className={styles.backdrop}
          onClick={onClose}
          tabIndex={-1}
          type="button"
        />
      ) : null}

      <aside
        aria-label={messages.shell.navigation.sectionsLabel}
        aria-modal={isDrawer ? true : undefined}
        className={styles.root}
        data-drawer={isDrawer || undefined}
        hidden={!isVisible}
        id="app-sidebar"
        onKeyDown={handleKeyDown}
        ref={sidebarRef}
        role={isDrawer ? 'dialog' : undefined}
      >
        <div className={styles.heading}>
          <Typography as="span" variant="heading-sm">
            {messages.shell.navigation.label}
          </Typography>
          {isDrawer ? (
            <Button aria-label={messages.shell.navigation.closeLabel} onClick={onClose}>
              {messages.shell.navigation.close}
            </Button>
          ) : null}
        </div>

        <nav aria-label={messages.shell.navigation.sectionsLabel}>
          <ul className={styles.list}>
            {navigationItems.map((item) => {
              const isCurrent =
                currentPath === item.path ||
                (item.path !== ROUTES.home && currentPath.startsWith(`${item.path}/`));

              return (
                <li key={item.path}>
                  <a
                    aria-current={isCurrent ? 'page' : undefined}
                    className={styles.link}
                    href={item.path}
                    onClick={(event) => {
                      if (isModifiedClick(event)) {
                        return;
                      }

                      event.preventDefault();
                      navigate(item.path);
                      if (isDrawer) {
                        onClose();
                      }
                    }}
                  >
                    {messages.navigation[item.labelKey]}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
