import { useTheme } from '@app/providers/theme';
import { Button } from '@shared/ui';

import styles from './ThemeSwitcher.module.css';
import { getNextTheme, themeLabels } from './theme-cycle';
import type { ThemeSwitcherProps } from './ThemeSwitcher.types';

export function ThemeSwitcher({ className, ...props }: ThemeSwitcherProps) {
  const { setTheme, theme } = useTheme();
  const next = getNextTheme(theme);
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <Button
      aria-label={`Текущая тема: ${themeLabels[theme]}. Переключить на ${themeLabels[next]}`}
      className={classes}
      onClick={() => setTheme(next)}
      {...props}
    >
      <span aria-hidden="true" className={styles.symbol}>
        ◐
      </span>
      <span className={styles.label}>Тема: {themeLabels[theme]}</span>
    </Button>
  );
}
