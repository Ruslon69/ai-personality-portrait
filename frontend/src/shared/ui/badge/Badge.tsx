import type { BadgeProps } from './Badge.types';
import styles from './Badge.module.css';

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return <span className={classes} data-tone={tone} {...props} />;
}
