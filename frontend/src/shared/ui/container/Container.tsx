import type { ContainerProps } from './Container.types';
import styles from './Container.module.css';

export function Container({ className, size = 'default', ...props }: ContainerProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return <div className={classes} data-size={size} {...props} />;
}
