import type { ButtonLinkProps } from './Button.types';
import styles from './Button.module.css';

export function ButtonLink({
  className,
  prominence = 'default',
  size = 'default',
  ...props
}: ButtonLinkProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return <a className={classes} data-prominence={prominence} data-size={size} {...props} />;
}
