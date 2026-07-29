import type { ButtonProps } from './Button.types';
import styles from './Button.module.css';

export function Button({ className, type = 'button', ...props }: ButtonProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return <button className={classes} type={type} {...props} />;
}
