import type { SurfaceProps } from './Surface.types';
import styles from './Surface.module.css';

export function Surface({ className, elevation = 'none', ...props }: SurfaceProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return <div className={classes} data-elevation={elevation} {...props} />;
}
