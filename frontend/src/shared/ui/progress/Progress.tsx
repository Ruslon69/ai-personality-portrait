import type { ProgressProps } from './Progress.types';
import styles from './Progress.module.css';

export function Progress({ className, label, max = 100, ...props }: ProgressProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <label className={styles.wrapper}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <progress className={classes} max={max} {...props} />
    </label>
  );
}
