import type { CardProps } from './Card.types';
import styles from './Card.module.css';

export function Card({ className, ...props }: CardProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return <div className={classes} {...props} />;
}
