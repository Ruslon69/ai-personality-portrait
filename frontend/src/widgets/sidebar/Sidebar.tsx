import { useEffect, useRef } from 'react';

import { useRouter } from '@router/navigation';
import { ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { Button, Typography } from '@shared/ui';

import { navigationItems } from './navigation';
import styles from './Sidebar.module.css';
import type { SidebarProps } from './Sidebar.types';

function isModifiedClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function Sidebar({ isDrawer, isOpen, onClose }: SidebarProps) {
  const { currentPath, navigate } = useRouter();
  const { messages } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isDrawer || !dialog || !isOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('button')?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawer, isOpen]);

  const contents = (
    <>
      <div className={styles.heading}>
        <Typography as="span" variant="heading-sm">
          {messages.shell.navigation.label}
        </Typography>
        {isDrawer ? (
          <Button
            aria-label={messages.shell.navigation.closeLabel}
            onClick={onClose}
            prominence="quiet"
          >
            {messages.shell.navigation.close}
          </Button>
        ) : null}
      </div>
      <nav aria-label={messages.shell.navigation.sectionsLabel}>
        <ul className={styles.list}>
          {navigationItems.map((item) => {
            const isCurrent =
              currentPath === item.path ||
              (!('exact' in item) &&
                item.path !== ROUTES.home &&
                currentPath.startsWith(`${item.path}/`));
            return (
              <li key={item.path}>
                <a
                  aria-current={isCurrent ? 'page' : undefined}
                  className={styles.link}
                  href={item.path}
                  onClick={(event) => {
                    if (isModifiedClick(event)) return;
                    event.preventDefault();
                    navigate(item.path);
                    if (isDrawer) onClose();
                  }}
                >
                  {messages.navigation[item.labelKey]}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  return isDrawer ? (
    <dialog
      aria-label={messages.shell.navigation.sectionsLabel}
      className={styles.root}
      data-drawer="true"
      id="app-sidebar"
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      {contents}
    </dialog>
  ) : (
    <aside
      aria-label={messages.shell.navigation.sectionsLabel}
      className={styles.root}
      id="app-sidebar-rail"
    >
      {contents}
    </aside>
  );
}
