import type { ButtonProps } from './Button.types';
import styles from './Button.module.css';

export function Button({
  className,
  prominence = 'default',
  size = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      data-prominence={prominence}
      data-size={size}
      type={type}
      {...props}
    />
  );
}
