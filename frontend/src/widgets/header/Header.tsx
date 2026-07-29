import { ThemeSwitcher } from '@features';
import { useRouter } from '@router';
import { appConfig, ROUTES } from '@shared/config';
import { Button, Typography } from '@shared/ui';

import styles from './Header.module.css';
import type { HeaderProps } from './Header.types';

function isModifiedClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function Header({ isMenuOpen, menuButtonRef, onMenuToggle }: HeaderProps) {
  const { navigate } = useRouter();

  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.leading}>
          <Button
            aria-controls="app-sidebar"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Закрыть навигацию' : 'Открыть навигацию'}
            className={styles.menuButton}
            onClick={onMenuToggle}
            ref={menuButtonRef}
          >
            Меню
          </Button>

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
          <ThemeSwitcher />
          <Button aria-label="Открыть настройки" onClick={() => navigate(ROUTES.settings)}>
            <span aria-hidden="true">⚙</span>
            <span className={styles.actionLabel}>Настройки</span>
          </Button>
          <Button aria-label="Меню пользователя пока недоступно" disabled>
            <span aria-hidden="true">П</span>
            <span className={styles.actionLabel}>Пользователь</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
