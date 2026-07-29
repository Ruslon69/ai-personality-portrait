import type { StackProps } from './Stack.types';
import styles from './Stack.module.css';

export function Stack({
  align = 'stretch',
  className,
  direction = 'column',
  gap = 'md',
  justify = 'start',
  wrap = false,
  ...props
}: StackProps) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      data-align={align}
      data-direction={direction}
      data-gap={gap}
      data-justify={justify}
      data-wrap={wrap || undefined}
      {...props}
    />
  );
}
