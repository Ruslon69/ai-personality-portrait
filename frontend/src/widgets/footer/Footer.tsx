import { appConfig } from '@shared/config';
import { useI18n } from '@shared/i18n';
import { Typography } from '@shared/ui';

import styles from './Footer.module.css';

export function Footer() {
  const { messages } = useI18n();

  return (
    <footer className={styles.root}>
      <Typography as="span" variant="caption">
        © {appConfig.name} · {messages.shell.footer}
      </Typography>
    </footer>
  );
}
