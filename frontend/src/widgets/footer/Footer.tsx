import { appConfig } from '@shared/config';
import { Typography } from '@shared/ui';

import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.root}>
      <Typography as="span" variant="caption">
        © {appConfig.name}
      </Typography>
    </footer>
  );
}
