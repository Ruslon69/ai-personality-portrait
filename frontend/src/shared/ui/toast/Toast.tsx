import type { ToastProps } from './Toast.types';
import styles from './Toast.module.css';

export function Toast({ className, role, tone = 'neutral', ...props }: ToastProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  const resolvedRole = role ?? (tone === 'error' ? 'alert' : 'status');

  return (
    <div
      aria-live={resolvedRole === 'alert' ? 'assertive' : 'polite'}
      className={classes}
      data-tone={tone}
      role={resolvedRole}
      {...props}
    />
  );
}
