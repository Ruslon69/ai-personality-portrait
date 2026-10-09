import { LanguageSwitcher } from '@features/language-switcher';
import { ThemeSwitcher } from '@features/theme-switcher';
import { useRouter } from '@router/navigation';
import { appConfig, ROUTES } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { BrandIdentity, Button } from '@shared/ui';

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
  showMenu = false,
  variant = 'application',
}: HeaderProps) {
  const { navigate } = useRouter();
  const { messages } = useI18n();
  const isMarketing = variant === 'marketing';

  return (
    <header className={styles.root} data-variant={variant}>
      <div className={styles.inner}>
        <div className={styles.leading}>
          {!isMarketing || showMenu ? (
            <Button
              aria-controls="app-sidebar"
              aria-haspopup="dialog"
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
            aria-label={appConfig.brand.name}
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
            <BrandIdentity decorative variant="header" />
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
