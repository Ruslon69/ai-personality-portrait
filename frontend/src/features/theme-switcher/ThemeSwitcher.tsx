import { useTheme } from '@app/providers/theme';
import { formatMessage, useI18n } from '@shared/i18n';
import { Button } from '@shared/ui';

import styles from './ThemeSwitcher.module.css';
import { getNextTheme } from './theme-cycle';
import type { ThemeSwitcherProps } from './ThemeSwitcher.types';

export function ThemeSwitcher({ className, ...props }: ThemeSwitcherProps) {
  const { setTheme, theme } = useTheme();
  const { messages } = useI18n();
  const next = getNextTheme(theme);
  const classes = [styles.root, className].filter(Boolean).join(' ');
  const themeMessages = messages.shell.theme;
  const currentLabel = themeMessages.modes[theme];
  const nextLabel = themeMessages.modes[next];
  const shortLabel = themeMessages.shortModes[theme];

  return (
    <Button
      aria-label={formatMessage(themeMessages.action, {
        current: currentLabel,
        next: nextLabel,
      })}
      className={classes}
      onClick={() => setTheme(next)}
      {...props}
    >
      <span aria-hidden="true" className={styles.symbol}>
        <span className={styles.symbolCore} />
      </span>
      <span className={styles.label}>{shortLabel}</span>
    </Button>
  );
}
