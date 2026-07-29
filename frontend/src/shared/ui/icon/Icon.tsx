import type { IconProps } from './Icon.types';
import styles from './Icon.module.css';

export function Icon({ children, className, label, size = 'md', ...props }: IconProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={classes}
      data-size={size}
      role={label ? 'img' : undefined}
      {...props}
    >
      {children}
    </span>
  );
}
