import type { InputProps } from './Input.types';
import styles from './Input.module.css';

export function Input({ className, ...props }: InputProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return <input className={classes} {...props} />;
}
