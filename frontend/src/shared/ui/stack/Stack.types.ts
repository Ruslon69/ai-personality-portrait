import type { ComponentPropsWithoutRef } from 'react';

export type StackDirection = 'row' | 'column';
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlignment = 'start' | 'center' | 'end' | 'stretch';
export type StackJustification = 'start' | 'center' | 'end' | 'between';

export type StackProps = ComponentPropsWithoutRef<'div'> & {
  align?: StackAlignment;
  direction?: StackDirection;
  gap?: StackGap;
  justify?: StackJustification;
  wrap?: boolean;
};
