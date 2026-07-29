import type { SpinnerProps } from './Spinner.types';
import styles from './Spinner.module.css';

export function Spinner({ className, label = 'Загрузка', size = 'md', ...props }: SpinnerProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <span aria-live="polite" className={classes} role="status" {...props}>
      <span aria-hidden="true" className={styles.indicator} data-size={size} />
      <span className={styles.label}>{label}</span>
    </span>
  );
}
