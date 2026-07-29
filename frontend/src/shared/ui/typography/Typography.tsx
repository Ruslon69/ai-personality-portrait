import type { TypographyProps } from './Typography.types';
import styles from './Typography.module.css';

export function Typography({
  as: Component = 'p',
  className,
  variant = 'body',
  ...props
}: TypographyProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return <Component className={classes} data-variant={variant} {...props} />;
}
