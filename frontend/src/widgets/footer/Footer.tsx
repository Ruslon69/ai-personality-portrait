import { appConfig, ROUTES } from '@shared/config';
import type { AppRoutePath } from '@shared/config';
import { useRouter } from '@router/navigation';
import { useI18n } from '@shared/i18n';
import { Typography } from '@shared/ui';

import styles from './Footer.module.css';

export function Footer() {
  const { navigate } = useRouter();
  const { messages } = useI18n();

  const navigateTo = (path: AppRoutePath) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    navigate(path);
  };

  return (
    <footer className={styles.root}>
      <Typography as="span" variant="caption">
        © {appConfig.name} · {messages.shell.footer}
      </Typography>
      <nav aria-label={messages.shell.legal.label} className={styles.legal}>
        <a href={ROUTES.privacy} onClick={navigateTo(ROUTES.privacy)}>
          {messages.shell.legal.privacy}
        </a>
        <a href={ROUTES.terms} onClick={navigateTo(ROUTES.terms)}>
          {messages.shell.legal.terms}
        </a>
      </nav>
    </footer>
  );
}
