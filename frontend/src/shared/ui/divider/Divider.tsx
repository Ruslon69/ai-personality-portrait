import type { DividerProps } from './Divider.types';
import styles from './Divider.module.css';

export function Divider({ className, orientation = 'horizontal', ...props }: DividerProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <hr
      aria-orientation={orientation}
      className={classes}
      data-orientation={orientation}
      {...props}
    />
  );
}
