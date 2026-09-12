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
  showSettings,
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
              <svg focusable="false" viewBox="0 0 48 48">
                <rect className={styles.logoCard} height="39" rx="4" width="30" x="9" y="4.5" />
                <path className={styles.logoPortal} d="M15.5 35V23.5a8.5 8.5 0 0 1 17 0V35" />
                <path className={styles.logoWick} d="M24 35V25.5M20.5 35h7" />
                <path
                  className={styles.logoFlame}
                  d="M24 24c-2.8-1.4-3.8-3.7-2.1-6.1.9-1.3 2.3-2.4 2.8-4.2 2.7 2.6 3.7 5.1 2.6 7.4-.6 1.4-1.8 2.4-3.3 2.9Z"
                />
                <path className={styles.logoOrbit} d="M13.2 14.2c5.5-5.4 14.8-7.2 22-2.4" />
                <circle className={styles.logoPoint} cx="35.2" cy="11.8" r="1.35" />
              </svg>
            </span>
            <Typography as="span" className={styles.projectName} variant="heading-sm">
              {appConfig.brand.displayName}
            </Typography>
          </a>
        </div>

        <div className={styles.actions}>
          <LanguageSwitcher />
          <ThemeSwitcher />
          {(showSettings ?? !isMarketing) ? (
            <>
              <Button
                aria-label={messages.shell.header.openSettings}
                className={styles.settingsAction}
                onClick={() => navigate(ROUTES.settings)}
              >
                <span aria-hidden="true">⚙</span>
                <span className={styles.actionLabel}>{messages.shell.header.settings}</span>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
