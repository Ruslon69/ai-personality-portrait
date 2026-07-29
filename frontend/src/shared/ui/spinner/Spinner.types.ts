import type { ComponentPropsWithoutRef } from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export type SpinnerProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  label?: string;
  size?: SpinnerSize;
};
