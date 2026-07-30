import { LanguageSwitcher } from '@features/language-switcher';
import { ThemeSwitcher } from '@features/theme-switcher';
import { useRouter } from '@router/navigation';
import { appConfig, ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { Button, Typography } from '@shared/ui';

import styles from './Header.module.css';
import type { HeaderProps } from './Header.types';

function isModifiedClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function Header({
  isMenuOpen,
  menuButtonRef,
  onMenuToggle,
  variant = 'application',
}: HeaderProps) {
  const { navigate } = useRouter();
  const { messages } = useI18n();
  const isMarketing = variant === 'marketing';

  return (
    <header className={styles.root} data-variant={variant}>
      <div className={styles.inner}>
        <div className={styles.leading}>
          {!isMarketing ? (
            <Button
              aria-controls="app-sidebar"
              aria-expanded={isMenuOpen}
              aria-label={
                isMenuOpen
                  ? messages.shell.header.closeNavigation
                  : messages.shell.header.openNavigation
              }
              className={styles.menuButton}
              onClick={onMenuToggle}
              ref={menuButtonRef}
            >
              {messages.shell.header.menu}
            </Button>
          ) : null}

          <a
            className={styles.brand}
            href={ROUTES.home}
            onClick={(event) => {
              if (isModifiedClick(event)) {
                return;
              }

              event.preventDefault();
              navigate(ROUTES.home);
            }}
          >
            <span aria-hidden="true" className={styles.logo}>
              AP
            </span>
            <Typography as="span" className={styles.projectName} variant="heading-sm">
              {appConfig.name}
            </Typography>
          </a>
        </div>

        <div className={styles.actions}>
          <LanguageSwitcher />
          <ThemeSwitcher />
          {!isMarketing ? (
            <>
              <Button
                aria-label={messages.shell.header.openSettings}
                className={styles.settingsAction}
                onClick={() => navigate(ROUTES.settings)}
              >
                <span aria-hidden="true">⚙</span>
                <span className={styles.actionLabel}>{messages.shell.header.settings}</span>
              </Button>
              <Button
                aria-label={messages.shell.header.userMenuUnavailable}
                className={styles.userAction}
                disabled
              >
                <span aria-hidden="true">П</span>
                <span className={styles.actionLabel}>{messages.shell.header.userPlaceholder}</span>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
