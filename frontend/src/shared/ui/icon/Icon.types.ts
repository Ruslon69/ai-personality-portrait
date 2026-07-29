import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type IconSize = 'sm' | 'md' | 'lg';

export type IconProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  children: ReactNode;
  label?: string;
  size?: IconSize;
};
